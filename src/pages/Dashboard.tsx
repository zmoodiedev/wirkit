import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Layout from '@/components/Layout';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Flame, 
  Dumbbell, 
  Apple,
  Calendar,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Sample data - replace with real data from your state management
  const todayStats = {
    caloriesConsumed: 1450,
    caloriesGoal: 2000,
    workoutTime: 45,
    workoutGoal: 60,
    waterIntake: 6,
    waterGoal: 8
  };

  const weekProgress = {
    workoutsCompleted: 4,
    workoutsPlanned: 6
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-hero rounded-2xl p-6 text-white">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            Welcome back, Alex! 💪
          </h1>
          <p className="opacity-90">
            You're doing great! Let's keep the momentum going.
          </p>
        </div>

        {/* Today's Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4 text-center">
              <Flame className="mx-auto mb-2 text-orange-500" size={24} />
              <div className="text-2xl font-bold text-foreground">
                {todayStats.caloriesConsumed}
              </div>
              <div className="text-xs text-muted-foreground">
                of {todayStats.caloriesGoal} cal
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4 text-center">
              <Clock className="mx-auto mb-2 text-primary" size={24} />
              <div className="text-2xl font-bold text-foreground">
                {todayStats.workoutTime}m
              </div>
              <div className="text-xs text-muted-foreground">
                of {todayStats.workoutGoal}m
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4 text-center">
              <Target className="mx-auto mb-2 text-blue-500" size={24} />
              <div className="text-2xl font-bold text-foreground">
                {todayStats.waterIntake}
              </div>
              <div className="text-xs text-muted-foreground">
                of {todayStats.waterGoal} glasses
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4 text-center">
              <TrendingUp className="mx-auto mb-2 text-success" size={24} />
              <div className="text-2xl font-bold text-foreground">
                {weekProgress.workoutsCompleted}
              </div>
              <div className="text-xs text-muted-foreground">
                of {weekProgress.workoutsPlanned} workouts
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
                  <span>{todayStats.caloriesConsumed}/{todayStats.caloriesGoal} cal</span>
                </div>
                <Progress 
                  value={(todayStats.caloriesConsumed / todayStats.caloriesGoal) * 100} 
                  className="h-3" 
                />
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
                  <span>{todayStats.workoutTime}/{todayStats.workoutGoal} min</span>
                </div>
                <Progress 
                  value={(todayStats.workoutTime / todayStats.workoutGoal) * 100} 
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