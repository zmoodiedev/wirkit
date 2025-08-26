-- Create storage bucket for progress photos
INSERT INTO storage.buckets (id, name, public) VALUES ('progress-photos', 'progress-photos', false);

-- Create storage policies for progress photos
CREATE POLICY "Users can view their own progress photos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own progress photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own progress photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own progress photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);