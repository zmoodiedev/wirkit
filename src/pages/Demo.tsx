import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Flame, 
  Dumbbell, 
  Apple,
  Calendar,
  MessageCircle,
  User,
  BarChart3,
  ChefHat,
  Play,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Demo = () => {
  // Sample demo data
  const demoData = {
    user: {
      name: "Alex Johnson",
      goals: {
        daily_calories: 2200,
        daily_workout_minutes: 60,
        daily_water: 8,
        weekly_workouts: 5
      },
      dailyStats: {
        calories_consumed: 1450,
        workout_minutes: 35,
        water_intake: 5,
        protein_consumed: 85,
        carbs_consumed: 180,
        fat_consumed: 45
      },
      weeklyWorkouts: 3
    },
    recentWorkouts: [
      { name: "Upper Body Strength", duration: 45, date: "Today" },
      { name: "HIIT Cardio", duration: 30, date: "Yesterday" },
      { name: "Leg Day", duration: 60, date: "2 days ago" }
    ],
    recentMeals: [
      { name: "Greek Yogurt Bowl", calories: 320, type: "breakfast" },
      { name: "Chicken Salad", calories: 450, type: "lunch" },
      { name: "Protein Smoothie", calories: 280, type: "snack" },
      { name: "Grilled Salmon", calories: 400, type: "dinner" }
    ],
    plannedItems: [
      { title: "Morning Run", time: "7:00 AM", type: "workout" },
      { title: "Meal Prep", time: "2:00 PM", type: "meal" },
      { title: "Evening Yoga", time: "7:00 PM", type: "workout" }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Header */}
      <div className="bg-gradient-hero text-white p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              WirkIt Demo Experience
            </h1>
            <p className="opacity-90">
              This is what your dashboard would look like with an account
            </p>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Demo Mode
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          {/* Demo Notice */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-primary" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium">Demo Preview</p>
                  <p className="text-xs text-muted-foreground">
                    This shows sample data to demonstrate the app's features. 
                    <Link to="/login" className="text-primary hover:underline ml-1">
                      Sign in to access your real dashboard
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Welcome Section */}
          <div className="bg-gradient-hero rounded-2xl p-6 text-white">
            <h2 className="text-2xl lg:text-3xl font-bold mb-2">
              Welcome back, {demoData.user.name} 💪
            </h2>
            <p className="opacity-90">
              You're making great progress today!
            </p>
          </div>

          {/* Today's Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-4 text-center">
                <Flame className="mx-auto mb-2 text-orange-500" size={24} />
                <div className="text-2xl font-bold text-foreground">
                  {demoData.user.dailyStats.calories_consumed}
                </div>
                <div className="text-xs text-muted-foreground">
                  of {demoData.user.goals.daily_calories} cal
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-4 text-center">
                <Clock className="mx-auto mb-2 text-primary" size={24} />
                <div className="text-2xl font-bold text-foreground">
                  {demoData.user.dailyStats.workout_minutes}m
                </div>
                <div className="text-xs text-muted-foreground">
                  of {demoData.user.goals.daily_workout_minutes}m
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-4 text-center">
                <Target className="mx-auto mb-2 text-blue-500" size={24} />
                <div className="text-2xl font-bold text-foreground">
                  {demoData.user.dailyStats.water_intake}
                </div>
                <div className="text-xs text-muted-foreground">
                  of {demoData.user.goals.daily_water} glasses
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-4 text-center">
                <TrendingUp className="mx-auto mb-2 text-success" size={24} />
                <div className="text-2xl font-bold text-foreground">
                  {demoData.user.weeklyWorkouts}
                </div>
                <div className="text-xs text-muted-foreground">
                  of {demoData.user.goals.weekly_workouts} workouts
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
                    <span>{demoData.user.dailyStats.calories_consumed}/{demoData.user.goals.daily_calories} cal</span>
                  </div>
                  <Progress 
                    value={(demoData.user.dailyStats.calories_consumed / demoData.user.goals.daily_calories) * 100} 
                    className="h-3" 
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="font-medium text-blue-600">{demoData.user.dailyStats.protein_consumed}g</div>
                    <div className="text-muted-foreground">Protein</div>
                  </div>
                  <div>
                    <div className="font-medium text-orange-600">{demoData.user.dailyStats.carbs_consumed}g</div>
                    <div className="text-muted-foreground">Carbs</div>
                  </div>
                  <div>
                    <div className="font-medium text-purple-600">{demoData.user.dailyStats.fat_consumed}g</div>
                    <div className="text-muted-foreground">Fat</div>
                  </div>
                </div>
                <Button disabled className="w-full" variant="outline">
                  <Apple size={16} className="mr-2" />
                  Log Meal (Demo Mode)
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
                    <span>{demoData.user.dailyStats.workout_minutes}/{demoData.user.goals.daily_workout_minutes} min</span>
                  </div>
                  <Progress 
                    value={(demoData.user.dailyStats.workout_minutes / demoData.user.goals.daily_workout_minutes) * 100} 
                    className="h-3" 
                  />
                </div>
                <Button disabled className="w-full bg-gradient-primary">
                  <Dumbbell size={16} className="mr-2" />
                  Start Workout (Demo Mode)
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
                {demoData.recentWorkouts.map((workout, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Play size={16} className="text-primary" />
                      <div>
                        <div className="font-medium text-sm">{workout.name}</div>
                        <div className="text-xs text-muted-foreground">{workout.date}</div>
                      </div>
                    </div>
                    <Badge variant="secondary">{workout.duration}m</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Meals */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ChefHat size={20} className="text-orange-500" />
                  Today's Meals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {demoData.recentMeals.map((meal, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Apple size={16} className="text-orange-500" />
                      <div>
                        <div className="font-medium text-sm">{meal.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{meal.type}</div>
                      </div>
                    </div>
                    <Badge variant="secondary">{meal.calories} cal</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Planned Items */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar size={20} className="text-blue-500" />
                  Today's Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {demoData.plannedItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
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
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Explore Features</CardTitle>
              <CardDescription>
                See what you can do with a WirkIt account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Button disabled variant="outline" className="h-20 flex-col gap-2">
                  <Calendar size={24} />
                  <span>Plan Workouts</span>
                </Button>
                
                <Button disabled variant="outline" className="h-20 flex-col gap-2">
                  <BarChart3 size={24} />
                  <span>Track Progress</span>
                </Button>
                
                <Button disabled variant="outline" className="h-20 flex-col gap-2">
                  <MessageCircle size={24} />
                  <span>AI Coach</span>
                </Button>

                <Button disabled variant="outline" className="h-20 flex-col gap-2">
                  <User size={24} />
                  <span>Profile & Goals</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-gradient-hero text-white shadow-elevated">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
              <p className="text-lg opacity-90 mb-6">
                Join thousands of users tracking their fitness with WirkIt
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/login">
                    Sign In to Get Started
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                  <Link to="/">
                    Learn More
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Demo;