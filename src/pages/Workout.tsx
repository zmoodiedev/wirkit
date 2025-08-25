import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import Layout from '@/components/Layout';
import { 
  Plus, 
  Play, 
  Pause, 
  Timer, 
  Weight, 
  RotateCcw, 
  Check,
  TrendingUp
} from 'lucide-react';
import { useWorkouts } from '@/hooks/useWorkouts';


const Workout = () => {
  const { 
    currentWorkout,
    isWorkoutActive,
    setIsWorkoutActive,
    workoutTimer,
    loading,
    createSampleWorkout,
    toggleSet,
    updateSetWeight,
    getCompletedSets,
    getTotalSets
  } = useWorkouts();

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentWorkout) {
    return (
      <Layout>
        <div className="space-y-6">
          <Card className="text-center p-8">
            <CardHeader>
              <CardTitle>No Workout Planned</CardTitle>
              <CardDescription>
                Start your fitness journey by creating your first workout!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={createSampleWorkout} className="bg-gradient-primary hover:shadow-glow transition-all">
                <Plus size={16} className="mr-2" />
                Create Sample Workout
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Workout Header */}
        <Card className="bg-gradient-hero text-white border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
            <CardTitle className="text-2xl">{currentWorkout.name}</CardTitle>
            <CardDescription className="text-white/80">
              {currentWorkout.description || 'Your workout for today'}
            </CardDescription>
              </div>
              <Button
                onClick={() => setIsWorkoutActive(!isWorkoutActive)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {isWorkoutActive ? (
                  <>
                    <Pause size={16} className="mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={16} className="mr-2" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">
                  {Math.floor(workoutTimer / 60)}:{(workoutTimer % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm opacity-80">Duration</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{getCompletedSets()}/{getTotalSets()}</div>
                <div className="text-sm opacity-80">Sets Complete</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{currentWorkout.exercises.length}</div>
                <div className="text-sm opacity-80">Exercises</div>
              </div>
            </div>
            <Progress 
              value={(getCompletedSets() / getTotalSets()) * 100} 
              className="mt-4 bg-white/20"
            />
          </CardContent>
        </Card>

        {/* Exercise List */}
        <div className="space-y-4">
          {currentWorkout.exercises.map((exercise) => (
            <Card key={exercise.id} className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{exercise.category}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Timer size={14} />
                        {exercise.rest_time}s rest
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exercise.sets.map((set, setIndex) => (
                    <div 
                      key={set.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        set.is_completed 
                          ? 'bg-success/10 border-success text-success-foreground' 
                          : 'bg-muted/50 border-border hover:border-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant={set.is_completed ? "default" : "outline"}
                          onClick={() => toggleSet(exercise.id, set.id)}
                          className={set.is_completed ? "bg-success hover:bg-success/90" : ""}
                        >
                          {set.is_completed ? <Check size={16} /> : setIndex + 1}
                        </Button>
                        <div className="text-sm">
                          <span className="font-medium">{set.reps} reps</span>
                          {set.weight && (
                            <span className="text-muted-foreground ml-2">
                              @ {set.weight} lbs
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {set.weight !== undefined && (
                          <div className="flex items-center gap-1">
                            <Weight size={14} className="text-muted-foreground" />
                            <Input
                              type="number"
                              value={set.weight || ''}
                              className="w-16 h-8 text-center"
                              onChange={(e) => {
                                const weight = parseFloat(e.target.value) || 0;
                                updateSetWeight(exercise.id, set.id, weight);
                              }}
                            />
                          </div>
                        )}
                        <Button size="sm" variant="ghost">
                          <RotateCcw size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Exercise Button */}
        <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all">
          <Plus size={16} className="mr-2" />
          Add Exercise
        </Button>

        {/* Complete Workout */}
        {getCompletedSets() === getTotalSets() && (
          <Card className="bg-gradient-success text-white border-0 shadow-elevated">
            <CardContent className="p-6 text-center">
              <TrendingUp size={48} className="mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Workout Complete! 🎉</h3>
              <p className="opacity-90 mb-4">
                Great job! You've completed all sets. Time to rest and recover.
              </p>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                Save & Finish Workout
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Workout;