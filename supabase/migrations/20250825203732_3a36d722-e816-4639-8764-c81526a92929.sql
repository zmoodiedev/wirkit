-- Create a table for custom foods that users can save and reuse
CREATE TABLE public.custom_foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein INTEGER NOT NULL DEFAULT 0,
  carbs INTEGER NOT NULL DEFAULT 0,
  fat INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own custom foods" 
ON public.custom_foods 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom foods" 
ON public.custom_foods 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom foods" 
ON public.custom_foods 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom foods" 
ON public.custom_foods 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_custom_foods_updated_at
BEFORE UPDATE ON public.custom_foods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();