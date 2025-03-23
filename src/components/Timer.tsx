
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  PlayIcon, 
  PauseIcon, 
  Square as StopIcon, 
  AlertCircleIcon, 
  MoonIcon, 
  RepeatIcon,
  CalendarIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { toast } from '@/components/ui/use-toast';

interface TimerProps {
  defaultMinutes?: number;
  pauseWhenSleeping?: boolean;
  onComplete?: () => void;
  repeatInterval?: number; // minutes between repeats
  activeDays?: string[]; // days the timer should be active
  manualDuration?: boolean; // allow manual duration input
}

const daysOfWeek = [
  { value: 'sun', label: 'S' },
  { value: 'mon', label: 'M' },
  { value: 'tue', label: 'T' },
  { value: 'wed', label: 'W' },
  { value: 'thu', label: 'T' },
  { value: 'fri', label: 'F' },
  { value: 'sat', label: 'S' },
];

const Timer = ({ 
  defaultMinutes = 20, 
  pauseWhenSleeping = false,
  onComplete,
  repeatInterval = 0,
  activeDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
  manualDuration = false
}: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPauseDuringSleep, setIsPauseDuringSleep] = useState(pauseWhenSleeping);
  const [timeSetting, setTimeSetting] = useState(defaultMinutes);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(activeDays);
  const [repeatEvery, setRepeatEvery] = useState(repeatInterval);
  const [isRepeating, setIsRepeating] = useState(repeatInterval > 0);
  const [completionCount, setCompletionCount] = useState(0);
  const [isManualDuration, setIsManualDuration] = useState(manualDuration);
  const [manualHours, setManualHours] = useState(0);
  const [manualMinutes, setManualMinutes] = useState(defaultMinutes);
  const [manualSeconds, setManualSeconds] = useState(0);
  
  const intervalRef = useRef<number | null>(null);
  const repeatTimeoutRef = useRef<number | null>(null);

  // Check if timer should be active today
  const isActiveToday = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
    return selectedDays.includes(today);
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const formattedHrs = hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : '';
    const formattedMins = `${mins.toString().padStart(2, '0')}:`;
    const formattedSecs = secs.toString().padStart(2, '0');
    
    return `${formattedHrs}${formattedMins}${formattedSecs}`;
  };

  // Handle visibility change to pause timer when tab is not visible (simulating sleep detection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isPauseDuringSleep && isRunning) {
        if (document.visibilityState === 'hidden') {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
        } else {
          startTimer();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPauseDuringSleep, isRunning]);

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      clearInterval(intervalRef.current!);
      setIsRunning(false);
      
      setCompletionCount(prev => prev + 1);
      onComplete?.();
      
      // Handle repeating timer
      if (isRepeating && repeatEvery > 0) {
        toast({
          title: "Timer Completed",
          description: `Timer will repeat in ${repeatEvery} ${repeatEvery === 1 ? 'minute' : 'minutes'}`
        });
        
        // Schedule the next timer
        repeatTimeoutRef.current = window.setTimeout(() => {
          // Only start if it's an active day
          if (isActiveToday()) {
            setTimeLeft(timeSetting * 60);
            setIsRunning(true);
            startTimer();
          } else {
            toast({
              title: "Timer Skipped",
              description: "Timer not started because today is disabled in settings"
            });
          }
        }, repeatEvery * 60 * 1000);
      }
    }
  }, [timeLeft, isRunning, onComplete, isRepeating, repeatEvery, timeSetting]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (repeatTimeoutRef.current) clearTimeout(repeatTimeoutRef.current);
    };
  }, []);

  // Start timer function
  const startTimer = () => {
    if (intervalRef.current !== null) return;
    
    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Toggle timer play/pause
  const toggleTimer = () => {
    // Check if today is an active day
    if (!isRunning && !isActiveToday()) {
      toast({
        title: "Timer Not Started",
        description: "Today is not enabled in your timer settings",
        variant: "destructive"
      });
      return;
    }
    
    if (isRunning) {
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
      setIsRunning(false);
    } else {
      if (timeLeft === 0) {
        // Reset timer if it's completed
        setTimeLeft(timeSetting * 60);
      }
      startTimer();
      setIsRunning(true);
    }
  };

  // Reset timer
  const resetTimer = () => {
    clearInterval(intervalRef.current!);
    intervalRef.current = null;
    if (repeatTimeoutRef.current) {
      clearTimeout(repeatTimeoutRef.current);
      repeatTimeoutRef.current = null;
    }
    setIsRunning(false);
    setTimeLeft(timeSetting * 60);
    setCompletionCount(0);
  };

  // Handle time setting change
  const handleTimeSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setTimeSetting(value);
    }
  };

  // Handle manual time inputs
  const handleManualTimeChange = () => {
    const totalSeconds = (manualHours * 3600) + (manualMinutes * 60) + manualSeconds;
    if (totalSeconds > 0) {
      setTimeSetting(Math.ceil(totalSeconds / 60));
      setTimeLeft(totalSeconds);
      setIsEditing(false);
    } else {
      toast({
        title: "Invalid Time",
        description: "Please enter a time greater than zero",
        variant: "destructive"
      });
    }
  };

  // Save time setting
  const saveTimeSetting = () => {
    if (isManualDuration) {
      handleManualTimeChange();
    } else {
      setTimeLeft(timeSetting * 60);
      setIsEditing(false);
    }
  };

  // Toggle edit mode
  const toggleEdit = () => {
    if (isRunning) return;
    setIsEditing(!isEditing);
  };

  // Toggle repeat timer
  const toggleRepeat = (value: boolean) => {
    setIsRepeating(value);
    if (!value && repeatTimeoutRef.current) {
      clearTimeout(repeatTimeoutRef.current);
      repeatTimeoutRef.current = null;
    }
  };

  // Toggle day selection
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      // Don't allow removing the last day
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Calculate progress percentage
  const progressPercent = ((timeSetting * 60 - timeLeft) / (timeSetting * 60)) * 100;

  return (
    <div className="flex flex-col items-center">
      {/* Timer Circle */}
      <div 
        className="relative w-64 h-64 rounded-full mb-8 cursor-pointer neo-morphism flex items-center justify-center"
        onClick={toggleEdit}
      >
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-muted opacity-20"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className="text-primary transition-all duration-1000 ease-out-expo"
            style={{
              strokeDasharray: 2 * Math.PI * 120,
              strokeDashoffset: 2 * Math.PI * 120 * (1 - progressPercent / 100),
            }}
          />
        </svg>

        {/* Timer Display */}
        <div className="z-10 text-center">
          {isEditing ? (
            <div className="flex flex-col items-center space-y-2 px-4">
              {isManualDuration ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={manualHours}
                      onChange={(e) => setManualHours(parseInt(e.target.value) || 0)}
                      className="w-14 text-center text-lg h-10"
                      min="0"
                      max="23"
                    />
                    <span className="text-sm">h</span>
                    <Input
                      type="number"
                      value={manualMinutes}
                      onChange={(e) => setManualMinutes(parseInt(e.target.value) || 0)}
                      className="w-14 text-center text-lg h-10"
                      min="0"
                      max="59"
                    />
                    <span className="text-sm">m</span>
                    <Input
                      type="number"
                      value={manualSeconds}
                      onChange={(e) => setManualSeconds(parseInt(e.target.value) || 0)}
                      className="w-14 text-center text-lg h-10"
                      min="0"
                      max="59"
                    />
                    <span className="text-sm">s</span>
                  </div>
                  <div className="flex justify-between w-full">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setIsManualDuration(false)}
                    >
                      Simple
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={saveTimeSetting}
                    >
                      Set
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <Input
                    type="number"
                    value={timeSetting}
                    onChange={handleTimeSettingChange}
                    className="w-24 text-center text-2xl h-12"
                    min="1"
                  />
                  <Label className="text-sm text-muted-foreground">Minutes</Label>
                  <div className="flex justify-between w-full">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setIsManualDuration(true)}
                    >
                      Advanced
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={saveTimeSetting}
                    >
                      Set
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-5xl font-light tracking-tighter">{formatTime(timeLeft)}</span>
              <span className="text-sm text-muted-foreground mt-2">
                {isRunning ? "Running" : timeLeft === 0 ? `Completed ${completionCount > 1 ? `(${completionCount}×)` : ''}` : "Ready"}
              </span>
              {isRepeating && repeatEvery > 0 && (
                <div className="flex items-center text-xs text-primary/70 mt-1">
                  <RepeatIcon className="h-3 w-3 mr-1" />
                  <span>Every {repeatEvery} {repeatEvery === 1 ? 'minute' : 'minutes'}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active Days */}
      <div className="mb-4">
        <ToggleGroup type="multiple" value={selectedDays} className="justify-center">
          {daysOfWeek.map((day) => (
            <ToggleGroupItem
              key={day.value}
              value={day.value}
              aria-label={`Toggle ${day.label}`}
              size="sm"
              className="w-8 h-8 rounded-full data-[state=on]:bg-primary data-[state=on]:text-white"
              onClick={() => toggleDay(day.value)}
            >
              {day.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        <Button
          size="lg"
          variant="outline"
          className="w-12 h-12 rounded-full"
          onClick={resetTimer}
          disabled={isRunning && timeLeft > 0}
        >
          <StopIcon className="h-5 w-5" />
        </Button>
        
        <Button
          size="lg"
          variant={isRunning ? "secondary" : "default"}
          className={cn(
            "w-16 h-16 rounded-full shadow-md transition-transform duration-300",
            isRunning ? "bg-accent" : "bg-primary"
          )}
          onClick={toggleTimer}
        >
          {isRunning ? (
            <PauseIcon className="h-6 w-6" />
          ) : (
            <PlayIcon className="h-6 w-6" />
          )}
        </Button>
        
        <div className="w-12 h-12 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Switch
              id="sleep-mode"
              checked={isPauseDuringSleep}
              onCheckedChange={setIsPauseDuringSleep}
            />
            <Label htmlFor="sleep-mode" className="sr-only">
              Pause during sleep
            </Label>
            <MoonIcon 
              className={cn(
                "h-5 w-5 transition-colors", 
                isPauseDuringSleep ? "text-primary" : "text-muted-foreground"
              )} 
            />
          </div>
        </div>
      </div>
      
      {/* Repeat Option */}
      <div className="mt-4 flex flex-col items-center">
        <div className="flex items-center space-x-2 mb-2">
          <Switch
            id="repeat-mode"
            checked={isRepeating}
            onCheckedChange={toggleRepeat}
          />
          <Label htmlFor="repeat-mode" className="text-sm">
            Repeat Timer
          </Label>
        </div>
        
        {isRepeating && (
          <div className="flex items-center space-x-2">
            <Label className="text-sm">Every</Label>
            <Input
              type="number"
              value={repeatEvery}
              onChange={(e) => setRepeatEvery(parseInt(e.target.value) || 1)}
              className="w-16 h-8 text-center"
              min="1"
              max="1440"
            />
            <Label className="text-sm">minutes</Label>
          </div>
        )}
      </div>
      
      {/* Sleep Mode Description */}
      {isPauseDuringSleep && (
        <div className="flex items-start mt-4 max-w-xs text-center">
          <AlertCircleIcon className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Timer will automatically pause when the app is in the background or your device is sleeping
          </p>
        </div>
      )}
    </div>
  );
};

export default Timer;
