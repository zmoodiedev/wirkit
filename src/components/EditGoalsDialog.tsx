import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { UserGoals } from '@/hooks/useFitnessData';

interface EditGoalsDialogProps {
  userGoals: UserGoals | null;
  onUpdateGoals: (goals: Partial<UserGoals>) => Promise<void>;
}

const EditGoalsDialog = ({ userGoals, onUpdateGoals }: EditGoalsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [goals, setGoals] = useState({
    daily_calories: userGoals?.daily_calories || 2000,
    daily_protein: userGoals?.daily_protein || 150,
    daily_carbs: userGoals?.daily_carbs || 250,
    daily_fat: userGoals?.daily_fat || 67,
    daily_water: userGoals?.daily_water || 8,
    daily_workout_minutes: userGoals?.daily_workout_minutes || 60,
    weekly_workouts: userGoals?.weekly_workouts || 5
  });

  const handleSave = async () => {
    await onUpdateGoals(goals);
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Reset form when opening
      setGoals({
        daily_calories: userGoals?.daily_calories || 2000,
        daily_protein: userGoals?.daily_protein || 150,
        daily_carbs: userGoals?.daily_carbs || 250,
        daily_fat: userGoals?.daily_fat || 67,
        daily_water: userGoals?.daily_water || 8,
        daily_workout_minutes: userGoals?.daily_workout_minutes || 60,
        weekly_workouts: userGoals?.weekly_workouts || 5
      });
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
          <Settings size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Nutrition Goals</DialogTitle>
          <DialogDescription>
            Customize your daily nutrition and fitness targets
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Daily Calories</Label>
              <Input
                id="calories"
                type="number"
                value={goals.daily_calories}
                onChange={(e) => setGoals(prev => ({ ...prev, daily_calories: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                value={goals.daily_protein}
                onChange={(e) => setGoals(prev => ({ ...prev, daily_protein: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                value={goals.daily_carbs}
                onChange={(e) => setGoals(prev => ({ ...prev, daily_carbs: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                value={goals.daily_fat}
                onChange={(e) => setGoals(prev => ({ ...prev, daily_fat: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="water">Water (glasses)</Label>
              <Input
                id="water"
                type="number"
                value={goals.daily_water}
                onChange={(e) => setGoals(prev => ({ ...prev, daily_water: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workout">Workout (min/day)</Label>
              <Input
                id="workout"
                type="number"
                value={goals.daily_workout_minutes}
                onChange={(e) => setGoals(prev => ({ ...prev, daily_workout_minutes: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weekly_workouts">Weekly Workouts</Label>
            <Input
              id="weekly_workouts"
              type="number"
              value={goals.weekly_workouts}
              onChange={(e) => setGoals(prev => ({ ...prev, weekly_workouts: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Goals
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditGoalsDialog;