import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserPreferences {
  workout_reminders: boolean;
  meal_reminders: boolean;
  progress_updates: boolean;
  achievement_notifications: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // If no preferences exist, create default ones
      if (!data) {
        const defaultPreferences = {
          workout_reminders: true,
          meal_reminders: true,
          progress_updates: false,
          achievement_notifications: true,
          email_notifications: true,
          push_notifications: true,
        };

        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            ...defaultPreferences
          });

        if (insertError) throw insertError;
        
        setPreferences(defaultPreferences);
      } else {
        setPreferences({
          workout_reminders: data.workout_reminders,
          meal_reminders: data.meal_reminders,
          progress_updates: data.progress_updates,
          achievement_notifications: data.achievement_notifications,
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user || !preferences) return false;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Success",
        description: "Preferences updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  return {
    preferences,
    loading,
    updatePreferences,
    refetch: fetchPreferences,
  };
};