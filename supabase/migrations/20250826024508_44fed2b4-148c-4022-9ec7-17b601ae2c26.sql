-- Add missing foreign key constraints with CASCADE DELETE for user-related tables
-- Only add constraints that don't already exist

-- Check and add foreign key constraint to user_goals table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_goals_user_id_fkey' 
        AND table_name = 'user_goals'
    ) THEN
        ALTER TABLE public.user_goals 
        ADD CONSTRAINT user_goals_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add foreign key constraint to user_preferences table (if not exists)  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_preferences_user_id_fkey' 
        AND table_name = 'user_preferences'
    ) THEN
        ALTER TABLE public.user_preferences 
        ADD CONSTRAINT user_preferences_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add foreign key constraint to workouts table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'workouts_user_id_fkey' 
        AND table_name = 'workouts'
    ) THEN
        ALTER TABLE public.workouts 
        ADD CONSTRAINT workouts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add foreign key constraint to food_entries table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'food_entries_user_id_fkey' 
        AND table_name = 'food_entries'
    ) THEN
        ALTER TABLE public.food_entries 
        ADD CONSTRAINT food_entries_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add foreign key constraint to planned_items table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'planned_items_user_id_fkey' 
        AND table_name = 'planned_items'
    ) THEN
        ALTER TABLE public.planned_items 
        ADD CONSTRAINT planned_items_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add foreign key constraint to progress_entries table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'progress_entries_user_id_fkey' 
        AND table_name = 'progress_entries'
    ) THEN
        ALTER TABLE public.progress_entries 
        ADD CONSTRAINT progress_entries_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add foreign key constraint to progress_photos table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'progress_photos_user_id_fkey' 
        AND table_name = 'progress_photos'
    ) THEN
        ALTER TABLE public.progress_photos 
        ADD CONSTRAINT progress_photos_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add foreign key constraint to daily_stats table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'daily_stats_user_id_fkey' 
        AND table_name = 'daily_stats'
    ) THEN
        ALTER TABLE public.daily_stats 
        ADD CONSTRAINT daily_stats_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add foreign key constraint to exercise_records table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'exercise_records_user_id_fkey' 
        AND table_name = 'exercise_records'
    ) THEN
        ALTER TABLE public.exercise_records 
        ADD CONSTRAINT exercise_records_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add foreign key constraint to custom_foods table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'custom_foods_user_id_fkey' 
        AND table_name = 'custom_foods'
    ) THEN
        ALTER TABLE public.custom_foods 
        ADD CONSTRAINT custom_foods_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add foreign key constraint to achievements table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'achievements_user_id_fkey' 
        AND table_name = 'achievements'
    ) THEN
        ALTER TABLE public.achievements 
        ADD CONSTRAINT achievements_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;