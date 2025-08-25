import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import Layout from '@/components/Layout';
import { AddPlannedItemDialog } from '@/components/AddPlannedItemDialog';
import { usePlannedItems } from '@/hooks/usePlannedItems';
import { format, isSameDay } from 'date-fns';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Dumbbell, 
  Apple,
  Target,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

const Planner = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { 
    plannedItems, 
    loading, 
    addPlannedItem, 
    deletePlannedItem, 
    toggleComplete 
  } = usePlannedItems();

  const getTodayStats = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayItems = plannedItems.filter(item => item.date === today);
    const workouts = todayItems.filter(item => item.type === 'workout');
    const meals = todayItems.filter(item => item.type === 'meal');
    
    return {
      totalWorkouts: workouts.length,
      completedWorkouts: workouts.filter(w => w.completed).length,
      totalMeals: meals.length,
      completedMeals: meals.filter(m => m.completed).length,
      totalTime: workouts.reduce((total, w) => total + (w.duration || 0), 0),
      totalCalories: meals.reduce((total, m) => total + (m.calories || 0), 0)
    };
  };

  const getItemsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return plannedItems.filter(item => item.date === dateStr);
  };

  const stats = getTodayStats();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-hero text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Fitness Planner</CardTitle>
            <CardDescription className="text-white/80">
              Plan your workouts and meals for optimal results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {stats.completedWorkouts}/{stats.totalWorkouts}
                </div>
                <div className="text-sm opacity-80">Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {stats.completedMeals}/{stats.totalMeals}
                </div>
                <div className="text-sm opacity-80">Meals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalTime}m</div>
                <div className="text-sm opacity-80">Exercise Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalCalories}</div>
                <div className="text-sm opacity-80">Planned Calories</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            {/* Today's Schedule */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon size={20} className="text-primary" />
                      Today's Schedule
                    </CardTitle>
                    <CardDescription>
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </CardDescription>
                  </div>
                  <AddPlannedItemDialog onAdd={addPlannedItem}>
                    <Button size="sm">
                      <Plus size={16} className="mr-2" />
                      Add Item
                    </Button>
                  </AddPlannedItemDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getItemsForDate(new Date())
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((item) => {
                      const Icon = item.type === 'workout' ? Dumbbell : Apple;
                      
                      return (
                        <div 
                          key={item.id} 
                          className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                            item.completed 
                              ? 'bg-success/10 border-success' 
                              : 'bg-card hover:shadow-card'
                          }`}
                        >
                          <button
                            onClick={() => toggleComplete(item.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              item.completed 
                                ? 'bg-success text-white' 
                                : 'bg-muted hover:bg-accent'
                            }`}
                          >
                            {item.completed ? (
                              <CheckCircle size={16} />
                            ) : (
                              <Icon size={16} />
                            )}
                          </button>
                          
                          <div className="flex-1">
                            <div className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {item.title}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                {item.time}
                              </div>
                              {item.duration && (
                                <div>{item.duration} min</div>
                              )}
                              {item.calories && (
                                <div>{item.calories} cal</div>
                              )}
                              {item.difficulty && (
                                <Badge 
                                  variant={
                                    item.difficulty === 'easy' ? 'secondary' :
                                    item.difficulty === 'medium' ? 'default' : 'destructive'
                                  }
                                >
                                  {item.difficulty}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => deletePlannedItem(item.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {getItemsForDate(new Date()).length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No items planned for today
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-card">
                <CardContent className="p-4">
                  <AddPlannedItemDialog 
                    onAdd={(item) => addPlannedItem({ ...item, type: 'workout' })}
                  >
                    <Button className="w-full h-20 flex-col gap-2 bg-gradient-primary hover:shadow-glow transition-all">
                      <Dumbbell size={24} />
                      <span>Add Workout</span>
                    </Button>
                  </AddPlannedItemDialog>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-4">
                  <AddPlannedItemDialog 
                    onAdd={(item) => addPlannedItem({ ...item, type: 'meal' })}
                  >
                    <Button variant="outline" className="w-full h-20 flex-col gap-2">
                      <Apple size={24} />
                      <span>Plan Meal</span>
                    </Button>
                  </AddPlannedItemDialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="week" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Weekly Overview</CardTitle>
                <CardDescription>
                  Your scheduled items for this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  Weekly overview coming soon. Use the Calendar tab to view items by date.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Calendar View</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border w-full"
                  />
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>
                    {selectedDate?.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedDate && getItemsForDate(selectedDate).length > 0 ? (
                      getItemsForDate(selectedDate)
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((item) => {
                          const Icon = item.type === 'workout' ? Dumbbell : Apple;
                          
                          return (
                            <div 
                              key={item.id} 
                              className={`flex items-center gap-3 p-3 rounded-lg border ${
                                item.completed 
                                  ? 'bg-success/10 border-success' 
                                  : 'bg-card'
                              }`}
                            >
                              <Icon size={16} className="text-primary" />
                              <div className="flex-1">
                                <div className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {item.title}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {item.time} {item.duration && `• ${item.duration}m`} {item.calories && `• ${item.calories} cal`}
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => deletePlannedItem(item.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          );
                        })
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No items planned for this date
                      </div>
                    )}
                    <AddPlannedItemDialog 
                      onAdd={(item) => addPlannedItem({ 
                        ...item, 
                        date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
                      })}
                    >
                      <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all">
                        <Plus size={16} className="mr-2" />
                        Add to This Date
                      </Button>
                    </AddPlannedItemDialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Planner;