
import { useState } from 'react';
import Layout from '@/components/Layout';
import Notes from '@/components/Notes';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from '@/lib/uuid';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  pinned: boolean;
  favorite: boolean;
}

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
    },
    {
      id: '2',
      title: 'Affirmations',
      content: 'I am worthy of all the good things coming my way.\nI attract success and abundance effortlessly.\nI am grateful for all that I have and all that is coming to me.',
      createdAt: new Date(Date.now() - 5 * 86400000),
      updatedAt: new Date(Date.now() - 5 * 86400000),
      pinned: false,
      favorite: true,
    },
  ]);

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
      note.id === updatedNote.id ? updatedNote : note
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

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-medium">Notes</h1>
          <p className="text-muted-foreground">
            Journal your manifestation journey
          </p>
        </div>

        {/* Notes Component */}
        <Notes
          notes={notes}
          onAddNote={addNote}
          onUpdateNote={updateNote}
          onDeleteNote={deleteNote}
          onTogglePinned={togglePinned}
          onToggleFavorite={toggleFavorite}
        />
      </div>
    </Layout>
  );
};

export default NotesPage;
