import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Flame, 
  Dumbbell, 
  Apple,
  Calendar,
  MessageCircle,
  ChefHat,
  Play
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFitnessData } from '@/hooks/useFitnessData';
import { useWorkouts } from '@/hooks/useWorkouts';
import { usePlannedItems } from '@/hooks/usePlannedItems';

const Dashboard = () => {
  const { userGoals, dailyStats, profile, loading, foodEntries } = useFitnessData();
  const { allWorkouts } = useWorkouts();
  const { plannedItems } = usePlannedItems();

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  const displayName = profile?.display_name || "";

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-hero rounded-2xl p-6 text-white">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            Welcome back, {displayName} 💪
          </h1>
          <p className="opacity-90">
            {dailyStats?.calories_consumed ? 
              "You're making great progress today!" : 
              "Ready to start your fitness journey today?"
            }
          </p>
        </div>

        {/* Today's Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4 text-center">
              <Flame className="mx-auto mb-2 text-orange-500" size={24} />
              <div className="text-2xl font-bold text-foreground">
                {dailyStats?.calories_consumed || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                of {userGoals?.daily_calories || 2000} cal
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4 text-center">
              <Clock className="mx-auto mb-2 text-primary" size={24} />
              <div className="text-2xl font-bold text-foreground">
                {dailyStats?.workout_minutes || 0}m
              </div>
              <div className="text-xs text-muted-foreground">
                of {userGoals?.daily_workout_minutes || 60}m
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4 text-center">
              <Target className="mx-auto mb-2 text-blue-500" size={24} />
              <div className="text-2xl font-bold text-foreground">
                {dailyStats?.water_intake || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                of {userGoals?.daily_water || 8} glasses
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4 text-center">
              <TrendingUp className="mx-auto mb-2 text-success" size={24} />
              <div className="text-2xl font-bold text-foreground">
                0
              </div>
              <div className="text-xs text-muted-foreground">
                of {userGoals?.weekly_workouts || 5} workouts
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Progress */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame size={20} className="text-orange-500" />
                Calorie Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Consumed</span>
                  <span>{dailyStats?.calories_consumed || 0}/{userGoals?.daily_calories || 2000} cal</span>
                </div>
                <Progress 
                  value={((dailyStats?.calories_consumed || 0) / (userGoals?.daily_calories || 2000)) * 100} 
                  className="h-3" 
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="font-medium text-blue-600">{dailyStats?.protein_consumed || 0}g</div>
                  <div className="text-muted-foreground">Protein</div>
                </div>
                <div>
                  <div className="font-medium text-orange-600">{dailyStats?.carbs_consumed || 0}g</div>
                  <div className="text-muted-foreground">Carbs</div>
                </div>
                <div>
                  <div className="font-medium text-purple-600">{dailyStats?.fat_consumed || 0}g</div>
                  <div className="text-muted-foreground">Fat</div>
                </div>
              </div>
              <Button asChild className="w-full" variant="outline">
                <Link to="/diet">
                  <Apple size={16} className="mr-2" />
                  Log Meal
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} className="text-primary" />
                Workout Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Time Active</span>
                  <span>{dailyStats?.workout_minutes || 0}/{userGoals?.daily_workout_minutes || 60} min</span>
                </div>
                <Progress 
                  value={((dailyStats?.workout_minutes || 0) / (userGoals?.daily_workout_minutes || 60)) * 100} 
                  className="h-3" 
                />
              </div>
              <Button asChild className="w-full bg-gradient-primary hover:shadow-glow transition-all">
                <Link to="/workout">
                  <Dumbbell size={16} className="mr-2" />
                  Start Workout
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Workouts */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Dumbbell size={20} className="text-primary" />
                Recent Workouts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {allWorkouts.slice(0, 3).map((workout) => (
                <div key={workout.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Play size={16} className="text-primary" />
                    <div>
                      <div className="font-medium text-sm">{workout.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {workout.date === new Date().toISOString().split('T')[0] ? 'Today' : 
                         workout.date === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? 'Yesterday' : 
                         workout.date}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">{workout.duration_minutes}m</Badge>
                </div>
              ))}
              {allWorkouts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent workouts. Start your first workout today!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Today's Meals */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ChefHat size={20} className="text-orange-500" />
                Today's Meals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {foodEntries
                .filter(entry => entry.date === new Date().toISOString().split('T')[0])
                .slice(0, 4)
                .map((meal) => (
                <div key={meal.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Apple size={16} className="text-orange-500" />
                    <div>
                      <div className="font-medium text-sm">{meal.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{meal.meal_type}</div>
                    </div>
                  </div>
                  <Badge variant="secondary">{meal.calories} cal</Badge>
                </div>
              ))}
              {foodEntries.filter(entry => entry.date === new Date().toISOString().split('T')[0]).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No meals logged yet today. Log your first meal!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Today's Plan */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar size={20} className="text-blue-500" />
                Today's Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {plannedItems
                .filter(item => item.date === new Date().toISOString().split('T')[0])
                .slice(0, 3)
                .map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {item.type === 'workout' ? 
                      <Dumbbell size={16} className="text-primary" /> : 
                      <ChefHat size={16} className="text-orange-500" />
                    }
                    <div>
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.time}</div>
                    </div>
                  </div>
                  {item.completed && <Badge variant="secondary">Done</Badge>}
                </div>
              ))}
              {plannedItems.filter(item => item.date === new Date().toISOString().split('T')[0]).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No plans for today. Create your schedule in the Planner!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              What would you like to do today?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link to="/planner">
                  <Calendar size={24} />
                  <span>Plan Today</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link to="/progress">
                  <TrendingUp size={24} />
                  <span>View Progress</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-20 flex-col gap-2 col-span-2 lg:col-span-1">
                <Link to="/chat">
                  <MessageCircle size={24} />
                  <span>Ask AI Coach</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;