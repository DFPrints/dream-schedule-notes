
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { StopwatchComponent } from '@/components/StopwatchComponent';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { TimerIcon, FlagIcon, PlusIcon, SaveIcon, TrashIcon, ClockIcon, BarChart4Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from '@/lib/uuid';

interface StopwatchGoal {
  id: string;
  name: string;
  targetTime: number; // in milliseconds
  description?: string;
  bestTime?: number;
  createdAt: Date;
}

const StopwatchPage = () => {
  const [goals, setGoals] = useState<StopwatchGoal[]>(() => {
    try {
      const savedGoals = localStorage.getItem('manifestStopwatchGoals');
      if (savedGoals) {
        return JSON.parse(savedGoals).map((goal: any) => ({
          ...goal,
          createdAt: new Date(goal.createdAt)
        }));
      }
    } catch (error) {
      console.error('Error loading stopwatch goals:', error);
    }
    return [];
  });
  
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalMinutes, setNewGoalMinutes] = useState('5');
  const [newGoalSeconds, setNewGoalSeconds] = useState('0');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  
  const handleAddGoal = () => {
    if (!newGoalName.trim()) {
      toast({
        title: "Name Required",
        description: "Please provide a name for your goal.",
        variant: "destructive"
      });
      return;
    }
    
    const minutes = parseInt(newGoalMinutes) || 0;
    const seconds = parseInt(newGoalSeconds) || 0;
    const targetTime = (minutes * 60 * 1000) + (seconds * 1000);
    
    if (targetTime <= 0) {
      toast({
        title: "Invalid Time",
        description: "Please set a target time greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    const newGoal: StopwatchGoal = {
      id: uuidv4(),
      name: newGoalName,
      targetTime,
      description: newGoalDescription,
      createdAt: new Date()
    };
    
    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    
    // Save to localStorage
    try {
      localStorage.setItem('manifestStopwatchGoals', JSON.stringify(updatedGoals));
    } catch (error) {
      console.error('Error saving stopwatch goals:', error);
    }
    
    // Reset form
    setNewGoalName('');
    setNewGoalMinutes('5');
    setNewGoalSeconds('0');
    setNewGoalDescription('');
    setIsAddingGoal(false);
    
    toast({
      title: "Goal Added",
      description: `"${newGoalName}" has been added to your goals.`
    });
  };
  
  const handleDeleteGoal = (id: string) => {
    const goalToDelete = goals.find(goal => goal.id === id);
    if (!goalToDelete) return;
    
    const updatedGoals = goals.filter(goal => goal.id !== id);
    setGoals(updatedGoals);
    
    // Save to localStorage
    try {
      localStorage.setItem('manifestStopwatchGoals', JSON.stringify(updatedGoals));
    } catch (error) {
      console.error('Error saving stopwatch goals:', error);
    }
    
    toast({
      title: "Goal Deleted",
      description: `"${goalToDelete.name}" has been removed from your goals.`
    });
  };
  
  const formatGoalTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const updateGoalBestTime = (goalId: string, time: number) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const bestTime = goal.bestTime ? Math.min(goal.bestTime, time) : time;
        return { ...goal, bestTime };
      }
      return goal;
    });
    
    setGoals(updatedGoals);
    
    // Save to localStorage
    try {
      localStorage.setItem('manifestStopwatchGoals', JSON.stringify(updatedGoals));
    } catch (error) {
      console.error('Error saving stopwatch goals:', error);
    }
    
    const updatedGoal = updatedGoals.find(g => g.id === goalId);
    
    toast({
      title: "New Record!",
      description: `You set a new best time for "${updatedGoal?.name}".`
    });
  };
  
  return (
    <Layout>
      <div className="space-y-8 pb-20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium">Stopwatch</h1>
            <p className="text-muted-foreground">
              Track elapsed time for your activities
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Card className="neo-morphism border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <TimerIcon className="h-5 w-5 mr-2 text-primary" />
                  Stopwatch
                  <span className="ml-auto text-xs text-muted-foreground">Time elapsed</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StopwatchComponent />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="neo-morphism border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <FlagIcon className="h-5 w-5 mr-2 text-primary" />
                    Time Goals
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setIsAddingGoal(true)}
                    className="h-8 rounded-full"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Goal
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAddingGoal ? (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <Label htmlFor="goal-name">Goal Name</Label>
                      <Input
                        id="goal-name"
                        value={newGoalName}
                        onChange={(e) => setNewGoalName(e.target.value)}
                        placeholder="e.g., Morning Meditation"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label>Target Time</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="number"
                          value={newGoalMinutes}
                          onChange={(e) => setNewGoalMinutes(e.target.value)}
                          min="0"
                          max="59"
                          className="w-20"
                        />
                        <span>minutes</span>
                        <Input
                          type="number"
                          value={newGoalSeconds}
                          onChange={(e) => setNewGoalSeconds(e.target.value)}
                          min="0"
                          max="59"
                          className="w-20"
                        />
                        <span>seconds</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="goal-description">Description (Optional)</Label>
                      <Input
                        id="goal-description"
                        value={newGoalDescription}
                        onChange={(e) => setNewGoalDescription(e.target.value)}
                        placeholder="Brief description of your goal"
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button
                        variant="ghost"
                        onClick={() => setIsAddingGoal(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddGoal}>
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Save Goal
                      </Button>
                    </div>
                  </div>
                ) : goals.length > 0 ? (
                  <div className="space-y-3">
                    {goals.map((goal) => (
                      <div 
                        key={goal.id} 
                        className="p-3 rounded-lg border border-border flex justify-between items-center hover:bg-secondary/10 transition-colors"
                      >
                        <div>
                          <h4 className="font-medium">{goal.name}</h4>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            <span>Target: {formatGoalTime(goal.targetTime)}</span>
                          </div>
                          {goal.bestTime && (
                            <div className="flex items-center text-sm text-green-500 mt-1">
                              <BarChart4Icon className="h-3 w-3 mr-1" />
                              <span>Best: {formatGoalTime(goal.bestTime)}</span>
                            </div>
                          )}
                          {goal.description && (
                            <p className="text-xs text-muted-foreground mt-1">{goal.description}</p>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <TrashIcon className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 text-muted-foreground">
                    <FlagIcon className="h-12 w-12 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="mb-2">No time goals created yet</p>
                    <Button size="sm" onClick={() => setIsAddingGoal(true)}>
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add your first goal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="neo-morphism border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <svg className="h-5 w-5 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Affirmation Timer Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-medium">Why Set Time Goals?</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Setting specific time goals for your affirmations and manifestation practices can help build consistency and measure your progress over time.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Suggested Practice Times:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                          <span className="text-xs font-medium">1</span>
                        </div>
                        <div>
                          <p className="font-medium">5-Minute Morning Affirmations</p>
                          <p className="text-sm text-muted-foreground">Start your day with positive energy</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                          <span className="text-xs font-medium">2</span>
                        </div>
                        <div>
                          <p className="font-medium">10-Minute Manifestation Visualization</p>
                          <p className="text-sm text-muted-foreground">Create a clear mental image of your desires</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                          <span className="text-xs font-medium">3</span>
                        </div>
                        <div>
                          <p className="font-medium">15-Minute Gratitude Practice</p>
                          <p className="text-sm text-muted-foreground">Express thankfulness for current blessings</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                          <span className="text-xs font-medium">4</span>
                        </div>
                        <div>
                          <p className="font-medium">20-Minute Deep Manifestation Session</p>
                          <p className="text-sm text-muted-foreground">Connect deeply with your intentions</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground pt-0">
                Create custom goals based on your personal practice
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StopwatchPage;
