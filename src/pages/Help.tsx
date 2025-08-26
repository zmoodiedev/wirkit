import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { 
  Home, 
  Dumbbell, 
  Apple, 
  TrendingUp, 
  Calendar, 
  MessageCircle, 
  User,
  Plus,
  Edit3,
  CheckCircle,
  Target,
  Clock,
  BarChart3,
  Utensils,
  Timer
} from 'lucide-react';

const Help = () => {
  const features = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: Home,
      description: 'Your fitness overview and daily summary',
      content: [
        'View your daily progress at a glance',
        'See workout completion status',
        'Track calorie intake and nutrition goals',
        'Monitor weekly workout streaks',
        'Quick access to all other features'
      ]
    },
    {
      id: 'workout',
      title: 'Workout Tracker',
      icon: Dumbbell,
      description: 'Log and track your exercise sessions',
      content: [
        'Create new workout sessions with custom names',
        'Add exercises with sets, reps, and weights',
        'Track workout duration and completion',
        'View your workout history',
        'Monitor progress over time'
      ]
    },
    {
      id: 'diet',
      title: 'Diet Tracker',
      icon: Apple,
      description: 'Monitor your nutrition and calorie intake',
      content: [
        'Log meals for breakfast, lunch, dinner, and snacks',
        'Track calories, protein, carbs, and fats',
        'Search for foods or create custom entries',
        'View daily nutrition breakdown',
        'Monitor progress toward your calorie goals'
      ]
    },
    {
      id: 'progress',
      title: 'Progress Tracking',
      icon: TrendingUp,
      description: 'Track your fitness journey over time',
      content: [
        'Log body measurements (weight, body fat, etc.)',
        'Upload progress photos',
        'View charts and trends over time',
        'Set and track personal records',
        'Monitor your transformation journey'
      ]
    },
    {
      id: 'planner',
      title: 'Fitness Planner',
      icon: Calendar,
      description: 'Plan your workouts and meals in advance',
      content: [
        'Schedule workouts and meals for specific dates and times',
        'Set workout difficulty levels and durations',
        'Plan meal calories and timing',
        'Mark items as complete when finished',
        'Edit or delete planned items as needed'
      ]
    },
    {
      id: 'chat',
      title: 'AI Fitness Coach',
      icon: MessageCircle,
      description: 'Get personalized fitness advice and support',
      content: [
        'Ask questions about workouts, nutrition, and fitness',
        'Get personalized workout recommendations',
        'Receive meal planning suggestions',
        'Log workouts and meals through conversation',
        'Get motivation and support 24/7'
      ]
    },
    {
      id: 'profile',
      title: 'Profile Management',
      icon: User,
      description: 'Manage your personal information and goals',
      content: [
        'Set your fitness goals and preferences',
        'Update personal information (age, height, weight)',
        'Configure daily targets for calories and macros',
        'Manage notification preferences',
        'View your fitness statistics'
      ]
    }
  ];

  const quickTips = [
    {
      title: 'Getting Started',
      tips: [
        'Start by setting up your profile with your fitness goals',
        'Use the Dashboard to get an overview of your daily progress',
        'Begin logging workouts or meals to start tracking your journey'
      ]
    },
    {
      title: 'Daily Workflow',
      tips: [
        'Check your Dashboard each morning to see your goals',
        'Use the Planner to schedule your day\'s activities',
        'Log workouts and meals as you complete them',
        'Ask the AI Coach for advice when you need guidance'
      ]
    },
    {
      title: 'Pro Tips',
      tips: [
        'Use the AI Coach to quickly log activities by typing naturally',
        'Plan your meals in advance to stay on track with nutrition goals',
        'Take progress photos regularly to see your transformation',
        'Set realistic daily targets that you can consistently achieve'
      ]
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-hero text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Help & User Guide</CardTitle>
            <CardDescription className="text-white/80">
              Learn how to use each feature to maximize your fitness journey
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="features" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="features">Features Guide</TabsTrigger>
            <TabsTrigger value="tips">Quick Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="space-y-6">
            <div className="grid gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.id} className="shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-primary text-white">
                          <Icon size={20} />
                        </div>
                        {feature.title}
                      </CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          Key Features:
                        </h4>
                        <ul className="space-y-2">
                          {feature.content.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle size={16} className="text-success mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <div className="grid gap-6">
              {quickTips.map((section, index) => (
                <Card key={index} className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target size={20} className="text-primary" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                            {tipIndex + 1}
                          </Badge>
                          <span className="text-sm leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}

              {/* Common Actions Reference */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 size={20} className="text-primary" />
                    Common Actions Reference
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Plus size={16} className="text-success" />
                        Adding Items
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Click "Add Workout" or "Add Meal" buttons</li>
                        <li>• Use the <Badge variant="outline" className="text-xs">+</Badge> icon in any section</li>
                        <li>• Tell the AI Coach what you want to log</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Edit3 size={16} className="text-primary" />
                        Editing Items
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Click the edit <Badge variant="outline" className="text-xs"><Edit3 size={12} /></Badge> icon next to items</li>
                        <li>• Modify details in the popup form</li>
                        <li>• Save changes or cancel to keep original</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <CheckCircle size={16} className="text-success" />
                        Completing Tasks
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Click the circle icon to mark items complete</li>
                        <li>• Completed items appear with a checkmark</li>
                        <li>• Progress automatically updates on Dashboard</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Clock size={16} className="text-primary" />
                        Timing & Scheduling
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Use the Planner to schedule future activities</li>
                        <li>• Set specific times for workouts and meals</li>
                        <li>• View your schedule in Today, Week, or Calendar views</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Help;