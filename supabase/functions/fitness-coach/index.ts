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

    // Check if the user wants to log something or create workouts
    const loggedItems = await processUserRequest(message, userId);
    let logConfirmation = '';
    
    if (loggedItems.length > 0) {
      logConfirmation = `\n\n✅ I've created/logged the following for you:\n${loggedItems.join('\n')}`;
    }

    const systemPrompt = `You are an expert AI fitness coach and nutritionist. Your role is to provide personalized, science-based fitness and nutrition guidance.

USER CONTEXT:
${userContext}

SPECIAL ABILITIES:
- When users ask you to create workouts, you can generate structured workout plans with specific exercises and sets
- When users mention meals or food they've eaten, acknowledge that you've logged it
- When users mention workouts or exercises they've done, acknowledge that you've logged it  
- When users mention planning activities, acknowledge that you've added it to their planner
- You can automatically log meals, workouts, and planner items based on user descriptions
- You can create complete workout routines including exercises, sets, reps, and rest times

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

  console.log('Processing user message:', message);
  console.log('Lowercase message:', lowerMessage);

  try {
    // Detect workout creation (highest priority)
    const isWorkoutCreation = detectWorkoutCreation(lowerMessage);
    console.log('Workout creation detected:', isWorkoutCreation);
    
    if (isWorkoutCreation) {
      console.log('Extracting workout creation data...');
      const workoutData = await extractWorkoutCreationData(message);
      console.log('Extracted workout data:', JSON.stringify(workoutData, null, 2));
      
      if (workoutData) {
        console.log('Creating workout with exercises...');
        const result = await createWorkoutWithExercises(workoutData, userId);
        console.log('Workout creation result:', result);
        
        if (result) {
          loggedItems.push(`💪 Created workout: ${workoutData.name} with ${workoutData.exercises.length} exercises`);
        }
      }
      return loggedItems; // Return early to prevent other detections
    }
    
    // Detect workout logging
    if (detectWorkoutLogging(lowerMessage)) {
      const workoutData = await extractWorkoutData(message);
      if (workoutData) {
        const result = await logWorkout(workoutData, userId);
        if (result) {
          loggedItems.push(`🏋️ Workout: ${workoutData.name} (${workoutData.duration} minutes)`);
        }
      }
      return loggedItems; // Return early to prevent other detections
    }

    // Detect meal logging (only if not workout related)
    if (detectMealLogging(lowerMessage) && !isWorkoutRelated(lowerMessage)) {
      const mealData = await extractMealData(message);
      if (mealData) {
        const result = await logMeal(mealData, userId);
        if (result) {
          loggedItems.push(`🍽️ Meal: ${mealData.name} (${mealData.calories} calories)`);
        }
      }
      return loggedItems; // Return early to prevent other detections
    }

    // Detect planner item (only if not workout or meal related)
    const isPlannerRequest = detectPlannerRequest(lowerMessage);
    console.log('Planner request detected:', isPlannerRequest);
    
    if (isPlannerRequest && !isWorkoutRelated(lowerMessage) && !isMealRelated(lowerMessage)) {
      console.log('Processing planner request...');
      const plannerDataArray = await extractPlannerData(message);
      console.log('Extracted planner data:', JSON.stringify(plannerDataArray, null, 2));
      
      if (plannerDataArray && plannerDataArray.length > 0) {
        let successCount = 0;
        for (const plannerData of plannerDataArray) {
          const result = await logPlannerItem(plannerData, userId);
          if (result) successCount++;
        }
        console.log(`Planner items creation result: ${successCount}/${plannerDataArray.length} created`);
        
        if (successCount > 0) {
          if (plannerDataArray.length === 1) {
            loggedItems.push(`📅 Planned: ${plannerDataArray[0].title} for ${plannerDataArray[0].date}`);
          } else {
            loggedItems.push(`📅 Planned: ${successCount} ${plannerDataArray[0].title.toLowerCase()} sessions`);
          }
        }
      }
    }

    // Also automatically create planner items for workout and meal requests
    if (isWorkoutCreation) {
      console.log('Auto-creating planner item for workout...');
      const workoutPlannerData = {
        title: 'Workout Session',
        type: 'workout',
        date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0],
        time: '18:00', // Default 6 PM
        duration: 60
      };
      await logPlannerItem(workoutPlannerData, userId);
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
    'breakfast', 'lunch', 'dinner', 'snack', 'meal',
    'just had', 'eating', 'food', 'cooked', 'made',
    'ordered', 'grabbed', 'picked up', 'bought food',
    'chicken', 'beef', 'fish', 'salmon', 'turkey', 'pork',
    'rice', 'pasta', 'bread', 'salad', 'vegetables', 'fruits',
    'eggs', 'oatmeal', 'yogurt', 'smoothie', 'sandwich',
    'pizza', 'burger', 'tacos', 'soup', 'steak', 'apple',
    'banana', 'protein shake', 'coffee', 'calories'
  ];
  console.log('Checking message for meal logging keywords:', message);
  
  const found = mealKeywords.some(keyword => message.includes(keyword));
  console.log('Meal logging keyword found:', found);
  
  return found;
}

function detectPlannerRequest(message: string): boolean {
  const plannerKeywords = [
    'plan', 'schedule', 'tomorrow', 'next week', 'later', 'planning to',
    'want to', 'going to', 'will do', 'remind me', 'set reminder',
    'book', 'appointment', 'meeting', 'calendar', 'agenda',
    'plan to eat', 'plan to workout', 'schedule workout', 'schedule meal',
    'tomorrow I will', 'next I will', 'planning on', 'intend to',
    'set up', 'arrange', 'organize', 'pencil in',
    'add', 'add a', 'add workout', 'add meal', 'put in calendar',
    'every', 'weekly', 'monthly', 'recurring', 'regular',
    'every monday', 'every tuesday', 'every wednesday', 'every thursday',
    'every friday', 'every saturday', 'every sunday',
    'all mondays', 'all tuesdays', 'all wednesdays', 'all thursdays',
    'all fridays', 'all saturdays', 'all sundays'
  ];
  console.log('Checking message for planner keywords:', message);
  
  const found = plannerKeywords.some(keyword => message.includes(keyword));
  console.log('Planner keyword found:', found);
  
  return found;
}

function detectWorkoutCreation(message: string): boolean {
  const creationKeywords = [
    'create workout', 'make workout', 'build workout', 'design workout',
    'workout plan', 'workout routine', 'training program', 'exercise routine',
    'generate workout', 'build me a workout', 'create a workout',
    'create a', 'make a', 'generate a', 'build a', 'design a',
    'need a workout', 'want a workout', 'give me a workout',
    'push workout', 'pull workout', 'leg workout', 'chest workout',
    'back workout', 'arm workout', 'shoulder workout', 'full body workout',
    'cardio workout', 'strength workout', 'hiit workout'
  ];
  console.log('Checking message for workout creation keywords:', message);
  console.log('Keywords to check:', creationKeywords);
  
  const found = creationKeywords.some(keyword => message.includes(keyword));
  console.log('Workout creation keyword found:', found);
  
  return found;
}

function isWorkoutRelated(message: string): boolean {
  const workoutKeywords = [
    'workout', 'exercise', 'training', 'gym', 'fitness', 'lift', 'run', 'cardio',
    'strength', 'push', 'pull', 'leg', 'chest', 'back', 'arms', 'shoulders'
  ];
  return workoutKeywords.some(keyword => message.includes(keyword));
}

function isMealRelated(message: string): boolean {
  const mealKeywords = [
    'meal', 'food', 'eat', 'breakfast', 'lunch', 'dinner', 'snack', 'calories'
  ];
  return mealKeywords.some(keyword => message.includes(keyword));
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
  console.log('Extracting meal data from:', message);
  
  // Determine meal type based on explicit mentions first, then time
  let mealType = 'snack';
  
  if (lowerMessage.includes('breakfast')) {
    mealType = 'breakfast';
  } else if (lowerMessage.includes('lunch')) {
    mealType = 'lunch';
  } else if (lowerMessage.includes('dinner')) {
    mealType = 'dinner';
  } else {
    // Fall back to time-based detection
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) {
      mealType = 'breakfast';
    } else if (hour >= 11 && hour < 16) {
      mealType = 'lunch';
    } else if (hour >= 16 && hour < 22) {
      mealType = 'dinner';
    }
  }

  console.log('Detected meal type:', mealType);

  // Extract food name - try to capture the full meal description
  let foodName = 'Mixed meal';
  
  // Look for common meal patterns
  const mealPatterns = [
    /(?:had|ate|consumed|eating)\s+([^.!?]+?)(?:\s+for\s+(?:breakfast|lunch|dinner)|$)/i,
    /(?:breakfast|lunch|dinner).*?(?:was|is|had|ate)\s+([^.!?]+)/i,
    /(?:made|cooked|ordered)\s+([^.!?]+?)(?:\s+for\s+(?:breakfast|lunch|dinner)|$)/i
  ];

  for (const pattern of mealPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      foodName = match[1].trim();
      // Clean up the food name
      foodName = foodName.replace(/\s+for\s+(breakfast|lunch|dinner|today|yesterday).*$/i, '');
      foodName = foodName.replace(/\s*,\s*and\s*/, ' and ');
      break;
    }
  }

  // If no pattern match, look for individual food items and combine them
  if (foodName === 'Mixed meal') {
    const foodKeywords = [
      'chicken', 'beef', 'fish', 'salmon', 'turkey', 'pork', 'steak',
      'rice', 'pasta', 'bread', 'noodles', 'quinoa', 'potatoes',
      'salad', 'vegetables', 'veggies', 'broccoli', 'carrots', 'spinach',
      'fruits', 'apple', 'banana', 'berries', 'orange',
      'eggs', 'oatmeal', 'yogurt', 'smoothie', 'sandwich', 'burger',
      'pizza', 'tacos', 'soup', 'beans', 'cheese', 'avocado'
    ];

    const foundFoods = foodKeywords.filter(food => lowerMessage.includes(food));
    if (foundFoods.length > 0) {
      foodName = foundFoods.join(' and ');
    }
  }

  console.log('Extracted food name:', foodName);

  // Smart calorie estimation based on meal type and food content
  let calories = 300; // default
  
  // Base calories by meal type
  const baseMealCalories = {
    'breakfast': 350,
    'lunch': 450,
    'dinner': 500,
    'snack': 200
  };
  
  calories = baseMealCalories[mealType] || 300;
  
  // Adjust based on food content
  if (lowerMessage.includes('rice') || lowerMessage.includes('pasta') || lowerMessage.includes('bread')) {
    calories += 100; // carbs add calories
  }
  if (lowerMessage.includes('chicken') || lowerMessage.includes('beef') || lowerMessage.includes('fish') || lowerMessage.includes('protein')) {
    calories += 50; // protein
  }
  if (lowerMessage.includes('salad') || lowerMessage.includes('vegetables')) {
    calories -= 50; // veggies are lower calorie
  }

  console.log('Estimated calories:', calories);

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
  console.log('Extracting planner data from:', message);
  
  // Determine if this is a recurring request
  const isRecurring = lowerMessage.includes('every') || lowerMessage.includes('all');
  console.log('Is recurring request:', isRecurring);
  
  let targetDates: Date[] = [];
  
  if (isRecurring) {
    // Handle recurring requests like "every Tuesday in September"
    const dayOfWeek = extractDayOfWeek(lowerMessage);
    const month = extractMonth(lowerMessage);
    const year = extractYear(lowerMessage) || new Date().getFullYear();
    
    console.log('Recurring schedule - Day:', dayOfWeek, 'Month:', month, 'Year:', year);
    
    if (dayOfWeek !== null && month !== null) {
      targetDates = getAllDatesForDayInMonth(dayOfWeek, month, year);
      console.log('Generated target dates:', targetDates.map(d => d.toISOString().split('T')[0]));
    }
  } else {
    // Handle single date requests
    let targetDate = new Date();
    if (lowerMessage.includes('tomorrow')) {
      targetDate.setDate(targetDate.getDate() + 1);
    } else if (lowerMessage.includes('next week')) {
      targetDate.setDate(targetDate.getDate() + 7);
    } else if (lowerMessage.includes('monday')) {
      const daysUntilMonday = (1 + 7 - targetDate.getDay()) % 7;
      targetDate.setDate(targetDate.getDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday));
    }
    targetDates = [targetDate];
  }

  // Determine type and title with better detection
  let type = 'other';
  let title = 'Planned activity';
  
  if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') || lowerMessage.includes('gym') || 
      lowerMessage.includes('train') || lowerMessage.includes('lift') || lowerMessage.includes('run') ||
      lowerMessage.includes('cardio') || lowerMessage.includes('push') || lowerMessage.includes('pull') ||
      lowerMessage.includes('leg')) {
    type = 'workout';
    title = 'Planned workout session';
  } else if (lowerMessage.includes('meal') || lowerMessage.includes('eat') || lowerMessage.includes('cook') ||
             lowerMessage.includes('breakfast') || lowerMessage.includes('lunch') || lowerMessage.includes('dinner') ||
             lowerMessage.includes('food') || lowerMessage.includes('restaurant')) {
    type = 'meal';
    title = 'Planned meal';
  }

  // Extract time (default to 6 PM for workouts, 12 PM for meals)
  const timeMatch = message.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i);
  let time = type === 'workout' ? '18:00' : '12:00';
  
  if (timeMatch) {
    let hour = parseInt(timeMatch[1]);
    const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const isPM = timeMatch[3].toLowerCase() === 'pm';
    
    if (isPM && hour !== 12) hour += 12;
    else if (!isPM && hour === 12) hour = 0;
    
    time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  // Return multiple planner items for recurring events
  return targetDates.map(date => ({
    title: title,
    type: type,
    date: new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0],
    time: time,
    duration: 60 // default 1 hour
  }));
}

// Helper functions for recurring date parsing
function extractDayOfWeek(message: string): number | null {
  const days = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
    'thursday': 4, 'friday': 5, 'saturday': 6
  };
  
  for (const [day, num] of Object.entries(days)) {
    if (message.includes(day)) return num;
  }
  return null;
}

function extractMonth(message: string): number | null {
  const months = {
    'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
    'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
  };
  
  for (const [month, num] of Object.entries(months)) {
    if (message.includes(month)) return num;
  }
  return null;
}

function extractYear(message: string): number | null {
  const yearMatch = message.match(/\b(20\d{2})\b/);
  if (yearMatch) return parseInt(yearMatch[1]);
  
  if (message.includes('this year')) return new Date().getFullYear();
  if (message.includes('next year')) return new Date().getFullYear() + 1;
  
  return null;
}

function getAllDatesForDayInMonth(dayOfWeek: number, month: number, year: number): Date[] {
  const dates: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Find first occurrence of the day in the month
  let current = new Date(firstDay);
  while (current.getDay() !== dayOfWeek) {
    current.setDate(current.getDate() + 1);
  }
  
  // Add all occurrences of that day in the month
  while (current <= lastDay) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }
  
  return dates;
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

async function extractWorkoutCreationData(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Determine workout type and name
  let workoutName = 'Custom Workout';
  let workoutType = 'general';
  let exercises: any[] = [];
  
  // Extract workout type
  const workoutTypes = {
    'push': { name: 'Push Day', type: 'strength' },
    'pull': { name: 'Pull Day', type: 'strength' },
    'leg': { name: 'Leg Day', type: 'strength' },
    'upper': { name: 'Upper Body', type: 'strength' },
    'lower': { name: 'Lower Body', type: 'strength' },
    'full body': { name: 'Full Body Workout', type: 'strength' },
    'cardio': { name: 'Cardio Session', type: 'cardio' },
    'hiit': { name: 'HIIT Workout', type: 'cardio' },
    'strength': { name: 'Strength Training', type: 'strength' },
    'chest': { name: 'Chest Workout', type: 'strength' },
    'back': { name: 'Back Workout', type: 'strength' },
    'arms': { name: 'Arms Workout', type: 'strength' },
    'shoulders': { name: 'Shoulder Workout', type: 'strength' },
    'core': { name: 'Core Workout', type: 'strength' },
    'abs': { name: 'Ab Workout', type: 'strength' }
  };

  for (const [key, value] of Object.entries(workoutTypes)) {
    if (lowerMessage.includes(key)) {
      workoutName = value.name;
      workoutType = value.type;
      break;
    }
  }

  // Create exercises based on workout type
  if (workoutType === 'strength') {
    if (lowerMessage.includes('push') || lowerMessage.includes('chest')) {
      exercises = [
        { name: 'Bench Press', category: 'chest', rest_time: 120, sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }] },
        { name: 'Push-ups', category: 'chest', rest_time: 60, sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] },
        { name: 'Overhead Press', category: 'shoulders', rest_time: 90, sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }] },
        { name: 'Tricep Dips', category: 'arms', rest_time: 60, sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }] }
      ];
    } else if (lowerMessage.includes('pull') || lowerMessage.includes('back')) {
      exercises = [
        { name: 'Pull-ups', category: 'back', rest_time: 90, sets: [{ reps: 6 }, { reps: 6 }, { reps: 6 }] },
        { name: 'Bent-over Row', category: 'back', rest_time: 90, sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }] },
        { name: 'Lat Pulldown', category: 'back', rest_time: 60, sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }] },
        { name: 'Bicep Curls', category: 'arms', rest_time: 60, sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] }
      ];
    } else if (lowerMessage.includes('leg') || lowerMessage.includes('lower')) {
      exercises = [
        { name: 'Squats', category: 'legs', rest_time: 120, sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }] },
        { name: 'Deadlifts', category: 'legs', rest_time: 150, sets: [{ reps: 6 }, { reps: 6 }, { reps: 6 }] },
        { name: 'Lunges', category: 'legs', rest_time: 60, sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] },
        { name: 'Calf Raises', category: 'legs', rest_time: 45, sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }] }
      ];
    } else {
      // Default full body workout
      exercises = [
        { name: 'Squats', category: 'legs', rest_time: 90, sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }] },
        { name: 'Push-ups', category: 'chest', rest_time: 60, sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }] },
        { name: 'Pull-ups', category: 'back', rest_time: 90, sets: [{ reps: 6 }, { reps: 6 }, { reps: 6 }] },
        { name: 'Plank', category: 'core', rest_time: 45, sets: [{ reps: 1 }, { reps: 1 }, { reps: 1 }] }
      ];
    }
  } else if (workoutType === 'cardio') {
    exercises = [
      { name: 'Running', category: 'cardio', rest_time: 60, sets: [{ reps: 1 }] },
      { name: 'Jumping Jacks', category: 'cardio', rest_time: 30, sets: [{ reps: 50 }, { reps: 50 }, { reps: 50 }] },
      { name: 'Burpees', category: 'cardio', rest_time: 60, sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }] },
      { name: 'Mountain Climbers', category: 'cardio', rest_time: 45, sets: [{ reps: 20 }, { reps: 20 }, { reps: 20 }] }
    ];
  }

  return {
    name: workoutName,
    description: `AI-generated ${workoutName.toLowerCase()} created from chat`,
    date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0],
    exercises: exercises
  };
}

async function createWorkoutWithExercises(workoutData: any, userId: string): Promise<boolean> {
  try {
    console.log('Creating workout with data:', JSON.stringify(workoutData, null, 2));
    
    // First create the workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        name: workoutData.name,
        description: workoutData.description,
        date: workoutData.date,
        is_completed: false
      })
      .select()
      .single();

    if (workoutError || !workout) {
      console.error('Error creating workout:', workoutError);
      return false;
    }

    console.log('Workout created with ID:', workout.id);
    console.log('Number of exercises to create:', workoutData.exercises?.length || 0);

    // Then create exercises for the workout
    if (!workoutData.exercises || workoutData.exercises.length === 0) {
      console.error('No exercises provided in workout data');
      return false;
    }

    for (let i = 0; i < workoutData.exercises.length; i++) {
      const exerciseData = workoutData.exercises[i];
      console.log(`Creating exercise ${i + 1}:`, exerciseData.name);
      
      const { data: exercise, error: exerciseError } = await supabase
        .from('exercises')
        .insert({
          workout_id: workout.id,
          name: exerciseData.name,
          category: exerciseData.category,
          rest_time: exerciseData.rest_time
        })
        .select()
        .single();

      if (exerciseError) {
        console.error(`Error creating exercise ${exerciseData.name}:`, exerciseError);
        continue;
      }

      if (!exercise) {
        console.error(`No exercise data returned for ${exerciseData.name}`);
        continue;
      }

      console.log(`Exercise created successfully: ${exercise.id}`);

      // Create sets for each exercise
      if (exerciseData.sets && exerciseData.sets.length > 0) {
        const sets = exerciseData.sets.map((set: any, index: number) => ({
          exercise_id: exercise.id,
          reps: set.reps,
          weight: set.weight || null,
          set_order: index + 1,
          is_completed: false
        }));

        console.log(`Creating ${sets.length} sets for exercise ${exerciseData.name}`);

        const { error: setsError } = await supabase
          .from('exercise_sets')
          .insert(sets);

        if (setsError) {
          console.error(`Error creating sets for ${exerciseData.name}:`, setsError);
        } else {
          console.log(`Sets created successfully for ${exerciseData.name}`);
        }
      } else {
        console.log(`No sets provided for exercise ${exerciseData.name}`);
      }
    }

    console.log('Workout with exercises created successfully');
    return true;
  } catch (error) {
    console.error('Error creating workout with exercises:', error);
    return false;
  }
}