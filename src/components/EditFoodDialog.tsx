import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FoodEntry, useFitnessData } from '@/hooks/useFitnessData';
import { useToast } from '@/hooks/use-toast';

interface EditFoodDialogProps {
  foodEntry: FoodEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditFoodDialog = ({ foodEntry, open, onOpenChange }: EditFoodDialogProps) => {
  const [name, setName] = useState(foodEntry.name);
  const [calories, setCalories] = useState(foodEntry.calories.toString());
  const [protein, setProtein] = useState(foodEntry.protein.toString());
  const [carbs, setCarbs] = useState(foodEntry.carbs.toString());
  const [fat, setFat] = useState(foodEntry.fat.toString());
  const [mealType, setMealType] = useState(foodEntry.meal_type);
  const [loading, setLoading] = useState(false);

  const { editFoodEntry } = useFitnessData();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !calories) {
      toast({
        title: "Missing information",
        description: "Please enter at least food name and calories",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      await editFoodEntry(foodEntry.id, {
        name,
        calories: parseInt(calories),
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fat: parseInt(fat) || 0,
        meal_type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      });

      toast({
        title: "Food updated",
        description: `${name} has been updated successfully`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update food entry",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Food Entry</DialogTitle>
          <DialogDescription>
            Update your food entry details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Food Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Chicken Breast"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meal-type">Meal Type</Label>
            <Select value={mealType} onValueChange={(value) => setMealType(value as 'breakfast' | 'lunch' | 'dinner' | 'snack')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories *</Label>
              <Input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Food'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFoodDialog;