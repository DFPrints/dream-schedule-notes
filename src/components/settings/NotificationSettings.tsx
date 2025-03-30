
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { BellIcon, VolumeIcon, Vibrate } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface NotificationSettingsProps {
  settings: {
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    volume: number;
    enableVibration?: boolean;
    showAds?: boolean;
  };
  onSettingChange: (key: string, value: any) => void;
}

const NotificationSettings = ({ 
  settings, 
  onSettingChange 
}: NotificationSettingsProps) => {
  
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
        onSettingChange('notificationsEnabled', true);
        toast({
          title: "Notifications enabled",
          description: "You'll now receive notifications for timers and events.",
        });
        
        new Notification("Manifest App", {
          body: "Notifications are now enabled!",
          icon: "/favicon.ico"
        });
      } else {
        onSettingChange('notificationsEnabled', false);
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

  return (
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
                  onSettingChange('notificationsEnabled', checked);
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
            onCheckedChange={(checked) => {
              onSettingChange('soundEnabled', checked);
              if (checked) {
                playTestSound(settings.volume);
              }
            }}
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
                onValueChange={(value) => {
                  onSettingChange('volume', value[0]);
                  if (settings.soundEnabled) {
                    playTestSound(value[0]);
                  }
                }}
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
              onCheckedChange={(checked) => {
                onSettingChange('enableVibration', checked);
                if (checked) {
                  testVibration();
                }
              }}
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

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-primary/10">
              <BellIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <Label>Show Ads</Label>
              <p className="text-sm text-muted-foreground">
                Display advertisements in the app
              </p>
            </div>
          </div>
          <Switch
            checked={settings.showAds !== undefined ? settings.showAds : true}
            onCheckedChange={(checked) => 
              onSettingChange('showAds', checked)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
