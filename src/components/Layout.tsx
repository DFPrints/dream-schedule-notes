
import { useLocation, Link } from 'react-router-dom';
import { HomeIcon, TimerIcon, CalendarIcon, FileTextIcon, SettingsIcon, MicIcon, StopwatchIcon } from 'lucide-react';
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

  useEffect(() => {
    setMounted(true);
    
    // Check for smaller screens (iPhone SE, small Android phones)
    const checkScreenSize = () => {
      setIsSmallerScreen(window.innerWidth < 360 || window.innerHeight < 640);
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
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // For debugging
  useEffect(() => {
    console.log('Layout render - isMobile:', isMobile, 'showAds:', showAds, 'isSmallerScreen:', isSmallerScreen);
  }, [isMobile, showAds, isSmallerScreen]);

  const navItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Timer', path: '/timer', icon: TimerIcon },
    { name: 'Stopwatch', path: '/stopwatch', icon: StopwatchIcon },
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
            <div className="flex justify-around items-center h-16 px-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex flex-col items-center justify-center py-2 rounded-full transition-all duration-300',
                      isSmallerScreen ? 'w-12' : 'w-16',
                      isActive 
                        ? 'text-primary scale-110' 
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <item.icon className={cn(
                      'mb-1 transition-transform',
                      isSmallerScreen ? 'w-4 h-4' : 'w-5 h-5',
                      isActive && 'animate-scale-in'
                    )} />
                    {!isSmallerScreen && (
                      <span className={cn(
                        'text-xs font-medium transition-opacity',
                        isActive ? 'opacity-100' : 'opacity-80'
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
