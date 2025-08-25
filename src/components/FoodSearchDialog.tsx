import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { useFitnessData } from '@/hooks/useFitnessData';
import { useToast } from '@/hooks/use-toast';

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const commonFoods: FoodItem[] = [
  { name: 'Banana (1 medium)', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: 'Greek Yogurt (1 cup)', calories: 150, protein: 20, carbs: 9, fat: 4 },
  { name: 'Almonds (1 oz)', calories: 164, protein: 6, carbs: 6, fat: 14 },
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 4 },
  { name: 'Brown Rice (1 cup cooked)', calories: 216, protein: 5, carbs: 45, fat: 2 },
  { name: 'Avocado (1 medium)', calories: 320, protein: 4, carbs: 17, fat: 29 },
  { name: 'Whole Wheat Bread (1 slice)', calories: 80, protein: 4, carbs: 14, fat: 1 },
  { name: 'Eggs (1 large)', calories: 70, protein: 6, carbs: 1, fat: 5 }
];

interface FoodSearchDialogProps {
  defaultMealType?: string;
  trigger?: React.ReactNode;
}

const FoodSearchDialog = ({ defaultMealType = 'breakfast', trigger }: FoodSearchDialogProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const { addFoodEntry } = useFitnessData();
  const { toast } = useToast();

  const filteredFoods = commonFoods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFood = async (food: FoodItem) => {
    setLoading(true);
    
    try {
      await addFoodEntry({
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        meal_type: defaultMealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      });

      toast({
        title: "Food added",
        description: `${food.name} has been added to your ${defaultMealType}`,
      });

      setOpen(false);
      setSearchQuery('');
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
          <Button size="sm">
            <Search size={14} className="mr-1" />
            Search Foods
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Search Foods</DialogTitle>
          <DialogDescription>
            Find and add foods from our database
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search for foods..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredFoods.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {searchQuery ? 'No foods found matching your search' : 'Start typing to search for foods'}
              </div>
            ) : (
              filteredFoods.map((food) => (
                <div key={food.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                  <div>
                    <div className="font-medium">{food.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {food.calories} cal • P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleAddFood(food)}
                    disabled={loading}
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodSearchDialog;