
import { useState } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckIcon, 
  PlusIcon, 
  CalendarIcon,
  CalendarDaysIcon,
  CalendarCheckIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Event {
  id: string;
  title: string;
  content?: string;
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
  const [month, setMonth] = useState<Date>(new Date());
  
  // Get events for selected date
  const eventsForSelectedDate = selectedDate 
    ? events.filter(event => 
        event.date.toDateString() === selectedDate.toDateString()
      )
    : [];

  // Get number of events per day for the current month
  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

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
              isCompleted: (date) => events.some(event => 
                event.date.toDateString() === date.toDateString() && event.completed
              ),
              isToday: (date) => date.toDateString() === new Date().toDateString(),
            }}
            modifiersClassNames={{
              hasEvent: "bg-primary/10 font-medium",
              isCompleted: "bg-manifest-gold/20 text-manifest-gold",
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
                            eventsForThisDay.map((_, idx) => (
                              <div 
                                key={idx} 
                                className={cn(
                                  "w-1 h-1 rounded-full",
                                  allComplete ? "bg-manifest-gold" :
                                  hasCompletedEvents ? "bg-primary" : "bg-primary"
                                )} 
                              />
                            ))
                          ) : (
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "absolute -bottom-0 h-3 min-w-3 px-1 text-[0.6rem] flex items-center justify-center",
                                allComplete ? "bg-manifest-gold/20 text-manifest-gold border-manifest-gold" :
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
            size="sm"
            onClick={handleAddEvent}
            className="rounded-full h-8 w-8 p-0 bg-primary hover:bg-primary/90"
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
                className={cn(
                  "flex items-center p-3 rounded-lg transition-all hover:shadow-md cursor-pointer",
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
                    "h-6 w-6 rounded-full p-0 mr-3",
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
                  <span className={cn(
                    "font-medium",
                    event.completed && "line-through text-muted-foreground"
                  )}>
                    {event.title}
                  </span>
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
              </div>
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

export default Calendar;
