
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
  const requestAnimationFrameRef = useRef<number | null>(null);
  const storageKeyRef = useRef<string>(`background_timer_${isCountdown ? 'countdown' : 'stopwatch'}_${Date.now()}`);
  const isVisibleRef = useRef<boolean>(true);
  
  useEffect(() => {
    storageKeyRef.current = `background_timer_${isCountdown ? 'countdown' : 'stopwatch'}_${Date.now()}`;
    
    // Clean up old timers
    const cleanup = () => {
      const previousKeys = Object.keys(localStorage).filter(key => 
        key.startsWith(`background_timer_${isCountdown ? 'countdown' : 'stopwatch'}_`) && 
        key !== storageKeyRef.current
      );
      
      previousKeys.forEach(key => {
        try {
          const value = JSON.parse(localStorage.getItem(key) || '{}');
          if (!value.isRunning) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          localStorage.removeItem(key);
        }
      });
    };
    
    cleanup();
  }, [isCountdown]);
  
  const saveState = () => {
    try {
      const state = {
        time,
        isRunning,
        isPaused,
        startTime: startTimeRef.current,
        pausedAt: pausedAtRef.current,
        lastTick: Date.now(),
        initialTime,
        isCountdown,
        timestamp: Date.now()
      };
      
      if (isRunning || isPaused) {
        localStorage.setItem(storageKeyRef.current, JSON.stringify(state));
        // Also store in sessionStorage for tab switching
        sessionStorage.setItem(`current_timer_state`, JSON.stringify(state));
      } else {
        localStorage.removeItem(storageKeyRef.current);
        sessionStorage.removeItem(`current_timer_state`);
      }
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  };
  
  // Load state from storage on initialization
  useEffect(() => {
    let loadedState = false;
    
    // Try to load from sessionStorage first (for tab switching)
    try {
      const currentState = sessionStorage.getItem(`current_timer_state`);
      if (currentState) {
        const state = JSON.parse(currentState);
        if (state.isCountdown === isCountdown) {
          loadState(state);
          loadedState = true;
        }
      }
    } catch (error) {
      console.error('Error loading timer state from sessionStorage:', error);
    }
    
    // If nothing in sessionStorage, try localStorage (for app restarts)
    if (!loadedState) {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(`background_timer_${isCountdown ? 'countdown' : 'stopwatch'}_`)
      );
      
      if (keys.length > 0) {
        keys.sort((a, b) => {
          try {
            const stateA = JSON.parse(localStorage.getItem(a) || '{}');
            const stateB = JSON.parse(localStorage.getItem(b) || '{}');
            return (stateB.timestamp || 0) - (stateA.timestamp || 0);
          } catch {
            return 0;
          }
        });
        
        const savedState = localStorage.getItem(keys[0]);
        
        if (savedState) {
          const state = JSON.parse(savedState);
          
          if (state.isCountdown === isCountdown) {
            loadState(state);
          }
        }
      }
    }
  }, [isCountdown]);
  
  const loadState = (state: any) => {
    storageKeyRef.current = `background_timer_${isCountdown ? 'countdown' : 'stopwatch'}_${state.timestamp || Date.now()}`;
    
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
    
    saveState();
  };
  
  // Setup animation frame for smooth updates
  useEffect(() => {
    const animationFrame = () => {
      if (isRunning && !isPaused && isVisibleRef.current) {
        const now = Date.now();
        const elapsed = (now - lastTickRef.current) / 1000;
        
        if (elapsed > 0) {
          setTime(prevTime => {
            if (isCountdown) {
              const newTime = Math.max(0, prevTime - elapsed);
              if (newTime <= 0) {
                setIsComplete(true);
                setIsRunning(false);
                saveState();
                return 0;
              }
              return newTime;
            } else {
              return prevTime + elapsed;
            }
          });
          
          lastTickRef.current = now;
        }
        
        if (requestAnimationFrameRef.current) {
          cancelAnimationFrame(requestAnimationFrameRef.current);
        }
        
        requestAnimationFrameRef.current = requestAnimationFrame(animationFrame);
      }
    };
    
    if (isRunning && !isPaused && isVisibleRef.current) {
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
      }
      
      requestAnimationFrameRef.current = requestAnimationFrame(animationFrame);
      
      if (!intervalRef.current) {
        intervalRef.current = window.setInterval(() => {
          saveState();
        }, 1000);
      }
    }
    
    return () => {
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
        requestAnimationFrameRef.current = null;
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, isCountdown]);
  
  // Save state whenever important values change
  useEffect(() => {
    saveState();
  }, [time, isRunning, isPaused]);
  
  // Handle visibility changes (tab switching, app minimizing)
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
      
      if (document.visibilityState === 'visible') {
        if (isRunning && !isPaused) {
          const now = Date.now();
          const elapsed = (now - lastTickRef.current) / 1000;
          lastTickRef.current = now;
          
          if (elapsed > 0) {
            setTime(prevTime => {
              if (isCountdown) {
                const newTime = Math.max(0, prevTime - elapsed);
                if (newTime <= 0) {
                  setIsComplete(true);
                  setIsRunning(false);
                  return 0;
                }
                return newTime;
              } else {
                return prevTime + elapsed;
              }
            });
          }
          
          if (requestAnimationFrameRef.current) {
            cancelAnimationFrame(requestAnimationFrameRef.current);
          }
          
          requestAnimationFrameRef.current = requestAnimationFrame(function animationFrame() {
            if (isRunning && !isPaused) {
              const now = Date.now();
              const elapsed = (now - lastTickRef.current) / 1000;
              
              if (elapsed > 0) {
                setTime(prevTime => {
                  if (isCountdown) {
                    const newTime = Math.max(0, prevTime - elapsed);
                    if (newTime <= 0) {
                      setIsComplete(true);
                      setIsRunning(false);
                      return 0;
                    }
                    return newTime;
                  } else {
                    return prevTime + elapsed;
                  }
                });
                
                lastTickRef.current = now;
              }
              
              requestAnimationFrameRef.current = requestAnimationFrame(animationFrame);
            }
          });
        }
      } else {
        lastTickRef.current = Date.now();
        saveState();
        
        if (requestAnimationFrameRef.current) {
          cancelAnimationFrame(requestAnimationFrameRef.current);
          requestAnimationFrameRef.current = null;
        }
      }
    };
    
    // Listen for visibility changes and handle app close/reopen
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', saveState);
    window.addEventListener('pagehide', saveState);
    window.addEventListener('blur', saveState);
    window.addEventListener('focus', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', saveState);
      window.removeEventListener('pagehide', saveState);
      window.removeEventListener('blur', saveState);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [isRunning, isPaused, isCountdown]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
        requestAnimationFrameRef.current = null;
      }
      
      if (isRunning) {
        saveState();
      }
    };
  }, [isRunning]);
  
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
  
  const pause = () => {
    if (isRunning && !isPaused) {
      pausedAtRef.current = time;
      setIsPaused(true);
      
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
        requestAnimationFrameRef.current = null;
      }
    }
  };
  
  const resume = () => {
    if (isRunning && isPaused) {
      lastTickRef.current = Date.now();
      setIsPaused(false);
    }
  };
  
  const reset = () => {
    setTime(initialTime);
    setIsRunning(false);
    setIsPaused(false);
    setIsComplete(false);
    startTimeRef.current = null;
    pausedAtRef.current = 0;
    lastTickRef.current = Date.now();
    
    if (requestAnimationFrameRef.current) {
      cancelAnimationFrame(requestAnimationFrameRef.current);
      requestAnimationFrameRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    localStorage.removeItem(storageKeyRef.current);
    sessionStorage.removeItem(`current_timer_state`);
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
