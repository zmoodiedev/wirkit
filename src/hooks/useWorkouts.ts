import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ExerciseSet {
  id: string;
  reps: number;
  weight?: number;
  is_completed: boolean;
  set_order: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  rest_time: number;
  sets: ExerciseSet[];
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  date: string;
  duration_minutes: number;
  is_completed: boolean;
  exercises: Exercise[];
}

export const useWorkouts = () => {
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);

  const fetchTodayWorkout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's workout
      const { data: workoutData } = await supabase
        .from('workouts')
        .select(`
          *,
          exercises (
            *,
            exercise_sets (*)
          )
        `)
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (workoutData) {
        // Transform the data to match our interface
        const workout: Workout = {
          ...workoutData,
          exercises: workoutData.exercises ? workoutData.exercises.map((exercise: any) => ({
            ...exercise,
            sets: exercise.exercise_sets ? exercise.exercise_sets.sort((a: any, b: any) => a.set_order - b.set_order) : []
          })) : []
        };
        setCurrentWorkout(workout);
      } else {
        setCurrentWorkout(null);
      }
    } catch (error) {
      console.error('Error fetching workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSampleWorkout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Create a new workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: 'Push Day Workout',
          description: 'Chest, Shoulders & Triceps',
          date: today
        })
        .select()
        .single();

      if (workoutError || !workout) {
        console.error('Error creating workout:', workoutError);
        return;
      }

      // Sample exercises data
      const exercisesData = [
        {
          name: 'Bench Press',
          category: 'Chest',
          rest_time: 120,
          sets: [
            { reps: 10, weight: 135, set_order: 1 },
            { reps: 8, weight: 155, set_order: 2 },
            { reps: 6, weight: 175, set_order: 3 }
          ]
        },
        {
          name: 'Squats',
          category: 'Legs',
          rest_time: 180,
          sets: [
            { reps: 12, weight: 185, set_order: 1 },
            { reps: 10, weight: 205, set_order: 2 },
            { reps: 8, weight: 225, set_order: 3 }
          ]
        },
        {
          name: 'Pull-ups',
          category: 'Back',
          rest_time: 90,
          sets: [
            { reps: 8, set_order: 1 },
            { reps: 6, set_order: 2 },
            { reps: 4, set_order: 3 }
          ]
        }
      ];

      // Create exercises and their sets
      for (const exerciseData of exercisesData) {
        const { data: exercise, error: exerciseError } = await supabase
          .from('exercises')
          .insert({
            workout_id: workout.id,
            name: exerciseData.name,
            category: exerciseData.category,
            rest_time: exerciseData.rest_time
          })
          .select()
          .single();

        if (exerciseError || !exercise) {
          console.error('Error creating exercise:', exerciseError);
          continue;
        }

        // Create sets for this exercise
        const setsToInsert = exerciseData.sets.map(set => ({
          exercise_id: exercise.id,
          reps: set.reps,
          weight: set.weight,
          set_order: set.set_order,
          is_completed: false
        }));

        const { error: setsError } = await supabase
          .from('exercise_sets')
          .insert(setsToInsert);

        if (setsError) {
          console.error('Error creating sets:', setsError);
        }
      }

      // Fetch the complete workout with exercises and sets
      await fetchTodayWorkout();
    } catch (error) {
      console.error('Error creating sample workout:', error);
    }
  };

  const toggleSet = async (exerciseId: string, setId: string) => {
    if (!currentWorkout) return;

    try {
      // Find the current set
      const exercise = currentWorkout.exercises.find(e => e.id === exerciseId);
      const set = exercise?.sets.find(s => s.id === setId);
      
      if (!set) return;

      // Toggle the completion status
      const { error } = await supabase
        .from('exercise_sets')
        .update({ is_completed: !set.is_completed })
        .eq('id', setId);

      if (!error) {
        // Update local state
        setCurrentWorkout(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            exercises: prev.exercises.map(exercise => 
              exercise.id === exerciseId
                ? {
                    ...exercise,
                    sets: exercise.sets.map(s => 
                      s.id === setId 
                        ? { ...s, is_completed: !s.is_completed }
                        : s
                    )
                  }
                : exercise
            )
          };
        });
      }
    } catch (error) {
      console.error('Error toggling set:', error);
    }
  };

  const updateSetWeight = async (exerciseId: string, setId: string, weight: number) => {
    if (!currentWorkout) return;

    try {
      const { error } = await supabase
        .from('exercise_sets')
        .update({ weight })
        .eq('id', setId);

      if (!error) {
        // Update local state
        setCurrentWorkout(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            exercises: prev.exercises.map(exercise => 
              exercise.id === exerciseId
                ? {
                    ...exercise,
                    sets: exercise.sets.map(s => 
                      s.id === setId 
                        ? { ...s, weight }
                        : s
                    )
                  }
                : exercise
            )
          };
        });
      }
    } catch (error) {
      console.error('Error updating set weight:', error);
    }
  };

  const getCompletedSets = () => {
    if (!currentWorkout) return 0;
    return currentWorkout.exercises.reduce((total, exercise) => 
      total + exercise.sets.filter(set => set.is_completed).length, 0
    );
  };

  const getTotalSets = () => {
    if (!currentWorkout) return 0;
    return currentWorkout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  };

  const createWorkout = async (workout: { name: string; description: string; date?: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const workoutDate = workout.date || new Date().toISOString().split('T')[0];

      const { data: newWorkout, error } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: workout.name,
          description: workout.description,
          date: workoutDate
        })
        .select()
        .single();

      if (error) throw error;

      // If it's today's workout, set as current
      const today = new Date().toISOString().split('T')[0];
      if (workoutDate === today) {
        await fetchTodayWorkout();
      }
      
      return newWorkout;
    } catch (error) {
      console.error('Error creating workout:', error);
      throw error;
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);

      if (error) throw error;

      // If it was the current workout, clear it
      if (currentWorkout?.id === workoutId) {
        setCurrentWorkout(null);
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  };

  const addExercise = async (workoutId: string, exercise: { 
    name: string; 
    category: string; 
    rest_time: number;
    sets: { reps: number; weight?: number }[];
  }) => {
    try {
      // Create the exercise
      const { data: newExercise, error: exerciseError } = await supabase
        .from('exercises')
        .insert({
          workout_id: workoutId,
          name: exercise.name,
          category: exercise.category,
          rest_time: exercise.rest_time
        })
        .select()
        .single();

      if (exerciseError || !newExercise) throw exerciseError;

      // Create the sets
      const setsToInsert = exercise.sets.map((set, index) => ({
        exercise_id: newExercise.id,
        reps: set.reps,
        weight: set.weight,
        set_order: index + 1,
        is_completed: false
      }));

      const { error: setsError } = await supabase
        .from('exercise_sets')
        .insert(setsToInsert);

      if (setsError) throw setsError;

      // Refresh current workout if this exercise was added to it
      if (currentWorkout?.id === workoutId) {
        await fetchTodayWorkout();
      }
    } catch (error) {
      console.error('Error adding exercise:', error);
      throw error;
    }
  };

  const completeWorkout = async () => {
    if (!currentWorkout) return;

    try {
      const { error } = await supabase
        .from('workouts')
        .update({ 
          is_completed: true,
          duration_minutes: Math.floor(workoutTimer / 60)
        })
        .eq('id', currentWorkout.id);

      if (error) throw error;

      setCurrentWorkout(prev => prev ? { ...prev, is_completed: true } : null);
      setIsWorkoutActive(false);
    } catch (error) {
      console.error('Error completing workout:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTodayWorkout();
  }, []);

  // Timer effect - runs when workout is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isWorkoutActive) {
      interval = setInterval(() => {
        setWorkoutTimer(prev => prev + 1);
      }, 1000);
    } else if (!isWorkoutActive && interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWorkoutActive]);

  return {
    currentWorkout,
    isWorkoutActive,
    setIsWorkoutActive,
    workoutTimer,
    setWorkoutTimer,
    loading,
    allWorkouts,
    createSampleWorkout,
    createWorkout,
    deleteWorkout,
    addExercise,
    completeWorkout,
    toggleSet,
    updateSetWeight,
    getCompletedSets,
    getTotalSets,
    refetch: fetchTodayWorkout
  };
};