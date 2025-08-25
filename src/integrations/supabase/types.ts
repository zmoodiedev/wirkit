export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      custom_foods: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          fat: number
          id: string
          name: string
          protein: number
          updated_at: string
          user_id: string
        }
        Insert: {
          calories: number
          carbs?: number
          created_at?: string
          fat?: number
          id?: string
          name: string
          protein?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          fat?: number
          id?: string
          name?: string
          protein?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_stats: {
        Row: {
          calories_consumed: number | null
          carbs_consumed: number | null
          created_at: string
          date: string
          fat_consumed: number | null
          id: string
          protein_consumed: number | null
          updated_at: string
          user_id: string
          water_intake: number | null
          workout_minutes: number | null
        }
        Insert: {
          calories_consumed?: number | null
          carbs_consumed?: number | null
          created_at?: string
          date?: string
          fat_consumed?: number | null
          id?: string
          protein_consumed?: number | null
          updated_at?: string
          user_id: string
          water_intake?: number | null
          workout_minutes?: number | null
        }
        Update: {
          calories_consumed?: number | null
          carbs_consumed?: number | null
          created_at?: string
          date?: string
          fat_consumed?: number | null
          id?: string
          protein_consumed?: number | null
          updated_at?: string
          user_id?: string
          water_intake?: number | null
          workout_minutes?: number | null
        }
        Relationships: []
      }
      exercise_sets: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          is_completed: boolean | null
          reps: number
          set_order: number
          weight: number | null
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          is_completed?: boolean | null
          reps: number
          set_order: number
          weight?: number | null
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          is_completed?: boolean | null
          reps?: number
          set_order?: number
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          rest_time: number | null
          workout_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          rest_time?: number | null
          workout_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          rest_time?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      food_entries: {
        Row: {
          calories: number
          carbs: number | null
          created_at: string
          date: string
          fat: number | null
          id: string
          logged_at: string
          meal_type: string
          name: string
          protein: number | null
          user_id: string
        }
        Insert: {
          calories: number
          carbs?: number | null
          created_at?: string
          date?: string
          fat?: number | null
          id?: string
          logged_at?: string
          meal_type: string
          name: string
          protein?: number | null
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number | null
          created_at?: string
          date?: string
          fat?: number | null
          id?: string
          logged_at?: string
          meal_type?: string
          name?: string
          protein?: number | null
          user_id?: string
        }
        Relationships: []
      }
      planned_items: {
        Row: {
          calories: number | null
          completed: boolean
          created_at: string
          date: string
          difficulty: string | null
          duration: number | null
          id: string
          time: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calories?: number | null
          completed?: boolean
          created_at?: string
          date?: string
          difficulty?: string | null
          duration?: number | null
          id?: string
          time: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calories?: number | null
          completed?: boolean
          created_at?: string
          date?: string
          difficulty?: string | null
          duration?: number | null
          id?: string
          time?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string
          display_name: string | null
          fitness_level: string | null
          goals: string[] | null
          height: string | null
          id: string
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          display_name?: string | null
          fitness_level?: string | null
          goals?: string[] | null
          height?: string | null
          id?: string
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string
          display_name?: string | null
          fitness_level?: string | null
          goals?: string[] | null
          height?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          created_at: string
          daily_calories: number | null
          daily_carbs: number | null
          daily_fat: number | null
          daily_protein: number | null
          daily_water: number | null
          daily_workout_minutes: number | null
          id: string
          updated_at: string
          user_id: string
          weekly_workouts: number | null
        }
        Insert: {
          created_at?: string
          daily_calories?: number | null
          daily_carbs?: number | null
          daily_fat?: number | null
          daily_protein?: number | null
          daily_water?: number | null
          daily_workout_minutes?: number | null
          id?: string
          updated_at?: string
          user_id: string
          weekly_workouts?: number | null
        }
        Update: {
          created_at?: string
          daily_calories?: number | null
          daily_carbs?: number | null
          daily_fat?: number | null
          daily_protein?: number | null
          daily_water?: number | null
          daily_workout_minutes?: number | null
          id?: string
          updated_at?: string
          user_id?: string
          weekly_workouts?: number | null
        }
        Relationships: []
      }
      workouts: {
        Row: {
          created_at: string
          date: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_completed: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_completed?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_completed?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
