
import { toast } from '@/components/ui/use-toast';

export const applyLanguageChange = (lang: string) => {
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
  
  document.documentElement.lang = lang;
};

export const applyDarkMode = (isDark: boolean) => {
  document.documentElement.classList.toggle('dark', isDark);
  
  toast({
    title: isDark ? "Dark mode enabled" : "Light mode enabled",
    description: "Theme preference has been updated.",
  });
};

export interface SettingsType {
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
  showAds?: boolean;
}

export const defaultSettings: SettingsType = {
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
  showAds: true
};
