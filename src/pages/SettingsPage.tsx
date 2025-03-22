
import { useState } from 'react';
import Layout from '@/components/Layout';
import Settings from '@/components/Settings';

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

  // Update settings
  const updateSettings = (newSettings: any) => {
    setSettings(newSettings);
    
    // Here you would persist settings to storage
    // localStorage.setItem('appSettings', JSON.stringify(newSettings));
    
    // If dark mode was toggled, you would apply it here
    if (newSettings.darkMode !== settings.darkMode) {
      // document.documentElement.classList.toggle('dark', newSettings.darkMode);
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
