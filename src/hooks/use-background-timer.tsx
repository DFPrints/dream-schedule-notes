
import { useState, useEffect, useRef } from 'react';

/**
 * A hook that allows timers to continue running even when the app is in the background.
 * 
 * @param initialTime Initial time in milliseconds
 * @param autoStart Whether to start the timer automatically
 * @param isCountdown Whether this is a countdown timer (true) or a stopwatch (false)
 * @returns Timer control functions and state
 */
export const useBackgroundTimer = (
  initialTime: number = 0,
  autoStart: boolean = false,
  isCountdown: boolean = false
) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number>(0);
  const lastTickRef = useRef<number>(Date.now());
  const timerIdRef = useRef<string>(`timer_${Math.random().toString(36).substring(2, 9)}`);
  
  // Save timer state to localStorage
  const saveState = () => {
    try {
      const state = {
        time,
        isRunning,
        isPaused,
        startTime: startTimeRef.current,
        pausedAt: pausedAtRef.current,
        lastTick: lastTickRef.current,
        initialTime,
        isCountdown,
        timestamp: Date.now(),
        timerId: timerIdRef.current
      };
      
      if (isRunning || isPaused) {
        localStorage.setItem(`background_timer_${timerIdRef.current}`, JSON.stringify(state));
      } else {
        localStorage.removeItem(`background_timer_${timerIdRef.current}`);
      }
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  };
  
  // Load timer state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(`background_timer_${timerIdRef.current}`);
      
      if (savedState) {
        const state = JSON.parse(savedState);
        
        // Only restore if it's the same type of timer
        if (state.isCountdown === isCountdown) {
          // Calculate elapsed time
          let currentTime = state.time;
          
          if (state.isRunning && !state.isPaused) {
            const now = Date.now();
            const elapsed = now - state.lastTick;
            
            if (isCountdown) {
              currentTime = Math.max(0, state.time - elapsed);
              if (currentTime === 0) {
                setIsComplete(true);
              }
            } else {
              currentTime = state.time + elapsed;
            }
          }
          
          setTime(currentTime);
          setIsRunning(state.isRunning);
          setIsPaused(state.isPaused);
          startTimeRef.current = state.startTime;
          pausedAtRef.current = state.pausedAt;
          lastTickRef.current = Date.now();
        }
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
  }, [isCountdown]);
  
  // Set up the main timer tick interval - using a more accurate approach with requestAnimationFrame
  useEffect(() => {
    if (isRunning && !isPaused) {
      let animationFrameId: number;
      
      const updateTimer = () => {
        const now = Date.now();
        const elapsed = now - lastTickRef.current;
        
        if (elapsed > 10) { // Update every 10ms for smoother display
          lastTickRef.current = now;
          
          setTime(prevTime => {
            if (isCountdown) {
              const newTime = Math.max(0, prevTime - elapsed);
              if (newTime === 0 && prevTime !== 0) {
                setIsComplete(true);
                setIsRunning(false);
              }
              return newTime;
            } else {
              return prevTime + elapsed;
            }
          });
          
          // Save state periodically (every ~1 second) to avoid excessive writes
          if (Math.random() < 0.01) {
            saveState();
          }
        }
        
        if (isRunning && !isPaused) {
          animationFrameId = requestAnimationFrame(updateTimer);
        }
      };
      
      animationFrameId = requestAnimationFrame(updateTimer);
      
      return () => {
        cancelAnimationFrame(animationFrameId);
        saveState(); // Save state on cleanup
      };
    }
  }, [isRunning, isPaused, isCountdown]);
  
  // Add event listeners for page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // App is now visible again
        if (isRunning && !isPaused) {
          // Update the time based on how long the app was in the background
          const now = Date.now();
          const elapsed = now - lastTickRef.current;
          lastTickRef.current = now;
          
          if (elapsed > 0) {
            setTime(prevTime => {
              if (isCountdown) {
                const newTime = Math.max(0, prevTime - elapsed);
                if (newTime === 0 && prevTime !== 0) {
                  setIsComplete(true);
                  setIsRunning(false);
                }
                return newTime;
              } else {
                return prevTime + elapsed;
              }
            });
          }
        }
      } else {
        // App is going into the background
        lastTickRef.current = Date.now();
        saveState();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, isPaused, isCountdown]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Save the final state on unmount if the timer is still running
      if (isRunning) {
        saveState();
      }
    };
  }, [isRunning]);
  
  // Start the timer
  const start = () => {
    if (!isRunning) {
      if (isCountdown && time === 0) {
        // Don't start a completed countdown timer
        return;
      }
      
      startTimeRef.current = isCountdown 
        ? Date.now() + time 
        : Date.now() - time;
      
      lastTickRef.current = Date.now();
      setIsRunning(true);
      setIsPaused(false);
      setIsComplete(false);
    } else if (isPaused) {
      lastTickRef.current = Date.now();
      setIsPaused(false);
    }
  };
  
  // Pause the timer
  const pause = () => {
    if (isRunning && !isPaused) {
      pausedAtRef.current = time;
      setIsPaused(true);
      saveState();
    }
  };
  
  // Resume the timer
  const resume = () => {
    if (isRunning && isPaused) {
      lastTickRef.current = Date.now();
      setIsPaused(false);
    }
  };
  
  // Reset the timer
  const reset = () => {
    setTime(initialTime);
    setIsRunning(false);
    setIsPaused(false);
    setIsComplete(false);
    startTimeRef.current = null;
    pausedAtRef.current = 0;
    lastTickRef.current = Date.now();
    
    // Clear saved state
    localStorage.removeItem(`background_timer_${timerIdRef.current}`);
  };
  
  return {
    time,
    isRunning,
    isPaused,
    isComplete,
    start,
    pause,
    resume,
    reset,
    setTime
  };
};
