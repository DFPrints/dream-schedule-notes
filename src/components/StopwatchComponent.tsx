
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PlayIcon, PauseIcon, SquareIcon, TimerResetIcon, FlagIcon, Trophy, Share2Icon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { useBackgroundTimer } from '@/hooks/use-background-timer';

export const StopwatchComponent = () => {
  // Use background timer with initial time set to 0 and isCountdown set to false
  const {
    time: elapsedTime,
    isRunning,
    isPaused,
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer
  } = useBackgroundTimer(0, false, false);
  
  const [laps, setLaps] = useState<number[]>([]);
  const [bestLap, setBestLap] = useState<number | null>(null);
  const [worstLap, setWorstLap] = useState<number | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [achievementUnlocked, setAchievementUnlocked] = useState<string | null>(null);
  
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
  
  // Toggle the stopwatch
  const toggleStopwatch = () => {
    if (!isRunning) {
      startTimer();
    } else {
      pauseTimer();
    }
  };
  
  // Reset the stopwatch
  const handleReset = () => {
    resetTimer();
    setLaps([]);
    setBestLap(null);
    setWorstLap(null);
    setShowShare(false);
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
      const timeValues = formatTime(elapsedTime);
      const shareText = `I tracked ${timeValues.hours}:${timeValues.minutes}:${timeValues.seconds} with ${laps.length} laps using the Manifest App Stopwatch!`;
      
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
  }, [elapsedTime, laps.length, isRunning]);

  // For debugging
  useEffect(() => {
    console.log('Stopwatch time:', elapsedTime, 'isRunning:', isRunning, 'isPaused:', isPaused);
  }, [elapsedTime, isRunning, isPaused]);

  const timeValues = formatTime(elapsedTime);
  
  return (
    <div className="space-y-6 max-w-md mx-auto">
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
            <div className="text-2xl md:text-3xl font-mono font-semibold tracking-tight bg-secondary/30 px-2 md:px-3 py-2 rounded-md">
              {timeValues.hours}
            </div>
          </div>
          <span className="text-xl font-mono mb-2">:</span>
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">M</span>
            <div className="text-2xl md:text-3xl font-mono font-semibold tracking-tight bg-secondary/30 px-2 md:px-3 py-2 rounded-md">
              {timeValues.minutes}
            </div>
          </div>
          <span className="text-xl font-mono mb-2">:</span>
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">S</span>
            <div className="text-2xl md:text-3xl font-mono font-semibold tracking-tight bg-secondary/30 px-2 md:px-3 py-2 rounded-md">
              {timeValues.seconds}
            </div>
          </div>
          <span className="text-xl font-mono mb-2">.</span>
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">MS</span>
            <div className="text-2xl md:text-3xl font-mono font-semibold tracking-tight bg-secondary/30 px-2 md:px-3 py-2 rounded-md">
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
          onClick={handleReset}
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
          
          <div className="max-h-48 overflow-y-auto space-y-1 pb-2">
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
            <div className="space-y-1">
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
        </div>
      )}
    </div>
  );
};
