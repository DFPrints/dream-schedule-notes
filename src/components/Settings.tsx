
import { useState, useEffect } from 'react';
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
    keepScreenOn?: boolean;
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
    keepScreenOn: true,
  },
  onUpdateSettings
}: SettingsProps) => {
  const [settings, setSettings] = useState(initialSettings);
  const [sleepStart, setSleepStart] = useState(initialSettings.sleepHoursStart);
  const [sleepEnd, setSleepEnd] = useState(initialSettings.sleepHoursEnd);
  const [timerDuration, setTimerDuration] = useState(initialSettings.defaultTimerDuration);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes to enable/disable save button
  useEffect(() => {
    const settingsChanged = JSON.stringify({
      ...settings,
      sleepHoursStart: sleepStart,
      sleepHoursEnd: sleepEnd,
      defaultTimerDuration: timerDuration
    }) !== JSON.stringify(initialSettings);
    
    setHasChanges(settingsChanged);
  }, [settings, sleepStart, sleepEnd, timerDuration, initialSettings]);

  // Handle settings change
  const handleSettingChange = (key: string, value: any) => {
    setSettings({
      ...settings,
      [key]: value
    });
    
    // Apply dark mode changes immediately for better user experience
    if (key === 'darkMode') {
      applyDarkMode(value);
    }
    
    // Play a test sound if sound is enabled
    if (key === 'soundEnabled' && value === true) {
      playTestSound(settings.volume);
    }
    
    // Play test sound when volume changes
    if (key === 'volume' && settings.soundEnabled) {
      playTestSound(value);
    }
  };
  
  // Apply dark mode
  const applyDarkMode = (isDark: boolean) => {
    // This would typically interact with your theme system
    // For now, we'll just show a toast indicating the change
    toast({
      title: isDark ? "Dark mode enabled" : "Light mode enabled",
      description: "Theme preference has been updated.",
    });
    
    // In a real implementation, you might do something like:
    // document.documentElement.classList.toggle('dark', isDark);
  };
  
  // Play test sound
  const playTestSound = (volume: number) => {
    try {
      // Create a simple sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
      
      gainNode.gain.setValueAtTime(volume / 100 * 0.1, audioContext.currentTime); // Adjust volume
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, 200); // Short beep
    } catch (error) {
      console.error("Could not play test sound:", error);
    }
  };
  
  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
      return;
    }
    
    if (Notification.permission === "granted") {
      toast({
        title: "Notifications already enabled",
        description: "You've already granted permission for notifications.",
      });
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        handleSettingChange('notificationsEnabled', true);
        toast({
          title: "Notifications enabled",
          description: "You'll now receive notifications for timers and events.",
        });
        
        // Show a test notification
        new Notification("Manifest App", {
          body: "Notifications are now enabled!",
          icon: "/favicon.ico"
        });
      } else {
        handleSettingChange('notificationsEnabled', false);
        toast({
          title: "Notifications disabled",
          description: "You've denied permission for notifications.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast({
        title: "Error enabling notifications",
        description: "There was a problem enabling notifications.",
        variant: "destructive",
      });
    }
  };

  // Handle save settings
  const handleSaveSettings = () => {
    const updatedSettings = {
      ...settings,
      sleepHoursStart: sleepStart,
      sleepHoursEnd: sleepEnd,
      defaultTimerDuration: timerDuration
    };
    
    // Try to save to localStorage for persistence
    try {
      localStorage.setItem('manifestAppSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error("Could not save settings to localStorage:", error);
    }
    
    // Call the parent component's update function
    onUpdateSettings?.(updatedSettings);
    
    // Reset the changes flag
    setHasChanges(false);
    
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  // Reset settings to defaults
  const resetSettings = () => {
    const defaultSettings = {
      darkMode: false,
      notificationsEnabled: true,
      soundEnabled: true,
      volume: 80,
      sleepHoursStart: '22:00',
      sleepHoursEnd: '06:00',
      defaultTimerDuration: 20,
      language: 'en',
      keepScreenOn: true,
    };
    
    setSettings(defaultSettings);
    setSleepStart(defaultSettings.sleepHoursStart);
    setSleepEnd(defaultSettings.sleepHoursEnd);
    setTimerDuration(defaultSettings.defaultTimerDuration);
    
    toast({
      title: "Settings reset",
      description: "All settings have been restored to defaults.",
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
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) => {
                  if (checked && Notification.permission !== "granted") {
                    requestNotificationPermission();
                  } else {
                    handleSettingChange('notificationsEnabled', checked);
                  }
                }}
              />
              {settings.notificationsEnabled && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Show a test notification
                    if (Notification.permission === "granted") {
                      new Notification("Test Notification", {
                        body: "This is a test notification from Manifest App",
                        icon: "/favicon.ico"
                      });
                      
                      toast({
                        title: "Test notification sent",
                        description: "Check your notifications to confirm they're working.",
                      });
                    } else {
                      requestNotificationPermission();
                    }
                  }}
                >
                  Test
                </Button>
              )}
            </div>
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
                onChange={(e) => setTimerDuration(parseInt(e.target.value) || 1)}
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
              checked={settings.keepScreenOn || false}
              onCheckedChange={(checked) => 
                handleSettingChange('keepScreenOn', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={resetSettings}
        >
          Reset to Defaults
        </Button>
        <Button 
          onClick={handleSaveSettings}
          disabled={!hasChanges}
        >
          <SaveIcon className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;
