import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useFitnessData } from '@/hooks/useFitnessData';


const Diet = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { userGoals, dailyStats, foodEntries, loading, updateWaterIntake } = useFitnessData();

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
    return foodEntries.filter(entry => entry.meal_type === meal);
  };

  const getMealCalories = (meal: string) => {
    return getMealEntries(meal).reduce((total, entry) => total + entry.calories, 0);
  };

  const handleWaterUpdate = (newIntake: number) => {
    updateWaterIntake(newIntake);
  };

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
                              <span className="text-xs text-muted-foreground">
                                {new Date(entry.logged_at).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
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
      </div>
    </Layout>
  );
};

export default Diet;