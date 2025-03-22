
import { useLocation, Link } from 'react-router-dom';
import { HomeIcon, TimerIcon, CalendarIcon, FileTextIcon, SettingsIcon, MicIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Timer', path: '/timer', icon: TimerIcon },
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
                      'flex flex-col items-center justify-center w-16 py-2 rounded-full transition-all duration-300',
                      isActive 
                        ? 'text-primary scale-110' 
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <item.icon className={cn(
                      'w-5 h-5 mb-1 transition-transform',
                      isActive && 'animate-scale-in'
                    )} />
                    <span className={cn(
                      'text-xs font-medium transition-opacity',
                      isActive ? 'opacity-100' : 'opacity-80'
                    )}>
                      {item.name}
                    </span>
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
    </div>
  );
};

export default Layout;
