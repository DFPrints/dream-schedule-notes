
import { useState } from 'react';
import Layout from '@/components/Layout';
import CalendarComponent from '@/components/Calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { PlusIcon } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  content?: string;
  date: Date;
  completed: boolean;
}

const CalendarPage = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Morning Meditation',
      content: 'Focus on abundance and gratitude',
      date: new Date(),
      completed: false,
    },
    {
      id: '2',
      title: 'Visualization Practice',
      content: 'Visualize achieving your goals',
      date: new Date(Date.now() - 86400000), // yesterday
      completed: true,
    },
  ]);
  
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventContent, setNewEventContent] = useState('');
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewEventOpen, setIsViewEventOpen] = useState(false);

  // Handle add event
  const handleAddEvent = (date: Date) => {
    setSelectedDate(date);
    setNewEventTitle('');
    setNewEventContent('');
    setIsAddEventOpen(true);
  };

  // Save new event
  const saveNewEvent = () => {
    if (!newEventTitle.trim() || !selectedDate) return;
    
    const newEvent: Event = {
      id: Date.now().toString(),
      title: newEventTitle,
      content: newEventContent,
      date: selectedDate,
      completed: false,
    };
    
    setEvents([...events, newEvent]);
    setIsAddEventOpen(false);
    
    toast({
      title: "Event Added",
      description: `"${newEventTitle}" has been added to your calendar.`,
    });
  };

  // Handle select event
  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsViewEventOpen(true);
  };

  // Toggle event completion
  const toggleEventComplete = (id: string, completed: boolean) => {
    const updatedEvents = events.map(event => 
      event.id === id ? { ...event, completed } : event
    );
    setEvents(updatedEvents);
    
    if (selectedEvent && selectedEvent.id === id) {
      setSelectedEvent({ ...selectedEvent, completed });
    }
    
    toast({
      title: completed ? "Event Completed" : "Event Incomplete",
      description: `Event has been marked as ${completed ? 'completed' : 'incomplete'}.`,
    });
  };

  // Delete event
  const deleteEvent = () => {
    if (!selectedEvent) return;
    
    const updatedEvents = events.filter(event => event.id !== selectedEvent.id);
    setEvents(updatedEvents);
    setIsViewEventOpen(false);
    
    toast({
      title: "Event Deleted",
      description: `"${selectedEvent.title}" has been removed from your calendar.`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-medium">Calendar</h1>
          <p className="text-muted-foreground">
            Track your manifestation practice
          </p>
        </div>

        {/* Calendar */}
        <CalendarComponent
          events={events}
          onAddEvent={handleAddEvent}
          onSelectEvent={handleSelectEvent}
          onToggleEventComplete={toggleEventComplete}
        />

        {/* Add Event Dialog */}
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Date</label>
                <p className="text-sm">
                  {selectedDate?.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Event title"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (optional)</label>
                <Textarea
                  placeholder="Add details about this event"
                  value={newEventContent}
                  onChange={(e) => setNewEventContent(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveNewEvent}>
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Event Dialog */}
        <Dialog open={isViewEventOpen} onOpenChange={setIsViewEventOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <p className="text-sm">
                  {selectedEvent?.date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              {selectedEvent?.content && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm">{selectedEvent.content}</p>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <p className="text-sm">
                  {selectedEvent?.completed ? "Completed" : "Not completed"}
                </p>
              </div>
            </div>
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button variant="destructive" onClick={deleteEvent}>
                Delete Event
              </Button>
              <Button 
                onClick={() => {
                  if (selectedEvent) {
                    toggleEventComplete(selectedEvent.id, !selectedEvent.completed);
                    setIsViewEventOpen(false);
                  }
                }}
              >
                Mark as {selectedEvent?.completed ? "Incomplete" : "Complete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CalendarPage;
