
import { useEffect, useState } from 'react';
import { BannerAdOptions, BannerAdPosition, BannerAdSize, AdMob } from '@capacitor-community/admob';

interface AdMobBannerProps {
  show: boolean;
}

const AdMobBanner = ({ show }: AdMobBannerProps) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAdMob = async () => {
      try {
        // Initialize AdMob
        await AdMob.initialize({
          // Remove the requestTrackingAuthorization property as it's not supported
          testingDevices: ['2077ef9a-815c-47df-987a-ba9a56bee178'],
          initializeForTesting: true,
        });
        setInitialized(true);
        console.log('AdMob initialized successfully');
      } catch (error) {
        console.error('Failed to initialize AdMob', error);
      }
    };

    if (!initialized) {
      initializeAdMob();
    }
  }, [initialized]);

  useEffect(() => {
    const showBanner = async () => {
      if (!initialized || !show) return;
      
      try {
        // Set up banner options
        const options: BannerAdOptions = {
          adId: 'ca-app-pub-3940256099942544/6300978111', // Test ad unit ID
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: true // Set to false in production
        };
        
        // Hide any existing banner
        await AdMob.removeBanner();
        
        // Show banner
        await AdMob.showBanner(options);
        console.log('Banner ad displayed');
      } catch (error) {
        console.error('Error showing banner ad', error);
      }
    };

    const hideBanner = async () => {
      if (!initialized) return;
      
      try {
        await AdMob.removeBanner();
        console.log('Banner ad removed');
      } catch (error) {
        console.error('Error removing banner ad', error);
      }
    };

    if (show) {
      showBanner();
    } else {
      hideBanner();
    }

    // Cleanup on component unmount
    return () => {
      if (initialized) {
        AdMob.removeBanner().catch(error => 
          console.error('Error removing banner on unmount', error)
        );
      }
    };
  }, [show, initialized]);

  // No visible UI - this component just manages the ads
  return null;
};

export default AdMobBanner;
