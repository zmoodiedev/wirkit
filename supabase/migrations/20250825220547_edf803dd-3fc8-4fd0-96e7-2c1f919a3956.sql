-- Create planned_items table for user schedules
CREATE TABLE public.planned_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('workout', 'meal')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TIME NOT NULL,
  duration INTEGER,
  calories INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.planned_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own planned items" 
ON public.planned_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own planned items" 
ON public.planned_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planned items" 
ON public.planned_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planned items" 
ON public.planned_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_planned_items_updated_at
BEFORE UPDATE ON public.planned_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();