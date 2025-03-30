
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SaveIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

import AppearanceSettings from './settings/AppearanceSettings';
import NotificationSettings from './settings/NotificationSettings';
import TimerSettings from './settings/TimerSettings';
import DeviceSettings from './settings/DeviceSettings';
import { applyDarkMode, applyLanguageChange, defaultSettings, SettingsType } from './settings/SettingsUtils';

interface SettingsProps {
  settings?: SettingsType;
  onUpdateSettings?: (settings: any) => void;
}

const Settings = ({ 
  settings: initialSettings = defaultSettings,
  onUpdateSettings
}: SettingsProps) => {
  const [settings, setSettings] = useState(initialSettings);
  const [sleepStart, setSleepStart] = useState(initialSettings.sleepHoursStart);
  const [sleepEnd, setSleepEnd] = useState(initialSettings.sleepHoursEnd);
  const [timerDuration, setTimerDuration] = useState(initialSettings.defaultTimerDuration);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const settingsChanged = JSON.stringify({
      ...settings,
      sleepHoursStart: sleepStart,
      sleepHoursEnd: sleepEnd,
      defaultTimerDuration: timerDuration
    }) !== JSON.stringify(initialSettings);
    
    setHasChanges(settingsChanged);
  }, [settings, sleepStart, sleepEnd, timerDuration, initialSettings]);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    if (isDarkMode !== settings.darkMode) {
      setSettings(prev => ({
        ...prev,
        darkMode: isDarkMode
      }));
    }
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings({
      ...settings,
      [key]: value
    });
    
    if (key === 'darkMode') {
      if (onUpdateSettings) {
        onUpdateSettings({ [key]: value });
      }
      applyDarkMode(value);
    }
    
    if (key === 'language') {
      if (onUpdateSettings) {
        onUpdateSettings({ [key]: value });
      }
      applyLanguageChange(value);
    }
  };

  const handleTimerDurationChange = (duration: number) => {
    setTimerDuration(duration);
  };

  const handleSleepHourChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setSleepStart(value);
    } else {
      setSleepEnd(value);
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
      <AppearanceSettings 
        settings={settings} 
        onSettingChange={handleSettingChange} 
      />
      
      <NotificationSettings 
        settings={settings} 
        onSettingChange={handleSettingChange} 
      />
      
      <TimerSettings 
        settings={settings}
        timerDuration={timerDuration}
        sleepStart={sleepStart}
        sleepEnd={sleepEnd}
        onSettingChange={handleSettingChange}
        onTimerDurationChange={handleTimerDurationChange}
        onSleepHourChange={handleSleepHourChange}
      />
      
      <DeviceSettings 
        settings={settings} 
        onSettingChange={handleSettingChange} 
      />

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
