
import { useState, useEffect } from 'react';
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
  TagIcon
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

  // Add new note
  const addNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      pinned: false,
      favorite: false,
      category: selectedCategory !== 'All' ? selectedCategory : 'Personal',
      tags: [],
      color: 'default'
    };
    
    setNotes([newNote, ...notes]);
    
    toast({
      title: "Note Created",
      description: "A new note has been created.",
    });
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
                    {availableTags.map(tag => (
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
          availableTags={availableTags}
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
      </div>
    </Layout>
  );
};

export default NotesPage;
