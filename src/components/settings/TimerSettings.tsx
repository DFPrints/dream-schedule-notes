
import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { TimerIcon, BedIcon, PlayCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface TimerSettingsProps {
  settings: {
    defaultTimerDuration: number;
    autoStartTimers?: boolean;
    sleepHoursStart: string;
    sleepHoursEnd: string;
    is24Hour?: boolean;
  };
  timerDuration: number;
  sleepStart: string;
  sleepEnd: string;
  onSettingChange: (key: string, value: any) => void;
  onTimerDurationChange: (duration: number) => void;
  onSleepHourChange: (type: 'start' | 'end', value: string) => void;
}

const TimerSettings = ({ 
  settings, 
  timerDuration,
  sleepStart,
  sleepEnd,
  onSettingChange,
  onTimerDurationChange,
  onSleepHourChange
}: TimerSettingsProps) => {
  const timerInputTimeoutRef = useRef<number | null>(null);

  const formatTimeString = (timeString: string) => {
    if (!timeString) return "";
    if (settings.is24Hour) return timeString;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleTimerDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onTimerDurationChange(parseInt(value) || 1);
    
    if (timerInputTimeoutRef.current) {
      window.clearTimeout(timerInputTimeoutRef.current);
    }
    
    timerInputTimeoutRef.current = window.setTimeout(() => {
      if (parseInt(value) < 1) {
        onTimerDurationChange(1);
      } else if (parseInt(value) > 1440) {
        onTimerDurationChange(1440);
        toast({
          title: "Maximum Duration",
          description: "Timer duration limited to 24 hours (1440 minutes)",
        });
      }
    }, 500);
  };

  return (
    <Card className="neo-morphism border-0">
      <CardHeader>
        <CardTitle>Timer Settings</CardTitle>
        <CardDescription>Configure your timer preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-primary/10">
              <TimerIcon className="h-4 w-4 text-primary" />
            </div>
            <Label>Default Timer Duration</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min={1}
              max={1440}
              value={timerDuration}
              onChange={handleTimerDurationChange}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">minutes</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-primary/10">
              <PlayCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <Label>Auto-start Timers</Label>
              <p className="text-sm text-muted-foreground">
                Start timers immediately when selected
              </p>
            </div>
          </div>
          <Switch
            checked={settings.autoStartTimers || false}
            onCheckedChange={(checked) => 
              onSettingChange('autoStartTimers', checked)
            }
          />
        </div>

        <Separator className="my-4" />
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-primary/10">
              <BedIcon className="h-4 w-4 text-primary" />
            </div>
            <Label>Sleep Hours</Label>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Set your typical sleep hours for sleep-aware timers
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1 inline-block text-sm">From</Label>
              <Input
                type="time"
                value={sleepStart}
                onChange={(e) => onSleepHourChange('start', e.target.value)}
              />
              <span className="text-xs text-muted-foreground mt-1 block">
                {!settings.is24Hour && `(${formatTimeString(sleepStart)})`}
              </span>
            </div>
            <div>
              <Label className="mb-1 inline-block text-sm">To</Label>
              <Input
                type="time"
                value={sleepEnd}
                onChange={(e) => onSleepHourChange('end', e.target.value)}
              />
              <span className="text-xs text-muted-foreground mt-1 block">
                {!settings.is24Hour && `(${formatTimeString(sleepEnd)})`}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimerSettings;
