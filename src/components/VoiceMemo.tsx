
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MicIcon, 
  StopCircleIcon, 
  PlayIcon, 
  PauseIcon,
  TrashIcon,
  HeartIcon,
  ArchiveIcon,
  EditIcon,
  SaveIcon,
  FolderIcon,
  PlusIcon
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from '@/lib/uuid';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VoiceMemo {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  createdAt: Date;
  notes?: string;
  favorite: boolean;
  archived: boolean;
  category?: string;
}

interface VoiceMemoProps {
  filterType?: 'all' | 'favorites' | 'archived';
}

const DEFAULT_CATEGORIES = [
  "Personal",
  "Manifestation",
  "Affirmations",
  "Goals",
  "Ideas",
  "Reminders",
  "Custom"
];

const VoiceMemo: React.FC<VoiceMemoProps> = ({ filterType = 'all' }) => {
  const [memos, setMemos] = useState<VoiceMemo[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editingMemo, setEditingMemo] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const customCategoryInputRef = useRef<HTMLInputElement>(null);

  // Load memos and categories from localStorage on component mount
  useEffect(() => {
    const loadSavedMemos = () => {
      try {
        const savedMemos = localStorage.getItem('voiceMemos');
        if (savedMemos) {
          const parsedMemos = JSON.parse(savedMemos);
          // Convert string dates back to Date objects
          const memosWithDates = parsedMemos.map((memo: any) => ({
            ...memo,
            createdAt: new Date(memo.createdAt)
          }));
          setMemos(memosWithDates);
        }
        
        const savedCategories = localStorage.getItem('voiceMemoCategories');
        if (savedCategories) {
          const parsedCategories = JSON.parse(savedCategories);
          if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
            // Ensure default categories are always present
            const combinedCategories = [...new Set([...DEFAULT_CATEGORIES, ...parsedCategories])];
            setCategories(combinedCategories);
          }
        }
      } catch (error) {
        console.error('Error loading voice memos from localStorage:', error);
      }
    };
    
    loadSavedMemos();
  }, []);
  
  // Save memos to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('voiceMemos', JSON.stringify(memos));
    } catch (error) {
      console.error('Error saving voice memos to localStorage:', error);
    }
  }, [memos]);
  
  // Save categories to localStorage whenever they change
  useEffect(() => {
    try {
      // Only save categories that aren't in the DEFAULT_CATEGORIES
      const customCategories = categories.filter(cat => !DEFAULT_CATEGORIES.includes(cat));
      localStorage.setItem('voiceMemoCategories', JSON.stringify(customCategories));
    } catch (error) {
      console.error('Error saving voice memo categories to localStorage:', error);
    }
  }, [categories]);

  // Update the recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // Format time in MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newMemo: VoiceMemo = {
          id: uuidv4(),
          title: `Voice Memo ${new Date().toLocaleString()}`,
          audioUrl,
          duration: recordingTime,
          createdAt: new Date(),
          notes: '',
          favorite: false,
          archived: false,
          category: 'Personal'
        };
        
        setMemos(prev => [newMemo, ...prev]);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        
        toast({
          title: "Recording Saved",
          description: `Voice memo (${formatTime(recordingTime)}) has been saved.`,
        });
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Setup audio visualization if needed
      setupAudioVisualization(stream);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  // Setup audio visualization
  const setupAudioVisualization = (stream: MediaStream) => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // You can use analyserRef.current to visualize audio if needed
    } catch (error) {
      console.error('Error setting up audio visualization:', error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Cleanup audio context
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
        analyserRef.current = null;
      }
    }
  };

  // Play/Pause audio
  const togglePlayPause = (audioUrl: string) => {
    if (activeAudio === audioUrl && isPlaying) {
      // Pause current audio
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      // Stop currently playing audio if any
      if (audioElementRef.current && isPlaying) {
        audioElementRef.current.pause();
      }
      
      // Play new audio
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setIsPlaying(false);
        setActiveAudio(null);
      };
      
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: "Playback Error",
          description: "Could not play this recording.",
          variant: "destructive"
        });
      });
      
      audioElementRef.current = audio;
      setActiveAudio(audioUrl);
      setIsPlaying(true);
    }
  };

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    setMemos(prev => prev.map(memo => 
      memo.id === id ? { ...memo, favorite: !memo.favorite } : memo
    ));
  };

  // Toggle archived status
  const toggleArchived = (id: string) => {
    setMemos(prev => prev.map(memo => 
      memo.id === id ? { ...memo, archived: !memo.archived } : memo
    ));
    
    toast({
      title: "Memo Updated",
      description: "Voice memo has been archived.",
    });
  };

  // Edit memo
  const startEditing = (memo: VoiceMemo) => {
    setEditingMemo(memo.id);
    setEditTitle(memo.title);
    setEditNotes(memo.notes || '');
    setEditCategory(memo.category || 'Personal');
  };

  // Save edits
  const saveEdits = () => {
    if (!editingMemo) return;
    
    setMemos(prev => prev.map(memo => 
      memo.id === editingMemo 
        ? { 
            ...memo, 
            title: editTitle, 
            notes: editNotes,
            category: editCategory
          } 
        : memo
    ));
    
    setEditingMemo(null);
    
    toast({
      title: "Memo Updated",
      description: "Your changes have been saved.",
    });
  };

  // Delete memo
  const deleteMemo = (id: string) => {
    // If this memo is currently playing, stop it
    const memoToDelete = memos.find(memo => memo.id === id);
    if (memoToDelete && activeAudio === memoToDelete.audioUrl && isPlaying) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        setIsPlaying(false);
        setActiveAudio(null);
      }
    }
    
    setMemos(prev => prev.filter(memo => memo.id !== id));
    
    toast({
      title: "Memo Deleted",
      description: "Voice memo has been deleted.",
    });
  };
  
  // Add new custom category
  const addNewCategory = () => {
    if (!newCategory.trim()) return;
    
    // Check if category already exists
    if (!categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
      toast({
        title: "Category Added",
        description: `"${newCategory}" has been added to your categories.`,
      });
    }
    
    // If we're editing a memo, apply the new category
    if (editingMemo) {
      setEditCategory(newCategory);
    }
    
    // Clear and close the dialog
    setNewCategory('');
    setIsNewCategoryDialogOpen(false);
  };
  
  // Open the custom category dialog
  const openCategoryDialog = () => {
    setNewCategory('');
    setIsNewCategoryDialogOpen(true);
    
    // Focus the input field after dialog opens
    setTimeout(() => {
      if (customCategoryInputRef.current) {
        customCategoryInputRef.current.focus();
      }
    }, 100);
  };

  // Filter memos based on the current filter type
  const filteredMemos = memos.filter(memo => {
    if (filterType === 'favorites') return memo.favorite;
    if (filterType === 'archived') return memo.archived;
    return !memo.archived; // 'all' shows non-archived memos
  });

  return (
    <div className="space-y-6">
      <Card className="neo-morphism border-0 mb-4">
        <CardContent className="p-6 flex justify-between items-center">
          {isRecording ? (
            <div className="flex-1 flex items-center">
              <div className="animate-pulse flex items-center">
                <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                <span className="font-medium">Recording...</span>
              </div>
              <span className="ml-2 text-muted-foreground">{formatTime(recordingTime)}</span>
            </div>
          ) : (
            <div className="flex-1">
              <p className="font-medium">
                {filterType === 'all' ? 'All Voice Memos' : 
                 filterType === 'favorites' ? 'Favorite Voice Memos' : 
                 'Archived Voice Memos'}
              </p>
              <p className="text-sm text-muted-foreground">
                {filteredMemos.length} {filteredMemos.length === 1 ? 'recording' : 'recordings'}
              </p>
            </div>
          )}
          
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            className={isRecording ? "bg-red-500 hover:bg-red-600" : ""}
          >
            {isRecording ? (
              <>
                <StopCircleIcon className="h-4 w-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <MicIcon className="h-4 w-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {filteredMemos.length > 0 ? (
          filteredMemos.map(memo => (
            <Card key={memo.id} className="glass-card overflow-hidden">
              <CardContent className="p-4">
                {editingMemo === memo.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Memo title"
                      className="font-medium"
                    />
                    
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="category" className="text-xs">Category</Label>
                      <div className="flex space-x-2">
                        <Select 
                          value={editCategory} 
                          onValueChange={(value) => {
                            if (value === "Custom") {
                              openCategoryDialog();
                            } else {
                              setEditCategory(value);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full h-8 text-xs">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                            <SelectItem value="Custom">
                              <div className="flex items-center">
                                <PlusIcon className="h-3 w-3 mr-1" />
                                Add Custom Category
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add notes about this recording..."
                      className="h-20 resize-none"
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingMemo(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveEdits}
                      >
                        <SaveIcon className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium truncate">{memo.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {memo.createdAt.toLocaleString()}
                          </p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(memo.duration)}
                          </p>
                          {memo.category && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <div className="flex items-center text-xs">
                                <FolderIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                                <span>{memo.category}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => toggleFavorite(memo.id)}
                        >
                          <HeartIcon 
                            className={`h-4 w-4 ${memo.favorite ? 'text-rose-400 fill-rose-400' : ''}`} 
                          />
                          <span className="sr-only">
                            {memo.favorite ? 'Remove from favorites' : 'Add to favorites'}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => toggleArchived(memo.id)}
                        >
                          <ArchiveIcon className="h-4 w-4" />
                          <span className="sr-only">
                            {memo.archived ? 'Unarchive' : 'Archive'}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => startEditing(memo)}
                        >
                          <EditIcon className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full text-destructive hover:text-destructive"
                          onClick={() => deleteMemo(memo.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                    
                    {memo.notes && (
                      <p className="text-sm mt-2 whitespace-pre-wrap">
                        {memo.notes}
                      </p>
                    )}
                    
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => togglePlayPause(memo.audioUrl)}
                      >
                        {activeAudio === memo.audioUrl && isPlaying ? (
                          <>
                            <PauseIcon className="h-4 w-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <PlayIcon className="h-4 w-4 mr-2" />
                            Play
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-8 border border-dashed rounded-lg">
            <MicIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-2 text-xl font-medium">No voice memos found</h3>
            <p className="text-muted-foreground">
              {filterType === 'all' 
                ? "Start recording to create your first voice memo" 
                : filterType === 'favorites' 
                  ? "Mark voice memos as favorites to see them here"
                  : "Archived voice memos will appear here"}
            </p>
            {filterType === 'all' && (
              <Button
                onClick={startRecording}
                className="mt-4"
                disabled={isRecording}
              >
                <MicIcon className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* New Category Dialog */}
      <Dialog open={isNewCategoryDialogOpen} onOpenChange={setIsNewCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a custom category for organizing your voice memos
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="newCategory" className="text-right">
                Category Name
              </Label>
              <Input
                id="newCategory"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                className="flex-1"
                ref={customCategoryInputRef}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addNewCategory();
                  }
                }}
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsNewCategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={addNewCategory}
              disabled={!newCategory.trim()}
            >
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoiceMemo;
