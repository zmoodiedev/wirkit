import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import Layout from '@/components/Layout';
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
  AlertCircle
} from 'lucide-react';

interface PlannedItem {
  id: string;
  title: string;
  type: 'workout' | 'meal';
  time: string;
  duration?: number;
  calories?: number;
  completed: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const Planner = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Sample planned items
  const [plannedItems, setPlannedItems] = useState<PlannedItem[]>([
    {
      id: '1',
      title: 'Morning Cardio',
      type: 'workout',
      time: '07:00',
      duration: 30,
      completed: true,
      difficulty: 'medium'
    },
    {
      id: '2',
      title: 'Protein Smoothie',
      type: 'meal',
      time: '08:00',
      calories: 320,
      completed: true
    },
    {
      id: '3',
      title: 'Push Day Workout',
      type: 'workout',
      time: '17:00',
      duration: 60,
      completed: false,
      difficulty: 'hard'
    },
    {
      id: '4',
      title: 'Grilled Salmon Dinner',
      type: 'meal',
      time: '19:00',
      calories: 450,
      completed: false
    },
    {
      id: '5',
      title: 'Evening Yoga',
      type: 'workout',
      time: '21:00',
      duration: 20,
      completed: false,
      difficulty: 'easy'
    }
  ]);

  const weekPlan = [
    { day: 'Mon', workouts: 2, meals: 4, completed: true },
    { day: 'Tue', workouts: 1, meals: 4, completed: true },
    { day: 'Wed', workouts: 2, meals: 3, completed: false },
    { day: 'Thu', workouts: 1, meals: 4, completed: false },
    { day: 'Fri', workouts: 2, meals: 4, completed: false },
    { day: 'Sat', workouts: 1, meals: 3, completed: false },
    { day: 'Sun', workouts: 0, meals: 3, completed: false }
  ];

  const toggleComplete = (id: string) => {
    setPlannedItems(items =>
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const getTodayStats = () => {
    const workouts = plannedItems.filter(item => item.type === 'workout');
    const meals = plannedItems.filter(item => item.type === 'meal');
    
    return {
      totalWorkouts: workouts.length,
      completedWorkouts: workouts.filter(w => w.completed).length,
      totalMeals: meals.length,
      completedMeals: meals.filter(m => m.completed).length,
      totalTime: workouts.reduce((total, w) => total + (w.duration || 0), 0),
      totalCalories: meals.reduce((total, m) => total + (m.calories || 0), 0)
    };
  };

  const stats = getTodayStats();

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
                  <Button size="sm">
                    <Plus size={16} className="mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plannedItems
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
                            <Button size="sm" variant="ghost">
                              <Edit3 size={14} />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-card">
                <CardContent className="p-4">
                  <Button className="w-full h-20 flex-col gap-2 bg-gradient-primary hover:shadow-glow transition-all">
                    <Dumbbell size={24} />
                    <span>Add Workout</span>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-4">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Apple size={24} />
                    <span>Plan Meal</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="week" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Weekly Overview</CardTitle>
                <CardDescription>
                  Your fitness plan for this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weekPlan.map((day) => (
                    <div 
                      key={day.day} 
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-medium w-12">{day.day}</div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Dumbbell size={14} />
                            {day.workouts} workouts
                          </div>
                          <div className="flex items-center gap-1">
                            <Apple size={14} />
                            {day.meals} meals
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {day.completed ? (
                          <Badge className="bg-success">
                            <CheckCircle size={12} className="mr-1" />
                            Complete
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <AlertCircle size={12} className="mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full mt-4 bg-gradient-primary hover:shadow-glow transition-all">
                  <Target size={16} className="mr-2" />
                  Generate Weekly Plan
                </Button>
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
                    <div className="text-center text-muted-foreground py-8">
                      No items planned for this date
                    </div>
                    <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all">
                      <Plus size={16} className="mr-2" />
                      Add to This Date
                    </Button>
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