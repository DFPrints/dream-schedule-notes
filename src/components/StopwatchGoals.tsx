
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  FlagIcon, 
  PlusIcon, 
  TimerIcon, 
  TrashIcon, 
  EditIcon,
  SaveIcon,
  ClockIcon
} from 'lucide-react';
import { v4 as uuidv4 } from '@/lib/uuid';
import { toast } from '@/components/ui/use-toast';

interface StopwatchGoal {
  id: string;
  name: string;
  targetTime: number; // in seconds
  affirmation?: string;
  color?: string;
}

interface StopwatchGoalsProps {
  onSelectGoal?: (goal: StopwatchGoal) => void;
}

const colorOptions = [
  { name: "Purple", value: "#9b87f5" },
  { name: "Blue", value: "#0EA5E9" },
  { name: "Green", value: "#10B981" },
  { name: "Yellow", value: "#F59E0B" },
  { name: "Orange", value: "#F97316" },
  { name: "Red", value: "#EF4444" },
  { name: "Pink", value: "#EC4899" }
];

const StopwatchGoals: React.FC<StopwatchGoalsProps> = ({ onSelectGoal }) => {
  const [goals, setGoals] = useState<StopwatchGoal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalMinutes, setNewGoalMinutes] = useState(5);
  const [newGoalSeconds, setNewGoalSeconds] = useState(0);
  const [newGoalAffirmation, setNewGoalAffirmation] = useState('');
  const [newGoalColor, setNewGoalColor] = useState(colorOptions[0].value);

  // Load goals from localStorage on component mount
  useEffect(() => {
    try {
      const savedGoals = localStorage.getItem('stopwatchGoals');
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
    } catch (error) {
      console.error('Error loading stopwatch goals from localStorage:', error);
    }
  }, []);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('stopwatchGoals', JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving stopwatch goals to localStorage:', error);
    }
  }, [goals]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddGoal = () => {
    // Reset form fields
    setNewGoalName('');
    setNewGoalMinutes(5);
    setNewGoalSeconds(0);
    setNewGoalAffirmation('');
    setNewGoalColor(colorOptions[0].value);
    setIsAdding(true);
    setEditingId(null);
  };

  const handleEditGoal = (goal: StopwatchGoal) => {
    setEditingId(goal.id);
    setNewGoalName(goal.name);
    
    const minutes = Math.floor(goal.targetTime / 60);
    const seconds = goal.targetTime % 60;
    
    setNewGoalMinutes(minutes);
    setNewGoalSeconds(seconds);
    setNewGoalAffirmation(goal.affirmation || '');
    setNewGoalColor(goal.color || colorOptions[0].value);
    setIsAdding(false);
  };

  const handleSaveGoal = () => {
    if (!newGoalName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your goal.",
        variant: "destructive"
      });
      return;
    }
    
    const totalSeconds = newGoalMinutes * 60 + newGoalSeconds;
    
    if (totalSeconds <= 0) {
      toast({
        title: "Invalid Time",
        description: "Please set a time greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    if (editingId) {
      // Update existing goal
      setGoals(prev => prev.map(goal => 
        goal.id === editingId
          ? {
              ...goal,
              name: newGoalName,
              targetTime: totalSeconds,
              affirmation: newGoalAffirmation,
              color: newGoalColor
            }
          : goal
      ));
      
      toast({
        title: "Goal Updated",
        description: `"${newGoalName}" has been updated.`,
      });
    } else {
      // Create new goal
      const newGoal: StopwatchGoal = {
        id: uuidv4(),
        name: newGoalName,
        targetTime: totalSeconds,
        affirmation: newGoalAffirmation,
        color: newGoalColor
      };
      
      setGoals(prev => [...prev, newGoal]);
      
      toast({
        title: "Goal Created",
        description: `"${newGoalName}" has been added to your goals.`,
      });
    }
    
    // Reset state
    setIsAdding(false);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    
    if (editingId === id) {
      setEditingId(null);
      setIsAdding(false);
    }
    
    toast({
      title: "Goal Deleted",
      description: "The goal has been removed.",
    });
  };

  return (
    <div className="space-y-4">
      <Card className="neo-morphism border-0">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <FlagIcon className="h-5 w-5 mr-2 text-primary" />
              Stopwatch Goals
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddGoal}
              className="h-8 w-8 p-0 rounded-full"
              disabled={isAdding || editingId !== null}
            >
              <PlusIcon className="h-4 w-4" />
              <span className="sr-only">Add Goal</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAdding || editingId ? (
            <div className="space-y-4 mb-4 p-4 border rounded-lg animate-fade-in">
              <h3 className="font-medium">
                {editingId ? "Edit Goal" : "Create New Goal"}
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="goalName">Goal Name</Label>
                <Input
                  id="goalName"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  placeholder="Morning Meditation"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Target Time</Label>
                <div className="flex space-x-2 items-center">
                  <div className="space-y-1">
                    <Input
                      type="number"
                      min={0}
                      max={60}
                      value={newGoalMinutes}
                      onChange={(e) => setNewGoalMinutes(parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                    <span className="text-xs text-muted-foreground block text-center">Minutes</span>
                  </div>
                  <span className="text-lg">:</span>
                  <div className="space-y-1">
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={newGoalSeconds}
                      onChange={(e) => setNewGoalSeconds(parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                    <span className="text-xs text-muted-foreground block text-center">Seconds</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goalAffirmation">Affirmation (Optional)</Label>
                <Textarea
                  id="goalAffirmation"
                  value={newGoalAffirmation}
                  onChange={(e) => setNewGoalAffirmation(e.target.value)}
                  placeholder="I am present in this moment and focused on my breath."
                  className="h-20 resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${newGoalColor === color.value ? 'border-primary' : 'border-transparent'}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewGoalColor(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveGoal}
                >
                  {editingId ? (
                    <>
                      <SaveIcon className="h-4 w-4 mr-1" />
                      Update
                    </>
                  ) : (
                    <>
                      <SaveIcon className="h-4 w-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : null}
          
          <div className="space-y-2">
            {goals.length > 0 ? (
              goals.map(goal => (
                <div 
                  key={goal.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/10 transition-colors"
                  style={{ borderLeftColor: goal.color, borderLeftWidth: 4 }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <h4 className="font-medium truncate">{goal.name}</h4>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground space-x-2">
                      <span className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {formatTime(goal.targetTime)}
                      </span>
                      {goal.affirmation && (
                        <span>• Has affirmation</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={() => onSelectGoal?.(goal)}
                    >
                      <TimerIcon className="h-4 w-4" />
                      <span className="sr-only">Use Goal</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={() => handleEditGoal(goal)}
                    >
                      <EditIcon className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full text-destructive"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border border-dashed rounded-lg">
                <FlagIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <h3 className="mt-2 text-lg font-medium">No goals set</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create preset goals for meditation, workouts, or other timed activities
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleAddGoal}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Your First Goal
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StopwatchGoals;
