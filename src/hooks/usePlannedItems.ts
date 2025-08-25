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

  const toggleComplete = (id: string) => {
    const item = plannedItems.find(item => item.id === id);
    if (item) {
      updatePlannedItem(id, { completed: !item.completed });
    }
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