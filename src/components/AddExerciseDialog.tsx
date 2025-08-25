import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddExerciseDialogProps {
  workoutId: string;
  onAddExercise: (exercise: { 
    name: string; 
    category: string; 
    rest_time: number;
    sets: { reps: number; weight?: number }[];
  }) => Promise<void>;
}

const AddExerciseDialog = ({ workoutId, onAddExercise }: AddExerciseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [restTime, setRestTime] = useState(60);
  const [sets, setSets] = useState([{ reps: 10, weight: undefined as number | undefined }]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const categories = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category) return;

    setLoading(true);
    try {
      await onAddExercise({
        name: name.trim(),
        category,
        rest_time: restTime,
        sets: sets.filter(set => set.reps > 0)
      });
      
      toast({
        title: "Exercise Added",
        description: "Your exercise has been added to the workout.",
      });
      
      setName('');
      setCategory('');
      setRestTime(60);
      setSets([{ reps: 10, weight: undefined }]);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add exercise. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSet = () => {
    setSets([...sets, { reps: 10, weight: undefined }]);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const updateSet = (index: number, field: 'reps' | 'weight', value: number | undefined) => {
    setSets(sets.map((set, i) => 
      i === index ? { ...set, [field]: value } : set
    ));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all">
          <Plus size={16} className="mr-2" />
          Add Exercise
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
          <DialogDescription>
            Add a new exercise with sets to your workout.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="exercise-name">Exercise Name</Label>
              <Input
                id="exercise-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Bench Press, Squats"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="rest-time">Rest Time (seconds)</Label>
                <Input
                  id="rest-time"
                  type="number"
                  value={restTime}
                  onChange={(e) => setRestTime(parseInt(e.target.value) || 60)}
                  min="30"
                  max="300"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Sets</Label>
                <Button type="button" size="sm" variant="outline" onClick={addSet}>
                  <Plus size={14} className="mr-1" />
                  Add Set
                </Button>
              </div>
              
              <div className="space-y-2">
                {sets.map((set, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-medium w-8">#{index + 1}</span>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Reps"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(index, 'reps', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Weight (lbs)"
                        value={set.weight || ''}
                        onChange={(e) => updateSet(index, 'weight', parseFloat(e.target.value) || undefined)}
                        min="0"
                        step="0.5"
                      />
                    </div>
                    {sets.length > 1 && (
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeSet(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim() || !category}>
              {loading ? "Adding..." : "Add Exercise"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExerciseDialog;