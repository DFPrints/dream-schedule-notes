
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Settings from '@/components/Settings';
import { toast } from '@/components/ui/use-toast';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    darkMode: true, // Default to dark mode
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
    showAds: true, // Default to showing ads
  });
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    try {
      // Check theme directly from localStorage first
      const currentTheme = localStorage.getItem('theme');
      const isDarkMode = currentTheme === 'dark';
      
      // Load other settings
      const savedSettings = localStorage.getItem('manifestAppSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        
        // Merge parsed settings with current state, prioritizing the theme setting
        setSettings(prevSettings => ({
          ...prevSettings,
          ...parsedSettings,
          darkMode: isDarkMode // Ensure darkMode matches the current theme
        }));
        
        // Set language if available
        if (parsedSettings.language) {
          document.documentElement.lang = parsedSettings.language;
        }
        
        // Apply screen wake lock if enabled
        if (parsedSettings.keepScreenOn) {
          applyScreenWakeLock();
        }
      } else {
        // If no saved settings, ensure darkMode in state matches actual theme
        setSettings(prevSettings => ({
          ...prevSettings,
          darkMode: isDarkMode
        }));
      }
    } catch (error) {
      console.error("Error loading settings from localStorage:", error);
      // On error, ensure dark mode is applied as default
      if (!document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
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
    
    // If dark mode was toggled, apply it immediately and save to separate theme storage
    if (newSettings.darkMode !== undefined && newSettings.darkMode !== settings.darkMode) {
      applyDarkMode(newSettings.darkMode);
    }
    
    // If language was changed
    if (newSettings.language !== undefined && newSettings.language !== settings.language) {
      applyLanguageChange(newSettings.language);
    }
    
    // If screen wake lock setting changed
    if (newSettings.keepScreenOn !== undefined && 
        newSettings.keepScreenOn !== settings.keepScreenOn) {
      if (newSettings.keepScreenOn) {
        applyScreenWakeLock();
      }
    }
    
    // If ads setting was changed
    if (newSettings.showAds !== undefined && 
        newSettings.showAds !== settings.showAds) {
      toast({
        title: newSettings.showAds ? "Ads enabled" : "Ads disabled",
        description: newSettings.showAds ? 
          "Ads will be shown to support development" : 
          "Ads have been turned off",
      });
    }
  };
  
  // Apply dark mode and store preference
  const applyDarkMode = (isDark: boolean) => {
    // Update class on html element
    document.documentElement.classList.toggle('dark', isDark);
    
    // Store theme preference separately for initial load
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Show toast notification
    toast({
      title: isDark ? "Dark mode enabled" : "Light mode enabled",
      description: "Theme preference has been updated",
    });
  };
  
  // Apply language change
  const applyLanguageChange = (language: string) => {
    document.documentElement.lang = language;
    document.querySelector('html')?.setAttribute('lang', language);
    
    const languages: Record<string, string> = {
      en: "English",
      es: "Spanish (Español)",
      fr: "French (Français)",
      de: "German (Deutsch)"
    };
    
    toast({
      title: "Language Changed",
      description: `App language set to ${languages[language] || language}`,
    });
    
    // Force re-render of components by triggering a small state update
    setTimeout(() => {
      const event = new Event('languagechange');
      window.dispatchEvent(event);
    }, 100);
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
