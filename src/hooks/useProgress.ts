import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ProgressEntry {
  id: string;
  date: string;
  weight?: number;
  body_fat_percentage?: number;
  chest_measurement?: number;
  waist_measurement?: number;
  arm_measurement?: number;
  thigh_measurement?: number;
  notes?: string;
}

export interface ExerciseRecord {
  id: string;
  exercise_name: string;
  weight?: number;
  reps?: number;
  sets?: number;
  distance?: number;
  duration?: number;
  record_type: 'weight' | 'reps' | 'distance' | 'time';
  record_date: string;
  notes?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  achievement_type: string;
  points: number;
  achieved_at: string;
}

export const useProgress = () => {
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecord[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProgressData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch progress entries
      const { data: progressData, error: progressError } = await supabase
        .from('progress_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (progressError) throw progressError;

      // Fetch exercise records
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercise_records')
        .select('*')
        .eq('user_id', user.id)
        .order('record_date', { ascending: false });

      if (exerciseError) throw exerciseError;

      // Fetch achievements
      const { data: achievementData, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('achieved_at', { ascending: false });

      if (achievementError) throw achievementError;

      setProgressEntries(progressData || []);
      setExerciseRecords(exerciseData?.map(record => ({
        ...record,
        weight: record.weight || undefined,
        reps: record.reps || undefined,
        sets: record.sets || undefined,
        distance: record.distance || undefined,
        duration: record.duration || undefined,
        record_type: record.record_type as 'weight' | 'reps' | 'distance' | 'time'
      })) || []);
      setAchievements(achievementData || []);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const addProgressEntry = async (entry: Omit<ProgressEntry, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('progress_entries')
        .insert({
          user_id: user.id,
          ...entry
        })
        .select()
        .single();

      if (error) throw error;

      setProgressEntries(prev => [data, ...prev]);
      toast.success('Progress entry added');
      return data;
    } catch (error) {
      console.error('Error adding progress entry:', error);
      toast.error('Failed to add progress entry');
    }
  };

  const addExerciseRecord = async (record: Omit<ExerciseRecord, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('exercise_records')
        .insert({
          user_id: user.id,
          ...record
        })
        .select()
        .single();

      if (error) throw error;

      setExerciseRecords(prev => [{
        ...data,
        weight: data.weight || undefined,
        reps: data.reps || undefined,
        sets: data.sets || undefined,
        distance: data.distance || undefined,
        duration: data.duration || undefined,
        record_type: data.record_type as 'weight' | 'reps' | 'distance' | 'time'
      }, ...prev]);
      toast.success('Personal record added');
      return data;
    } catch (error) {
      console.error('Error adding exercise record:', error);
      toast.error('Failed to add exercise record');
    }
  };

  const addAchievement = async (achievement: Omit<Achievement, 'id' | 'achieved_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('achievements')
        .insert({
          user_id: user.id,
          ...achievement
        })
        .select()
        .single();

      if (error) throw error;

      setAchievements(prev => [data, ...prev]);
      toast.success('Achievement unlocked!');
      return data;
    } catch (error) {
      console.error('Error adding achievement:', error);
      toast.error('Failed to add achievement');
    }
  };

  const updateProgressEntry = async (id: string, updates: Partial<ProgressEntry>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('progress_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setProgressEntries(prev => 
        prev.map(entry => 
          entry.id === id ? { ...entry, ...updates } : entry
        )
      );
      toast.success('Progress entry updated');
    } catch (error) {
      console.error('Error updating progress entry:', error);
      toast.error('Failed to update progress entry');
    }
  };

  const deleteProgressEntry = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('progress_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setProgressEntries(prev => prev.filter(entry => entry.id !== id));
      toast.success('Progress entry deleted');
    } catch (error) {
      console.error('Error deleting progress entry:', error);
      toast.error('Failed to delete progress entry');
    }
  };

  // Stats calculations
  const getLatestEntry = () => {
    return progressEntries[0] || null;
  };

  const getWeightProgress = () => {
    const entriesWithWeight = progressEntries
      .filter(entry => entry.weight)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return entriesWithWeight;
  };

  const getExerciseProgress = () => {
    const exerciseGroups = exerciseRecords.reduce((groups, record) => {
      if (!groups[record.exercise_name]) {
        groups[record.exercise_name] = [];
      }
      groups[record.exercise_name].push(record);
      return groups;
    }, {} as Record<string, ExerciseRecord[]>);

    return Object.entries(exerciseGroups).map(([exercise, records]) => {
      const sortedRecords = records.sort((a, b) => 
        new Date(b.record_date).getTime() - new Date(a.record_date).getTime()
      );
      
      const current = sortedRecords[0];
      const previous = sortedRecords[1];
      
      let change = null;
      if (previous) {
        if (current.record_type === 'weight' && current.weight && previous.weight) {
          change = `+${current.weight - previous.weight}`;
        } else if (current.record_type === 'reps' && current.reps && previous.reps) {
          change = `+${current.reps - previous.reps}`;
        }
      }

      return {
        exercise,
        current: formatRecordValue(current),
        previous: previous ? formatRecordValue(previous) : null,
        change
      };
    });
  };

  const formatRecordValue = (record: ExerciseRecord) => {
    switch (record.record_type) {
      case 'weight':
        return `${record.weight} lbs`;
      case 'reps':
        return `${record.reps} reps`;
      case 'distance':
        return `${record.distance} miles`;
      case 'time':
        return `${Math.floor((record.duration || 0) / 60)}:${String((record.duration || 0) % 60).padStart(2, '0')}`;
      default:
        return 'N/A';
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, [user]);

  return {
    progressEntries,
    exerciseRecords,
    achievements,
    loading,
    addProgressEntry,
    addExerciseRecord,
    addAchievement,
    updateProgressEntry,
    deleteProgressEntry,
    getLatestEntry,
    getWeightProgress,
    getExerciseProgress,
    refetch: fetchProgressData
  };
};