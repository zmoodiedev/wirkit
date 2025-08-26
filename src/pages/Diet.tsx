import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import Layout from '@/components/Layout';
import AddFoodDialog from '@/components/AddFoodDialog';
import FoodSearchDialog from '@/components/FoodSearchDialog';
import EditFoodDialog from '@/components/EditFoodDialog';
import { 
  Plus, 
  Search, 
  Flame, 
  Droplets,
  Apple,
  Coffee,
  Utensils,
  Moon,
  Edit3,
  Trash2
} from 'lucide-react';
import { useFitnessData, FoodEntry } from '@/hooks/useFitnessData';
import { useToast } from '@/hooks/use-toast';
import EditGoalsDialog from '@/components/EditGoalsDialog';


// Common foods from food database
const commonFoods = [
  { name: 'Banana (1 medium)', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: 'Greek Yogurt (1 cup)', calories: 150, protein: 20, carbs: 9, fat: 4 },
  { name: 'Almonds (1 oz)', calories: 164, protein: 6, carbs: 6, fat: 14 },
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 4 },
  { name: 'Brown Rice (1 cup cooked)', calories: 216, protein: 5, carbs: 45, fat: 2 },
  { name: 'Avocado (1 medium)', calories: 320, protein: 4, carbs: 17, fat: 29 },
  { name: 'Whole Wheat Bread (1 slice)', calories: 80, protein: 4, carbs: 14, fat: 1 },
  { name: 'Eggs (1 large)', calories: 70, protein: 6, carbs: 1, fat: 5 }
];

const Diet = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingFood, setEditingFood] = useState<FoodEntry | null>(null);
  const [deletingFood, setDeletingFood] = useState<FoodEntry | null>(null);
  const [addingFood, setAddingFood] = useState(false);
  const { userGoals, dailyStats, foodEntries, customFoods, loading, updateWaterIntake, deleteFoodEntry, addFoodEntry, updateUserGoals } = useFitnessData();
  const { toast } = useToast();

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  const getMealEntries = (meal: string) => {
    const today = new Date().toISOString().split('T')[0];
    return foodEntries.filter(entry => entry.meal_type === meal && entry.date === today);
  };

  const getMealCalories = (meal: string) => {
    return getMealEntries(meal).reduce((total, entry) => total + entry.calories, 0);
  };

  const handleWaterUpdate = (newIntake: number) => {
    updateWaterIntake(newIntake);
  };

  // Food search and pagination logic
  const itemsPerPage = 8;
  
  const filteredCommonFoods = commonFoods.filter(food =>
    food.name.toLowerCase().includes(foodSearchQuery.toLowerCase())
  );

  const filteredCustomFoods = customFoods.filter(food =>
    food.name.toLowerCase().includes(foodSearchQuery.toLowerCase())
  );

  const allFilteredFoods = [
    ...filteredCustomFoods.map(f => ({ ...f, isCustom: true })),
    ...filteredCommonFoods.map(f => ({ ...f, isCustom: false, id: undefined }))
  ];

  const totalPages = Math.ceil(allFilteredFoods.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFoods = allFilteredFoods.slice(startIndex, startIndex + itemsPerPage);

  const handleAddFood = async (food: any, mealType: string = 'breakfast') => {
    setAddingFood(true);
    
    try {
      await addFoodEntry({
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        meal_type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      });

      toast({
        title: "Food added",
        description: `${food.name} has been added to your ${mealType}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add food entry",
        variant: "destructive"
      });
    } finally {
      setAddingFood(false);
    }
  };

  // Reset pagination when search changes
  const handleSearchChange = (value: string) => {
    setFoodSearchQuery(value);
    setCurrentPage(1);
  };

  const handleDeleteFood = async () => {
    if (!deletingFood) return;
    
    try {
      await deleteFoodEntry(deletingFood.id);
      toast({
        title: "Food deleted",
        description: `${deletingFood.name} has been removed from your log`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete food entry",
        variant: "destructive"
      });
    } finally {
      setDeletingFood(null);
    }
  };

  const mealSections = [
    { id: 'breakfast', name: 'Breakfast', icon: Coffee },
    { id: 'lunch', name: 'Lunch', icon: Utensils },
    { id: 'dinner', name: 'Dinner', icon: Apple },
    { id: 'snack', name: 'Snacks', icon: Moon }
  ];

  const currentDate = new Date();

  return (
    <Layout>
      <div className="space-y-6">

        {/* Daily Overview */}
        <Card className="bg-gradient-hero text-white border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Today's Nutrition</CardTitle>
                <CardDescription className="text-white/80">
                  Track your daily intake and stay on target
                </CardDescription>
              </div>
              <EditGoalsDialog 
                userGoals={userGoals} 
                onUpdateGoals={updateUserGoals}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{dailyStats?.calories_consumed || 0}</div>
                <div className="text-sm opacity-80">of {userGoals?.daily_calories || 2000} cal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{dailyStats?.protein_consumed || 0}g</div>
                <div className="text-sm opacity-80">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{dailyStats?.carbs_consumed || 0}g</div>
                <div className="text-sm opacity-80">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{dailyStats?.fat_consumed || 0}g</div>
                <div className="text-sm opacity-80">Fat</div>
              </div>
            </div>
            <Progress 
              value={((dailyStats?.calories_consumed || 0) / (userGoals?.daily_calories || 2000)) * 100} 
              className="bg-white/20"
            />
          </CardContent>
        </Card>
        
        {/* Date Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {format(currentDate, 'EEEE, MMMM do')}
          </h1>
          <p className="text-muted-foreground">
            {format(currentDate, 'yyyy')}
          </p>
        </div>

        <Tabs defaultValue="log" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="log">Food Log</TabsTrigger>
            <TabsTrigger value="search">Add Food</TabsTrigger>
            <TabsTrigger value="water">Water Intake</TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="space-y-4">
            {mealSections.map((section) => {
              const Icon = section.icon;
              const mealEntries = getMealEntries(section.id);
              const mealCalories = getMealCalories(section.id);

              return (
                <Card key={section.id} className="shadow-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={20} className="text-primary" />
                        <CardTitle className="text-lg">{section.name}</CardTitle>
                        {mealCalories > 0 && (
                          <Badge variant="secondary">{mealCalories} cal</Badge>
                        )}
                      </div>
                      <AddFoodDialog defaultMealType={section.id} />
                    </div>
                  </CardHeader>
                  {mealEntries.length > 0 && (
                    <CardContent>
                      <div className="space-y-2">
                        {mealEntries.map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <div className="font-medium">{entry.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {entry.calories} cal • P: {entry.protein}g • C: {entry.carbs}g • F: {entry.fat}g
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(entry.logged_at).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => setEditingFood(entry)}
                              >
                                <Edit3 size={14} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => setDeletingFood(entry)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Add Foods</CardTitle>
                <CardDescription>
                  Search foods from our database or create custom entries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      placeholder="Search for foods..."
                      className="pl-10"
                      value={foodSearchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </div>
                  <AddFoodDialog 
                    customFoodOnly={true}
                    trigger={
                      <Button>
                        <Plus size={16} className="mr-2" />
                        Create Custom
                      </Button>
                    }
                  />
                </div>

                {/* Food Items List */}
                <div className="space-y-3">
                  {paginatedFoods.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      {foodSearchQuery ? 'No foods found matching your search' : 'Start typing to search for foods'}
                    </div>
                  ) : (
                    paginatedFoods.map((food, index) => (
                      <div key={`${food.isCustom ? 'custom' : 'common'}-${food.id || food.name}-${index}`} 
                           className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{food.name}</div>
                            {food.isCustom && <Badge variant="secondary" className="text-xs">Custom</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {food.calories} cal • P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select 
                            className="px-3 py-1 text-sm border rounded-md bg-background"
                            onChange={(e) => handleAddFood(food, e.target.value)}
                            disabled={addingFood}
                          >
                            <option value="">Add to...</option>
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                            <option value="snack">Snack</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                            }}
                            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="water" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="text-blue-500" size={20} />
                  Water Intake
                </CardTitle>
                <CardDescription>
                  Stay hydrated throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-500 mb-2">
                    {dailyStats?.water_intake || 0}/{userGoals?.daily_water || 8}
                  </div>
                  <div className="text-muted-foreground">glasses today</div>
                  <Progress 
                    value={((dailyStats?.water_intake || 0) / (userGoals?.daily_water || 8)) * 100} 
                    className="mt-4" 
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {Array.from({ length: userGoals?.daily_water || 8 }).map((_, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        index < (dailyStats?.water_intake || 0)
                          ? 'bg-blue-500 text-white'
                          : 'bg-muted hover:bg-accent'
                      }`}
                      onClick={() => handleWaterUpdate(index < (dailyStats?.water_intake || 0) ? index : index + 1)}
                    >
                      <Droplets size={20} />
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleWaterUpdate(Math.min((dailyStats?.water_intake || 0) + 1, userGoals?.daily_water || 8))}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Glass
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleWaterUpdate(Math.max((dailyStats?.water_intake || 0) - 1, 0))}
                    className="flex-1"
                  >
                    Remove Glass
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Food Dialog */}
        {editingFood && (
          <EditFoodDialog
            foodEntry={editingFood}
            open={!!editingFood}
            onOpenChange={(open) => !open && setEditingFood(null)}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingFood} onOpenChange={(open) => !open && setDeletingFood(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Food Entry</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingFood?.name}" from your food log? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteFood}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Diet;