
import React, { useEffect, useState } from 'react';

interface AdBannerProps {
  enabled: boolean;
}

const AdBanner: React.FC<AdBannerProps> = ({ enabled }) => {
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Only load the ad script if ads are enabled
    if (!enabled) return;

    // Check if the script is already loaded
    if (document.getElementById('google-ads-script')) {
      setAdLoaded(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.id = 'google-ads-script';
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456';
    script.crossOrigin = 'anonymous';
    
    // Add event listeners
    script.onload = () => {
      console.log('Ad script loaded');
      setAdLoaded(true);
    };
    
    script.onerror = (error) => {
      console.error('Error loading ad script:', error);
      // Handle error - maybe set a state to show a fallback
    };
    
    // Append the script to the document
    document.head.appendChild(script);
    
    // Cleanup function
    return () => {
      // Only remove if we're toggling ads off
      if (!enabled && document.getElementById('google-ads-script')) {
        document.getElementById('google-ads-script')?.remove();
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className={`w-full bg-background border-t ${adLoaded ? 'h-[90px]' : 'h-0'} transition-all duration-300`}>
      {adLoaded && (
        <div className="flex items-center justify-center h-full">
          {/* This div would contain the actual ad */}
          <div className="w-full max-w-[728px] h-[90px] bg-muted/30 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">
              Advertisement (Test Mode)
            </p>
            
            {/* Uncomment and configure this for real AdSense ads */}
            {/* 
            <ins 
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-1234567890123456"
              data-ad-slot="1234567890"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
            */}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdBanner;
