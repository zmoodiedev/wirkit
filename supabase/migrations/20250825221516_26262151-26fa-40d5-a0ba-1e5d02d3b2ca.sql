-- Create progress_entries table for tracking weight, body fat, and measurements
CREATE TABLE public.progress_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight DECIMAL,
  body_fat_percentage DECIMAL,
  chest_measurement DECIMAL,
  waist_measurement DECIMAL,
  arm_measurement DECIMAL,
  thigh_measurement DECIMAL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercise_records table for personal records
CREATE TABLE public.exercise_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  weight DECIMAL,
  reps INTEGER,
  sets INTEGER,
  distance DECIMAL,
  duration INTEGER, -- in seconds
  record_type TEXT CHECK (record_type IN ('weight', 'reps', 'distance', 'time')) NOT NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  achievement_type TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create progress_photos table
CREATE TABLE public.progress_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('front', 'back', 'side', 'other')) DEFAULT 'other',
  taken_at DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for progress_entries
CREATE POLICY "Users can view their own progress entries" 
ON public.progress_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress entries" 
ON public.progress_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress entries" 
ON public.progress_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress entries" 
ON public.progress_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for exercise_records
CREATE POLICY "Users can view their own exercise records" 
ON public.exercise_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exercise records" 
ON public.exercise_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise records" 
ON public.exercise_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise records" 
ON public.exercise_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for achievements
CREATE POLICY "Users can view their own achievements" 
ON public.achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievements" 
ON public.achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for progress_photos
CREATE POLICY "Users can view their own progress photos" 
ON public.progress_photos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress photos" 
ON public.progress_photos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress photos" 
ON public.progress_photos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress photos" 
ON public.progress_photos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_progress_entries_updated_at
BEFORE UPDATE ON public.progress_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercise_records_updated_at
BEFORE UPDATE ON public.exercise_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progress_photos_updated_at
BEFORE UPDATE ON public.progress_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();