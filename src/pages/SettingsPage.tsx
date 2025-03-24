
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Settings from '@/components/Settings';
import { toast } from '@/components/ui/use-toast';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
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
    enableVibration: true,
    autoStartTimers: false,
    hideCompleted: false,
  });
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('manifestAppSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prevSettings => ({
          ...prevSettings,
          ...parsedSettings
        }));
        
        // Apply dark mode if it was enabled
        if (parsedSettings.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Set language
        document.documentElement.lang = parsedSettings.language || 'en';
        
        // Apply screen wake lock if enabled
        if (parsedSettings.keepScreenOn) {
          applyScreenWakeLock();
        }
      }
    } catch (error) {
      console.error("Error loading settings from localStorage:", error);
    }
  }, []);
  
  // Ensure dark mode is applied when navigating to this page
  useEffect(() => {
    // This will maintain the dark mode state when navigating to the settings page
    const isDarkMode = document.documentElement.classList.contains('dark');
    if (isDarkMode !== settings.darkMode) {
      setSettings(prev => ({
        ...prev,
        darkMode: isDarkMode
      }));
    }
  }, []);

  // Update settings
  const updateSettings = (newSettings: any) => {
    setSettings(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      
      // Save to localStorage
      try {
        localStorage.setItem('manifestAppSettings', JSON.stringify(updatedSettings));
      } catch (error) {
        console.error("Could not save settings to localStorage:", error);
      }
      
      return updatedSettings;
    });
    
    // If dark mode was toggled, apply it
    if (newSettings.darkMode !== undefined && newSettings.darkMode !== settings.darkMode) {
      document.documentElement.classList.toggle('dark', newSettings.darkMode);
      
      toast({
        title: newSettings.darkMode ? "Dark mode enabled" : "Light mode enabled",
        description: "Theme preference has been updated.",
      });
    }
    
    // If language was changed
    if (newSettings.language !== undefined && newSettings.language !== settings.language) {
      document.documentElement.lang = newSettings.language;
      document.querySelector('html')?.setAttribute('lang', newSettings.language);
      
      const languages: Record<string, string> = {
        en: "English",
        es: "Spanish (Español)",
        fr: "French (Français)",
        de: "German (Deutsch)"
      };
      
      toast({
        title: "Language Changed",
        description: `App language set to ${languages[newSettings.language] || newSettings.language}`,
      });
      
      // Force re-render of components by triggering a language change event
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('languagechange', {
          detail: { language: newSettings.language }
        }));
      }, 100);
    }
    
    // Apply screen wake lock if enabled
    if (newSettings.keepScreenOn !== undefined && 
        newSettings.keepScreenOn !== settings.keepScreenOn) {
      if (newSettings.keepScreenOn) {
        applyScreenWakeLock();
      }
    }
  };
  
  // Apply screen wake lock to prevent device from sleeping
  const applyScreenWakeLock = async () => {
    if (!('wakeLock' in navigator)) {
      console.log('Wake Lock API not supported.');
      return;
    }
    
    try {
      // Request a screen wake lock
      const wakeLock = await (navigator as any).wakeLock.request('screen');
      
      // Listen for wake lock release
      wakeLock.addEventListener('release', () => {
        console.log('Screen Wake Lock released');
      });
      
      console.log('Screen Wake Lock acquired');
    } catch (error) {
      console.error('Failed to acquire wake lock:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-medium">Settings</h1>
          <p className="text-muted-foreground">
            Customize your experience
          </p>
        </div>

        {/* Settings Component */}
        <Settings
          settings={settings}
          onUpdateSettings={updateSettings}
        />
      </div>
    </Layout>
  );
};

export default SettingsPage;
