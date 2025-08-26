import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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

    if (!userId) {
      throw new Error('User ID is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get user's fitness context
    const userContext = await getUserFitnessContext(userId);
    
    console.log('User fitness context:', userContext);

    // Check if the user wants to log something
    const loggedItems = await processUserRequest(message, userId);
    let logConfirmation = '';
    
    if (loggedItems.length > 0) {
      logConfirmation = `\n\n✅ I've logged the following for you:\n${loggedItems.join('\n')}`;
    }

    const systemPrompt = `You are an expert AI fitness coach and nutritionist. Your role is to provide personalized, science-based fitness and nutrition guidance.

USER CONTEXT:
${userContext}

SPECIAL ABILITIES:
- When users mention meals or food they've eaten, acknowledge that you've logged it
- When users mention workouts or exercises they've done, acknowledge that you've logged it  
- When users mention planning activities, acknowledge that you've added it to their planner
- You can automatically log meals, workouts, and planner items based on user descriptions

INSTRUCTIONS:
- Be encouraging, motivating, and supportive
- Provide specific, actionable advice
- Use emojis appropriately to make responses engaging
- Keep responses concise but informative (2-3 paragraphs max)
- Always consider the user's current fitness level and goals
- When you log items, confirm what was logged and provide helpful context
- Provide specific numbers for exercises (sets, reps, duration)
- For meal suggestions, include approximate calories and macros
- Be knowledgeable about exercise form, injury prevention, and progressive overload
- If the user asks about something unrelated to fitness/health, politely redirect back to fitness topics

RESPONSE STYLE:
- Start with encouraging words
- Provide the main advice or information
- If you logged something, mention it positively
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
          { role: 'user', content: message + (logConfirmation ? `\n\nNOTE: You have automatically logged items for the user. Acknowledge this in your response.${logConfirmation}` : '') }
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
      loggedItems: loggedItems,
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

async function processUserRequest(message: string, userId: string): Promise<string[]> {
  const loggedItems: string[] = [];
  const lowerMessage = message.toLowerCase();

  try {
    // Detect workout logging
    if (detectWorkoutLogging(lowerMessage)) {
      const workoutData = await extractWorkoutData(message);
      if (workoutData) {
        const result = await logWorkout(workoutData, userId);
        if (result) {
          loggedItems.push(`🏋️ Workout: ${workoutData.name} (${workoutData.duration} minutes)`);
        }
      }
    }

    // Detect meal logging
    if (detectMealLogging(lowerMessage)) {
      const mealData = await extractMealData(message);
      if (mealData) {
        const result = await logMeal(mealData, userId);
        if (result) {
          loggedItems.push(`🍽️ Meal: ${mealData.name} (${mealData.calories} calories)`);
        }
      }
    }

    // Detect planner item
    if (detectPlannerRequest(lowerMessage)) {
      const plannerData = await extractPlannerData(message);
      if (plannerData) {
        const result = await logPlannerItem(plannerData, userId);
        if (result) {
          loggedItems.push(`📅 Planned: ${plannerData.title} for ${plannerData.date}`);
        }
      }
    }

  } catch (error) {
    console.error('Error processing user request:', error);
  }

  return loggedItems;
}

function detectWorkoutLogging(message: string): boolean {
  const workoutKeywords = [
    'did', 'finished', 'completed', 'just did', 'worked out', 'exercised',
    'trained', 'lifted', 'ran', 'jogged', 'swam', 'biked', 'cycled',
    'push-ups', 'squats', 'bench press', 'deadlift', 'cardio'
  ];
  return workoutKeywords.some(keyword => message.includes(keyword));
}

function detectMealLogging(message: string): boolean {
  const mealKeywords = [
    'ate', 'had', 'consumed', 'drank', 'finished eating', 'just ate',
    'breakfast', 'lunch', 'dinner', 'snack', 'meal'
  ];
  return mealKeywords.some(keyword => message.includes(keyword));
}

function detectPlannerRequest(message: string): boolean {
  const plannerKeywords = [
    'plan', 'schedule', 'tomorrow', 'next week', 'later', 'planning to',
    'want to', 'going to', 'will do', 'remind me'
  ];
  return plannerKeywords.some(keyword => message.includes(keyword));
}

async function extractWorkoutData(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Extract duration (look for numbers followed by minutes/min/hrs/hour)
  const durationMatch = message.match(/(\d+)\s*(minutes?|mins?|hours?|hrs?)/i);
  let duration = 30; // default
  
  if (durationMatch) {
    duration = parseInt(durationMatch[1]);
    if (durationMatch[2].startsWith('hour') || durationMatch[2].startsWith('hr')) {
      duration *= 60; // convert hours to minutes
    }
  }

  // Extract workout name/type
  let workoutName = 'General Workout';
  
  const workoutTypes = {
    'run': 'Running',
    'jog': 'Jogging', 
    'bike': 'Cycling',
    'cycle': 'Cycling',
    'swim': 'Swimming',
    'lift': 'Weight Training',
    'strength': 'Strength Training',
    'cardio': 'Cardio',
    'yoga': 'Yoga',
    'pilates': 'Pilates',
    'push-up': 'Push-ups',
    'squat': 'Squats',
    'bench press': 'Bench Press',
    'deadlift': 'Deadlifts'
  };

  for (const [key, value] of Object.entries(workoutTypes)) {
    if (lowerMessage.includes(key)) {
      workoutName = value;
      break;
    }
  }

  return {
    name: workoutName,
    duration: duration,
    description: `Logged from chat: ${message.substring(0, 100)}`,
    date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]
  };
}

async function extractMealData(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Determine meal type based on time or keywords
  let mealType = 'snack';
  const hour = new Date().getHours();
  
  if (lowerMessage.includes('breakfast') || (hour >= 6 && hour < 11)) {
    mealType = 'breakfast';
  } else if (lowerMessage.includes('lunch') || (hour >= 11 && hour < 16)) {
    mealType = 'lunch';
  } else if (lowerMessage.includes('dinner') || (hour >= 16 && hour < 22)) {
    mealType = 'dinner';
  }

  // Extract food name (basic parsing)
  let foodName = 'Mixed meal';
  const foodKeywords = [
    'chicken', 'beef', 'fish', 'salmon', 'turkey', 'pork',
    'rice', 'pasta', 'bread', 'salad', 'vegetables', 'fruits',
    'eggs', 'oatmeal', 'yogurt', 'smoothie', 'sandwich'
  ];

  for (const food of foodKeywords) {
    if (lowerMessage.includes(food)) {
      foodName = food.charAt(0).toUpperCase() + food.slice(1);
      break;
    }
  }

  // Basic calorie estimation
  let calories = 300; // default
  if (mealType === 'breakfast') calories = 350;
  else if (mealType === 'lunch') calories = 450;
  else if (mealType === 'dinner') calories = 500;

  return {
    name: foodName,
    meal_type: mealType,
    calories: calories,
    protein: Math.round(calories * 0.15 / 4), // ~15% protein
    carbs: Math.round(calories * 0.45 / 4), // ~45% carbs  
    fat: Math.round(calories * 0.30 / 9), // ~30% fat
    date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]
  };
}

async function extractPlannerData(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Determine date
  let targetDate = new Date();
  if (lowerMessage.includes('tomorrow')) {
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (lowerMessage.includes('next week')) {
    targetDate.setDate(targetDate.getDate() + 7);
  }

  // Determine type and title
  let type = 'other';
  let title = 'Planned activity';
  
  if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') || lowerMessage.includes('gym')) {
    type = 'workout';
    title = 'Planned workout session';
  } else if (lowerMessage.includes('meal') || lowerMessage.includes('eat') || lowerMessage.includes('cook')) {
    type = 'meal';
    title = 'Planned meal';
  }

  // Extract time (default to 9 AM)
  const timeMatch = message.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i);
  let time = '09:00';
  
  if (timeMatch) {
    let hour = parseInt(timeMatch[1]);
    const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const isPM = timeMatch[3].toLowerCase() === 'pm';
    
    if (isPM && hour !== 12) hour += 12;
    else if (!isPM && hour === 12) hour = 0;
    
    time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  return {
    title: title,
    type: type,
    date: new Date(targetDate.getTime() - (targetDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0],
    time: time,
    duration: 60 // default 1 hour
  };
}

async function logWorkout(workoutData: any, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        name: workoutData.name,
        description: workoutData.description,
        duration_minutes: workoutData.duration,
        date: workoutData.date,
        is_completed: true
      });

    if (error) {
      console.error('Error logging workout:', error);
      return false;
    }

    console.log('Workout logged successfully');
    return true;
  } catch (error) {
    console.error('Error logging workout:', error);
    return false;
  }
}

async function logMeal(mealData: any, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('food_entries')
      .insert({
        user_id: userId,
        name: mealData.name,
        meal_type: mealData.meal_type,
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fat: mealData.fat,
        date: mealData.date
      });

    if (error) {
      console.error('Error logging meal:', error);
      return false;
    }

    console.log('Meal logged successfully');
    return true;
  } catch (error) {
    console.error('Error logging meal:', error);
    return false;
  }
}

async function logPlannerItem(plannerData: any, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('planned_items')
      .insert({
        user_id: userId,
        title: plannerData.title,
        type: plannerData.type,
        date: plannerData.date,
        time: plannerData.time,
        duration: plannerData.duration,
        completed: false
      });

    if (error) {
      console.error('Error logging planner item:', error);
      return false;
    }

    console.log('Planner item logged successfully');
    return true;
  } catch (error) {
    console.error('Error logging planner item:', error);
    return false;
  }
}

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