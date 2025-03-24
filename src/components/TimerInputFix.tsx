
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TimerInputFixProps {
  initialValue: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const TimerInputFix = ({ 
  initialValue = 20, 
  onChange,
  min = 1,
  max = 1440
}: TimerInputFixProps) => {
  const [inputValue, setInputValue] = useState<string>(initialValue.toString());
  const timeoutRef = useRef<number | null>(null);
  
  // Update local state when initialValue changes from parent
  useEffect(() => {
    setInputValue(initialValue.toString());
  }, [initialValue]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Always update the displayed value immediately
    setInputValue(newValue);
    
    // Debounce the actual change notification
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      // Parse the value, defaulting to min if invalid
      let numValue = parseInt(newValue) || min;
      
      // Enforce min/max constraints
      if (numValue < min) numValue = min;
      if (numValue > max) numValue = max;
      
      // Update the input with the valid value
      setInputValue(numValue.toString());
      
      // Notify parent of the change
      onChange(numValue);
    }, 300); // Reduced the timeout for better responsiveness
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div>
      <Label>Duration (minutes)</Label>
      <Input
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        min={min}
        max={max}
        className="mt-1"
      />
    </div>
  );
};
