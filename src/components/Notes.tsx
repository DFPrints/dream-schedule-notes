
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { StarIcon, HeartIcon, FeatherIcon, SaveIcon, TrashIcon, PlusIcon, TagIcon, FolderIcon, PaletteIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface NotesProps {
  notes: Note[];
  onAddNote?: () => void;
  onUpdateNote?: (note: Note) => void;
  onDeleteNote?: (id: string) => void;
  onTogglePinned?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onToggleTag?: (id: string, tag: string) => void;
  onChangeCategory?: (id: string, category: string) => void;
  onChangeColor?: (id: string, color: string) => void;
  availableTags?: string[];
  categories?: string[];
  colorOptions?: { name: string; value: string }[];
}

const Notes = ({
  notes = [],
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onTogglePinned,
  onToggleFavorite,
  onToggleTag,
  onChangeCategory,
  onChangeColor,
  availableTags = [],
  categories = [],
  colorOptions = []
}: NotesProps) => {
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [editedColor, setEditedColor] = useState('');

  // Sort notes: pinned first, then by updatedAt
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  // Handle note selection
  const handleSelectNote = (note: Note) => {
    setActiveNote(note);
    setEditMode(false);
    setEditedTitle(note.title);
    setEditedContent(note.content);
    setEditedCategory(note.category || '');
    setEditedColor(note.color || '');
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (!activeNote) return;
    
    if (editMode) {
      // Save changes
      const updatedNote = {
        ...activeNote,
        title: editedTitle,
        content: editedContent,
        category: editedCategory || activeNote.category,
        color: editedColor || activeNote.color,
        updatedAt: new Date()
      };
      onUpdateNote?.(updatedNote);
      setActiveNote(updatedNote);
    }
    
    setEditMode(!editMode);
  };

  // Handle note property toggling (pin/favorite)
  const handleToggleProperty = (property: 'pinned' | 'favorite') => {
    if (!activeNote) return;
    
    if (property === 'pinned' && onTogglePinned) {
      onTogglePinned(activeNote.id);
      setActiveNote({
        ...activeNote,
        pinned: !activeNote.pinned
      });
    } else if (property === 'favorite' && onToggleFavorite) {
      onToggleFavorite(activeNote.id);
      setActiveNote({
        ...activeNote,
        favorite: !activeNote.favorite
      });
    }
  };

  // Handle note deletion
  const handleDeleteNote = () => {
    if (!activeNote || !onDeleteNote) return;
    onDeleteNote(activeNote.id);
    setActiveNote(null);
    setEditMode(false);
  };

  // Handle tag toggle
  const handleToggleTag = (tag: string) => {
    if (!activeNote || !onToggleTag) return;
    onToggleTag(activeNote.id, tag);
    
    const currentTags = activeNote.tags || [];
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    setActiveNote({
      ...activeNote,
      tags: updatedTags
    });
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    if (!activeNote || !onChangeCategory) return;
    onChangeCategory(activeNote.id, category);
    setEditedCategory(category);
    
    setActiveNote({
      ...activeNote,
      category
    });
  };

  // Handle color change
  const handleColorChange = (color: string) => {
    if (!activeNote || !onChangeColor) return;
    onChangeColor(activeNote.id, color);
    setEditedColor(color);
    
    setActiveNote({
      ...activeNote,
      color
    });
  };

  // Get color style for note
  const getNoteColorStyle = (colorValue?: string) => {
    if (!colorValue || colorValue === 'default') return {};
    
    const colorMap: Record<string, string> = {
      'purple': '#9b87f5',
      'blue': '#0EA5E9',
      'green': '#10B981',
      'yellow': '#F59E0B',
      'orange': '#F97316',
      'red': '#EF4444',
      'pink': '#EC4899'
    };
    
    return {
      borderLeft: `4px solid ${colorMap[colorValue] || 'var(--primary)'}`,
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Notes List */}
      <div className="md:col-span-1 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">My Notes</h3>
          <Button 
            size="sm" 
            onClick={onAddNote}
            className="rounded-full h-8 w-8 p-0"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="sr-only">Add note</span>
          </Button>
        </div>
        
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {sortedNotes.length > 0 ? (
            sortedNotes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all",
                  activeNote?.id === note.id 
                    ? "neo-morphism" 
                    : "glass-card hover:shadow-md",
                )}
                style={getNoteColorStyle(note.color)}
                onClick={() => handleSelectNote(note)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{note.title || "Untitled"}</h4>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {note.content.substring(0, 60)}
                      {note.content.length > 60 && "..."}
                    </p>
                  </div>
                  <div className="flex flex-col items-center ml-2">
                    {note.pinned && (
                      <StarIcon className="h-3 w-3 text-manifest-gold" />
                    )}
                    {note.favorite && (
                      <HeartIcon className="h-3 w-3 text-rose-400 mt-1" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">
                    {note.updatedAt.toLocaleDateString()}
                  </p>
                  {note.category && (
                    <Badge variant="outline" className="text-xs">
                      {note.category}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-6 text-muted-foreground border border-dashed rounded-lg">
              <FeatherIcon className="h-6 w-6 mx-auto text-muted-foreground/50" />
              <p className="mt-2 text-sm">No notes yet</p>
              <Button
                variant="link"
                size="sm"
                onClick={onAddNote}
                className="mt-1"
              >
                Create your first note
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Note Editor/Viewer */}
      <div className="md:col-span-2">
        {activeNote ? (
          <Card className="neo-morphism border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              {editMode ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Note title..."
                  className="font-medium text-lg h-9"
                />
              ) : (
                <div className="flex flex-col">
                  <CardTitle>{activeNote.title || "Untitled"}</CardTitle>
                  <div className="flex items-center mt-1 space-x-2 text-xs text-muted-foreground">
                    <span>Created: {activeNote.createdAt.toLocaleString()}</span>
                    <span>•</span>
                    <span>Updated: {activeNote.updatedAt.toLocaleString()}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 rounded-full",
                    activeNote.pinned && "text-manifest-gold"
                  )}
                  onClick={() => handleToggleProperty('pinned')}
                >
                  <StarIcon className="h-4 w-4" />
                  <span className="sr-only">
                    {activeNote.pinned ? "Unpin" : "Pin"}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 rounded-full",
                    activeNote.favorite && "text-rose-400"
                  )}
                  onClick={() => handleToggleProperty('favorite')}
                >
                  <HeartIcon className="h-4 w-4" />
                  <span className="sr-only">
                    {activeNote.favorite ? "Unfavorite" : "Favorite"}
                  </span>
                </Button>
              </div>
            </CardHeader>
            
            {!editMode && (
              <div className="px-6 pt-0 pb-2">
                <div className="flex flex-wrap gap-2 mb-3">
                  {activeNote.category && (
                    <div className="flex items-center">
                      <FolderIcon className="h-3 w-3 mr-1 text-primary" />
                      <Badge variant="secondary">{activeNote.category}</Badge>
                    </div>
                  )}
                  
                  {activeNote.tags && activeNote.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <TagIcon className="h-3 w-3 text-primary" />
                      <div className="flex flex-wrap gap-1">
                        {activeNote.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeNote.color && activeNote.color !== 'default' && (
                    <div className="flex items-center">
                      <PaletteIcon className="h-3 w-3 mr-1 text-primary" />
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ 
                          backgroundColor: 
                            activeNote.color === 'purple' ? '#9b87f5' :
                            activeNote.color === 'blue' ? '#0EA5E9' :
                            activeNote.color === 'green' ? '#10B981' :
                            activeNote.color === 'yellow' ? '#F59E0B' :
                            activeNote.color === 'orange' ? '#F97316' :
                            activeNote.color === 'red' ? '#EF4444' :
                            activeNote.color === 'pink' ? '#EC4899' : 'var(--primary)'
                        }} 
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {editMode && (
              <div className="px-6 pt-0 pb-2">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs font-medium mb-1">Category</p>
                    <Select 
                      value={editedCategory} 
                      onValueChange={handleCategoryChange}
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
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium mb-1">Color</p>
                    <Select 
                      value={editedColor || 'default'} 
                      onValueChange={handleColorChange}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map(color => (
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
                
                <div className="mb-3">
                  <p className="text-xs font-medium mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {availableTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={activeNote.tags?.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => handleToggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <CardContent>
              {editMode ? (
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="Write your note here..."
                  className="min-h-[200px] resize-none focus-visible:ring-0"
                />
              ) : (
                <div className="whitespace-pre-wrap min-h-[200px]">
                  {activeNote.content || (
                    <span className="text-muted-foreground">No content</span>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <div className="text-xs text-muted-foreground">
                {editMode ? "Editing" : `Last updated: ${activeNote.updatedAt.toLocaleString()}`}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteNote}
                  className="text-destructive h-8"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditToggle}
                  className="h-8"
                >
                  {editMode ? (
                    <>
                      <SaveIcon className="h-4 w-4 mr-1" />
                      Save
                    </>
                  ) : (
                    <>
                      <FeatherIcon className="h-4 w-4 mr-1" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center text-center p-10 border border-dashed rounded-lg">
            <div>
              <FeatherIcon className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-medium">No note selected</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Select a note from the list or create a new one
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={onAddNote}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Create New Note
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
