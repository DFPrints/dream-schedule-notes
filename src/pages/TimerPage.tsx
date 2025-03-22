
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Timer from '@/components/Timer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, ClockIcon, TimerOffIcon, Bell } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface TimerPreset {
  id: string;
  name: string;
  minutes: number;
  pauseDuringSleep: boolean;
}

const TimerPage = () => {
  const [activeTimer, setActiveTimer] = useState<TimerPreset | null>(null);
  const [presets, setPresets] = useState<TimerPreset[]>([
    { id: '1', name: 'Quick Focus', minutes: 15, pauseDuringSleep: false },
    { id: '2', name: 'Deep Work', minutes: 45, pauseDuringSleep: false },
    { id: '3', name: 'Overnight', minutes: 480, pauseDuringSleep: true },
  ]);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetMinutes, setNewPresetMinutes] = useState(20);
  const [newPresetPauseSleep, setNewPresetPauseSleep] = useState(false);
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
    };

    setPresets([...presets, newPreset]);
    setNewPresetName('');
    setNewPresetMinutes(20);
    setNewPresetPauseSleep(false);
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
                {activeTimer.pauseDuringSleep && (
                  <Badge variant="outline" className="ml-2">Sleep-Aware</Badge>
                )}
              </h2>
              <Timer 
                defaultMinutes={activeTimer.minutes} 
                pauseWhenSleeping={activeTimer.pauseDuringSleep}
                onComplete={handleTimerComplete}
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
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="pauseSleep"
                      checked={newPresetPauseSleep}
                      onChange={(e) => setNewPresetPauseSleep(e.target.checked)}
                      className="mr-2"
                    />
                    <Label htmlFor="pauseSleep">Pause during sleep hours</Label>
                  </div>
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
                    <p className="text-sm text-muted-foreground">
                      {preset.minutes} minutes
                      {preset.pauseDuringSleep && " • Pauses during sleep"}
                    </p>
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
