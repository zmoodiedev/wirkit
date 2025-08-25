import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileStats {
  joinDate: string;
  totalWorkouts: number;
  streakDays: number;
  achievements: number;
  avgWeeklyWorkouts: number;
  totalProgressEntries: number;
  totalFoodEntries: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  achievement_type: string;
  points: number;
  achieved_at: string;
}

export const useProfileStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Get user join date from profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('user_id', user.id)
        .single();

      // Count total workouts
      const { count: totalWorkouts } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count achievements
      const { count: achievementCount } = await supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count progress entries
      const { count: progressCount } = await supabase
        .from('progress_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count food entries
      const { count: foodCount } = await supabase
        .from('food_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Calculate workout streak (simplified - last consecutive days with workouts)
      const { data: recentWorkouts } = await supabase
        .from('workouts')
        .select('date')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('date', { ascending: false })
        .limit(30);

      let streakDays = 0;
      if (recentWorkouts && recentWorkouts.length > 0) {
        const today = new Date();
        let currentDate = new Date(today);
        const workoutDates = new Set(recentWorkouts.map(w => w.date));
        
        // Check backwards from today
        while (streakDays < 30) {
          const dateStr = currentDate.toISOString().split('T')[0];
          if (workoutDates.has(dateStr)) {
            streakDays++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else if (streakDays > 0) {
            // Streak broken
            break;
          } else {
            // No workout today, but streak hasn't started yet
            currentDate.setDate(currentDate.getDate() - 1);
          }
        }
      }

      // Calculate average weekly workouts (last 4 weeks)
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      const { count: recentWorkoutCount } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .gte('date', fourWeeksAgo.toISOString().split('T')[0]);

      const avgWeeklyWorkouts = recentWorkoutCount ? (recentWorkoutCount / 4) : 0;

      setStats({
        joinDate: profileData?.created_at 
          ? new Date(profileData.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long' 
            })
          : 'Recently',
        totalWorkouts: totalWorkouts || 0,
        streakDays,
        achievements: achievementCount || 0,
        avgWeeklyWorkouts: Math.round(avgWeeklyWorkouts * 10) / 10,
        totalProgressEntries: progressCount || 0,
        totalFoodEntries: foodCount || 0
      });

    } catch (error) {
      console.error('Error fetching profile stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('achieved_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchAchievements();
    }
  }, [user]);

  return {
    stats,
    achievements,
    loading,
    refetch: () => {
      fetchStats();
      fetchAchievements();
    }
  };
};