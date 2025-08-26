import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProgressPhoto {
  id: string;
  user_id: string;
  photo_url: string;
  photo_type: 'front' | 'side' | 'back' | 'other';
  taken_at: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useProgressPhotos = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('taken_at', { ascending: false });

      if (error) throw error;
      setPhotos((data || []) as ProgressPhoto[]);
    } catch (error) {
      console.error('Error fetching progress photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (
    file: File,
    photoType: 'front' | 'side' | 'back' | 'other',
    notes?: string,
    takenAt?: string
  ): Promise<ProgressPhoto | null> => {
    if (!user) return null;

    try {
      // Create a unique file name
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(fileName);

      // Save photo record to database
      const { data: photoData, error: dbError } = await supabase
        .from('progress_photos')
        .insert({
          user_id: user.id,
          photo_url: urlData.publicUrl,
          photo_type: photoType,
          taken_at: takenAt || new Date().toISOString().split('T')[0],
          notes: notes || null
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update local state
      const newPhoto = photoData as ProgressPhoto;
      setPhotos(prev => [newPhoto, ...prev]);
      
      return newPhoto;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  };

  const deletePhoto = async (photoId: string) => {
    if (!user) return;

    try {
      const photo = photos.find(p => p.id === photoId);
      if (!photo) return;

      // Extract file path from URL
      const url = new URL(photo.photo_url);
      const filePath = url.pathname.split('/').pop();
      
      if (filePath) {
        // Delete from storage
        await supabase.storage
          .from('progress-photos')
          .remove([`${user.id}/${filePath}`]);
      }

      // Delete from database
      const { error } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', photoId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  };

  const updatePhoto = async (photoId: string, updates: Partial<Pick<ProgressPhoto, 'photo_type' | 'notes' | 'taken_at'>>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('progress_photos')
        .update(updates)
        .eq('id', photoId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setPhotos(prev => 
        prev.map(photo => 
          photo.id === photoId ? { ...photo, ...updates } : photo
        )
      );
    } catch (error) {
      console.error('Error updating photo:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [user]);

  return {
    photos,
    loading,
    uploadPhoto,
    deletePhoto,
    updatePhoto,
    refetch: fetchPhotos
  };
};