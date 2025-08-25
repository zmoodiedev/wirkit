import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get user's fitness context
    const userContext = await getUserFitnessContext(userId);
    
    console.log('User fitness context:', userContext);

    const systemPrompt = `You are an expert AI fitness coach and nutritionist. Your role is to provide personalized, science-based fitness and nutrition guidance.

USER CONTEXT:
${userContext}

INSTRUCTIONS:
- Be encouraging, motivating, and supportive
- Provide specific, actionable advice
- Use emojis appropriately to make responses engaging
- Keep responses concise but informative (2-3 paragraphs max)
- Always consider the user's current fitness level and goals
- If asked to log workouts or meals, acknowledge the request positively
- Provide specific numbers for exercises (sets, reps, duration)
- For meal suggestions, include approximate calories and macros
- Be knowledgeable about exercise form, injury prevention, and progressive overload
- If the user asks about something unrelated to fitness/health, politely redirect back to fitness topics

RESPONSE STYLE:
- Start with encouraging words
- Provide the main advice or information
- End with a question or call to action to keep the conversation going`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fitness-coach function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getUserFitnessContext(userId: string): Promise<string> {
  if (!userId) {
    return "No user context available. Provide general fitness guidance.";
  }

  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, age, height, weight, fitness_level, goals')
      .eq('user_id', userId)
      .single();

    // Get user goals
    const { data: userGoals } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get recent workouts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: recentWorkouts } = await supabase
      .from('workouts')
      .select('name, duration_minutes, is_completed, date')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    // Get recent food entries (last 3 days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const { data: recentFoods } = await supabase
      .from('food_entries')
      .select('name, calories, protein, carbs, fat, meal_type, date')
      .eq('user_id', userId)
      .gte('date', threeDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    // Get recent progress entries
    const { data: recentProgress } = await supabase
      .from('progress_entries')
      .select('weight, body_fat_percentage, date, notes')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(3);

    let context = "USER PROFILE:\n";
    
    if (profile) {
      context += `- Name: ${profile.display_name || 'User'}\n`;
      context += `- Age: ${profile.age || 'Not specified'}\n`;
      context += `- Height: ${profile.height || 'Not specified'}\n`;
      context += `- Weight: ${profile.weight || 'Not specified'} lbs\n`;
      context += `- Fitness Level: ${profile.fitness_level || 'Not specified'}\n`;
      context += `- Goals: ${profile.goals ? profile.goals.join(', ') : 'Not specified'}\n`;
    }

    if (userGoals) {
      context += `\nDAILY TARGETS:\n`;
      context += `- Calories: ${userGoals.daily_calories} cal\n`;
      context += `- Protein: ${userGoals.daily_protein}g\n`;
      context += `- Carbs: ${userGoals.daily_carbs}g\n`;
      context += `- Fat: ${userGoals.daily_fat}g\n`;
      context += `- Workout Minutes: ${userGoals.daily_workout_minutes} min\n`;
      context += `- Weekly Workouts: ${userGoals.weekly_workouts}\n`;
    }

    if (recentWorkouts && recentWorkouts.length > 0) {
      context += `\nRECENT WORKOUTS (Last 7 days):\n`;
      recentWorkouts.slice(0, 5).forEach(workout => {
        context += `- ${workout.name}: ${workout.duration_minutes} min (${workout.is_completed ? 'Completed' : 'Planned'}) - ${workout.date}\n`;
      });
    }

    if (recentFoods && recentFoods.length > 0) {
      context += `\nRECENT MEALS (Last 3 days):\n`;
      const mealsByDay = recentFoods.reduce((acc, food) => {
        if (!acc[food.date]) acc[food.date] = [];
        acc[food.date].push(food);
        return acc;
      }, {} as any);

      Object.keys(mealsByDay).slice(0, 2).forEach(date => {
        const dailyCalories = mealsByDay[date].reduce((sum: number, food: any) => sum + (food.calories || 0), 0);
        context += `- ${date}: ${dailyCalories} calories\n`;
      });
    }

    if (recentProgress && recentProgress.length > 0) {
      context += `\nRECENT PROGRESS:\n`;
      const latest = recentProgress[0];
      context += `- Latest weight: ${latest.weight || 'Not recorded'} lbs (${latest.date})\n`;
      if (latest.body_fat_percentage) {
        context += `- Body fat: ${latest.body_fat_percentage}%\n`;
      }
      if (latest.notes) {
        context += `- Notes: ${latest.notes}\n`;
      }
    }

    return context;

  } catch (error) {
    console.error('Error fetching user context:', error);
    return "Error loading user context. Provide general fitness guidance.";
  }
}