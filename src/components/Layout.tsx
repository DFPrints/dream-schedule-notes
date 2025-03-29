
import { useLocation, Link } from 'react-router-dom';
import { HomeIcon, TimerIcon, CalendarIcon, FileTextIcon, SettingsIcon, MicIcon, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import AdMobBanner from './AdMobBanner';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [showAds, setShowAds] = useState(true);
  const isMobile = useIsMobile();
  const [isSmallerScreen, setIsSmallerScreen] = useState(false);
  const [isVerySmallScreen, setIsVerySmallScreen] = useState(false);
  const [hasWakeLock, setHasWakeLock] = useState(false);
  const [wakeLock, setWakeLock] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    // Check for screen sizes to provide better support across all devices
    const checkScreenSize = () => {
      setIsSmallerScreen(window.innerWidth < 360 || window.innerHeight < 640);
      setIsVerySmallScreen(window.innerWidth < 340 || window.innerHeight < 600);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    // Load ad setting from localStorage
    try {
      const savedSettings = localStorage.getItem('manifestAppSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings.showAds !== undefined) {
          setShowAds(parsedSettings.showAds);
          console.log('Ad settings loaded from localStorage:', parsedSettings.showAds);
        }
      }
    } catch (error) {
      console.error("Error loading ad settings:", error);
    }

    // Try to acquire wake lock for timers and stopwatch pages
    const acquireWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          const wl = await (navigator as any).wakeLock.request('screen');
          setWakeLock(wl);
          setHasWakeLock(true);
          console.log('Wake Lock acquired');
          
          wl.addEventListener('release', () => {
            setHasWakeLock(false);
            console.log('Wake Lock released');
          });
        } catch (err) {
          console.error(`Wake Lock error: ${err}`);
        }
      } else {
        console.log('Wake Lock API not supported');
      }
    };

    // Acquire wake lock for timer and stopwatch pages
    if (location.pathname === '/timer' || location.pathname === '/stopwatch') {
      acquireWakeLock();
    }
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      
      // Release wake lock if we had one
      if (wakeLock) {
        wakeLock.release().then(() => {
          console.log('Wake Lock released on cleanup');
        });
      }
    };
  }, [location.pathname]);

  // Re-acquire wake lock when visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && 
          (location.pathname === '/timer' || location.pathname === '/stopwatch') && 
          !hasWakeLock && 
          'wakeLock' in navigator) {
        try {
          const wl = await (navigator as any).wakeLock.request('screen');
          setWakeLock(wl);
          setHasWakeLock(true);
          console.log('Wake Lock re-acquired after visibility change');
        } catch (err) {
          console.error(`Wake Lock error: ${err}`);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname, hasWakeLock]);

  // For debugging
  useEffect(() => {
    console.log('Layout render - isMobile:', isMobile, 'showAds:', showAds, 
                'isSmallerScreen:', isSmallerScreen, 
                'isVerySmallScreen:', isVerySmallScreen,
                'hasWakeLock:', hasWakeLock);
  }, [isMobile, showAds, isSmallerScreen, isVerySmallScreen, hasWakeLock]);

  const navItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Timer', path: '/timer', icon: TimerIcon },
    { name: 'Stopwatch', path: '/stopwatch', icon: Clock },
    { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
    { name: 'Notes', path: '/notes', icon: FileTextIcon },
    { name: 'Voice', path: '/voice-memo', icon: MicIcon },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pt-4 pb-20 px-4 max-w-5xl mx-auto w-full">
        <div className="w-full animate-fade-in">
          {children}
        </div>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-5xl mx-auto">
          <div className="glass-morphism rounded-t-2xl mx-4 mb-0">
            <div className={cn(
              "flex justify-around items-center px-2", 
              isVerySmallScreen ? "h-14" : "h-16"
            )}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 rounded-full transition-all duration-300",
                      isVerySmallScreen ? "w-10" : isSmallerScreen ? "w-12" : "w-16",
                      isActive 
                        ? "text-primary scale-110" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "mb-1 transition-transform",
                      isVerySmallScreen ? "w-3.5 h-3.5" : isSmallerScreen ? "w-4 h-4" : "w-5 h-5",
                      isActive && "animate-scale-in"
                    )} />
                    {!isVerySmallScreen && (
                      <span className={cn(
                        "transition-opacity",
                        isSmallerScreen ? "text-[10px]" : "text-xs font-medium",
                        isActive ? "opacity-100" : "opacity-80"
                      )}>
                        {item.name}
                      </span>
                    )}
                    {isActive && (
                      <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary animate-scale-in" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      
      {/* AdMob Banner */}
      {isMobile && showAds && (
        <>
          <div className="fixed bottom-16 left-0 w-full text-center text-xs bg-yellow-100 text-black py-1 z-40">
            Ad Banner should appear below (debugging indicator)
          </div>
          <AdMobBanner show={showAds} />
        </>
      )}
    </div>
  );
};

export default Layout;
