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

export interface CustomFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
}

export const useFitnessData = () => {
  const [userGoals, setUserGoals] = useState<UserGoals | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
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

      // Fetch user's custom foods
      const { data: customFoodData } = await supabase
        .from('custom_foods')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

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
      setCustomFoods((customFoodData || []) as CustomFood[]);
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
        const updatedEntries = [...foodEntries, data as FoodEntry];
        setFoodEntries(updatedEntries);
        
        // Recalculate daily stats from all entries
        await recalculateDailyStats(updatedEntries);
      }
    } catch (error) {
      console.error('Error adding food entry:', error);
    }
  };

  const updateWaterIntake = async (newWaterIntake: number) => {
    await updateDailyStats({ water_intake: newWaterIntake });
  };

  const editFoodEntry = async (id: string, updates: Partial<Omit<FoodEntry, 'id' | 'logged_at'>>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('food_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (!error) {
        const updatedEntries = foodEntries.map(entry => 
          entry.id === id ? { ...entry, ...updates } : entry
        );
        setFoodEntries(updatedEntries);

        // Recalculate daily stats from all entries
        await recalculateDailyStats(updatedEntries);
      }
    } catch (error) {
      console.error('Error editing food entry:', error);
    }
  };

  const deleteFoodEntry = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('food_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (!error) {
        const updatedEntries = foodEntries.filter(entry => entry.id !== id);
        setFoodEntries(updatedEntries);
        
        // Recalculate daily stats from remaining entries
        await recalculateDailyStats(updatedEntries);
      }
    } catch (error) {
      console.error('Error deleting food entry:', error);
    }
  };

  const recalculateDailyStats = async (entries: FoodEntry[]) => {
    const newStats = entries.reduce((totals, entry) => ({
      calories_consumed: totals.calories_consumed + entry.calories,
      protein_consumed: totals.protein_consumed + entry.protein,
      carbs_consumed: totals.carbs_consumed + entry.carbs,
      fat_consumed: totals.fat_consumed + entry.fat
    }), {
      calories_consumed: 0,
      protein_consumed: 0,
      carbs_consumed: 0,
      fat_consumed: 0
    });

    await updateDailyStats({
      ...newStats,
      water_intake: dailyStats?.water_intake || 0,
      workout_minutes: dailyStats?.workout_minutes || 0
    });
  };

  const addCustomFood = async (food: Omit<CustomFood, 'id' | 'created_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('custom_foods')
        .insert({
          user_id: user.id,
          ...food
        })
        .select()
        .single();

      if (!error && data) {
        setCustomFoods(prev => [...prev, data as CustomFood]);
        return data as CustomFood;
      }
    } catch (error) {
      console.error('Error adding custom food:', error);
    }
  };

  const deleteCustomFood = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('custom_foods')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (!error) {
        setCustomFoods(prev => prev.filter(food => food.id !== id));
      }
    } catch (error) {
      console.error('Error deleting custom food:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return {
    userGoals,
    dailyStats,
    foodEntries,
    customFoods,
    profile, 
    loading,
    addFoodEntry,
    editFoodEntry,
    deleteFoodEntry,
    addCustomFood,
    deleteCustomFood,
    updateWaterIntake,
    updateDailyStats,
    refetch: fetchUserData
  };
};