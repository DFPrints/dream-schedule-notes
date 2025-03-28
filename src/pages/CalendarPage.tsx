
import { useState } from 'react';
import Layout from '@/components/Layout';
import CalendarComponent from '@/components/Calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { PlusIcon, XIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  content?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  category?: string;
  categoryColor?: string;
  completed: boolean;
}

const CATEGORIES = [
  { name: 'Meditation', color: '#4ade80' },
  { name: 'Visualization', color: '#60a5fa' },
  { name: 'Gratitude', color: '#f97316' },
  { name: 'Affirmation', color: '#a78bfa' },
  { name: 'Journal', color: '#facc15' },
];

const CalendarPage = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Morning Meditation',
      content: 'Focus on abundance and gratitude',
      date: new Date(),
      startTime: '08:00',
      endTime: '08:30',
      category: 'Meditation',
      categoryColor: '#4ade80',
      completed: false,
    },
    {
      id: '2',
      title: 'Visualization Practice',
      content: 'Visualize achieving your goals',
      date: new Date(Date.now() - 86400000), // yesterday
      startTime: '19:00',
      endTime: '19:30',
      category: 'Visualization',
      categoryColor: '#60a5fa',
      completed: true,
    },
  ]);
  
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventContent, setNewEventContent] = useState('');
  const [newEventStartTime, setNewEventStartTime] = useState('');
  const [newEventEndTime, setNewEventEndTime] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('');
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewEventOpen, setIsViewEventOpen] = useState(false);
  const [isCreateCustomCategoryOpen, setIsCreateCustomCategoryOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<Array<{name: string, color: string}>>([]);

  // Find category color by name
  const getCategoryColor = (categoryName: string) => {
    const predefinedCategory = CATEGORIES.find(cat => cat.name === categoryName);
    if (predefinedCategory) return predefinedCategory.color;
    
    const customCategory = customCategories.find(cat => cat.name === categoryName);
    if (customCategory) return customCategory.color;
    
    return '#4ade80'; // Default green
  };

  // Handle add event
  const handleAddEvent = (date: Date) => {
    setSelectedDate(date);
    setNewEventTitle('');
    setNewEventContent('');
    setNewEventStartTime('');
    setNewEventEndTime('');
    setNewEventCategory('Meditation'); // Default to meditation
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
      startTime: newEventStartTime || undefined,
      endTime: newEventEndTime || undefined,
      category: newEventCategory || 'Meditation',
      categoryColor: getCategoryColor(newEventCategory || 'Meditation'),
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

  // Format time for display
  const formatTime = (time?: string) => {
    if (!time) return '';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (e) {
      return time;
    }
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
          <DialogContent className="sm:max-w-md bg-black text-white border-gray-800">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl">Add New Event</DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-4 text-gray-400 hover:text-white" 
                onClick={() => setIsAddEventOpen(false)}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Title
                </label>
                <Input
                  placeholder="Event title"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="bg-gray-900 border-gray-700 focus:border-blue-500 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Description (optional)
                </label>
                <Textarea
                  placeholder="Event description"
                  value={newEventContent}
                  onChange={(e) => setNewEventContent(e.target.value)}
                  rows={4}
                  className="bg-gray-900 border-gray-700 focus:border-blue-500 text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Start Time
                  </label>
                  <Input
                    type="time"
                    value={newEventStartTime}
                    onChange={(e) => setNewEventStartTime(e.target.value)}
                    className="bg-gray-900 border-gray-700 focus:border-blue-500 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    End Time (optional)
                  </label>
                  <Input
                    type="time"
                    value={newEventEndTime}
                    onChange={(e) => setNewEventEndTime(e.target.value)}
                    className="bg-gray-900 border-gray-700 focus:border-blue-500 text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium">
                    Category
                  </label>
                  <Button 
                    variant="link" 
                    className="text-blue-400 text-xs p-0 h-auto"
                    onClick={() => setIsCreateCustomCategoryOpen(true)}
                  >
                    Create Custom
                  </Button>
                </div>
                <Select value={newEventCategory} onValueChange={setNewEventCategory}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 focus:border-blue-500">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {[...CATEGORIES, ...customCategories].map((category) => (
                      <SelectItem 
                        key={category.name} 
                        value={category.name}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4 flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddEventOpen(false)}
                  className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveNewEvent}
                  className="bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                  Add Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Event Dialog */}
        <Dialog open={isViewEventOpen} onOpenChange={setIsViewEventOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-700" 
                onClick={() => setIsViewEventOpen(false)}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Date</label>
                <p className="text-sm">
                  {selectedEvent?.date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              {(selectedEvent?.startTime || selectedEvent?.endTime) && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">Time</label>
                  <p className="text-sm">
                    {formatTime(selectedEvent?.startTime)}
                    {selectedEvent?.endTime && ` - ${formatTime(selectedEvent?.endTime)}`}
                  </p>
                </div>
              )}
              
              {selectedEvent?.category && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">Category</label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: selectedEvent.categoryColor || '#4ade80' }}
                    />
                    <p className="text-sm">{selectedEvent.category}</p>
                  </div>
                </div>
              )}
              
              {selectedEvent?.content && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm whitespace-pre-wrap">{selectedEvent.content}</p>
                </div>
              )}
              
              <div className="space-y-1">
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
                variant={selectedEvent?.completed ? "outline" : "default"}
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
