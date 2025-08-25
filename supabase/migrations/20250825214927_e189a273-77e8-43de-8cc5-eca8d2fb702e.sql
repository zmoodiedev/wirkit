-- Add additional profile fields to the existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN age integer,
ADD COLUMN height text,
ADD COLUMN weight integer,
ADD COLUMN fitness_level text,
ADD COLUMN goals text[]; -- Array of goals like ['Lose Weight', 'Build Muscle']