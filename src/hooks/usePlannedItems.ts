import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PlannedItem {
  id: string;
  title: string;
  type: 'workout' | 'meal';
  date: string;
  time: string;
  duration?: number;
  calories?: number;
  completed: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const usePlannedItems = () => {
  const [plannedItems, setPlannedItems] = useState<PlannedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPlannedItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('planned_items')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;

      const formattedItems = data.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type as 'workout' | 'meal',
        date: item.date,
        time: item.time,
        duration: item.duration || undefined,
        calories: item.calories || undefined,
        completed: item.completed,
        difficulty: (item.difficulty as 'easy' | 'medium' | 'hard') || undefined
      }));

      setPlannedItems(formattedItems);
    } catch (error) {
      console.error('Error fetching planned items:', error);
      toast.error('Failed to load planned items');
    } finally {
      setLoading(false);
    }
  };

  const addPlannedItem = async (item: Omit<PlannedItem, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('planned_items')
        .insert({
          user_id: user.id,
          title: item.title,
          type: item.type,
          date: item.date,
          time: item.time,
          duration: item.duration,
          calories: item.calories,
          difficulty: item.difficulty,
          completed: false
        })
        .select()
        .single();

      if (error) throw error;

      const newItem: PlannedItem = {
        id: data.id,
        title: data.title,
        type: data.type as 'workout' | 'meal',
        date: data.date,
        time: data.time,
        duration: data.duration || undefined,
        calories: data.calories || undefined,
        completed: data.completed,
        difficulty: (data.difficulty as 'easy' | 'medium' | 'hard') || undefined
      };

      setPlannedItems(prev => [...prev, newItem]);
      toast.success('Item added to schedule');
    } catch (error) {
      console.error('Error adding planned item:', error);
      toast.error('Failed to add item');
    }
  };

  const updatePlannedItem = async (id: string, updates: Partial<PlannedItem>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('planned_items')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setPlannedItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );
    } catch (error) {
      console.error('Error updating planned item:', error);
      toast.error('Failed to update item');
    }
  };

  const deletePlannedItem = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('planned_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setPlannedItems(prev => prev.filter(item => item.id !== id));
      toast.success('Item removed from schedule');
    } catch (error) {
      console.error('Error deleting planned item:', error);
      toast.error('Failed to remove item');
    }
  };

  const toggleComplete = async (id: string) => {
    try {
      const item = plannedItems.find(item => item.id === id);
      if (!item) return;

      const { error } = await supabase
        .from('planned_items')
        .update({ completed: !item.completed })
        .eq('id', id);

      if (error) throw error;

      // If completing a workout, create a workout entry
      if (!item.completed && item.type === 'workout') {
        await createWorkoutFromPlannedItem(item);
      }
      
      // If completing a meal, create a food entry
      if (!item.completed && item.type === 'meal') {
        await createFoodEntryFromPlannedItem(item);
      }

      // If uncompleting, remove the corresponding entry
      if (item.completed && item.type === 'workout') {
        await removeWorkoutFromPlannedItem(item);
      }
      
      if (item.completed && item.type === 'meal') {
        await removeFoodEntryFromPlannedItem(item);
      }

      setPlannedItems(prev => 
        prev.map(prevItem => 
          prevItem.id === id ? { ...prevItem, completed: !prevItem.completed } : prevItem
        )
      );
    } catch (error) {
      console.error('Error toggling completion:', error);
      toast.error('Failed to update item');
    }
  };

  const createWorkoutFromPlannedItem = async (item: PlannedItem) => {
    try {
      if (!user) return;

      // Create a workout entry
      await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: item.title,
          description: `Completed from planner - ${item.difficulty || 'Standard'} difficulty`,
          date: item.date,
          duration_minutes: item.duration || 30,
          is_completed: true
        });

      toast.success('Workout added to your workout history!');
    } catch (error) {
      console.error('Error creating workout from planned item:', error);
    }
  };

  const createFoodEntryFromPlannedItem = async (item: PlannedItem) => {
    try {
      if (!user) return;

      // Create a food entry
      await supabase
        .from('food_entries')
        .insert({
          user_id: user.id,
          name: item.title,
          calories: item.calories || 300,
          protein: Math.round((item.calories || 300) * 0.15 / 4), // Estimate protein
          carbs: Math.round((item.calories || 300) * 0.45 / 4), // Estimate carbs
          fat: Math.round((item.calories || 300) * 0.4 / 9), // Estimate fat
          meal_type: getMealTypeFromTime(item.time),
          date: item.date,
          logged_at: new Date().toISOString()
        });

      toast.success('Meal added to your diet log!');
    } catch (error) {
      console.error('Error creating food entry from planned item:', error);
    }
  };

  const removeWorkoutFromPlannedItem = async (item: PlannedItem) => {
    try {
      if (!user) return;

      // Find and delete the workout created from this planned item
      await supabase
        .from('workouts')
        .delete()
        .eq('user_id', user.id)
        .eq('name', item.title)
        .eq('date', item.date);

      toast.success('Workout removed from your workout history!');
    } catch (error) {
      console.error('Error removing workout from planned item:', error);
    }
  };

  const removeFoodEntryFromPlannedItem = async (item: PlannedItem) => {
    try {
      if (!user) return;

      // Find and delete the food entry created from this planned item
      const mealType = getMealTypeFromTime(item.time);
      await supabase
        .from('food_entries')
        .delete()
        .eq('user_id', user.id)
        .eq('name', item.title)
        .eq('date', item.date)
        .eq('meal_type', mealType);

      toast.success('Meal removed from your diet log!');
    } catch (error) {
      console.error('Error removing food entry from planned item:', error);
    }
  };

  const getMealTypeFromTime = (time: string): string => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 10) return 'breakfast';
    if (hour < 14) return 'lunch';
    if (hour < 18) return 'snack';
    return 'dinner';
  };

  useEffect(() => {
    fetchPlannedItems();
  }, [user]);

  return {
    plannedItems,
    loading,
    addPlannedItem,
    updatePlannedItem,
    deletePlannedItem,
    toggleComplete,
    refetch: fetchPlannedItems
  };
};