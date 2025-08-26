import { useEffect, useState } from 'react';
import { getTodayDate, getDaysAgoDate } from '@/lib/dateUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  date: string;
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
  const { user } = useAuth();
  const [userGoals, setUserGoals] = useState<UserGoals | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [profile, setProfile] = useState<{ display_name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    console.log('Fetching user data...');
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
      const today = getTodayDate();
      const { data: statsData } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      // Fetch recent food entries (last 3 days to catch entries from previous days)
      const threeDaysAgoStr = getDaysAgoDate(3);
      
      console.log('Fetching food entries for user:', user.id, 'from date:', threeDaysAgoStr, 'to today:', today);
      const { data: foodData, error: foodError } = await supabase
        .from('food_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', threeDaysAgoStr)
        .lte('date', today)
        .order('logged_at', { ascending: true });

      console.log('Food entries response:', { foodData, foodError });
      
      // Filter today's entries for stats calculation
      const todaysFoodEntries = (foodData || []).filter(entry => entry.date === today);

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
      
      // Calculate daily stats from today's food entries only, but preserve water intake and workout minutes from database
      if (todaysFoodEntries.length > 0) {
        const foodStats = todaysFoodEntries.reduce((totals, entry) => ({
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

        // Merge with existing stats to preserve water intake and workout minutes
        const mergedStats = {
          ...foodStats,
          water_intake: statsData?.water_intake || 0,
          workout_minutes: statsData?.workout_minutes || 0
        };
        
        setDailyStats(mergedStats);
      }
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

      const today = getTodayDate();
      
      const { error } = await supabase
        .from('daily_stats')
        .upsert({
          user_id: user.id,
          date: today,
          ...dailyStats,
          ...updates
        }, {
          onConflict: 'user_id,date'
        });

      if (!error) {
        setDailyStats(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Error updating daily stats:', error);
    }
  };

  const addFoodEntry = async (food: Omit<FoodEntry, 'id' | 'logged_at' | 'date'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('food_entries')
        .insert({
          user_id: user.id,
          ...food,
          date: getTodayDate()
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = getTodayDate();
      
      // Update database directly with the new water intake value
      const { error } = await supabase
        .from('daily_stats')
        .upsert({
          user_id: user.id,
          date: today,
          calories_consumed: dailyStats?.calories_consumed || 0,
          protein_consumed: dailyStats?.protein_consumed || 0,
          carbs_consumed: dailyStats?.carbs_consumed || 0,
          fat_consumed: dailyStats?.fat_consumed || 0,
          water_intake: newWaterIntake,
          workout_minutes: dailyStats?.workout_minutes || 0
        }, {
          onConflict: 'user_id,date'
        });

      if (!error) {
        // Update local state
        setDailyStats(prev => prev ? { ...prev, water_intake: newWaterIntake } : null);
      } else {
        console.error('Error updating water intake:', error);
      }
    } catch (error) {
      console.error('Error updating water intake:', error);
    }
  };

  const editFoodEntry = async (id: string, updates: Partial<Omit<FoodEntry, 'id' | 'logged_at' | 'date'>>) => {
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
    const today = getTodayDate();
    const todaysEntries = entries.filter(entry => entry.date === today);
    
    const newStats = todaysEntries.reduce((totals, entry) => ({
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

    const updatedStats = {
      ...newStats,
      water_intake: dailyStats?.water_intake || 0,
      workout_minutes: dailyStats?.workout_minutes || 0
    };

    // Update local state immediately for instant UI updates
    setDailyStats(updatedStats);

    // Update database in background
    await updateDailyStats(updatedStats);
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

  const updateUserGoals = async (updates: Partial<UserGoals>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_goals')
        .update(updates)
        .eq('user_id', user.id);

      if (!error) {
        setUserGoals(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Error updating user goals:', error);
    }
  };

  useEffect(() => {
    fetchUserData();

    // Set up real-time subscription for food entries
    if (user) {
      const today = getTodayDate();
      
      const channel = supabase
        .channel('food-entries-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'food_entries',
            filter: `user_id=eq.${user.id} AND date=eq.${today}`
          },
          (payload) => {
            console.log('New food entry detected:', payload);
            const newEntry = payload.new as FoodEntry;
            setFoodEntries(prev => {
              // Check if entry already exists to avoid duplicates
              if (prev.some(entry => entry.id === newEntry.id)) {
                return prev;
              }
              const updatedEntries = [...prev, newEntry];
              // Recalculate stats with new entry - we'll do this separately
              return updatedEntries;
            });
            // Trigger a fresh fetch to ensure data consistency
            fetchUserData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

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
    updateUserGoals,
    refetch: fetchUserData
  };
};