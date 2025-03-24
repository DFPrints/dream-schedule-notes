
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import StopwatchComponent from '@/components/StopwatchComponent';
import StopwatchGoals from '@/components/StopwatchGoals';
import { toast } from '@/components/ui/use-toast';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClockIcon, FlagIcon } from 'lucide-react';

interface StopwatchGoal {
  id: string;
  name: string;
  targetTime: number; // in seconds
  affirmation?: string;
  color?: string;
}

const StopwatchPage = () => {
  const [selectedGoal, setSelectedGoal] = useState<StopwatchGoal | null>(null);
  const [activeTab, setActiveTab] = useState('stopwatch');

  const handleSelectGoal = (goal: StopwatchGoal) => {
    setSelectedGoal(goal);
    setActiveTab('stopwatch');
    
    toast({
      title: "Goal Selected",
      description: `"${goal.name}" loaded. Target time: ${Math.floor(goal.targetTime / 60)}:${(goal.targetTime % 60).toString().padStart(2, '0')}`,
    });
    
    if (goal.affirmation) {
      setTimeout(() => {
        toast({
          title: "Affirmation",
          description: goal.affirmation,
          className: "bg-primary text-primary-foreground",
        });
      }, 1000);
    }
  };

  // Save selected goal to localStorage
  useEffect(() => {
    if (selectedGoal) {
      try {
        localStorage.setItem('lastSelectedStopwatchGoal', JSON.stringify(selectedGoal));
      } catch (error) {
        console.error('Error saving selected goal to localStorage:', error);
      }
    }
  }, [selectedGoal]);

  // Load selected goal from localStorage on component mount
  useEffect(() => {
    try {
      const savedGoal = localStorage.getItem('lastSelectedStopwatchGoal');
      if (savedGoal) {
        setSelectedGoal(JSON.parse(savedGoal));
      }
    } catch (error) {
      console.error('Error loading selected goal from localStorage:', error);
    }
  }, []);

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-medium">Stopwatch</h1>
          <p className="text-muted-foreground">
            Track time spent on activities
          </p>
        </div>

        {/* Selected Goal Display (if any) */}
        {selectedGoal && (
          <Card 
            className="neo-morphism border-0 animate-fade-in"
            style={{ borderLeftColor: selectedGoal.color, borderLeftWidth: 4 }}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-medium">{selectedGoal.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Target: {Math.floor(selectedGoal.targetTime / 60)}:{(selectedGoal.targetTime % 60).toString().padStart(2, '0')}
                </p>
              </div>
              {selectedGoal.affirmation && (
                <div className="max-w-xs italic text-sm">
                  "{selectedGoal.affirmation}"
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tabs for Stopwatch and Goals */}
        <Tabs 
          defaultValue="stopwatch" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stopwatch" className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-2" />
              Stopwatch
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center">
              <FlagIcon className="h-4 w-4 mr-2" />
              Goals
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="stopwatch" className="mt-4">
            <StopwatchComponent targetTime={selectedGoal?.targetTime} />
          </TabsContent>
          
          <TabsContent value="goals" className="mt-4">
            <StopwatchGoals onSelectGoal={handleSelectGoal} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default StopwatchPage;
