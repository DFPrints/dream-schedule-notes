
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowRightIcon, 
  TimerIcon, 
  CalendarIcon, 
  FeatherIcon, 
  SparklesIcon, 
  MicIcon, 
  Clock, 
  SettingsIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const navigate = useNavigate();
  const [activeManifestations, setActiveManifestations] = useState([]);
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('quick');
  const [isVerySmallScreen, setIsVerySmallScreen] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check for very small screens (older phones)
    const checkVerySmallScreen = () => {
      setIsVerySmallScreen(window.innerWidth < 340 || window.innerHeight < 600);
    };
    
    checkVerySmallScreen();
    window.addEventListener('resize', checkVerySmallScreen);
    
    return () => {
      window.removeEventListener('resize', checkVerySmallScreen);
    };
  }, []);

  const allFeatures = [
    { 
      id: 'timer', 
      name: "Timer", 
      icon: TimerIcon, 
      path: "/timer", 
      color: "bg-primary/10 text-primary",
      description: "Create timers that pause during sleep hours" 
    },
    { 
      id: 'stopwatch', 
      name: "Stopwatch", 
      icon: Clock, 
      path: "/stopwatch", 
      color: "bg-blue-500/10 text-blue-500",
      description: "Track time with precision" 
    },
    { 
      id: 'calendar', 
      name: "Calendar", 
      icon: CalendarIcon, 
      path: "/calendar", 
      color: "bg-manifest-gold/10 text-manifest-gold",
      description: "Set intentions for each day" 
    },
    { 
      id: 'notes', 
      name: "Notes", 
      icon: FeatherIcon, 
      path: "/notes", 
      color: "bg-manifest-rose/10 text-rose-500",
      description: "Journal your manifestation journey" 
    },
    { 
      id: 'voice', 
      name: "Voice Memos", 
      icon: MicIcon, 
      path: "/voice-memo", 
      color: "bg-purple-500/10 text-purple-500",
      description: "Record your manifestation practice" 
    },
    { 
      id: 'settings', 
      name: "Settings", 
      icon: SettingsIcon, 
      path: "/settings", 
      color: "bg-gray-500/10 text-gray-500",
      description: "Customize your experience" 
    }
  ];

  const quickActions = allFeatures.slice(0, 4);
  const recentItems = []; // This would be populated from localStorage in a real implementation

  if (!mounted) return null;

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        <div className="space-y-2">
          <h1 className="text-4xl font-light tracking-tight">Manifest</h1>
          <p className="text-muted-foreground">
            Create intentions, set timers, stay mindful
          </p>
        </div>

        <Tabs defaultValue="quick" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={cn(
            "grid mb-4",
            isVerySmallScreen ? "grid-cols-3 text-xs gap-x-1 px-1" : "grid-cols-3"
          )}>
            <TabsTrigger value="quick" className={isVerySmallScreen ? "px-2" : ""}>
              Quick Actions
            </TabsTrigger>
            <TabsTrigger value="all" className={isVerySmallScreen ? "px-2" : ""}>
              All Features
            </TabsTrigger>
            <TabsTrigger value="recent" className={isVerySmallScreen ? "px-2" : ""}>
              Recent
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="quick" className="mt-0 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="ghost"
                  className={cn(
                    "h-auto flex-col py-6 neo-morphism border-0",
                    isVerySmallScreen ? "py-4" : "py-6",
                    action.color
                  )}
                  onClick={() => navigate(action.path)}
                >
                  <action.icon className={cn(
                    "mb-2",
                    isVerySmallScreen ? "h-5 w-5" : "h-6 w-6"
                  )} />
                  <span className={cn(
                    "text-sm font-normal",
                    isVerySmallScreen && "text-xs"
                  )}>{action.name}</span>
                </Button>
              ))}
            </div>
            
            <Card className="glass-morphism overflow-hidden border-0 mt-6">
              <CardContent className={cn(
                "p-6",
                isVerySmallScreen && "p-4"
              )}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className={cn(
                      "font-medium flex items-center",
                      isVerySmallScreen ? "text-base" : "text-lg"
                    )}>
                      <SparklesIcon className={cn(
                        "mr-2 text-manifest-gold",
                        isVerySmallScreen ? "h-4 w-4" : "h-5 w-5"
                      )} />
                      Start New Manifestation
                    </h3>
                    <p className={cn(
                      "mt-1 text-muted-foreground",
                      isVerySmallScreen ? "text-xs" : "text-sm"
                    )}>
                      Set an intention and track your progress
                    </p>
                  </div>
                  <Button 
                    className="rounded-full h-10 w-10 p-0"
                    onClick={() => navigate('/timer')}
                  >
                    <ArrowRightIcon className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="all" className="mt-0 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allFeatures.map((feature) => (
                <Button
                  key={feature.id}
                  variant="ghost"
                  className={cn(
                    "h-auto flex-col neo-morphism border-0",
                    isVerySmallScreen ? "py-4 px-2" : "py-6",
                    feature.color
                  )}
                  onClick={() => navigate(feature.path)}
                >
                  <feature.icon className={cn(
                    "mb-2",
                    isVerySmallScreen ? "h-4 w-4" : "h-6 w-6"
                  )} />
                  <span className={cn(
                    "font-normal",
                    isVerySmallScreen ? "text-xs" : "text-sm"
                  )}>{feature.name}</span>
                  <p className={cn(
                    "text-muted-foreground mt-1",
                    isVerySmallScreen ? "text-[10px] line-clamp-2" : "text-xs"
                  )}>{feature.description}</p>
                </Button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="recent" className="mt-0 animate-fade-in">
            <div className="space-y-4">
              <h2 className={cn(
                "font-medium",
                isVerySmallScreen ? "text-base" : "text-lg"
              )}>Recent Activity</h2>
              <div className="grid gap-3">
                {recentItems.length > 0 ? (
                  recentItems.map((item, index) => (
                    <div key={index} className="flex items-center p-3 neo-morphism border-0 rounded-lg">
                      {/* Content for recent items would go here */}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center p-3 neo-morphism border-0 rounded-lg">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="ml-3">
                      <h3 className={cn(
                        "font-medium",
                        isVerySmallScreen ? "text-xs" : "text-sm"
                      )}>No recent activity</h3>
                      <p className={cn(
                        "text-muted-foreground",
                        isVerySmallScreen ? "text-[10px]" : "text-xs"
                      )}>Start using the app to see your activity here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <section className="pt-2">
          <h2 className={cn(
            "font-medium mb-4",
            isVerySmallScreen ? "text-base" : "text-lg"
          )}>Features</h2>
          <div className="grid gap-4">
            <div 
              className="glass-card p-4 rounded-lg flex items-start space-x-4 cursor-pointer"
              onClick={() => navigate('/timer')}
            >
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <TimerIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Advanced Timers</h3>
                <p className={cn(
                  "text-muted-foreground mt-1",
                  isVerySmallScreen ? "text-xs" : "text-sm"
                )}>
                  Create timers that pause during sleep hours and help you maintain consistent practice
                </p>
              </div>
            </div>
            
            <div 
              className="glass-card p-4 rounded-lg flex items-start space-x-4 cursor-pointer"
              onClick={() => navigate('/calendar')}
            >
              <div className="p-2 rounded-full bg-manifest-gold/10 text-manifest-gold">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Manifestation Calendar</h3>
                <p className={cn(
                  "text-muted-foreground mt-1",
                  isVerySmallScreen ? "text-xs" : "text-sm"
                )}>
                  Track your manifestation practice and set intentions for each day
                </p>
              </div>
            </div>
            
            <div 
              className="glass-card p-4 rounded-lg flex items-start space-x-4 cursor-pointer"
              onClick={() => navigate('/notes')}
            >
              <div className="p-2 rounded-full bg-manifest-rose/10 text-rose-500">
                <FeatherIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Manifestation Journal</h3>
                <p className={cn(
                  "text-muted-foreground mt-1",
                  isVerySmallScreen ? "text-xs" : "text-sm"
                )}>
                  Write down your intentions, gratitude, and manifestation progress
                </p>
              </div>
            </div>
            
            <div 
              className="glass-card p-4 rounded-lg flex items-start space-x-4 cursor-pointer"
              onClick={() => navigate('/voice-memo')}
            >
              <div className="p-2 rounded-full bg-purple-500/10 text-purple-500">
                <MicIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Voice Memos</h3>
                <p className={cn(
                  "text-muted-foreground mt-1",
                  isVerySmallScreen ? "text-xs" : "text-sm"
                )}>
                  Record, edit, and save voice notes for your manifestation practice
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
