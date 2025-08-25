import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

interface Exercise {
  id: string;
  name: string;
  sets: Array<{
    reps: number;
    weight?: number;
    completed: boolean;
  }>;
  restTime: number;
  category: string;
}

const Workout = () => {
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(0);
  
  // Sample workout data
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: '1',
      name: 'Bench Press',
      sets: [
        { reps: 10, weight: 135, completed: false },
        { reps: 8, weight: 155, completed: false },
        { reps: 6, weight: 175, completed: false }
      ],
      restTime: 120,
      category: 'Chest'
    },
    {
      id: '2',
      name: 'Squats',
      sets: [
        { reps: 12, weight: 185, completed: false },
        { reps: 10, weight: 205, completed: false },
        { reps: 8, weight: 225, completed: false }
      ],
      restTime: 180,
      category: 'Legs'
    },
    {
      id: '3',
      name: 'Pull-ups',
      sets: [
        { reps: 8, completed: false },
        { reps: 6, completed: false },
        { reps: 4, completed: false }
      ],
      restTime: 90,
      category: 'Back'
    }
  ]);

  const toggleSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex].completed = 
      !newExercises[exerciseIndex].sets[setIndex].completed;
    setExercises(newExercises);
  };

  const getCompletedSets = () => {
    return exercises.reduce((total, exercise) => 
      total + exercise.sets.filter(set => set.completed).length, 0
    );
  };

  const getTotalSets = () => {
    return exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Workout Header */}
        <Card className="bg-gradient-hero text-white border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Push Day Workout</CardTitle>
                <CardDescription className="text-white/80">
                  Chest, Shoulders & Triceps
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
                <div className="text-2xl font-bold">{exercises.length}</div>
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
          {exercises.map((exercise, exerciseIndex) => (
            <Card key={exercise.id} className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{exercise.category}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Timer size={14} />
                        {exercise.restTime}s rest
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exercise.sets.map((set, setIndex) => (
                    <div 
                      key={setIndex}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        set.completed 
                          ? 'bg-success/10 border-success text-success-foreground' 
                          : 'bg-muted/50 border-border hover:border-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant={set.completed ? "default" : "outline"}
                          onClick={() => toggleSet(exerciseIndex, setIndex)}
                          className={set.completed ? "bg-success hover:bg-success/90" : ""}
                        >
                          {set.completed ? <Check size={16} /> : setIndex + 1}
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
                        {set.weight && (
                          <div className="flex items-center gap-1">
                            <Weight size={14} className="text-muted-foreground" />
                            <Input
                              type="number"
                              value={set.weight}
                              className="w-16 h-8 text-center"
                              onChange={(e) => {
                                const newExercises = [...exercises];
                                newExercises[exerciseIndex].sets[setIndex].weight = 
                                  parseInt(e.target.value) || 0;
                                setExercises(newExercises);
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