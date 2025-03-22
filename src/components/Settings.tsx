
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { BellIcon, MoonIcon, SunIcon, VolumeIcon, TimerIcon, PhoneIcon, SaveIcon, BedIcon, LanguagesIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface SettingsProps {
  settings?: {
    darkMode: boolean;
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    volume: number;
    sleepHoursStart: string;
    sleepHoursEnd: string;
    defaultTimerDuration: number;
    language: string;
  };
  onUpdateSettings?: (settings: any) => void;
}

const Settings = ({ 
  settings: initialSettings = {
    darkMode: false,
    notificationsEnabled: true,
    soundEnabled: true,
    volume: 80,
    sleepHoursStart: '22:00',
    sleepHoursEnd: '06:00',
    defaultTimerDuration: 20,
    language: 'en',
  },
  onUpdateSettings
}: SettingsProps) => {
  const [settings, setSettings] = useState(initialSettings);
  const [sleepStart, setSleepStart] = useState(initialSettings.sleepHoursStart);
  const [sleepEnd, setSleepEnd] = useState(initialSettings.sleepHoursEnd);
  const [timerDuration, setTimerDuration] = useState(initialSettings.defaultTimerDuration);

  // Handle settings change
  const handleSettingChange = (key: string, value: any) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };

  // Handle save settings
  const handleSaveSettings = () => {
    const updatedSettings = {
      ...settings,
      sleepHoursStart: sleepStart,
      sleepHoursEnd: sleepEnd,
      defaultTimerDuration: timerDuration
    };
    
    onUpdateSettings?.(updatedSettings);
    
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="neo-morphism border-0">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-primary/10">
                {settings.darkMode ? (
                  <MoonIcon className="h-4 w-4 text-primary" />
                ) : (
                  <SunIcon className="h-4 w-4 text-primary" />
                )}
              </div>
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-primary/10">
                <LanguagesIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Label>Language</Label>
                <p className="text-sm text-muted-foreground">
                  Select your preferred language
                </p>
              </div>
            </div>
            <div className="w-32">
              <select 
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="neo-morphism border-0">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage notifications and sounds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-primary/10">
                <BellIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for timers and events
                </p>
              </div>
            </div>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={(checked) => 
                handleSettingChange('notificationsEnabled', checked)
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-primary/10">
                <VolumeIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Label>Sound Effects</Label>
                <p className="text-sm text-muted-foreground">
                  Play sounds for timers and actions
                </p>
              </div>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => 
                handleSettingChange('soundEnabled', checked)
              }
            />
          </div>
          
          {settings.soundEnabled && (
            <div className="pt-2">
              <Label className="mb-2 inline-block">Volume</Label>
              <div className="flex items-center space-x-2">
                <VolumeIcon className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[settings.volume]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => 
                    handleSettingChange('volume', value[0])
                  }
                />
                <span className="text-sm w-8 text-right">
                  {settings.volume}%
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
                max={120}
                value={timerDuration}
                onChange={(e) => setTimerDuration(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
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
                  onChange={(e) => setSleepStart(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1 inline-block text-sm">To</Label>
                <Input
                  type="time"
                  value={sleepEnd}
                  onChange={(e) => setSleepEnd(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="neo-morphism border-0">
        <CardHeader>
          <CardTitle>Device Settings</CardTitle>
          <CardDescription>Configure device-specific settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-primary/10">
                <PhoneIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Label>Keep Screen On</Label>
                <p className="text-sm text-muted-foreground">
                  Prevent device from sleeping during active timers
                </p>
              </div>
            </div>
            <Switch
              checked={settings.keepScreenOn}
              onCheckedChange={(checked) => 
                handleSettingChange('keepScreenOn', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>
          <SaveIcon className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;
