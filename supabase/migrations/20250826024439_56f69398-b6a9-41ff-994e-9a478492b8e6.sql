-- Add foreign key constraints with CASCADE DELETE for all user-related tables
-- This ensures that when a user is deleted from auth.users, all their data is automatically removed

-- Add foreign key constraint to profiles table
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraint to user_goals table
ALTER TABLE public.user_goals 
ADD CONSTRAINT user_goals_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraint to user_preferences table
ALTER TABLE public.user_preferences 
ADD CONSTRAINT user_preferences_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraint to workouts table
ALTER TABLE public.workouts 
ADD CONSTRAINT workouts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraint to food_entries table
ALTER TABLE public.food_entries 
ADD CONSTRAINT food_entries_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraint to planned_items table
ALTER TABLE public.planned_items 
ADD CONSTRAINT planned_items_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraint to progress_entries table
ALTER TABLE public.progress_entries 
ADD CONSTRAINT progress_entries_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraint to progress_photos table
ALTER TABLE public.progress_photos 
ADD CONSTRAINT progress_photos_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraint to daily_stats table
ALTER TABLE public.daily_stats 
ADD CONSTRAINT daily_stats_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraint to exercise_records table
ALTER TABLE public.exercise_records 
ADD CONSTRAINT exercise_records_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraint to custom_foods table
ALTER TABLE public.custom_foods 
ADD CONSTRAINT custom_foods_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraint to achievements table
ALTER TABLE public.achievements 
ADD CONSTRAINT achievements_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;