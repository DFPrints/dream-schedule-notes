
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
  });
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('manifestAppSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Error loading settings from localStorage:", error);
    }
  }, []);

  // Update settings
  const updateSettings = (newSettings: any) => {
    setSettings(newSettings);
    
    // If dark mode was toggled, apply it
    if (newSettings.darkMode !== settings.darkMode) {
      // Example of applying dark mode (would integrate with your theme system)
      // document.documentElement.classList.toggle('dark', newSettings.darkMode);
      
      toast({
        title: newSettings.darkMode ? "Dark mode enabled" : "Light mode enabled",
        description: "Theme preference has been updated.",
      });
    }
    
    // Apply screen wake lock if enabled
    if (newSettings.keepScreenOn) {
      applyScreenWakeLock();
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
