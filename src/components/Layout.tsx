
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
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [isSmallerScreen, setIsSmallerScreen] = useState(false);
  const [isVerySmallScreen, setIsVerySmallScreen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Improved screen size detection for better responsiveness
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      setIsSmallerScreen(width < 360 || height < 640);
      setIsVerySmallScreen(width < 340 || height < 600);
      setIsLandscape(width > height);
    };
    
    checkScreenSize();
    
    // Add event listeners for both resize and orientation change
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('orientationchange', checkScreenSize);
    
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
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('orientationchange', checkScreenSize);
    };
  }, []);

  // For debugging
  useEffect(() => {
    console.log('Layout render - isMobile:', isMobile, 
                'showAds:', showAds, 
                'screenSize:', screenSize,
                'isSmallerScreen:', isSmallerScreen, 
                'isVerySmallScreen:', isVerySmallScreen,
                'isLandscape:', isLandscape);
  }, [isMobile, showAds, screenSize, isSmallerScreen, isVerySmallScreen, isLandscape]);

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
      <main className={cn(
        "flex-1 pt-4 pb-20 px-2 sm:px-4 max-w-5xl mx-auto w-full",
        isLandscape && "pb-16"
      )}>
        <div className="w-full animate-fade-in">
          {children}
        </div>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-5xl mx-auto">
          <div className={cn(
            "glass-morphism rounded-t-2xl mx-2 sm:mx-4 mb-0",
            isLandscape && "rounded-t-xl"
          )}>
            <div className={cn(
              "flex justify-around items-center px-1 sm:px-2", 
              isVerySmallScreen ? "h-12" : isSmallerScreen ? "h-14" : "h-16",
              isLandscape && "h-12"
            )}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const iconSize = isVerySmallScreen ? "w-3.5 h-3.5" : 
                                 isSmallerScreen ? "w-4 h-4" : 
                                 isLandscape ? "w-4 h-4" : "w-5 h-5";
                
                const textSize = isVerySmallScreen ? "text-[8px]" : 
                                isSmallerScreen ? "text-[10px]" : 
                                isLandscape ? "text-[9px]" : "text-xs";
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex flex-col items-center justify-center py-1 rounded-full transition-all duration-300",
                      isVerySmallScreen ? "w-9" : 
                      isSmallerScreen ? "w-10" : 
                      isLandscape ? "w-10" : "w-16",
                      isActive 
                        ? "text-primary scale-110" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "mb-0.5 transition-transform",
                      iconSize,
                      isActive && "animate-scale-in"
                    )} />
                    {(!isVerySmallScreen || isLandscape) && (
                      <span className={cn(
                        "transition-opacity font-medium",
                        textSize,
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
        <AdMobBanner show={showAds} />
      )}
    </div>
  );
};

export default Layout;
