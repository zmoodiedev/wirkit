import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserGoals {
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  daily_water: number;
  weekly_workouts: number;
  daily_workout_minutes: number;
}

export interface DailyStats {
  calories_consumed: number;
  protein_consumed: number;
  carbs_consumed: number;
  fat_consumed: number;
  water_intake: number;
  workout_minutes: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  logged_at: string;
}

export const useFitnessData = () => {
  const [userGoals, setUserGoals] = useState<UserGoals | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [profile, setProfile] = useState<{ display_name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      // Fetch user goals
      const { data: goalsData } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch today's stats
      const today = new Date().toISOString().split('T')[0];
      const { data: statsData } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      // Fetch today's food entries
      const { data: foodData } = await supabase
        .from('food_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('logged_at', { ascending: true });

      setProfile(profileData);
      setUserGoals(goalsData);
      setDailyStats(statsData || {
        calories_consumed: 0,
        protein_consumed: 0,
        carbs_consumed: 0,
        fat_consumed: 0,
        water_intake: 0,
        workout_minutes: 0
      });
      setFoodEntries((foodData || []) as FoodEntry[]);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDailyStats = async (updates: Partial<DailyStats>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('daily_stats')
        .upsert({
          user_id: user.id,
          date: today,
          ...dailyStats,
          ...updates
        });

      if (!error) {
        setDailyStats(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Error updating daily stats:', error);
    }
  };

  const addFoodEntry = async (food: Omit<FoodEntry, 'id' | 'logged_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('food_entries')
        .insert({
          user_id: user.id,
          ...food,
          date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (!error && data) {
        setFoodEntries(prev => [...prev, data as FoodEntry]);
        
        // Update daily stats
        const newCalories = (dailyStats?.calories_consumed || 0) + food.calories;
        const newProtein = (dailyStats?.protein_consumed || 0) + food.protein;
        const newCarbs = (dailyStats?.carbs_consumed || 0) + food.carbs;
        const newFat = (dailyStats?.fat_consumed || 0) + food.fat;
        
        await updateDailyStats({
          calories_consumed: newCalories,
          protein_consumed: newProtein,
          carbs_consumed: newCarbs,
          fat_consumed: newFat
        });
      }
    } catch (error) {
      console.error('Error adding food entry:', error);
    }
  };

  const updateWaterIntake = async (newWaterIntake: number) => {
    await updateDailyStats({ water_intake: newWaterIntake });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return {
    userGoals,
    dailyStats,
    foodEntries,
    profile, 
    loading,
    addFoodEntry,
    updateWaterIntake,
    updateDailyStats,
    refetch: fetchUserData
  };
};