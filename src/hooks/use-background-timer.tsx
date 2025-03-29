
import { useState, useEffect, useRef } from 'react';

/**
 * A hook that allows timers to continue running even when the app is in the background.
 * 
 * @param initialTime Initial time in seconds
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
  
  // Save timer state to localStorage with timestamp for background tracking
  const saveState = () => {
    try {
      const state = {
        time,
        isRunning,
        isPaused,
        startTime: startTimeRef.current,
        pausedAt: pausedAtRef.current,
        lastTick: Date.now(), // Always use the current time when saving
        initialTime,
        isCountdown,
        timestamp: Date.now()
      };
      
      if (isRunning || isPaused) {
        localStorage.setItem(`background_timer_${isCountdown ? 'countdown' : 'stopwatch'}`, JSON.stringify(state));
      } else {
        localStorage.removeItem(`background_timer_${isCountdown ? 'countdown' : 'stopwatch'}`);
      }
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  };
  
  // Load timer state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(`background_timer_${isCountdown ? 'countdown' : 'stopwatch'}`);
      
      if (savedState) {
        const state = JSON.parse(savedState);
        
        // Only restore if it's the same type of timer
        if (state.isCountdown === isCountdown) {
          // Calculate elapsed time
          let currentTime = state.time;
          
          if (state.isRunning && !state.isPaused) {
            const now = Date.now();
            const elapsed = Math.floor((now - state.lastTick) / 1000);
            
            if (isCountdown) {
              currentTime = Math.max(0, state.time - elapsed);
              if (currentTime === 0) {
                setIsComplete(true);
                setIsRunning(false);
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
  
  // Set up the main timer tick interval
  useEffect(() => {
    if (isRunning && !isPaused) {
      const tick = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - lastTickRef.current) / 1000);
        if (elapsed > 0) {
          lastTickRef.current = now;
          
          setTime(prevTime => {
            if (isCountdown) {
              const newTime = Math.max(0, prevTime - elapsed);
              if (newTime === 0) {
                setIsComplete(true);
                setIsRunning(false);
              }
              return newTime;
            } else {
              return prevTime + elapsed;
            }
          });
        }
        
        // Save state periodically (every 5 seconds) to ensure background tracking works
        if (now - lastTickRef.current > 5000) {
          saveState();
        }
      };
      
      // Use setInterval for consistent ticking
      intervalRef.current = window.setInterval(tick, 1000);
      
      // Also save the current state
      saveState();
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isRunning, isPaused, isCountdown]);
  
  // Save state when timer running state changes
  useEffect(() => {
    saveState();
  }, [time, isRunning, isPaused]);
  
  // Add event listeners for page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // App is now visible again
        if (isRunning && !isPaused) {
          // Update the time based on how long the app was in the background
          const now = Date.now();
          const elapsed = Math.floor((now - lastTickRef.current) / 1000);
          lastTickRef.current = now;
          
          if (elapsed > 0) {
            setTime(prevTime => {
              if (isCountdown) {
                const newTime = Math.max(0, prevTime - elapsed);
                if (newTime === 0) {
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
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for beforeunload to save state when app is closed
    window.addEventListener('beforeunload', saveState);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', saveState);
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
      startTimeRef.current = Date.now() - (time * 1000);
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
    localStorage.removeItem(`background_timer_${isCountdown ? 'countdown' : 'stopwatch'}`);
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
