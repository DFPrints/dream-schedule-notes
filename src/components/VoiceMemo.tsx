
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Play, Pause, Square, Save, Trash, Repeat } from 'lucide-react';
import { v4 as uuidv4 } from '@/lib/uuid';
import { toast } from '@/components/ui/use-toast';

interface Recording {
  id: string;
  title: string;
  audioBlob: Blob;
  duration: number;
  createdAt: Date;
}

const VoiceMemo = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [loop, setLoop] = useState(false);
  const [recordingTitle, setRecordingTitle] = useState('');
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  
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
    
    return () => {
      audio.removeEventListener('ended', handlePlaybackEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);
  
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
          createdAt: new Date()
        };
        
        setRecordings([...recordings, newRecording]);
        setSelectedRecording(newRecording);
        setRecordingTitle('');
        
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
        </div>
        
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {recordings.length > 0 ? (
            recordings.map((recording) => (
              <div
                key={recording.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedRecording?.id === recording.id 
                    ? "neo-morphism" 
                    : "glass-card hover:shadow-md"
                }`}
                onClick={() => selectRecording(recording)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{recording.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Duration: {formatTime(recording.duration)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRecording(recording.id);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {recording.createdAt.toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center p-6 text-muted-foreground border border-dashed rounded-lg">
              <Mic className="h-6 w-6 mx-auto text-muted-foreground/50" />
              <p className="mt-2 text-sm">No voice memos yet</p>
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
              <Input
                type="text"
                placeholder="Recording title..."
                value={recordingTitle}
                onChange={(e) => setRecordingTitle(e.target.value)}
                disabled={isRecording || isPlaying}
                className="w-full"
              />
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
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VoiceMemo;
