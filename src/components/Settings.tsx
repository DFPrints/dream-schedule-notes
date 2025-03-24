import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  BellIcon, 
  MoonIcon, 
  SunIcon, 
  VolumeIcon, 
  TimerIcon, 
  PhoneIcon, 
  SaveIcon, 
  BedIcon, 
  LanguagesIcon, 
  Clock,
  Clock12,
  Vibrate,
  PlayCircle,
  EyeOffIcon
} from 'lucide-react';
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
    is24Hour?: boolean;
    showStopwatch?: boolean;
    enableVibration?: boolean;
    autoStartTimers?: boolean;
    hideCompleted?: boolean;
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
    is24Hour: true,
    showStopwatch: true,
    enableVibration: true,
    autoStartTimers: false,
    hideCompleted: false,
  },
  onUpdateSettings
}: SettingsProps) => {
  const [settings, setSettings] = useState(initialSettings);
  const [sleepStart, setSleepStart] = useState(initialSettings.sleepHoursStart);
  const [sleepEnd, setSleepEnd] = useState(initialSettings.sleepHoursEnd);
  const [timerDuration, setTimerDuration] = useState(initialSettings.defaultTimerDuration);
  const [hasChanges, setHasChanges] = useState(false);
  const timerInputTimeoutRef = useRef<number | null>(null);

  const formatTimeString = (timeString: string) => {
    if (!timeString) return "";
    if (settings.is24Hour) return timeString;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  useEffect(() => {
    const settingsChanged = JSON.stringify({
      ...settings,
      sleepHoursStart: sleepStart,
      sleepHoursEnd: sleepEnd,
      defaultTimerDuration: timerDuration
    }) !== JSON.stringify(initialSettings);
    
    setHasChanges(settingsChanged);
  }, [settings, sleepStart, sleepEnd, timerDuration, initialSettings]);

  const handleTimerDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimerDuration(parseInt(value) || 1);
    
    if (timerInputTimeoutRef.current) {
      window.clearTimeout(timerInputTimeoutRef.current);
    }
    
    timerInputTimeoutRef.current = window.setTimeout(() => {
      if (parseInt(value) < 1) {
        setTimerDuration(1);
      } else if (parseInt(value) > 1440) {
        setTimerDuration(1440);
        toast({
          title: "Maximum Duration",
          description: "Timer duration limited to 24 hours (1440 minutes)",
        });
      }
    }, 500);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings({
      ...settings,
      [key]: value
    });
    
    if (key === 'darkMode') {
      applyDarkMode(value);
    }
    
    if (key === 'soundEnabled' && value === true) {
      playTestSound(settings.volume);
    }
    
    if (key === 'volume' && settings.soundEnabled) {
      playTestSound(value);
    }

    if (key === 'language') {
      applyLanguageChange(value);
    }
    
    if (key === 'enableVibration' && value === true) {
      testVibration();
    }
  };

  const testVibration = () => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(200);
        toast({
          title: "Testing Vibration",
          description: "Your device should vibrate briefly.",
        });
      } catch (error) {
        console.error("Could not vibrate device:", error);
        toast({
          title: "Vibration Failed",
          description: "Your device doesn't support vibration or it's disabled.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Vibration Not Supported",
        description: "Your device doesn't support vibration.",
        variant: "destructive",
      });
    }
  };

  const applyLanguageChange = (lang: string) => {
    const languages = {
      en: "English",
      es: "Spanish (Español)",
      fr: "French (Français)",
      de: "German (Deutsch)"
    };
    
    toast({
      title: "Language Changed",
      description: `App language set to ${languages[lang as keyof typeof languages]}`,
    });
    
    applyDarkMode(settings.darkMode);
    document.documentElement.lang = lang;
  };

  const applyDarkMode = (isDark: boolean) => {
    document.documentElement.classList.toggle('dark', isDark);
    
    toast({
      title: isDark ? "Dark mode enabled" : "Light mode enabled",
      description: "Theme preference has been updated.",
    });
  };

  const playTestSound = (volume: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(volume / 100 * 0.1, audioContext.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, 200);
    } catch (error) {
      console.error("Could not play test sound:", error);
    }
  };

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

  const sendTestNotification = () => {
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
  };

  const handleSaveSettings = () => {
    const updatedSettings = {
      ...settings,
      sleepHoursStart: sleepStart,
      sleepHoursEnd: sleepEnd,
      defaultTimerDuration: timerDuration
    };
    
    try {
      localStorage.setItem('manifestAppSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error("Could not save settings to localStorage:", error);
    }
    
    onUpdateSettings?.(updatedSettings);
    
    setHasChanges(false);
    
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

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
      is24Hour: true,
      showStopwatch: true,
      enableVibration: true,
      autoStartTimers: false,
      hideCompleted: false,
    };
    
    setSettings(defaultSettings);
    setSleepStart(defaultSettings.sleepHoursStart);
    setSleepEnd(defaultSettings.sleepHoursEnd);
    setTimerDuration(defaultSettings.defaultTimerDuration);
    
    applyDarkMode(defaultSettings.darkMode);
    applyLanguageChange(defaultSettings.language);
    document.documentElement.classList.remove('dark');
    
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Label>Time Format</Label>
                <p className="text-sm text-muted-foreground">
                  Choose between 12-hour and 24-hour time
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={!settings.is24Hour ? "font-medium" : "text-muted-foreground"}>12h</span>
              <Switch
                checked={settings.is24Hour}
                onCheckedChange={(checked) => handleSettingChange('is24Hour', checked)}
              />
              <span className={settings.is24Hour ? "font-medium" : "text-muted-foreground"}>24h</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-primary/10">
                <EyeOffIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Label>Hide Completed</Label>
                <p className="text-sm text-muted-foreground">
                  Hide completed timers in the list
                </p>
              </div>
            </div>
            <Switch
              checked={settings.hideCompleted || false}
              onCheckedChange={(checked) => 
                handleSettingChange('hideCompleted', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications settings */}
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
                  onClick={sendTestNotification}
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Vibrate className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Label>Vibration</Label>
                <p className="text-sm text-muted-foreground">
                  Vibrate on timer completion
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.enableVibration || false}
                onCheckedChange={(checked) => 
                  handleSettingChange('enableVibration', checked)
                }
              />
              {settings.enableVibration && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={testVibration}
                >
                  Test
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer settings */}
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
                handleSettingChange('autoStartTimers', checked)
              }
            />
          </div>

          <Separator className="my-4" />
          
          {/* Sleep Hours section */}
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
                <span className="text-xs text-muted-foreground mt-1 block">
                  {!settings.is24Hour && `(${formatTimeString(sleepStart)})`}
                </span>
              </div>
              <div>
                <Label className="mb-1 inline-block text-sm">To</Label>
                <Input
                  type="time"
                  value={sleepEnd}
                  onChange={(e) => setSleepEnd(e.target.value)}
                />
                <span className="text-xs text-muted-foreground mt-1 block">
                  {!settings.is24Hour && `(${formatTimeString(sleepEnd)})`}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device settings */}
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
