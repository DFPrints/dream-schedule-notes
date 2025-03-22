import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, TimerIcon, CalendarIcon, FeatherIcon, SparklesIcon, MicIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Index = () => {
  const navigate = useNavigate();
  const [activeManifestations, setActiveManifestations] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Here you would fetch actual data
  }, []);

  // Sample quick actions
  const quickActions = [
    { name: "Start Timer", icon: TimerIcon, path: "/timer", color: "bg-manifest-accent/10 text-primary" },
    { name: "View Calendar", icon: CalendarIcon, path: "/calendar", color: "bg-manifest-gold/10 text-manifest-gold" },
    { name: "Create Note", icon: FeatherIcon, path: "/notes", color: "bg-manifest-rose/10 text-rose-500" },
    { name: "Record Voice", icon: MicIcon, path: "/voice-memo", color: "bg-purple-500/10 text-purple-500" },
  ];

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

        {/* Quick Actions */}
        <section className="pt-4">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.name}
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
        </section>

        {/* Start New Manifestation */}
        <section>
          <Card className="glass-morphism overflow-hidden border-0">
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
        </section>

        {/* Features Overview */}
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
