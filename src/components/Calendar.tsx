import { useState } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckIcon, 
  PlusIcon, 
  CalendarIcon,
  CalendarDaysIcon,
  CalendarCheckIcon,
  ClockIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

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

interface CalendarProps {
  events?: Event[];
  onAddEvent?: (date: Date) => void;
  onSelectEvent?: (event: Event) => void;
  onToggleEventComplete?: (id: string, completed: boolean) => void;
}

const Calendar = ({ 
  events = [], 
  onAddEvent,
  onSelectEvent,
  onToggleEventComplete
}: CalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  
  const eventsForSelectedDate = selectedDate 
    ? events.filter(event => 
        event.date.toDateString() === selectedDate.toDateString()
      ).sort((a, b) => {
        if (a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        if (a.startTime && !b.startTime) return -1;
        if (!a.startTime && b.startTime) return 1;
        return a.title.localeCompare(b.title);
      })
    : [];

  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleAddEvent = () => {
    if (selectedDate && onAddEvent) {
      onAddEvent(selectedDate);
    }
  };

  const handleToggleComplete = (event: Event) => {
    if (onToggleEventComplete) {
      onToggleEventComplete(event.id, !event.completed);
    }
  };

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
    <div className="space-y-6">
      <Card className="border-0 shadow-md overflow-hidden rounded-xl">
        <CardHeader className="bg-primary/5 pb-2">
          <CardTitle className="flex items-center text-lg">
            <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
            <span className="text-lg font-medium">
              {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            className="p-3 pointer-events-auto"
            onMonthChange={setMonth}
            modifiers={{
              hasEvent: (date) => events.some(event => 
                event.date.toDateString() === date.toDateString()
              ),
              isCompleted: (date) => {
                const dayEvents = events.filter(event => 
                  event.date.toDateString() === date.toDateString()
                );
                return dayEvents.length > 0 && dayEvents.every(event => event.completed);
              },
              hasPartialComplete: (date) => {
                const dayEvents = events.filter(event => 
                  event.date.toDateString() === date.toDateString()
                );
                return dayEvents.length > 0 && 
                       dayEvents.some(event => event.completed) &&
                       !dayEvents.every(event => event.completed);
              },
              isToday: (date) => date.toDateString() === new Date().toDateString(),
            }}
            modifiersClassNames={{
              hasEvent: "bg-primary/10 font-medium",
              isCompleted: "bg-manifest-gold/20 text-manifest-gold",
              hasPartialComplete: "bg-primary/20",
              isToday: "border-2 border-primary ring-2 ring-primary/20",
            }}
            components={{
              DayContent: (props) => {
                const date = props.date;
                const dateNumber = date.getDate();
                const eventsForThisDay = getEventsForDay(date);
                const hasEvents = eventsForThisDay.length > 0;
                const hasCompletedEvents = eventsForThisDay.some(event => event.completed);
                const allComplete = hasEvents && eventsForThisDay.every(event => event.completed);
                
                const categoryColors = hasEvents 
                  ? [...new Set(eventsForThisDay.map(e => e.categoryColor || '#4ade80'))]
                  : [];
                
                return (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className={cn(
                      "w-full h-full flex items-center justify-center",
                      hasEvents && "font-medium",
                    )}>
                      {dateNumber}
                      
                      {hasEvents && (
                        <div className="absolute -bottom-1 flex space-x-0.5 justify-center">
                          {eventsForThisDay.length > 0 && eventsForThisDay.length <= 3 ? (
                            categoryColors.map((color, idx) => (
                              <div 
                                key={idx} 
                                className="w-1 h-1 rounded-full" 
                                style={{ backgroundColor: color }}
                              />
                            ))
                          ) : (
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "absolute -bottom-0 h-3 min-w-3 px-1 text-[0.6rem] flex items-center justify-center",
                                allComplete ? "bg-manifest-gold/20 text-manifest-gold border-manifest-gold" :
                                hasCompletedEvents ? "bg-primary/20 text-primary border-primary" :
                                "bg-primary/20 text-primary border-primary"
                              )}
                            >
                              {eventsForThisDay.length}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              },
            }}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-medium flex items-center">
              {selectedDate ? (
                <time dateTime={selectedDate.toISOString()} className="flex items-center">
                  <CalendarDaysIcon className="h-4 w-4 mr-2 text-primary" />
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </time>
              ) : (
                "Select a date"
              )}
            </h3>
            {selectedDate?.toDateString() === new Date().toDateString() && (
              <Badge variant="outline" className="bg-primary/5 text-xs">Today</Badge>
            )}
          </div>
          <Button
            onClick={handleAddEvent}
            className="rounded-md h-9 bg-primary hover:bg-primary/90 flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Event</span>
          </Button>
        </div>

        {eventsForSelectedDate.length > 0 ? (
          <div className="space-y-2">
            {eventsForSelectedDate.map((event) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-start p-4 rounded-lg transition-all hover:shadow-md cursor-pointer",
                  event.completed 
                    ? "glass-card bg-manifest-gold/5 border border-manifest-gold/20" 
                    : "glass-card hover:bg-primary/5"
                )}
                onClick={() => onSelectEvent?.(event)}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "h-6 w-6 rounded-full p-0 mr-3 mt-0.5",
                    event.completed 
                      ? "bg-manifest-gold/20 text-manifest-gold" 
                      : "bg-primary/10 text-primary/40"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleComplete(event);
                  }}
                >
                  <CheckIcon className="h-3 w-3" />
                  <span className="sr-only">
                    {event.completed ? "Mark as incomplete" : "Mark as complete"}
                  </span>
                </Button>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className={cn(
                      "font-medium",
                      event.completed && "line-through text-muted-foreground"
                    )}>
                      {event.title}
                    </span>
                    
                    {event.categoryColor && (
                      <div 
                        className="w-3 h-3 rounded-full ml-2" 
                        style={{ backgroundColor: event.categoryColor }}
                      />
                    )}
                  </div>
                  
                  {(event.startTime || event.category) && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {event.startTime && (
                        <div className="flex items-center text-xs text-muted-foreground gap-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>
                            {formatTime(event.startTime)}
                            {event.endTime && ` - ${formatTime(event.endTime)}`}
                          </span>
                        </div>
                      )}
                      
                      {event.category && (
                        <Badge 
                          variant="outline" 
                          className="px-2 py-0 h-5 text-xs"
                          style={{ 
                            backgroundColor: `${event.categoryColor}20`,
                            color: event.categoryColor,
                            borderColor: `${event.categoryColor}40`
                          }}
                        >
                          {event.category}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {event.content && (
                    <p className={cn(
                      "text-xs mt-1",
                      event.completed ? "text-muted-foreground/70" : "text-muted-foreground"
                    )}>
                      {event.content.length > 60 
                        ? `${event.content.substring(0, 60)}...` 
                        : event.content}
                    </p>
                  )}
                </div>
                {event.completed && (
                  <CalendarCheckIcon className="h-4 w-4 text-manifest-gold ml-2" />
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 rounded-lg border border-dashed border-muted-foreground/20 bg-muted/5">
            <CalendarIcon className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No events for this day</p>
            <Button 
              variant="link" 
              className="text-primary mt-2 text-sm"
              onClick={handleAddEvent}
            >
              Add your first event
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const CategoryForm = ({ onClose, onSave }) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#9b87f5");

  const colors = [
    { name: "Purple", value: "#9b87f5" },
    { name: "Blue", value: "#0EA5E9" },
    { name: "Green", value: "#10B981" },
    { name: "Yellow", value: "#F59E0B" },
    { name: "Orange", value: "#F97316" },
    { name: "Red", value: "#EF4444" },
    { name: "Pink", value: "#EC4899" },
    { name: "Indigo", value: "#6366F1" },
    { name: "Teal", value: "#14B8A6" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSave({
      id: uuidv4(),
      name: name.trim(),
      color,
    });
    
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category-name">Category Name</Label>
        <Input
          id="category-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1"
          placeholder="Enter category name"
          autoFocus
        />
      </div>
      
      <div>
        <Label>Color</Label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {colors.map((colorOption) => (
            <div
              key={colorOption.value}
              className={`flex items-center justify-center p-2 rounded-md cursor-pointer border-2 transition-all ${
                color === colorOption.value ? "border-primary" : "border-transparent"
              }`}
              style={{ backgroundColor: `${colorOption.value}22` }}
              onClick={() => setColor(colorOption.value)}
            >
              <div
                className="w-4 h-4 rounded-full mr-1.5"
                style={{ backgroundColor: colorOption.value }}
              />
              <span className="text-xs truncate max-w-[70px]">{colorOption.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          Save
        </Button>
      </div>
    </form>
  );
};

export default Calendar;
