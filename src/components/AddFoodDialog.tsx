import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { useFitnessData } from '@/hooks/useFitnessData';
import { useToast } from '@/hooks/use-toast';

interface AddFoodDialogProps {
  defaultMealType?: string;
  trigger?: React.ReactNode;
  customFoodOnly?: boolean;
}

const AddFoodDialog = ({ defaultMealType = 'breakfast', trigger, customFoodOnly = false }: AddFoodDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState(defaultMealType);
  const [saveAsCustom, setSaveAsCustom] = useState(customFoodOnly);
  const [loading, setLoading] = useState(false);

  const { addFoodEntry, addCustomFood } = useFitnessData();
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
      const foodData = {
        name,
        calories: parseInt(calories),
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fat: parseInt(fat) || 0,
      };

      // Save as custom food if checkbox is checked
      if (saveAsCustom) {
        await addCustomFood(foodData);
      }

      // If not custom food only mode, also add to today's log
      if (!customFoodOnly) {
        await addFoodEntry({
          ...foodData,
          meal_type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        });
      }

      toast({
        title: customFoodOnly ? "Custom food saved" : (saveAsCustom ? "Food added and saved" : "Food added"),
        description: customFoodOnly 
          ? `${name} has been saved to your custom foods`
          : (saveAsCustom 
            ? `${name} has been added to your ${mealType} and saved for future use`
            : `${name} has been added to your ${mealType}`),
      });

      // Reset form
      setName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setSaveAsCustom(customFoodOnly);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add food entry",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Plus size={14} className="mr-1" />
            Add
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{customFoodOnly ? 'Create Custom Food' : 'Add Food Entry'}</DialogTitle>
          <DialogDescription>
            {customFoodOnly 
              ? 'Create a custom food that you can reuse later'
              : 'Add a food item to your daily log'
            }
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

          {!customFoodOnly && (
            <div className="space-y-2">
              <Label htmlFor="meal-type">Meal Type</Label>
              <Select value={mealType} onValueChange={setMealType}>
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
          )}

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

          {!customFoodOnly && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="save-custom" 
                checked={saveAsCustom}
                onCheckedChange={(checked) => setSaveAsCustom(!!checked)}
              />
              <Label htmlFor="save-custom" className="text-sm">
                Save this food to my custom foods for future use
              </Label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (customFoodOnly ? 'Saving...' : 'Adding...') : (customFoodOnly ? 'Save Food' : 'Add Food')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFoodDialog;