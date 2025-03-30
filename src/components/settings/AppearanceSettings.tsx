
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MoonIcon, SunIcon, LanguagesIcon, Clock, EyeOffIcon } from 'lucide-react';

interface AppearanceSettingsProps {
  settings: {
    darkMode: boolean;
    language: string;
    is24Hour?: boolean;
    hideCompleted?: boolean;
  };
  onSettingChange: (key: string, value: any) => void;
}

const AppearanceSettings = ({ 
  settings, 
  onSettingChange 
}: AppearanceSettingsProps) => {
  return (
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
            onCheckedChange={(checked) => onSettingChange('darkMode', checked)}
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
              onChange={(e) => onSettingChange('language', e.target.value)}
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
              onCheckedChange={(checked) => onSettingChange('is24Hour', checked)}
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
              onSettingChange('hideCompleted', checked)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
