
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlayIcon, PauseIcon, StopIcon, AlertCircleIcon, MoonIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerProps {
  defaultMinutes?: number;
  pauseWhenSleeping?: boolean;
  onComplete?: () => void;
}

const Timer = ({ 
  defaultMinutes = 20, 
  pauseWhenSleeping = false,
  onComplete
}: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPauseDuringSleep, setIsPauseDuringSleep] = useState(pauseWhenSleeping);
  const [timeSetting, setTimeSetting] = useState(defaultMinutes);
  const [isEditing, setIsEditing] = useState(false);
  const intervalRef = useRef<number | null>(null);

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
      onComplete?.();
    }
  }, [timeLeft, isRunning, onComplete]);

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
    setIsRunning(false);
    setTimeLeft(timeSetting * 60);
  };

  // Handle time setting change
  const handleTimeSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setTimeSetting(value);
    }
  };

  // Save time setting
  const saveTimeSetting = () => {
    setTimeLeft(timeSetting * 60);
    setIsEditing(false);
  };

  // Toggle edit mode
  const toggleEdit = () => {
    if (isRunning) return;
    setIsEditing(!isEditing);
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
            <div className="flex flex-col items-center space-y-2">
              <Input
                type="number"
                value={timeSetting}
                onChange={handleTimeSettingChange}
                className="w-24 text-center text-2xl h-12"
                min="1"
              />
              <Label className="text-sm text-muted-foreground">Minutes</Label>
              <Button 
                size="sm" 
                onClick={saveTimeSetting}
                className="mt-2"
              >
                Set
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-5xl font-light tracking-tighter">{formatTime(timeLeft)}</span>
              <span className="text-sm text-muted-foreground mt-2">
                {isRunning ? "Running" : timeLeft === 0 ? "Completed" : "Ready"}
              </span>
            </div>
          )}
        </div>
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
