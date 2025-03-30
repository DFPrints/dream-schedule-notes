
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PhoneIcon } from 'lucide-react';

interface DeviceSettingsProps {
  settings: {
    keepScreenOn?: boolean;
  };
  onSettingChange: (key: string, value: any) => void;
}

const DeviceSettings = ({ 
  settings, 
  onSettingChange 
}: DeviceSettingsProps) => {
  return (
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
              onSettingChange('keepScreenOn', checked)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceSettings;
