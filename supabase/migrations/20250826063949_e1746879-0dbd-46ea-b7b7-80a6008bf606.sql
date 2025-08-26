-- Create exercises table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  rest_time INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on exercises
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Create policies for exercises
CREATE POLICY "Users can view exercises in their workouts" 
ON public.exercises 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.workouts 
  WHERE workouts.id = exercises.workout_id 
  AND workouts.user_id = auth.uid()
));

CREATE POLICY "Users can create exercises in their workouts" 
ON public.exercises 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.workouts 
  WHERE workouts.id = exercises.workout_id 
  AND workouts.user_id = auth.uid()
));

CREATE POLICY "Users can update exercises in their workouts" 
ON public.exercises 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.workouts 
  WHERE workouts.id = exercises.workout_id 
  AND workouts.user_id = auth.uid()
));

CREATE POLICY "Users can delete exercises in their workouts" 
ON public.exercises 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.workouts 
  WHERE workouts.id = exercises.workout_id 
  AND workouts.user_id = auth.uid()
));

-- Create exercise_sets table
CREATE TABLE public.exercise_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  reps INTEGER NOT NULL,
  weight NUMERIC,
  set_order INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on exercise_sets
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;

-- Create policies for exercise_sets
CREATE POLICY "Users can view sets in their exercises" 
ON public.exercise_sets 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.exercises 
  JOIN public.workouts ON workouts.id = exercises.workout_id 
  WHERE exercises.id = exercise_sets.exercise_id 
  AND workouts.user_id = auth.uid()
));

CREATE POLICY "Users can create sets in their exercises" 
ON public.exercise_sets 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.exercises 
  JOIN public.workouts ON workouts.id = exercises.workout_id 
  WHERE exercises.id = exercise_sets.exercise_id 
  AND workouts.user_id = auth.uid()
));

CREATE POLICY "Users can update sets in their exercises" 
ON public.exercise_sets 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.exercises 
  JOIN public.workouts ON workouts.id = exercises.workout_id 
  WHERE exercises.id = exercise_sets.exercise_id 
  AND workouts.user_id = auth.uid()
));

CREATE POLICY "Users can delete sets in their exercises" 
ON public.exercise_sets 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.exercises 
  JOIN public.workouts ON workouts.id = exercises.workout_id 
  WHERE exercises.id = exercise_sets.exercise_id 
  AND workouts.user_id = auth.uid()
));