
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlayIcon, PauseIcon, SquareIcon, TimerResetIcon, FlagIcon } from 'lucide-react';

export const StopwatchComponent = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const [bestLap, setBestLap] = useState<number | null>(null);
  const [worstLap, setWorstLap] = useState<number | null>(null);
  
  // Format time as HH:MM:SS.MS
  const formatTime = (time: number) => {
    const milliseconds = Math.floor((time % 1000) / 10);
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / (1000 * 60)) % 60);
    const hours = Math.floor(time / (1000 * 60 * 60));
    
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      milliseconds: milliseconds.toString().padStart(2, '0')
    };
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
    setBestLap(null);
    setWorstLap(null);
  };
  
  // Record a lap
  const recordLap = () => {
    if (isRunning) {
      const lastLapTime = laps.length > 0 ? elapsedTime - laps[0] : elapsedTime;
      const newLaps = [elapsedTime, ...laps];
      setLaps(newLaps);
      
      // Calculate best and worst laps
      if (newLaps.length > 1) {
        const lapTimes = [];
        for (let i = 0; i < newLaps.length - 1; i++) {
          lapTimes.push(newLaps[i] - newLaps[i + 1]);
        }
        
        const minLap = Math.min(...lapTimes);
        const maxLap = Math.max(...lapTimes);
        
        setBestLap(minLap);
        setWorstLap(maxLap);
      }
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

  const timeValues = formatTime(elapsedTime);
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center items-end space-x-1 mb-2">
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">H</span>
            <div className="text-3xl font-mono font-semibold tracking-tight bg-secondary/30 px-3 py-2 rounded-md">
              {timeValues.hours}
            </div>
          </div>
          <span className="text-xl font-mono mb-2">:</span>
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">M</span>
            <div className="text-3xl font-mono font-semibold tracking-tight bg-secondary/30 px-3 py-2 rounded-md">
              {timeValues.minutes}
            </div>
          </div>
          <span className="text-xl font-mono mb-2">:</span>
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">S</span>
            <div className="text-3xl font-mono font-semibold tracking-tight bg-secondary/30 px-3 py-2 rounded-md">
              {timeValues.seconds}
            </div>
          </div>
          <span className="text-xl font-mono mb-2">.</span>
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">MS</span>
            <div className="text-3xl font-mono font-semibold tracking-tight bg-secondary/30 px-3 py-2 rounded-md">
              {timeValues.milliseconds}
            </div>
          </div>
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
          <FlagIcon className="h-4 w-4 mr-1" />
          Lap
        </Button>
      </div>
      
      {laps.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2">Laps</h4>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {laps.length > 1 && (
              <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                <div className="text-center">
                  <span className="text-muted-foreground">Best Lap</span>
                  {bestLap !== null && (
                    <div className="text-green-500 font-mono mt-1">
                      {formatTime(bestLap).minutes}:{formatTime(bestLap).seconds}.{formatTime(bestLap).milliseconds}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground">Average</span>
                  {laps.length > 1 && (
                    <div className="font-mono mt-1">
                      {formatTime(laps[0] / laps.length).minutes}:{formatTime(laps[0] / laps.length).seconds}.{formatTime(laps[0] / laps.length).milliseconds}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground">Worst Lap</span>
                  {worstLap !== null && (
                    <div className="text-red-500 font-mono mt-1">
                      {formatTime(worstLap).minutes}:{formatTime(worstLap).seconds}.{formatTime(worstLap).milliseconds}
                    </div>
                  )}
                </div>
              </div>
            )}
            {laps.map((lap, index, arr) => {
              const lapTime = index === arr.length - 1 ? lap : lap - arr[index + 1];
              const isLapBest = bestLap === lapTime;
              const isLapWorst = worstLap === lapTime;
              
              return (
                <div 
                  key={index} 
                  className={`flex justify-between text-sm py-1 px-2 rounded-md ${
                    isLapBest ? "bg-green-500/10 border-l-2 border-green-500" : 
                    isLapWorst ? "bg-red-500/10 border-l-2 border-red-500" : 
                    "bg-secondary/50"
                  }`}
                >
                  <span className="font-medium">Lap {arr.length - index}</span>
                  <span className="font-mono">{formatTime(lap).minutes}:{formatTime(lap).seconds}.{formatTime(lap).milliseconds}</span>
                  {index < arr.length - 1 && (
                    <span className={`font-mono ${
                      isLapBest ? "text-green-500" : 
                      isLapWorst ? "text-red-500" : ""
                    }`}>
                      +{formatTime(lapTime).minutes}:{formatTime(lapTime).seconds}.{formatTime(lapTime).milliseconds}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
