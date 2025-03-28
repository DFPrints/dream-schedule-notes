
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Play, Pause, Square, Save, Trash, Repeat, BookmarkIcon, ArchiveIcon, Share2, Clock, Download, SlidersHorizontal } from 'lucide-react';
import { v4 as uuidv4 } from '@/lib/uuid';
import { toast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Recording {
  id: string;
  title: string;
  audioBlob: Blob;
  duration: number;
  createdAt: Date;
  favorite?: boolean;
  archived?: boolean;
  transcription?: string;
  category?: string;
}

interface VoiceMemoProps {
  filterType?: 'all' | 'favorites' | 'archived';
  customCategories?: string[];
  categoryColors?: Record<string, string>;
  onCreateCategory?: () => void;
}

const recordingCategories = [
  'Uncategorized',
  'Affirmations',
  'Manifestations',
  'Ideas',
  'Reminders',
  'Personal',
  'Work'
];

const VoiceMemo = ({ filterType = 'all', customCategories = [], onCreateCategory }: VoiceMemoProps) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [loop, setLoop] = useState(false);
  const [recordingTitle, setRecordingTitle] = useState('');
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [recordingCategory, setRecordingCategory] = useState('Uncategorized');
  const [isNoiseReductionEnabled, setIsNoiseReductionEnabled] = useState(false);
  const [selectedRecordings, setSelectedRecordings] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.addEventListener('ended', handlePlaybackEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current = audio;
    
    // Load recordings from localStorage
    loadRecordingsFromStorage();
    
    return () => {
      audio.removeEventListener('ended', handlePlaybackEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);
  
  // Save recordings to localStorage when they change
  useEffect(() => {
    if (recordings.length > 0) {
      saveRecordingsToStorage();
    }
  }, [recordings]);
  
  // Filter recordings based on the selected tab
  const filteredRecordings = recordings.filter(recording => {
    // First apply category/favorites/archive filter
    const matchesFilter = 
      filterType === 'all' ? true :
      filterType === 'favorites' ? recording.favorite :
      filterType === 'archived' ? recording.archived :
      true;
    
    // Then apply search filter
    const matchesSearch = 
      searchTerm ? 
      recording.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recording.transcription && recording.transcription.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (recording.category && recording.category.toLowerCase().includes(searchTerm.toLowerCase())) :
      true;
    
    return matchesFilter && matchesSearch;
  });
  
  // Save recordings to localStorage (metadata only)
  const saveRecordingsToStorage = () => {
    try {
      // We need to store only metadata, not blobs
      const recordingsMetadata = recordings.map(recording => ({
        id: recording.id,
        title: recording.title,
        duration: recording.duration,
        createdAt: recording.createdAt,
        favorite: recording.favorite,
        archived: recording.archived,
        transcription: recording.transcription,
        category: recording.category
      }));
      
      localStorage.setItem('voiceMemoMetadata', JSON.stringify(recordingsMetadata));
      
      // Store blobs separately using IndexedDB or another approach
      // For simplicity, we're not implementing this part in this example
    } catch (error) {
      console.error("Error saving recordings to storage:", error);
    }
  };
  
  // Load recordings from localStorage
  const loadRecordingsFromStorage = () => {
    try {
      const savedMetadata = localStorage.getItem('voiceMemoMetadata');
      if (savedMetadata) {
        const parsedMetadata = JSON.parse(savedMetadata);
        // Convert dates from strings
        const metadataWithDates = parsedMetadata.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }));
        
        // Create dummy blobs for demo purposes
        // In a real app, you would load the actual audio blobs from IndexedDB
        const recordingsWithBlobs = metadataWithDates.map((item: any) => ({
          ...item,
          audioBlob: new Blob([], { type: 'audio/webm' })
        }));
        
        setRecordings(recordingsWithBlobs);
      }
    } catch (error) {
      console.error("Error loading recordings from storage:", error);
    }
  };
  
  // Handle audio ended event
  const handlePlaybackEnded = () => {
    if (loop && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      setIsPlaying(false);
      setPlaybackTime(0);
    }
  };
  
  // Update playback time
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setPlaybackTime(audioRef.current.currentTime);
    }
  };
  
  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const newRecordingId = uuidv4();
        
        const newRecording: Recording = {
          id: newRecordingId,
          title: recordingTitle || `Recording ${recordings.length + 1}`,
          audioBlob,
          duration: recordingTime,
          createdAt: new Date(),
          favorite: false,
          archived: false,
          category: recordingCategory
        };
        
        setRecordings([...recordings, newRecording]);
        setSelectedRecording(newRecording);
        setRecordingTitle('');
        setRecordingCategory('Uncategorized');
        
        // Set up audio for playback
        if (audioRef.current) {
          const audioURL = URL.createObjectURL(audioBlob);
          audioRef.current.src = audioURL;
        }
        
        toast({
          title: "Recording saved",
          description: `${newRecording.title} (${formatTime(recordingTime)})`,
        });
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Timer for recording duration
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access error",
        description: "Please grant microphone permission to record audio",
        variant: "destructive"
      });
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks in the stream
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      // Clear recording timer
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  // Toggle play/pause
  const togglePlayback = () => {
    if (!audioRef.current || !selectedRecording) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  // Toggle loop
  const toggleLoop = () => {
    setLoop(!loop);
    if (audioRef.current) {
      audioRef.current.loop = !loop;
    }
  };
  
  // Handle recording selection
  const selectRecording = (recording: Recording) => {
    if (isMultiSelectMode) {
      toggleRecordingSelection(recording.id);
      return;
    }
    
    if (isRecording) stopRecording();
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    setSelectedRecording(recording);
    setPlaybackTime(0);
    
    // Set up audio for playback
    if (audioRef.current) {
      const audioURL = URL.createObjectURL(recording.audioBlob);
      audioRef.current.src = audioURL;
      audioRef.current.currentTime = 0;
    }
  };
  
  // Toggle recording selection for multi-select
  const toggleRecordingSelection = (id: string) => {
    setSelectedRecordings(prev => 
      prev.includes(id) ? prev.filter(recId => recId !== id) : [...prev, id]
    );
  };
  
  // Toggle multi-select mode
  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    setSelectedRecordings([]);
  };
  
  // Delete selected recordings
  const deleteSelectedRecordings = () => {
    const updatedRecordings = recordings.filter(rec => !selectedRecordings.includes(rec.id));
    setRecordings(updatedRecordings);
    setSelectedRecordings([]);
    setIsMultiSelectMode(false);
    
    toast({
      title: "Recordings deleted",
      description: `${selectedRecordings.length} recordings have been removed`,
    });
  };
  
  // Toggle favorite for a recording
  const toggleFavorite = (id: string) => {
    const updatedRecordings = recordings.map(rec => 
      rec.id === id ? { ...rec, favorite: !rec.favorite } : rec
    );
    setRecordings(updatedRecordings);
    
    // Update selected recording if needed
    if (selectedRecording && selectedRecording.id === id) {
      const updatedRecording = updatedRecordings.find(rec => rec.id === id);
      if (updatedRecording) {
        setSelectedRecording(updatedRecording);
      }
    }
  };
  
  // Toggle archive for a recording
  const toggleArchive = (id: string) => {
    const updatedRecordings = recordings.map(rec => 
      rec.id === id ? { ...rec, archived: !rec.archived } : rec
    );
    setRecordings(updatedRecordings);
    
    // Update selected recording if needed
    if (selectedRecording && selectedRecording.id === id) {
      const updatedRecording = updatedRecordings.find(rec => rec.id === id);
      if (updatedRecording) {
        setSelectedRecording(updatedRecording);
      }
    }
  };
  
  // Update recording title
  const updateRecordingTitle = (id: string, newTitle: string) => {
    const updatedRecordings = recordings.map(rec => 
      rec.id === id ? { ...rec, title: newTitle } : rec
    );
    setRecordings(updatedRecordings);
    
    // Update selected recording if needed
    if (selectedRecording && selectedRecording.id === id) {
      const updatedRecording = updatedRecordings.find(rec => rec.id === id);
      if (updatedRecording) {
        setSelectedRecording(updatedRecording);
      }
    }
  };
  
  // Update recording category
  const updateRecordingCategory = (id: string, category: string) => {
    const updatedRecordings = recordings.map(rec => 
      rec.id === id ? { ...rec, category } : rec
    );
    setRecordings(updatedRecordings);
    
    // Update selected recording if needed
    if (selectedRecording && selectedRecording.id === id) {
      const updatedRecording = updatedRecordings.find(rec => rec.id === id);
      if (updatedRecording) {
        setSelectedRecording(updatedRecording);
      }
    }
  };
  
  // Delete recording
  const deleteRecording = (id: string) => {
    if (selectedRecording && selectedRecording.id === id) {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      setSelectedRecording(null);
    }
    
    const updatedRecordings = recordings.filter(rec => rec.id !== id);
    setRecordings(updatedRecordings);
    
    toast({
      title: "Recording deleted",
      description: "The voice memo has been removed",
    });
  };
  
  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (audioRef.current && selectedRecording) {
      const seekTime = (value[0] / 100) * selectedRecording.duration;
      audioRef.current.currentTime = seekTime;
      setPlaybackTime(seekTime);
    }
  };
  
  // Set playback rate
  const handlePlaybackRateChange = (rate: string) => {
    const numRate = parseFloat(rate);
    setPlaybackRate(numRate);
    
    if (audioRef.current) {
      audioRef.current.playbackRate = numRate;
    }
  };
  
  // Simulate transcription
  const generateTranscription = (id: string) => {
    if (!selectedRecording) return;
    
    // In a real app, you would send the audio to a transcription service
    // For this demo, we'll just fake it with a placeholder
    
    toast({
      title: "Generating transcription",
      description: "This may take a moment...",
    });
    
    // Simulate API delay
    setTimeout(() => {
      const transcriptionText = "This is a simulated transcription of your voice memo. In a real application, this would be generated by a speech-to-text service.";
      
      const updatedRecordings = recordings.map(rec => 
        rec.id === id ? { ...rec, transcription: transcriptionText } : rec
      );
      setRecordings(updatedRecordings);
      
      // Update selected recording
      if (selectedRecording && selectedRecording.id === id) {
        const updatedRecording = { ...selectedRecording, transcription: transcriptionText };
        setSelectedRecording(updatedRecording);
      }
      
      toast({
        title: "Transcription complete",
        description: "Your recording has been transcribed.",
      });
    }, 2000);
  };
  
  // Format time (seconds) to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get playback progress percentage
  const getPlaybackProgress = () => {
    if (!selectedRecording) return 0;
    return (playbackTime / selectedRecording.duration) * 100;
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Recordings List */}
      <div className="md:col-span-1 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Voice Memos</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`h-8 w-8 p-0 rounded-full ${isMultiSelectMode ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={toggleMultiSelectMode}
            >
              <Checkbox className="h-4 w-4" checked={isMultiSelectMode} />
              <span className="sr-only">Select multiple</span>
            </Button>
            
            {isMultiSelectMode && selectedRecordings.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete selected</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Selected Recordings</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedRecordings.length} recordings? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteSelectedRecordings}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        
        <div className="relative">
          <Input
            type="text"
            placeholder="Search recordings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchTerm('')}
            >
              ×
            </Button>
          )}
        </div>
        
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {filteredRecordings.length > 0 ? (
            filteredRecordings.map((recording) => (
              <div
                key={recording.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedRecording?.id === recording.id 
                    ? "neo-morphism" 
                    : "glass-card hover:shadow-md"
                } ${selectedRecordings.includes(recording.id) ? 'ring-2 ring-primary' : ''}`}
                onClick={() => selectRecording(recording)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {isMultiSelectMode && (
                      <Checkbox 
                        checked={selectedRecordings.includes(recording.id)} 
                        onCheckedChange={() => toggleRecordingSelection(recording.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <h4 className="font-medium truncate">{recording.title}</h4>
                        {recording.favorite && (
                          <BookmarkIcon className="h-3 w-3 ml-1 text-yellow-500" />
                        )}
                        {recording.archived && (
                          <ArchiveIcon className="h-3 w-3 ml-1 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatTime(recording.duration)}</span>
                        {recording.category && recording.category !== 'Uncategorized' && (
                          <span className="ml-2 bg-secondary px-1.5 py-0.5 rounded-full text-xs">
                            {recording.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 w-6 p-0 rounded-full ${recording.favorite ? 'text-yellow-500' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(recording.id);
                      }}
                    >
                      <BookmarkIcon className="h-3 w-3" />
                      <span className="sr-only">Favorite</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleArchive(recording.id);
                      }}
                    >
                      <ArchiveIcon className="h-3 w-3" />
                      <span className="sr-only">Archive</span>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 rounded-full text-destructive"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash className="h-3 w-3" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Recording</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this recording? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteRecording(recording.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {recording.createdAt.toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center p-6 text-muted-foreground border border-dashed rounded-lg">
              <Mic className="h-6 w-6 mx-auto text-muted-foreground/50" />
              <p className="mt-2 text-sm">No voice memos {filterType !== 'all' ? `in ${filterType}` : ''}</p>
              <p className="text-sm">Click Record to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="md:col-span-2">
        <Card className="neo-morphism border-0">
          <CardHeader>
            <CardTitle>Voice Recorder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recording Title Input */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Recording title..."
                  value={recordingTitle}
                  onChange={(e) => setRecordingTitle(e.target.value)}
                  disabled={isRecording || isPlaying}
                  className="w-full"
                />
                
                <Select
                  value={recordingCategory}
                  onValueChange={setRecordingCategory}
                  disabled={isRecording || isPlaying}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {recordingCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    {customCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="create_new" className="text-primary" onSelect={e => {
                      e.preventDefault();
                      onCreateCategory && onCreateCategory();
                    }}>
                      Create New
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Recording Timer / Player Progress */}
            <div className="text-center">
              <div className="text-3xl font-mono">
                {isRecording ? formatTime(recordingTime) : 
                  selectedRecording ? formatTime(playbackTime) : "00:00"}
              </div>
              
              {selectedRecording && !isRecording && (
                <div className="mt-4">
                  <Progress value={getPlaybackProgress()} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>00:00</span>
                    <span>{formatTime(selectedRecording.duration)}</span>
                  </div>
                </div>
              )}
              
              {isRecording && (
                <div className="mt-4">
                  <div className="flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse mr-2"></div>
                    <span className="text-sm">Recording...</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Playback Seek Control */}
            {selectedRecording && !isRecording && (
              <div className="px-2">
                <Slider
                  value={[getPlaybackProgress()]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleSeek}
                  disabled={isRecording}
                />
              </div>
            )}
            
            {/* Noise Reduction Option */}
            {isRecording && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="noise-reduction"
                  checked={isNoiseReductionEnabled}
                  onCheckedChange={(checked) => setIsNoiseReductionEnabled(checked as boolean)}
                />
                <Label htmlFor="noise-reduction">Enable noise reduction</Label>
              </div>
            )}
            
            {/* Transcription View */}
            {selectedRecording && selectedRecording.transcription && (
              <div className="p-3 bg-secondary/30 rounded-md max-h-32 overflow-y-auto">
                <h4 className="text-xs uppercase font-medium text-muted-foreground mb-1">Transcription</h4>
                <p className="text-sm">{selectedRecording.transcription}</p>
              </div>
            )}
            
            {/* Playback Rate (when a recording is selected) */}
            {selectedRecording && !isRecording && (
              <div className="flex items-center justify-center space-x-2">
                <Label className="text-xs">Playback Speed:</Label>
                <Select value={playbackRate.toString()} onValueChange={handlePlaybackRateChange}>
                  <SelectTrigger className="w-[80px] h-7 text-xs">
                    <SelectValue placeholder="Speed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5x</SelectItem>
                    <SelectItem value="0.75">0.75x</SelectItem>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="1.25">1.25x</SelectItem>
                    <SelectItem value="1.5">1.5x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap justify-center gap-2">
            {isRecording ? (
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full h-12 w-12 p-0"
                onClick={stopRecording}
              >
                <Square className="h-5 w-5" />
                <span className="sr-only">Stop Recording</span>
              </Button>
            ) : (
              <Button
                variant="default"
                size="lg"
                className="rounded-full h-12 w-12 p-0 bg-red-500 hover:bg-red-600"
                onClick={startRecording}
                disabled={isPlaying}
              >
                <Mic className="h-5 w-5" />
                <span className="sr-only">Start Recording</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              size="lg"
              className="rounded-full h-12 w-12 p-0"
              onClick={togglePlayback}
              disabled={!selectedRecording || isRecording}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
              <span className="sr-only">
                {isPlaying ? "Pause" : "Play"}
              </span>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className={`rounded-full h-12 w-12 p-0 ${loop ? "bg-primary text-primary-foreground" : ""}`}
              onClick={toggleLoop}
              disabled={!selectedRecording || isRecording}
            >
              <Repeat className="h-5 w-5" />
              <span className="sr-only">
                {loop ? "Disable Loop" : "Enable Loop"}
              </span>
            </Button>
            
            {selectedRecording && !isRecording && (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full h-12 w-12 p-0"
                  onClick={() => generateTranscription(selectedRecording.id)}
                  disabled={!!selectedRecording.transcription}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  <span className="sr-only">Transcribe</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full h-12 w-12 p-0"
                  onClick={() => {
                    // In a real app, this would create a download link
                    toast({
                      title: "Download started",
                      description: "Your recording is being prepared for download."
                    });
                  }}
                >
                  <Download className="h-5 w-5" />
                  <span className="sr-only">Download</span>
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-full h-12 w-12 p-0"
                    >
                      <Share2 className="h-5 w-5" />
                      <span className="sr-only">Share</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-52">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Share Recording</h4>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="w-full">
                          Copy Link
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            )}
          </CardFooter>
        </Card>
        
        {/* Edit Selected Recording */}
        {selectedRecording && !isRecording && (
          <Card className="neo-morphism border-0 mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                Edit Recording
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={selectedRecording.title}
                  onChange={(e) => updateRecordingTitle(selectedRecording.id, e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={selectedRecording.category || 'Uncategorized'}
                  onValueChange={(category) => updateRecordingCategory(selectedRecording.id, category)}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {recordingCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    {customCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="create_new" className="text-primary" onSelect={e => {
                      e.preventDefault();
                      onCreateCategory && onCreateCategory();
                    }}>
                      Create New
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex-1 ${selectedRecording.favorite ? 'bg-yellow-500/10' : ''}`}
                  onClick={() => toggleFavorite(selectedRecording.id)}
                >
                  <BookmarkIcon className={`h-4 w-4 mr-1 ${selectedRecording.favorite ? 'text-yellow-500' : ''}`} />
                  {selectedRecording.favorite ? 'Unfavorite' : 'Favorite'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex-1 ${selectedRecording.archived ? 'bg-secondary' : ''}`}
                  onClick={() => toggleArchive(selectedRecording.id)}
                >
                  <ArchiveIcon className="h-4 w-4 mr-1" />
                  {selectedRecording.archived ? 'Unarchive' : 'Archive'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VoiceMemo;
