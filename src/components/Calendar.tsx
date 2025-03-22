
import { useState } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { CheckIcon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  date: Date;
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
  
  // Get events for selected date
  const eventsForSelectedDate = selectedDate 
    ? events.filter(event => 
        event.date.toDateString() === selectedDate.toDateString()
      )
    : [];

  // Handle date selection
  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  // Handle add event
  const handleAddEvent = () => {
    if (selectedDate && onAddEvent) {
      onAddEvent(selectedDate);
    }
  };

  // Handle toggle event completion
  const handleToggleComplete = (event: Event) => {
    if (onToggleEventComplete) {
      onToggleEventComplete(event.id, !event.completed);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm overflow-hidden neo-morphism">
        <CardContent className="p-0">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            className="p-3 pointer-events-auto"
            modifiers={{
              hasEvent: (date) => events.some(event => 
                event.date.toDateString() === date.toDateString()
              ),
            }}
            modifiersClassNames={{
              hasEvent: "bg-primary/10 font-medium text-primary",
            }}
            components={{
              DayContent: (props) => {
                const date = props.date;
                const hasEvents = events.some(event => 
                  event.date.toDateString() === date.toDateString()
                );
                const hasCompletedEvents = events.some(event => 
                  event.date.toDateString() === date.toDateString() && event.completed
                );
                
                return (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div>{props.day}</div>
                    {hasEvents && (
                      <div className={cn(
                        "absolute -bottom-1 w-1 h-1 rounded-full",
                        hasCompletedEvents ? "bg-manifest-gold" : "bg-primary"
                      )} />
                    )}
                  </div>
                );
              },
            }}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {selectedDate ? (
              <time dateTime={selectedDate.toISOString()}>
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
          <Button
            size="sm"
            onClick={handleAddEvent}
            className="rounded-full h-8 w-8 p-0"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="sr-only">Add event</span>
          </Button>
        </div>

        {eventsForSelectedDate.length > 0 ? (
          <div className="space-y-2">
            {eventsForSelectedDate.map((event) => (
              <div 
                key={event.id}
                className="flex items-center p-3 glass-card rounded-lg transition-all hover:shadow-md cursor-pointer"
                onClick={() => onSelectEvent?.(event)}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "h-6 w-6 rounded-full p-0 mr-3",
                    event.completed ? "bg-manifest-gold/20" : "bg-primary/10"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleComplete(event);
                  }}
                >
                  <CheckIcon 
                    className={cn(
                      "h-3 w-3",
                      event.completed ? "text-manifest-gold" : "text-primary/40"
                    )} 
                  />
                  <span className="sr-only">
                    {event.completed ? "Mark as incomplete" : "Mark as complete"}
                  </span>
                </Button>
                <span className={cn(
                  "font-medium",
                  event.completed && "line-through text-muted-foreground"
                )}>
                  {event.title}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 text-muted-foreground">
            <p className="text-sm">No events for this day</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
