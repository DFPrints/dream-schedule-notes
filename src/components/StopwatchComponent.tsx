
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PlayIcon, PauseIcon, SquareIcon, TimerResetIcon, FlagIcon, Trophy, Share2Icon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface StopwatchComponentProps {
  targetTime?: number; // Optional target time in seconds
}

export const StopwatchComponent = ({ targetTime }: StopwatchComponentProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const [bestLap, setBestLap] = useState<number | null>(null);
  const [worstLap, setWorstLap] = useState<number | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [achievementUnlocked, setAchievementUnlocked] = useState<string | null>(null);
  const [targetReached, setTargetReached] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const achievementsRef = useRef<Set<string>>(new Set());
  
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
    if (!isRunning) {
      // Start the stopwatch
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now() - elapsedTime;
      } else {
        startTimeRef.current = Date.now() - elapsedTime;
      }
      
      intervalRef.current = window.setInterval(() => {
        const currentElapsed = Date.now() - startTimeRef.current!;
        setElapsedTime(currentElapsed);
        
        // Check if target time is reached
        if (targetTime && !targetReached && currentElapsed >= targetTime * 1000) {
          setTargetReached(true);
          toast({
            title: "Target Time Reached!",
            description: "You've reached your goal time.",
          });
        }
      }, 10);
      
      setIsRunning(true);
    } else {
      // Stop the stopwatch
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRunning(false);
      
      // Check if we should show achievements
      checkAchievements();
    }
  };
  
  // Reset the stopwatch
  const resetStopwatch = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsRunning(false);
    setElapsedTime(0);
    setLaps([]);
    setBestLap(null);
    setWorstLap(null);
    startTimeRef.current = null;
    setShowShare(false);
    setTargetReached(false);
  };
  
  // Record a lap
  const recordLap = () => {
    if (isRunning) {
      const newLaps = [elapsedTime, ...laps];
      setLaps(newLaps);
      
      // Calculate lap times (time between each lap)
      if (newLaps.length > 1) {
        const lapTimes = [];
        for (let i = 0; i < newLaps.length - 1; i++) {
          lapTimes.push(newLaps[i] - newLaps[i + 1]);
        }
        
        const minLap = Math.min(...lapTimes);
        const maxLap = Math.max(...lapTimes);
        
        setBestLap(minLap);
        setWorstLap(maxLap);
        
        // Show toast for best lap if it's a new one
        if (minLap < (bestLap || Infinity)) {
          toast({
            title: "New Best Lap!",
            description: `You've set a new record: ${formatTime(minLap).minutes}:${formatTime(minLap).seconds}.${formatTime(minLap).milliseconds}`,
          });
        }
      }
    }
  };
  
  // Check for achievements
  const checkAchievements = () => {
    const achievements = [
      { id: 'first-minute', time: 60000, title: 'First Minute', description: 'Completed your first minute of tracking' },
      { id: 'five-minutes', time: 300000, title: '5-Minute Club', description: 'Reached the 5-minute milestone' },
      { id: 'ten-laps', laps: 10, title: 'Lap Master', description: 'Recorded 10 laps in a single session' }
    ];
    
    for (const achievement of achievements) {
      if (achievement.time && elapsedTime >= achievement.time && !achievementsRef.current.has(achievement.id)) {
        achievementsRef.current.add(achievement.id);
        setAchievementUnlocked(achievement.title);
        toast({
          title: "Achievement Unlocked!",
          description: `${achievement.title}: ${achievement.description}`,
        });
        break;
      }
      
      if (achievement.laps && laps.length >= achievement.laps && !achievementsRef.current.has(achievement.id)) {
        achievementsRef.current.add(achievement.id);
        setAchievementUnlocked(achievement.title);
        toast({
          title: "Achievement Unlocked!",
          description: `${achievement.title}: ${achievement.description}`,
        });
        break;
      }
    }
    
    // Auto-hide achievement after 3 seconds
    if (achievementUnlocked) {
      setTimeout(() => {
        setAchievementUnlocked(null);
      }, 3000);
    }
  };
  
  // Handle share functionality
  const handleShare = async () => {
    try {
      const shareText = `I tracked ${formatTime(elapsedTime).hours}:${formatTime(elapsedTime).minutes}:${formatTime(elapsedTime).seconds} with ${laps.length} laps using the Manifest App Stopwatch!`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'My Stopwatch Time',
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to Clipboard",
          description: "Your time has been copied to clipboard",
        });
      }
      
      setShowShare(false);
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Sharing Failed",
        description: "There was a problem sharing your time",
        variant: "destructive",
      });
    }
  };
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Show share option when stopwatch is stopped with time > 0
  useEffect(() => {
    if (!isRunning && elapsedTime > 0) {
      setShowShare(true);
    }
  }, [isRunning, elapsedTime]);
  
  // Check for achievements when time changes
  useEffect(() => {
    if (isRunning && elapsedTime > 0) {
      checkAchievements();
    }
  }, [elapsedTime, laps.length]);

  const timeValues = formatTime(elapsedTime);
  
  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Target time indicator */}
      {targetTime && !targetReached && (
        <div className="bg-primary/10 p-2 rounded-lg text-center">
          <span className="text-sm">
            Target: {Math.floor(targetTime / 60)}:{(targetTime % 60).toString().padStart(2, '0')}
            {isRunning && (
              <span className="ml-2">
                ({Math.max(0, Math.ceil((targetTime * 1000 - elapsedTime) / 1000))}s remaining)
              </span>
            )}
          </span>
        </div>
      )}
      
      {targetReached && (
        <div className="bg-green-500/10 text-green-500 rounded-lg p-2 text-center animate-pulse">
          <span className="font-medium">Target time reached! 🎉</span>
        </div>
      )}
      
      {achievementUnlocked && (
        <div className="bg-primary/10 text-primary rounded-lg p-2 text-center animate-scale-in mb-2">
          <Trophy className="h-4 w-4 inline-block mr-1" />
          <span className="font-medium">{achievementUnlocked}</span>
        </div>
      )}
      
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
        
        {showShare && (
          <Button 
            onClick={handleShare}
            className="rounded-full" 
            size="sm"
            variant="outline"
          >
            <Share2Icon className="h-4 w-4 mr-1" />
            Share
          </Button>
        )}
      </div>
      
      {laps.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Laps</h4>
            <Badge variant="outline" className="text-xs">
              {laps.length} {laps.length === 1 ? 'lap' : 'laps'}
            </Badge>
          </div>
          
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
