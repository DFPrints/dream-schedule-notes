
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2cc534773d5f4611b1dbe844ba1ccf70',
  appName: 'dream-schedule-notes',
  webDir: 'dist',
  server: {
    url: 'https://2cc53477-3d5f-4611-b1db-e844ba1ccf70.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    AdMob: {
      appId: {
        android: 'ca-app-pub-3940256099942544~3347511713',  // Test AdMob app ID for Android
        ios: 'ca-app-pub-3940256099942544~1458002511'       // Test AdMob app ID for iOS
      }
    }
  }
};

export default config;
