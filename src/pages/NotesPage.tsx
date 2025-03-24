
import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import Notes from '@/components/Notes';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from '@/lib/uuid';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  SearchIcon, 
  SlidersIcon,
  CalendarIcon,
  TagIcon,
  XIcon,
  PlusIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  pinned: boolean;
  favorite: boolean;
  category?: string;
  tags?: string[];
  color?: string;
}

// Available note categories
const noteCategories = [
  "Personal",
  "Work",
  "Manifestation",
  "Ideas",
  "Gratitude",
  "Affirmations",
  "Goals",
  "Dreams",
  "All"
];

// Available note tags
const availableTags = [
  "important",
  "urgent",
  "inspiration",
  "follow-up",
  "creative",
  "personal-growth",
  "success",
  "abundance",
  "love",
  "health"
];

// Note color options
const noteColors = [
  { name: "Default", value: "default" },
  { name: "Purple", value: "purple" },
  { name: "Blue", value: "blue" },
  { name: "Green", value: "green" },
  { name: "Yellow", value: "yellow" },
  { name: "Orange", value: "orange" },
  { name: "Red", value: "red" },
  { name: "Pink", value: "pink" }
];

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Manifestation Goals',
      content: 'Focus on attracting abundance and positive energy in all aspects of life. Remember to practice gratitude daily.',
      createdAt: new Date(Date.now() - 7 * 86400000),
      updatedAt: new Date(Date.now() - 2 * 86400000),
      pinned: true,
      favorite: false,
      category: 'Manifestation',
      tags: ['abundance', 'success'],
      color: 'purple'
    },
    {
      id: '2',
      title: 'Affirmations',
      content: 'I am worthy of all the good things coming my way.\nI attract success and abundance effortlessly.\nI am grateful for all that I have and all that is coming to me.',
      createdAt: new Date(Date.now() - 5 * 86400000),
      updatedAt: new Date(Date.now() - 5 * 86400000),
      pinned: false,
      favorite: true,
      category: 'Affirmations',
      tags: ['personal-growth', 'love'],
      color: 'blue'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('updatedAt');
  
  // New note dialog state
  const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('Personal');
  const [newNoteTags, setNewNoteTags] = useState<string[]>([]);
  const [newNoteColor, setNewNoteColor] = useState('default');
  const [newCustomTag, setNewCustomTag] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  
  const newNoteContentRef = useRef<HTMLTextAreaElement>(null);

  // Add new note
  const addNote = () => {
    setIsNewNoteDialogOpen(true);
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteCategory(selectedCategory !== 'All' ? selectedCategory : 'Personal');
    setNewNoteTags([]);
    setNewNoteColor('default');
    
    // Focus the content textarea after dialog opens
    setTimeout(() => {
      newNoteContentRef.current?.focus();
    }, 50);
  };

  const createNewNote = () => {
    // Validate note content
    if (!newNoteContent.trim()) {
      toast({
        title: "Content Required",
        description: "Please add some content to your note.",
        variant: "destructive"
      });
      return;
    }
    
    const newNote: Note = {
      id: uuidv4(),
      title: newNoteTitle.trim() || 'Untitled Note',
      content: newNoteContent,
      createdAt: new Date(),
      updatedAt: new Date(),
      pinned: false,
      favorite: false,
      category: newNoteCategory,
      tags: newNoteTags,
      color: newNoteColor
    };
    
    setNotes([newNote, ...notes]);
    setIsNewNoteDialogOpen(false);
    
    toast({
      title: "Note Created",
      description: "A new note has been created.",
    });
  };

  // Add a custom tag
  const addCustomTag = () => {
    if (!newCustomTag.trim()) return;
    
    const tag = newCustomTag.trim().toLowerCase().replace(/\s+/g, '-');
    
    if (!customTags.includes(tag) && !availableTags.includes(tag)) {
      setCustomTags([...customTags, tag]);
    }
    
    if (!newNoteTags.includes(tag)) {
      setNewNoteTags([...newNoteTags, tag]);
    }
    
    setNewCustomTag('');
  };

  // Update note
  const updateNote = (updatedNote: Note) => {
    const updatedNotes = notes.map(note => 
      note.id === updatedNote.id ? {
        ...updatedNote,
        updatedAt: new Date() // Update the timestamp
      } : note
    );
    setNotes(updatedNotes);
    
    toast({
      title: "Note Updated",
      description: "Your note has been saved.",
    });
  };

  // Delete note
  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    
    toast({
      title: "Note Deleted",
      description: "Your note has been deleted.",
    });
  };

  // Toggle pinned
  const togglePinned = (id: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, pinned: !note.pinned } : note
    );
    setNotes(updatedNotes);
  };

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, favorite: !note.favorite } : note
    );
    setNotes(updatedNotes);
  };

  // Add or remove tag from a note
  const toggleTag = (noteId: string, tag: string) => {
    const updatedNotes = notes.map(note => {
      if (note.id === noteId) {
        const currentTags = note.tags || [];
        const tags = currentTags.includes(tag) 
          ? currentTags.filter(t => t !== tag)
          : [...currentTags, tag];
        return { ...note, tags, updatedAt: new Date() };
      }
      return note;
    });
    setNotes(updatedNotes);
  };

  // Change note category
  const changeNoteCategory = (noteId: string, category: string) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId ? { ...note, category, updatedAt: new Date() } : note
    );
    setNotes(updatedNotes);
  };

  // Change note color
  const changeNoteColor = (noteId: string, color: string) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId ? { ...note, color, updatedAt: new Date() } : note
    );
    setNotes(updatedNotes);
  };

  // Handle tag selection for filtering
  const toggleTagFilter = (tag: string) => {
    setSelectedTags(
      selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag]
    );
  };

  // Filter and sort notes based on current settings
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
    
    const matchesTags = selectedTags.length === 0 || 
                        (note.tags && selectedTags.some(tag => note.tags?.includes(tag)));
    
    return matchesSearch && matchesCategory && matchesTags;
  }).sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  // Get all available tags including custom ones
  const getAllTags = () => {
    return [...new Set([...availableTags, ...customTags])];
  };

  // Save to localStorage whenever notes change
  useEffect(() => {
    try {
      localStorage.setItem('manifestNotes', JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving notes to localStorage:', error);
    }
  }, [notes]);

  // Load from localStorage on component mount
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('manifestNotes');
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        // Convert string dates back to Date objects
        const notesWithDates = parsedNotes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
        setNotes(notesWithDates);
        
        // Extract any custom tags - fix the type error here
        const allTags = parsedNotes.flatMap((note: any) => note.tags || []);
        // Add explicit type checking to ensure we're only setting string values
        const savedCustomTags = [...new Set(allTags.filter((tag: any) => 
          typeof tag === 'string' && !availableTags.includes(tag)
        ))] as string[];
        
        setCustomTags(savedCustomTags);
      }
    } catch (error) {
      console.error('Error loading notes from localStorage:', error);
    }
  }, []);

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium">Notes</h1>
            <p className="text-muted-foreground">
              Journal your manifestation journey
            </p>
          </div>
          <Button onClick={addNote} size="sm" className="rounded-full">
            <span className="mr-1">+</span> New Note
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="neo-morphism border-0">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Select 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {noteCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center"
                  >
                    <SlidersIcon className="h-4 w-4 mr-1" />
                    Filters
                  </Button>
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updatedAt">Last Updated</SelectItem>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showFilters && (
                <div className="p-2 bg-background/50 rounded-md border animate-fade-in">
                  <p className="text-sm font-medium mb-2">Filter by Tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {[...availableTags, ...customTags].map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTagFilter(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes Component */}
        <Notes
          notes={filteredNotes}
          onAddNote={addNote}
          onUpdateNote={updateNote}
          onDeleteNote={deleteNote}
          onTogglePinned={togglePinned}
          onToggleFavorite={toggleFavorite}
          onToggleTag={toggleTag}
          onChangeCategory={changeNoteCategory}
          onChangeColor={changeNoteColor}
          availableTags={getAllTags()}
          categories={noteCategories.filter(cat => cat !== 'All')}
          colorOptions={noteColors}
        />

        {filteredNotes.length === 0 && (
          <div className="text-center p-8">
            <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-2 text-lg font-medium">No notes found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== 'All' || selectedTags.length > 0
                ? "Try changing your search or filters"
                : "Create your first note to get started"}
            </p>
            <Button onClick={addNote} className="mt-4">
              Create a Note
            </Button>
          </div>
        )}
        
        {/* New Note Dialog */}
        <Dialog open={isNewNoteDialogOpen} onOpenChange={setIsNewNoteDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
              <DialogDescription>
                Add a new note to your collection
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid items-center gap-1.5">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Untitled Note"
                />
              </div>
              
              <div className="grid items-center gap-1.5">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Write your thoughts here..."
                  className="min-h-[200px] resize-vertical"
                  ref={newNoteContentRef}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newNoteCategory} 
                    onValueChange={setNewNoteCategory}
                  >
                    <SelectTrigger className="w-full mt-1.5">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {noteCategories.filter(cat => cat !== 'All').map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Select 
                    value={newNoteColor} 
                    onValueChange={setNewNoteColor}
                  >
                    <SelectTrigger className="w-full mt-1.5">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {noteColors.map(color => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ 
                                backgroundColor: 
                                  color.value === 'default' ? 'var(--primary)' :
                                  color.value === 'purple' ? '#9b87f5' :
                                  color.value === 'blue' ? '#0EA5E9' :
                                  color.value === 'green' ? '#10B981' :
                                  color.value === 'yellow' ? '#F59E0B' :
                                  color.value === 'orange' ? '#F97316' :
                                  color.value === 'red' ? '#EF4444' :
                                  color.value === 'pink' ? '#EC4899' : 'var(--primary)'
                              }} 
                            />
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {getAllTags().map(tag => (
                    <Badge
                      key={tag}
                      variant={newNoteTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (newNoteTags.includes(tag)) {
                          setNewNoteTags(newNoteTags.filter(t => t !== tag));
                        } else {
                          setNewNoteTags([...newNoteTags, tag]);
                        }
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2 mt-3">
                  <Input
                    placeholder="Add custom tag..."
                    value={newCustomTag}
                    onChange={(e) => setNewCustomTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomTag();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addCustomTag}
                    disabled={!newCustomTag.trim()}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between items-center">
              <div>
                {newNoteTags.length > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground space-x-1">
                    <TagIcon className="h-3 w-3" />
                    <span>{newNoteTags.length} tags</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewNoteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={createNewNote}
                >
                  Create Note
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default NotesPage;
