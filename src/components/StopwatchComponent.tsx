
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlayIcon, PauseIcon, SquareIcon, TimerResetIcon } from 'lucide-react';

export const StopwatchComponent = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  
  // Format time as HH:MM:SS.MS
  const formatTime = (time: number) => {
    const milliseconds = Math.floor((time % 1000) / 10);
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / (1000 * 60)) % 60);
    const hours = Math.floor(time / (1000 * 60 * 60));
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':') + '.' + milliseconds.toString().padStart(2, '0');
  };
  
  // Start/Stop the stopwatch
  const toggleStopwatch = () => {
    setIsRunning(!isRunning);
  };
  
  // Reset the stopwatch
  const resetStopwatch = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setLaps([]);
  };
  
  // Record a lap
  const recordLap = () => {
    if (isRunning) {
      setLaps([...laps, elapsedTime]);
    }
  };
  
  // Update the timer every 10ms when running
  useEffect(() => {
    let interval: number | null = null;
    
    if (isRunning) {
      const startTime = Date.now() - elapsedTime;
      
      interval = window.setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 10);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, elapsedTime]);
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-3xl font-mono font-semibold tracking-tight">
          {formatTime(elapsedTime)}
        </div>
      </div>
      
      <div className="flex justify-center gap-2">
        <Button 
          onClick={toggleStopwatch}
          className="rounded-full" 
          size="sm"
          variant={isRunning ? "outline" : "default"}
        >
          {isRunning ? <PauseIcon className="h-4 w-4 mr-1" /> : <PlayIcon className="h-4 w-4 mr-1" />}
          {isRunning ? "Pause" : "Start"}
        </Button>
        
        <Button 
          onClick={resetStopwatch}
          className="rounded-full" 
          size="sm"
          variant="outline"
          disabled={elapsedTime === 0}
        >
          <TimerResetIcon className="h-4 w-4 mr-1" />
          Reset
        </Button>
        
        <Button 
          onClick={recordLap}
          className="rounded-full" 
          size="sm"
          variant="outline"
          disabled={!isRunning}
        >
          <SquareIcon className="h-4 w-4 mr-1" />
          Lap
        </Button>
      </div>
      
      {laps.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Laps</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {laps.map((lap, index) => (
              <div key={index} className="flex justify-between text-sm py-1 px-2 rounded-md bg-secondary/50">
                <span>Lap {laps.length - index}</span>
                <span className="font-mono">{formatTime(lap)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
