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
  CalendarIcon,
  AlarmClockIcon,
  SaveIcon
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
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TimerProps {
  defaultMinutes?: number;
  pauseWhenSleeping?: boolean;
  onComplete?: () => void;
  repeatInterval?: number; // minutes between repeats
  activeDays?: string[]; // days the timer should be active
  manualDuration?: boolean; // allow manual duration input
  sleepHoursStart?: string; // start of sleep hours (e.g. "22:00")
  sleepHoursEnd?: string; // end of sleep hours (e.g. "06:00")
  is24Hour?: boolean; // 24-hour time format
  onSavePreset?: (preset: TimerPreset) => void; // handle saving preset
}

interface TimerPreset {
  name: string;
  minutes: number;
  pauseDuringSleep: boolean;
  repeatInterval?: number;
  activeDays?: string[];
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
  manualDuration = false,
  sleepHoursStart = "22:00",
  sleepHoursEnd = "06:00",
  is24Hour = true,
  onSavePreset
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
  const [isSleepTime, setIsSleepTime] = useState(false);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState("");
  
  const [hoursInput, setHoursInput] = useState("0");
  const [minutesInput, setMinutesInput] = useState(defaultMinutes.toString());
  const [secondsInput, setSecondsInput] = useState("0");
  
  const intervalRef = useRef<number | null>(null);
  const repeatTimeoutRef = useRef<number | null>(null);
  const sleepCheckIntervalRef = useRef<number | null>(null);

  const isActiveToday = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
    return selectedDays.includes(today);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const formattedHrs = hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : '';
    const formattedMins = `${mins.toString().padStart(2, '0')}:`;
    const formattedSecs = secs.toString().padStart(2, '0');
    
    return `${formattedHrs}${formattedMins}${formattedSecs}`;
  };

  const formatTimeString = (timeString: string) => {
    if (!timeString) return "";
    if (is24Hour) return timeString;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const checkIfSleepTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    const [sleepStartHour, sleepStartMinute] = sleepHoursStart.split(':').map(Number);
    const [sleepEndHour, sleepEndMinute] = sleepHoursEnd.split(':').map(Number);
    
    const sleepStartMinutes = sleepStartHour * 60 + sleepStartMinute;
    const sleepEndMinutes = sleepEndHour * 60 + sleepEndMinute;
    
    if (sleepStartMinutes > sleepEndMinutes) {
      return currentTimeMinutes >= sleepStartMinutes || currentTimeMinutes <= sleepEndMinutes;
    } else {
      return currentTimeMinutes >= sleepStartMinutes && currentTimeMinutes <= sleepEndMinutes;
    }
  };

  useEffect(() => {
    if (isPauseDuringSleep && isRunning) {
      const isSleeping = checkIfSleepTime();
      setIsSleepTime(isSleeping);
      
      if (isSleeping) {
        pauseTimer();
        toast({
          title: "Timer Paused",
          description: "Timer paused during sleep hours",
        });
      } else {
        startTimerInterval();
      }
      
      sleepCheckIntervalRef.current = window.setInterval(() => {
        const nowSleeping = checkIfSleepTime();
        setIsSleepTime(nowSleeping);
        
        if (nowSleeping && !isSleepTime && isRunning) {
          pauseTimer();
          toast({
            title: "Timer Paused",
            description: "Timer paused during sleep hours",
          });
        } else if (!nowSleeping && isSleepTime && !isRunning && intervalRef.current === null) {
          setIsRunning(true);
          startTimerInterval();
          toast({
            title: "Timer Resumed",
            description: "Sleep hours ended, timer resumed",
          });
        }
      }, 60000);
      
      return () => {
        if (sleepCheckIntervalRef.current) {
          clearInterval(sleepCheckIntervalRef.current);
        }
      };
    }
  }, [isPauseDuringSleep, isRunning, sleepHoursStart, sleepHoursEnd]);

  useEffect(() => {
    if (isPauseDuringSleep && isRunning) {
      if (document.visibilityState === 'hidden') {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
      } else {
        startTimerInterval();
      }
    }
  }, [isPauseDuringSleep, isRunning]);

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      clearInterval(intervalRef.current!);
      setIsRunning(false);
      
      setCompletionCount(prev => prev + 1);
      onComplete?.();
      
      if (isRepeating && repeatEvery > 0) {
        toast({
          title: "Timer Completed",
          description: `Timer will repeat in ${repeatEvery} ${repeatEvery === 1 ? 'minute' : 'minutes'}`
        });
        
        repeatTimeoutRef.current = window.setTimeout(() => {
          if (isActiveToday()) {
            if (isPauseDuringSleep && checkIfSleepTime()) {
              toast({
                title: "Timer Delayed",
                description: "Timer will start after sleep hours"
              });
            } else {
              setTimeLeft(timeSetting * 60);
              setIsRunning(true);
              startTimerInterval();
            }
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

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (repeatTimeoutRef.current) clearTimeout(repeatTimeoutRef.current);
      if (sleepCheckIntervalRef.current) clearInterval(sleepCheckIntervalRef.current);
    };
  }, []);

  const pauseTimer = () => {
    clearInterval(intervalRef.current!);
    intervalRef.current = null;
    setIsRunning(false);
  };

  const startTimerInterval = () => {
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

  const toggleTimer = () => {
    if (!isRunning && !isActiveToday()) {
      toast({
        title: "Timer Not Started",
        description: "Today is not enabled in your timer settings",
        variant: "destructive"
      });
      return;
    }
    
    if (!isRunning && isPauseDuringSleep && checkIfSleepTime()) {
      setIsSleepTime(true);
      toast({
        title: "Timer Not Started",
        description: "Cannot start timer during sleep hours",
        variant: "destructive"
      });
      return;
    }
    
    if (isRunning) {
      pauseTimer();
    } else {
      if (timeLeft === 0) {
        setTimeLeft(timeSetting * 60);
      }
      startTimerInterval();
      setIsRunning(true);
    }
  };

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

  const handleTimeSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setTimeSetting(value);
    }
  };

  const handleHoursInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHoursInput(value);
  };

  const handleMinutesInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinutesInput(value);
  };

  const handleSecondsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSecondsInput(value);
  };

  const applyTimeInputs = () => {
    const hrs = parseInt(hoursInput) || 0;
    const mins = parseInt(minutesInput) || 0;
    const secs = parseInt(secondsInput) || 0;
    
    const validHrs = Math.min(Math.max(hrs, 0), 23);
    const validMins = Math.min(Math.max(mins, 0), 59);
    const validSecs = Math.min(Math.max(secs, 0), 59);

    setManualHours(validHrs);
    setManualMinutes(validMins);
    setManualSeconds(validSecs);

    setHoursInput(validHrs.toString());
    setMinutesInput(validMins.toString());
    setSecondsInput(validSecs.toString());
  };

  const handleInputBlur = () => {
    applyTimeInputs();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyTimeInputs();
    }
  };

  const handleManualTimeChange = () => {
    applyTimeInputs();
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

  const saveTimeSetting = () => {
    if (isManualDuration) {
      handleManualTimeChange();
    } else {
      setTimeLeft(timeSetting * 60);
      setIsEditing(false);
    }
  };

  const toggleEdit = () => {
    if (isRunning) return;
    
    if (!isEditing) {
      setHoursInput(manualHours.toString());
      setMinutesInput(manualMinutes.toString());
      setSecondsInput(manualSeconds.toString());
    }
    
    setIsEditing(!isEditing);
  };

  const toggleRepeat = (value: boolean) => {
    setIsRepeating(value);
    if (!value && repeatTimeoutRef.current) {
      clearTimeout(repeatTimeoutRef.current);
      repeatTimeoutRef.current = null;
    }
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const progressPercent = ((timeSetting * 60 - timeLeft) / (timeSetting * 60)) * 100;

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast({
        title: "Name Required",
        description: "Please provide a name for your preset.",
        variant: "destructive"
      });
      return;
    }
    
    const totalSeconds = (manualHours * 3600) + (manualMinutes * 60) + manualSeconds;
    const minutesEquivalent = Math.ceil(totalSeconds / 60);
    
    const preset = {
      name: presetName,
      minutes: isManualDuration ? minutesEquivalent : timeSetting,
      pauseDuringSleep: isPauseDuringSleep,
      repeatInterval: isRepeating ? repeatEvery : undefined,
      activeDays: selectedDays
    };
    
    onSavePreset?.(preset);
    setShowSavePreset(false);
    setPresetName("");
    
    toast({
      title: "Preset Saved",
      description: `"${presetName}" preset has been created.`,
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={cn(
          "relative w-64 h-64 rounded-full mb-8 cursor-pointer neo-morphism flex items-center justify-center",
          isSleepTime && isPauseDuringSleep && "bg-muted/30"
        )}
        onClick={toggleEdit}
      >
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
            className={cn(
              "text-primary transition-all duration-1000 ease-out-expo",
              isSleepTime && isPauseDuringSleep && "text-muted"
            )}
            style={{
              strokeDasharray: 2 * Math.PI * 120,
              strokeDashoffset: 2 * Math.PI * 120 * (1 - progressPercent / 100),
            }}
          />
        </svg>

        <div className="z-10 text-center">
          {isEditing ? (
            <div className="flex flex-col items-center space-y-2 px-4">
              {isManualDuration ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={hoursInput}
                      onChange={handleHoursInputChange}
                      onBlur={handleInputBlur}
                      onKeyDown={handleInputKeyDown}
                      className="w-14 text-center text-lg h-10"
                      min="0"
                      max="23"
                    />
                    <span className="text-sm">h</span>
                    <Input
                      type="number"
                      value={minutesInput}
                      onChange={handleMinutesInputChange}
                      onBlur={handleInputBlur}
                      onKeyDown={handleInputKeyDown}
                      className="w-14 text-center text-lg h-10"
                      min="0"
                      max="59"
                    />
                    <span className="text-sm">m</span>
                    <Input
                      type="number"
                      value={secondsInput}
                      onChange={handleSecondsInputChange}
                      onBlur={handleInputBlur}
                      onKeyDown={handleInputKeyDown}
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
              
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={() => setShowSavePreset(true)}
              >
                <SaveIcon className="h-3 w-3 mr-1" />
                Save as Preset
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-5xl font-light tracking-tighter">{formatTime(timeLeft)}</span>
              <span className="text-sm text-muted-foreground mt-2">
                {isSleepTime && isPauseDuringSleep ? (
                  <span className="flex items-center">
                    <MoonIcon className="h-3 w-3 mr-1" />
                    Paused (Sleep Hours)
                  </span>
                ) : (
                  isRunning ? "Running" : timeLeft === 0 ? `Completed ${completionCount > 1 ? `(${completionCount}×)` : ''}` : "Ready"
                )}
              </span>
              {isRepeating && repeatEvery > 0 && (
                <div className="flex items-center text-xs text-primary/70 mt-1">
                  <RepeatIcon className="h-3 w-3 mr-1" />
                  <span>Every {repeatEvery} {repeatEvery === 1 ? 'minute' : 'minutes'}</span>
                </div>
              )}
              {isPauseDuringSleep && (
                <div className="flex items-center text-xs text-primary/70 mt-1">
                  <MoonIcon className="h-3 w-3 mr-1" />
                  <span>Pauses {formatTimeString(sleepHoursStart)}-{formatTimeString(sleepHoursEnd)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showSavePreset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4">Save Timer Preset</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="preset-name">Preset Name</Label>
                <Input
                  id="preset-name"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="e.g., My Focus Timer"
                  className="mt-1"
                  autoFocus
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Duration: {isManualDuration ? 
                  `${manualHours}h ${manualMinutes}m ${manualSeconds}s` : 
                  `${timeSetting} minutes`}
                </p>
                <p>Sleep-aware: {isPauseDuringSleep ? 'Yes' : 'No'}</p>
                {isRepeating && <p>Repeats every: {repeatEvery} minutes</p>}
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowSavePreset(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSavePreset}>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Save Preset
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            isRunning ? "bg-accent" : "bg-primary", 
            (isPauseDuringSleep && isSleepTime) && "opacity-50 cursor-not-allowed"
          )}
          onClick={toggleTimer}
          disabled={isPauseDuringSleep && isSleepTime}
        >
          {isRunning ? (
            <PauseIcon className="h-6 w-6" />
          ) : (
            <PlayIcon className="h-6 w-6" />
          )}
        </Button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent>
              <p>Pause during sleep hours ({formatTimeString(sleepHoursStart)}-{formatTimeString(sleepHoursEnd)})</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
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
      
      {isPauseDuringSleep && (
        <div className="flex items-start mt-4 max-w-xs text-center">
          <AlertCircleIcon className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Timer will automatically pause during sleep hours ({formatTimeString(sleepHoursStart)} - {formatTimeString(sleepHoursEnd)}) and when the app is in the background
          </p>
        </div>
      )}
    </div>
  );
};

export default Timer;
