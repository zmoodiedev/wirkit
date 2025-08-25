import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import { AddProgressDialog } from '@/components/AddProgressDialog';
import { AddRecordDialog } from '@/components/AddRecordDialog';
import { useProgress } from '@/hooks/useProgress';
import { useFitnessData } from '@/hooks/useFitnessData';
import { format } from 'date-fns';
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
  Camera,
  Loader2,
  Plus
} from 'lucide-react';

const Progress = () => {
  const { 
    progressEntries, 
    exerciseRecords, 
    achievements, 
    loading: progressLoading,
    addProgressEntry,
    addExerciseRecord,
    getLatestEntry,
    getWeightProgress,
    getExerciseProgress
  } = useProgress();
  
  const { userGoals, dailyStats, profile } = useFitnessData();
  
  if (progressLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  const latestEntry = getLatestEntry();
  const weightProgress = getWeightProgress();
  const exerciseProgress = getExerciseProgress();
  
  // Calculate stats from actual data
  const stats = {
    currentWeight: latestEntry?.weight || 0,
    startWeight: weightProgress.length > 0 ? weightProgress[0].weight : 0,
    goalWeight: 160, // Default goal weight
    bodyFat: latestEntry?.body_fat_percentage || 0,
    totalWorkouts: exerciseRecords.length,
    streakDays: 0, // TODO: Calculate streak from daily stats
    avgCalories: dailyStats?.calories_consumed || 0,
    personalRecords: exerciseRecords.length
  };

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
                <div className="text-2xl font-bold">{stats.currentWeight || 0} lbs</div>
                <div className="text-sm opacity-80">Current Weight</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.bodyFat || 0}%</div>
                <div className="text-sm opacity-80">Body Fat</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
                <div className="text-sm opacity-80">Exercise Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.personalRecords}</div>
                <div className="text-sm opacity-80">Personal Records</div>
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Weight size={20} className="text-primary" />
                      Weight Progress
                    </CardTitle>
                    <AddProgressDialog onAdd={addProgressEntry}>
                      <Button size="sm" variant="outline">
                        <Plus size={16} className="mr-2" />
                        Add Entry
                      </Button>
                    </AddProgressDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {latestEntry ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Start Weight</span>
                          <span className="font-medium">{stats.startWeight || 'N/A'} lbs</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Current Weight</span>
                          <span className="font-medium text-primary">{stats.currentWeight || 'N/A'} lbs</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Goal Weight</span>
                          <span className="font-medium">{stats.goalWeight} lbs</span>
                        </div>
                        {stats.currentWeight && stats.startWeight && (
                          <div className="pt-2 border-t">
                            <div className="flex items-center gap-2">
                              {stats.currentWeight < stats.startWeight ? (
                                <>
                                  <TrendingDown className="text-success" size={16} />
                                  <span className="text-success font-medium">
                                    -{(stats.startWeight - stats.currentWeight).toFixed(1)} lbs lost
                                  </span>
                                </>
                              ) : (
                                <>
                                  <TrendingUp className="text-primary" size={16} />
                                  <span className="text-primary font-medium">
                                    +{(stats.currentWeight - stats.startWeight).toFixed(1)} lbs gained
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {Math.abs(stats.goalWeight - stats.currentWeight).toFixed(1)} lbs to goal
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        No progress data yet. Add your first entry to start tracking!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Weekly Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weightProgress.length > 0 ? (
                      weightProgress.slice(0, 8).map((entry, index) => (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <div className="font-medium">{format(new Date(entry.date), 'MMM dd')}</div>
                            <div className="text-sm text-muted-foreground">
                              {entry.body_fat_percentage && `BF: ${entry.body_fat_percentage}%`}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{entry.weight} lbs</div>
                            {index < weightProgress.length - 1 && weightProgress[index + 1]?.weight && (
                              <div className={`text-xs flex items-center gap-1 ${
                                entry.weight < weightProgress[index + 1].weight 
                                  ? 'text-success' 
                                  : 'text-primary'
                              }`}>
                                {entry.weight < weightProgress[index + 1].weight ? (
                                  <TrendingDown size={12} />
                                ) : (
                                  <TrendingUp size={12} />
                                )}
                                {Math.abs(entry.weight - weightProgress[index + 1].weight).toFixed(1)} lbs
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No weight progress recorded yet
                      </div>
                    )}
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
                  {exerciseProgress.length > 0 ? (
                    exerciseProgress.map((exercise) => (
                      <div key={exercise.exercise} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium">{exercise.exercise}</div>
                          <div className="text-sm text-muted-foreground">
                            {exercise.previous ? `Previous: ${exercise.previous}` : 'First record'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">{exercise.current}</div>
                          {exercise.change && (
                            <Badge variant="secondary" className="bg-success/10 text-success">
                              {exercise.change}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No exercise records yet. Log your first PR!
                    </div>
                  )}
                </div>
                <AddRecordDialog onAdd={addExerciseRecord}>
                  <Button className="w-full mt-4 bg-gradient-primary hover:shadow-glow transition-all">
                    <TrendingUp size={16} className="mr-2" />
                    Log New PR
                  </Button>
                </AddRecordDialog>
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
                    {latestEntry ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Chest</span>
                          <span className="font-medium">{latestEntry.chest_measurement || 'Not recorded'}"</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Waist</span>
                          <span className="font-medium">{latestEntry.waist_measurement || 'Not recorded'}"</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Arms</span>
                          <span className="font-medium">{latestEntry.arm_measurement || 'Not recorded'}"</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Thighs</span>
                          <span className="font-medium">{latestEntry.thigh_measurement || 'Not recorded'}"</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        No measurements recorded yet
                      </div>
                    )}
                  </div>
                  <AddProgressDialog onAdd={addProgressEntry}>
                    <Button variant="outline" className="w-full mt-4">
                      <Ruler size={16} className="mr-2" />
                      Update Measurements
                    </Button>
                  </AddProgressDialog>
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
                  {achievements.length > 0 ? (
                    achievements.slice(0, 5).map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Trophy size={20} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{achievement.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(achievement.achieved_at), 'MMM dd, yyyy')}
                          </div>
                        </div>
                        <Badge variant="secondary">+{achievement.points} XP</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No achievements yet. Keep working towards your goals!
                    </div>
                  )}
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
                  <div className="text-xs text-muted-foreground">Recent Calories</div>
                </CardContent>
              </Card>
              
              <Card className="text-center shadow-card">
                <CardContent className="p-4">
                  <Dumbbell className="mx-auto mb-2 text-primary" size={24} />
                  <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
                  <div className="text-xs text-muted-foreground">Exercise Records</div>
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