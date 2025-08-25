import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
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

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
}

const Diet = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [waterIntake, setWaterIntake] = useState(6);
  
  const dailyGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67,
    water: 8
  };

  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([
    {
      id: '1',
      name: 'Oatmeal with Berries',
      calories: 320,
      protein: 12,
      carbs: 54,
      fat: 6,
      meal: 'breakfast',
      time: '08:30'
    },
    {
      id: '2',
      name: 'Grilled Chicken Salad',
      calories: 450,
      protein: 35,
      carbs: 20,
      fat: 25,
      meal: 'lunch',
      time: '12:45'
    },
    {
      id: '3',
      name: 'Protein Shake',
      calories: 250,
      protein: 25,
      carbs: 15,
      fat: 8,
      meal: 'snack',
      time: '15:30'
    },
    {
      id: '4',
      name: 'Salmon with Rice',
      calories: 520,
      protein: 40,
      carbs: 45,
      fat: 18,
      meal: 'dinner',
      time: '19:00'
    }
  ]);

  const getTotalMacros = () => {
    return foodEntries.reduce((total, entry) => ({
      calories: total.calories + entry.calories,
      protein: total.protein + entry.protein,
      carbs: total.carbs + entry.carbs,
      fat: total.fat + entry.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const getMealEntries = (meal: string) => {
    return foodEntries.filter(entry => entry.meal === meal);
  };

  const getMealCalories = (meal: string) => {
    return getMealEntries(meal).reduce((total, entry) => total + entry.calories, 0);
  };

  const macros = getTotalMacros();

  const mealSections = [
    { id: 'breakfast', name: 'Breakfast', icon: Coffee },
    { id: 'lunch', name: 'Lunch', icon: Utensils },
    { id: 'dinner', name: 'Dinner', icon: Apple },
    { id: 'snack', name: 'Snacks', icon: Moon }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Daily Overview */}
        <Card className="bg-gradient-hero text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Today's Nutrition</CardTitle>
            <CardDescription className="text-white/80">
              Track your daily intake and stay on target
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{macros.calories}</div>
                <div className="text-sm opacity-80">of {dailyGoals.calories} cal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{macros.protein}g</div>
                <div className="text-sm opacity-80">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{macros.carbs}g</div>
                <div className="text-sm opacity-80">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{macros.fat}g</div>
                <div className="text-sm opacity-80">Fat</div>
              </div>
            </div>
            <Progress 
              value={(macros.calories / dailyGoals.calories) * 100} 
              className="bg-white/20"
            />
          </CardContent>
        </Card>

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
                      <Button size="sm" variant="outline">
                        <Plus size={14} className="mr-1" />
                        Add
                      </Button>
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
                              <span className="text-xs text-muted-foreground">{entry.time}</span>
                              <Button size="sm" variant="ghost">
                                <Edit3 size={14} />
                              </Button>
                              <Button size="sm" variant="ghost">
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
                <CardTitle>Search Foods</CardTitle>
                <CardDescription>
                  Find and add foods to your diary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    placeholder="Search for foods..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Sample search results */}
                <div className="space-y-2">
                  {['Banana (1 medium)', 'Greek Yogurt (1 cup)', 'Almonds (1 oz)', 'Chicken Breast (100g)'].map((food) => (
                    <div key={food} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <span>{food}</span>
                      <Button size="sm">
                        <Plus size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
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
                    {waterIntake}/{dailyGoals.water}
                  </div>
                  <div className="text-muted-foreground">glasses today</div>
                  <Progress 
                    value={(waterIntake / dailyGoals.water) * 100} 
                    className="mt-4" 
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {Array.from({ length: dailyGoals.water }).map((_, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        index < waterIntake
                          ? 'bg-blue-500 text-white'
                          : 'bg-muted hover:bg-accent'
                      }`}
                      onClick={() => setWaterIntake(index < waterIntake ? index : index + 1)}
                    >
                      <Droplets size={20} />
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setWaterIntake(Math.min(waterIntake + 1, dailyGoals.water))}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Glass
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setWaterIntake(Math.max(waterIntake - 1, 0))}
                    className="flex-1"
                  >
                    Remove Glass
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Diet;