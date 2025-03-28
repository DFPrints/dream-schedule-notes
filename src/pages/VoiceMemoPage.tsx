import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { MicIcon, StopCircleIcon, PlayIcon, PauseIcon, TrashIcon, SaveIcon, PencilIcon, XIcon } from 'lucide-react';
import { v4 as uuidv4 } from '@/lib/uuid';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface VoiceMemo {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  createdAt: Date;
  category?: string;
  categoryColor?: string;
  transcription?: string;
}

const CATEGORIES = [
  { name: 'Affirmation', color: '#FF5733' },
  { name: 'Gratitude', color: '#33FF57' },
  { name: 'Visualization', color: '#3357FF' },
  { name: 'Reflection', color: '#F3FF33' },
  { name: 'Goal Setting', color: '#FF33F6' },
  { name: 'Other', color: '#33FFF6' },
];

const VoiceMemoPage = () => {
  const [memos, setMemos] = useState<VoiceMemo[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentAudio, setCurrentAudio] = useState<{ memo: VoiceMemo | null, isPlaying: boolean }>({ memo: null, isPlaying: false });
  const [editMemoId, setEditMemoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [memoToDelete, setMemoToDelete] = useState<VoiceMemo | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [newMemoTitle, setNewMemoTitle] = useState('');
  const [newMemoCategory, setNewMemoCategory] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Load memos from localStorage on component mount
  useEffect(() => {
    try {
      const savedMemos = localStorage.getItem('manifestVoiceMemos');
      if (savedMemos) {
        const parsedMemos = JSON.parse(savedMemos).map((memo: any) => ({
          ...memo,
          createdAt: new Date(memo.createdAt)
        }));
        setMemos(parsedMemos);
      }
    } catch (error) {
      console.error('Error loading voice memos:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your voice memos',
        variant: 'destructive',
      });
    }
  }, []);
  
  // Save memos to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('manifestVoiceMemos', JSON.stringify(memos));
    } catch (error) {
      console.error('Error saving voice memos:', error);
    }
  }, [memos]);
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);
  
  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setShowSaveDialog(true);
        setNewMemoTitle(`Voice Memo ${memos.length + 1}`);
        setNewMemoCategory('');
        
        // Store temporarily
        const newMemo: VoiceMemo = {
          id: uuidv4(),
          title: `Voice Memo ${memos.length + 1}`,
          audioUrl,
          duration: recordingTime,
          createdAt: new Date(),
        };
        
        // Reset recording state
        setIsRecording(false);
        setRecordingTime(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Set as current memo for immediate playback option
        setCurrentAudio({ memo: newMemo, isPlaying: false });
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: 'Recording Started',
        description: 'Speak clearly into your microphone',
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording Failed',
        description: 'Could not access your microphone',
        variant: 'destructive',
      });
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // The onstop handler will handle the rest
    }
  };
  
  // Save new memo
  const saveNewMemo = () => {
    if (!currentAudio.memo) return;
    
    const newMemo: VoiceMemo = {
      ...currentAudio.memo,
      title: newMemoTitle || `Voice Memo ${memos.length + 1}`,
      category: newMemoCategory || undefined,
      categoryColor: newMemoCategory ? 
        CATEGORIES.find(c => c.name === newMemoCategory)?.color : 
        undefined
    };
    
    setMemos(prev => [...prev, newMemo]);
    setShowSaveDialog(false);
    
    toast({
      title: 'Voice Memo Saved',
      description: `"${newMemo.title}" has been saved`,
    });
  };
  
  // Play/pause audio
  const togglePlayback = (memo: VoiceMemo) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    if (currentAudio.memo?.id === memo.id && currentAudio.isPlaying) {
      // Pause current audio
      audioRef.current.pause();
      setCurrentAudio({ memo, isPlaying: false });
    } else {
      // Stop any playing audio
      audioRef.current.pause();
      
      // Play new audio
      audioRef.current.src = memo.audioUrl;
      audioRef.current.play();
      
      // Set up ended event
      audioRef.current.onended = () => {
        setCurrentAudio({ memo: null, isPlaying: false });
      };
      
      setCurrentAudio({ memo, isPlaying: true });
    }
  };
  
  // Delete memo
  const deleteMemo = () => {
    if (!memoToDelete) return;
    
    // If this memo is currently playing, stop it
    if (currentAudio.memo?.id === memoToDelete.id && audioRef.current) {
      audioRef.current.pause();
      setCurrentAudio({ memo: null, isPlaying: false });
    }
    
    // Remove the memo
    setMemos(prev => prev.filter(m => m.id !== memoToDelete.id));
    setShowDeleteDialog(false);
    setMemoToDelete(null);
    
    toast({
      title: 'Voice Memo Deleted',
      description: `"${memoToDelete.title}" has been deleted`,
    });
  };
  
  // Update memo
  const updateMemo = () => {
    if (!editMemoId) return;
    
    setMemos(prev => prev.map(memo => 
      memo.id === editMemoId ? {
        ...memo,
        title: editTitle,
        category: editCategory || undefined,
        categoryColor: editCategory ? 
          CATEGORIES.find(c => c.name === editCategory)?.color : 
          undefined
      } : memo
    ));
    
    setEditMemoId(null);
    
    toast({
      title: 'Voice Memo Updated',
      description: `"${editTitle}" has been updated`,
    });
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Filter memos based on active tab
  const filteredMemos = activeTab === 'all' 
    ? memos 
    : memos.filter(memo => memo.category === activeTab);
  
  // Get category color
  const getCategoryColor = (categoryName?: string) => {
    if (!categoryName) return '#CCCCCC';
    const category = CATEGORIES.find(c => c.name === categoryName);
    return category?.color || '#CCCCCC';
  };
  
  // Get category badge style
  const getCategoryBadgeStyle = (categoryColor?: string) => {
    if (!categoryColor) return {};
    
    // Convert color to lowercase string to ensure proper handling
    const colorStr = (categoryColor || '').toString().toLowerCase();
    
    return {
      backgroundColor: `${colorStr}33`, // Add transparency
      color: colorStr,
      borderColor: `${colorStr}66`,
    };
  };
  
  return (
    <Layout>
      <div className="space-y-6 pb-20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium">Voice Memos</h1>
            <p className="text-muted-foreground">
              Record and save your affirmations and thoughts
            </p>
          </div>
        </div>
        
        <Card className="neo-morphism border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <MicIcon className="h-5 w-5 mr-2 text-primary" />
              Voice Recorder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              {isRecording ? (
                <>
                  <div className="text-2xl font-mono animate-pulse">
                    {formatTime(recordingTime)}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                    <Button 
                      variant="destructive" 
                      size="lg" 
                      className="rounded-full h-16 w-16 relative z-10"
                      onClick={stopRecording}
                    >
                      <StopCircleIcon className="h-8 w-8" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recording... Tap to stop
                  </p>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="rounded-full h-16 w-16 border-primary/50 hover:bg-primary/10"
                    onClick={startRecording}
                  >
                    <MicIcon className="h-8 w-8 text-primary" />
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Tap to start recording
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium">Your Voice Memos</h2>
              <Badge variant="outline">
                {filteredMemos.length} {filteredMemos.length === 1 ? 'memo' : 'memos'}
              </Badge>
            </div>
            
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              {CATEGORIES.map(category => (
                <TabsTrigger 
                  key={category.name} 
                  value={category.name}
                  style={{
                    backgroundColor: memos.some(m => m.category === category.name) 
                      ? `${category.color}22` 
                      : undefined,
                    borderColor: memos.some(m => m.category === category.name) 
                      ? `${category.color}44` 
                      : undefined,
                  }}
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0 space-y-3">
              {filteredMemos.length > 0 ? (
                filteredMemos
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .map(memo => (
                    <Card key={memo.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="font-medium">{memo.title}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span className="mr-2">{formatTime(memo.duration)}</span>
                              <span>•</span>
                              <span className="ml-2">{formatDistanceToNow(memo.createdAt, { addSuffix: true })}</span>
                            </div>
                            {memo.category && (
                              <Badge 
                                variant="outline" 
                                className="mt-1"
                                style={getCategoryBadgeStyle(memo.categoryColor)}
                              >
                                {memo.category}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full"
                              onClick={() => {
                                setEditMemoId(memo.id);
                                setEditTitle(memo.title);
                                setEditCategory(memo.category || '');
                              }}
                            >
                              <PencilIcon className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full"
                              onClick={() => {
                                setMemoToDelete(memo);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <TrashIcon className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                            <Button 
                              variant={currentAudio.memo?.id === memo.id && currentAudio.isPlaying ? "default" : "outline"}
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full"
                              onClick={() => togglePlayback(memo)}
                            >
                              {currentAudio.memo?.id === memo.id && currentAudio.isPlaying ? (
                                <PauseIcon className="h-4 w-4" />
                              ) : (
                                <PlayIcon className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {currentAudio.memo?.id === memo.id && currentAudio.isPlaying ? 'Pause' : 'Play'}
                              </span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <MicIcon className="h-12 w-12 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="mb-2">No voice memos yet</p>
                  <Button size="sm" onClick={startRecording}>
                    Record your first memo
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Edit Memo Dialog */}
        {editMemoId && (
          <Dialog open={!!editMemoId} onOpenChange={(open) => !open && setEditMemoId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Voice Memo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category.name} value={category.name}>
                          <div className="flex items-center">
                            <div 
                              className="h-3 w-3 rounded-full mr-2" 
                              style={{ backgroundColor: category.color }}
                            ></div>
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setEditMemoId(null)}>
                  Cancel
                </Button>
                <Button onClick={updateMemo}>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Voice Memo</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete "{memoToDelete?.title}"? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteMemo}>
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Save New Memo Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Voice Memo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-title">Title</Label>
                <Input
                  id="new-title"
                  value={newMemoTitle}
                  onChange={(e) => setNewMemoTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-category">Category</Label>
                <Select value={newMemoCategory} onValueChange={setNewMemoCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category.name} value={category.name}>
                        <div className="flex items-center">
                          <div 
                            className="h-3 w-3 rounded-full mr-2" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Duration: {formatTime(currentAudio.memo?.duration || 0)}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => currentAudio.memo && togglePlayback(currentAudio.memo)}
                >
                  {currentAudio.isPlaying ? (
                    <>
                      <PauseIcon className="h-4 w-4 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4 mr-1" />
                      Preview
                    </>
                  )}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveNewMemo}>
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Memo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default VoiceMemoPage;
