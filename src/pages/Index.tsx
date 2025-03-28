
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
  StopwatchIcon, 
  SettingsIcon,
  Clock 
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

  useEffect(() => {
    setMounted(true);
    // Here you would fetch actual data
  }, []);

  // All available features
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
      icon: StopwatchIcon, 
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

  // Quick actions (subset of features)
  const quickActions = allFeatures.slice(0, 4);

  if (!mounted) return null;

  return (
    <Layout>
      <div className="space-y-8 pb-20">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-light tracking-tight">Manifest</h1>
          <p className="text-muted-foreground">
            Create intentions, set timers, stay mindful
          </p>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="quick" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="quick">Quick Actions</TabsTrigger>
            <TabsTrigger value="all">All Features</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
          
          {/* Quick Actions Tab Content */}
          <TabsContent value="quick" className="mt-0 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="ghost"
                  className={cn(
                    "h-auto flex-col py-6 neo-morphism border-0",
                    action.color
                  )}
                  onClick={() => navigate(action.path)}
                >
                  <action.icon className="h-6 w-6 mb-2" />
                  <span className="text-sm font-normal">{action.name}</span>
                </Button>
              ))}
            </div>
            
            {/* Start New Manifestation */}
            <Card className="glass-morphism overflow-hidden border-0 mt-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium flex items-center">
                      <SparklesIcon className="h-5 w-5 mr-2 text-manifest-gold" />
                      Start New Manifestation
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
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
          
          {/* All Features Tab Content */}
          <TabsContent value="all" className="mt-0 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allFeatures.map((feature) => (
                <Button
                  key={feature.id}
                  variant="ghost"
                  className={cn(
                    "h-auto flex-col py-6 neo-morphism border-0",
                    feature.color
                  )}
                  onClick={() => navigate(feature.path)}
                >
                  <feature.icon className="h-6 w-6 mb-2" />
                  <span className="text-sm font-normal">{feature.name}</span>
                  <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                </Button>
              ))}
            </div>
          </TabsContent>
          
          {/* Recent Tab Content */}
          <TabsContent value="recent" className="mt-0 animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Recent Activity</h2>
              <div className="grid gap-3">
                {/* This could be populated with real user activity */}
                <div className="flex items-center p-3 neo-morphism border-0 rounded-lg">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">No recent activity</h3>
                    <p className="text-xs text-muted-foreground">Start using the app to see your activity here</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Features Overview - always shown */}
        <section className="pt-2">
          <h2 className="text-lg font-medium mb-4">Features</h2>
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
                <p className="text-sm text-muted-foreground mt-1">
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
                <p className="text-sm text-muted-foreground mt-1">
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
                <p className="text-sm text-muted-foreground mt-1">
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
                <p className="text-sm text-muted-foreground mt-1">
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
