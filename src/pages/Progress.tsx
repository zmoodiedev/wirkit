import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import { 
  TrendingUp, 
  TrendingDown, 
  Weight, 
  Ruler, 
  Target,
  Calendar,
  Flame,
  Dumbbell,
  Trophy,
  Camera
} from 'lucide-react';

const Progress = () => {
  // Sample progress data
  const stats = {
    currentWeight: 165,
    startWeight: 170,
    goalWeight: 160,
    bodyFat: 12.5,
    muscle: 145,
    totalWorkouts: 48,
    streakDays: 12,
    avgCalories: 1850,
    personalRecords: 8
  };

  const weeklyProgress = [
    { week: 'Week 1', weight: 170, bodyFat: 15.2 },
    { week: 'Week 2', weight: 168, bodyFat: 14.8 },
    { week: 'Week 3', weight: 166, bodyFat: 14.1 },
    { week: 'Week 4', weight: 165, bodyFat: 12.5 },
  ];

  const exerciseProgress = [
    { exercise: 'Bench Press', current: '185 lbs', previous: '175 lbs', change: '+10' },
    { exercise: 'Squat', current: '225 lbs', previous: '215 lbs', change: '+10' },
    { exercise: 'Deadlift', current: '275 lbs', previous: '265 lbs', change: '+10' },
    { exercise: 'Pull-ups', current: '12 reps', previous: '10 reps', change: '+2' },
  ];

  const achievements = [
    { title: 'First Week Complete', date: '2 weeks ago', icon: Trophy },
    { title: '10 Workouts Done', date: '1 week ago', icon: Dumbbell },
    { title: 'Protein Goal Met', date: '3 days ago', icon: Target },
    { title: 'New PR: Bench Press', date: 'Today', icon: TrendingUp },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-hero text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Your Progress</CardTitle>
            <CardDescription className="text-white/80">
              Track your fitness journey and celebrate achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.currentWeight} lbs</div>
                <div className="text-sm opacity-80">Current Weight</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.bodyFat}%</div>
                <div className="text-sm opacity-80">Body Fat</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
                <div className="text-sm opacity-80">Total Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.streakDays}</div>
                <div className="text-sm opacity-80">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="weight" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="strength">Strength</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="achievements">Awards</TabsTrigger>
          </TabsList>

          <TabsContent value="weight" className="space-y-4">
            {/* Weight Progress */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Weight size={20} className="text-primary" />
                    Weight Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Start Weight</span>
                      <span className="font-medium">{stats.startWeight} lbs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Weight</span>
                      <span className="font-medium text-primary">{stats.currentWeight} lbs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Goal Weight</span>
                      <span className="font-medium">{stats.goalWeight} lbs</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="text-success" size={16} />
                        <span className="text-success font-medium">
                          -{stats.startWeight - stats.currentWeight} lbs lost
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {stats.goalWeight - stats.currentWeight} lbs to goal
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Weekly Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weeklyProgress.map((week, index) => (
                      <div key={week.week} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium">{week.week}</div>
                          <div className="text-sm text-muted-foreground">
                            BF: {week.bodyFat}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{week.weight} lbs</div>
                          {index > 0 && (
                            <div className="text-xs text-success flex items-center gap-1">
                              <TrendingDown size={12} />
                              -{weeklyProgress[index - 1].weight - week.weight} lbs
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="strength" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell size={20} className="text-primary" />
                  Strength Progress
                </CardTitle>
                <CardDescription>
                  Personal records and exercise improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exerciseProgress.map((exercise) => (
                    <div key={exercise.exercise} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">{exercise.exercise}</div>
                        <div className="text-sm text-muted-foreground">
                          Previous: {exercise.previous}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{exercise.current}</div>
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          {exercise.change}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-gradient-primary hover:shadow-glow transition-all">
                  <TrendingUp size={16} className="mr-2" />
                  Log New PR
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="body" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler size={20} className="text-primary" />
                    Body Measurements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Chest</span>
                      <span className="font-medium">42.5"</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Waist</span>
                      <span className="font-medium">32"</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Arms</span>
                      <span className="font-medium">15.5"</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Thighs</span>
                      <span className="font-medium">24"</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Ruler size={16} className="mr-2" />
                    Update Measurements
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Progress Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <Camera size={24} className="text-muted-foreground" />
                    </div>
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <Camera size={24} className="text-muted-foreground" />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Camera size={16} className="mr-2" />
                    Add Photo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy size={20} className="text-primary" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon size={20} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{achievement.title}</div>
                          <div className="text-sm text-muted-foreground">{achievement.date}</div>
                        </div>
                        <Badge variant="secondary">+10 XP</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="text-center shadow-card">
                <CardContent className="p-4">
                  <Trophy className="mx-auto mb-2 text-yellow-500" size={24} />
                  <div className="text-2xl font-bold">{stats.personalRecords}</div>
                  <div className="text-xs text-muted-foreground">Personal Records</div>
                </CardContent>
              </Card>
              
              <Card className="text-center shadow-card">
                <CardContent className="p-4">
                  <Calendar className="mx-auto mb-2 text-primary" size={24} />
                  <div className="text-2xl font-bold">{stats.streakDays}</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </CardContent>
              </Card>
              
              <Card className="text-center shadow-card">
                <CardContent className="p-4">
                  <Flame className="mx-auto mb-2 text-orange-500" size={24} />
                  <div className="text-2xl font-bold">{stats.avgCalories}</div>
                  <div className="text-xs text-muted-foreground">Avg Calories</div>
                </CardContent>
              </Card>
              
              <Card className="text-center shadow-card">
                <CardContent className="p-4">
                  <Dumbbell className="mx-auto mb-2 text-primary" size={24} />
                  <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
                  <div className="text-xs text-muted-foreground">Total Workouts</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Progress;