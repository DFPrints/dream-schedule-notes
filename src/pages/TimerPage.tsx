
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Timer from '@/components/Timer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  PlusIcon, 
  ClockIcon, 
  TimerOffIcon, 
  Bell, 
  CalendarIcon,
  RepeatIcon
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface TimerPreset {
  id: string;
  name: string;
  minutes: number;
  pauseDuringSleep: boolean;
  repeatInterval?: number;
  activeDays?: string[];
  manualDuration?: boolean;
}

const daysOfWeek = [
  { value: 'sun', label: 'Sun' },
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
];

const TimerPage = () => {
  const [activeTimer, setActiveTimer] = useState<TimerPreset | null>(null);
  const [presets, setPresets] = useState<TimerPreset[]>([
    { 
      id: '1', 
      name: 'Quick Focus', 
      minutes: 15, 
      pauseDuringSleep: false,
      activeDays: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    },
    { 
      id: '2', 
      name: 'Deep Work', 
      minutes: 45, 
      pauseDuringSleep: false,
      activeDays: ['mon', 'tue', 'wed', 'thu', 'fri']
    },
    { 
      id: '3', 
      name: 'Overnight', 
      minutes: 480, 
      pauseDuringSleep: true,
      activeDays: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    },
    { 
      id: '4', 
      name: 'Hourly Reminder', 
      minutes: 60, 
      pauseDuringSleep: true,
      repeatInterval: 60,
      activeDays: ['mon', 'tue', 'wed', 'thu', 'fri']
    },
  ]);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetMinutes, setNewPresetMinutes] = useState(20);
  const [newPresetPauseSleep, setNewPresetPauseSleep] = useState(false);
  const [newPresetRepeat, setNewPresetRepeat] = useState(false);
  const [newPresetRepeatInterval, setNewPresetRepeatInterval] = useState(60);
  const [newPresetDays, setNewPresetDays] = useState(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']);
  const [isAddingPreset, setIsAddingPreset] = useState(false);

  // Handle timer completion
  const handleTimerComplete = () => {
    toast({
      title: "Timer Complete",
      description: activeTimer 
        ? `Your "${activeTimer.name}" timer has finished!` 
        : "Your timer has finished!",
    });
  };

  // Start a preset timer
  const startPresetTimer = (preset: TimerPreset) => {
    setActiveTimer(preset);
    toast({
      title: "Timer Started",
      description: `Starting "${preset.name}" timer for ${preset.minutes} minutes.`,
    });
  };

  // Toggle day selection
  const toggleDay = (day: string) => {
    if (newPresetDays.includes(day)) {
      // Don't allow removing the last day
      if (newPresetDays.length > 1) {
        setNewPresetDays(newPresetDays.filter(d => d !== day));
      }
    } else {
      setNewPresetDays([...newPresetDays, day]);
    }
  };

  // Add a new preset
  const addNewPreset = () => {
    if (!newPresetName.trim()) {
      toast({
        title: "Name Required",
        description: "Please provide a name for your preset.",
        variant: "destructive",
      });
      return;
    }

    const newPreset: TimerPreset = {
      id: Date.now().toString(),
      name: newPresetName,
      minutes: newPresetMinutes,
      pauseDuringSleep: newPresetPauseSleep,
      activeDays: newPresetDays,
      repeatInterval: newPresetRepeat ? newPresetRepeatInterval : undefined,
    };

    setPresets([...presets, newPreset]);
    setNewPresetName('');
    setNewPresetMinutes(20);
    setNewPresetPauseSleep(false);
    setNewPresetRepeat(false);
    setNewPresetRepeatInterval(60);
    setNewPresetDays(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']);
    setIsAddingPreset(false);

    toast({
      title: "Preset Added",
      description: `"${newPresetName}" preset has been created.`,
    });
  };

  return (
    <Layout>
      <div className="space-y-8 pb-20">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-medium">Timer</h1>
          <p className="text-muted-foreground">
            Set timers for your manifestation practice
          </p>
        </div>

        {/* Active Timer */}
        <div className="flex flex-col items-center pt-4">
          {activeTimer ? (
            <>
              <h2 className="text-lg font-medium mb-6">
                {activeTimer.name}
                <div className="flex gap-1 mt-1">
                  {activeTimer.pauseDuringSleep && (
                    <Badge variant="outline" className="text-xs">Sleep-Aware</Badge>
                  )}
                  {activeTimer.repeatInterval && (
                    <Badge variant="outline" className="text-xs">
                      <RepeatIcon className="h-3 w-3 mr-1" />
                      Every {activeTimer.repeatInterval}m
                    </Badge>
                  )}
                  {activeTimer.activeDays && activeTimer.activeDays.length < 7 && (
                    <Badge variant="outline" className="text-xs">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {activeTimer.activeDays.length} days
                    </Badge>
                  )}
                </div>
              </h2>
              <Timer 
                defaultMinutes={activeTimer.minutes} 
                pauseWhenSleeping={activeTimer.pauseDuringSleep}
                onComplete={handleTimerComplete}
                repeatInterval={activeTimer.repeatInterval}
                activeDays={activeTimer.activeDays}
                manualDuration={false}
              />
              <Button
                variant="ghost"
                className="mt-8"
                onClick={() => setActiveTimer(null)}
              >
                <TimerOffIcon className="h-4 w-4 mr-2" />
                Cancel Timer
              </Button>
            </>
          ) : (
            <Card className="w-full max-w-md neo-morphism border-0">
              <CardContent className="p-6 text-center">
                <ClockIcon className="h-12 w-12 mx-auto text-primary/50 mb-4" />
                <h3 className="text-lg font-medium">No Active Timer</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  Select a preset or create a new timer
                </p>
                <Timer 
                  defaultMinutes={20} 
                  onComplete={handleTimerComplete}
                  manualDuration={true}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timer Presets */}
        <div className="pt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Presets</h2>
            <Button
              size="sm"
              onClick={() => setIsAddingPreset(!isAddingPreset)}
              className="rounded-full h-8 w-8 p-0"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="sr-only">Add preset</span>
            </Button>
          </div>

          {/* Add new preset form */}
          {isAddingPreset && (
            <Card className="mb-4 animate-scale-in neo-morphism border-0">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div>
                    <Label>Preset Name</Label>
                    <Input
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="e.g., Meditation"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={newPresetMinutes}
                      onChange={(e) => setNewPresetMinutes(parseInt(e.target.value))}
                      min={1}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Active Days</Label>
                    <ToggleGroup type="multiple" value={newPresetDays} className="justify-start flex-wrap">
                      {daysOfWeek.map((day) => (
                        <ToggleGroupItem
                          key={day.value}
                          value={day.value}
                          aria-label={day.label}
                          size="sm"
                          className="data-[state=on]:bg-primary data-[state=on]:text-white"
                          onClick={() => toggleDay(day.value)}
                        >
                          {day.label.substring(0, 1)}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>
                  
                  <div className="flex items-center">
                    <Switch
                      id="pauseSleep"
                      checked={newPresetPauseSleep}
                      onCheckedChange={(checked) => setNewPresetPauseSleep(checked)}
                      className="mr-2"
                    />
                    <Label htmlFor="pauseSleep">Pause during sleep hours</Label>
                  </div>
                  
                  <div className="flex items-center">
                    <Switch
                      id="repeatTimer"
                      checked={newPresetRepeat}
                      onCheckedChange={(checked) => setNewPresetRepeat(checked)}
                      className="mr-2"
                    />
                    <Label htmlFor="repeatTimer">Repeat timer</Label>
                  </div>
                  
                  {newPresetRepeat && (
                    <div className="pl-7">
                      <Label className="text-sm">Repeat every</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="number"
                          value={newPresetRepeatInterval}
                          onChange={(e) => setNewPresetRepeatInterval(parseInt(e.target.value) || 1)}
                          min={1}
                          className="w-16"
                        />
                        <span className="text-sm">minutes</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => setIsAddingPreset(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={addNewPreset}>
                      Save Preset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preset list */}
          <div className="grid gap-3">
            {presets.map((preset) => (
              <div 
                key={preset.id}
                className={cn(
                  "glass-card p-4 rounded-lg flex justify-between items-center cursor-pointer hover:shadow-md transition-shadow",
                  activeTimer?.id === preset.id && "border-primary"
                )}
                onClick={() => startPresetTimer(preset)}
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-primary/10 text-primary mr-3">
                    <ClockIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{preset.name}</h3>
                    <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2">
                      <span>{preset.minutes} minutes</span>
                      
                      {preset.pauseDuringSleep && (
                        <span className="flex items-center">
                          <span>•</span>
                          <span className="ml-2">Pauses during sleep</span>
                        </span>
                      )}
                      
                      {preset.repeatInterval && (
                        <span className="flex items-center">
                          <span>•</span>
                          <span className="ml-2 flex items-center">
                            <RepeatIcon className="h-3 w-3 mr-1" />
                            Every {preset.repeatInterval}m
                          </span>
                        </span>
                      )}
                      
                      {preset.activeDays && preset.activeDays.length < 7 && (
                        <span className="flex items-center">
                          <span>•</span>
                          <span className="ml-2 flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {preset.activeDays.map(d => d.charAt(0).toUpperCase()).join('')}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full h-8 w-8 p-0"
                >
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Start</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TimerPage;
