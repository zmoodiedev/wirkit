import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import Layout from '@/components/Layout';
import GoalsSelector from '@/components/GoalsSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useProfileStats } from '@/hooks/useProfileStats';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { 
  User, 
  Settings, 
  Target, 
  Bell,
  Shield,
  Camera,
  Edit3,
  Save,
  Trophy,
  Calendar,
  Activity,
  Plus,
  X
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { stats, achievements, loading: statsLoading } = useProfileStats();
  const { preferences, loading: prefsLoading, updatePreferences } = useUserPreferences();
  const [isEditing, setIsEditing] = useState(false);

  const loading = profileLoading || statsLoading || prefsLoading;

  // Form state for editing
  const [formData, setFormData] = useState({
    display_name: '',
    age: '',
    height: '',
    weight: '',
    goalWeight: '',
    fitness_level: '',
    goals: [] as string[],
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || '',
        age: profile.age?.toString() || '',
        height: profile.height || '',
        weight: profile.weight?.toString() || '',
        weight: profile.goalWeight?.toString() || '',
        fitness_level: profile.fitness_level || '',
        goals: profile.goals || ['Lose Weight', 'Build Muscle', 'Improve Endurance'],
      });
    }
  }, [profile, user]);

  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const displayGoals = profile?.goals || ['Lose Weight', 'Build Muscle', 'Improve Endurance'];

  const handleSave = async () => {
    const updates = {
      display_name: formData.display_name || null,
      age: formData.age ? parseInt(formData.age) : null,
      height: formData.height || null,
      weight: formData.weight ? parseInt(formData.weight) : null,
      weight: formData.goalWeight ? parseInt(formData.weight) : null,
      fitness_level: formData.fitness_level || null,
      goals: formData.goals.length > 0 ? formData.goals : null,
    };

    const success = await updateProfile(updates);
    if (success) {
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="bg-gradient-hero text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="text-2xl bg-white/20 text-white">
                    {displayName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="sm" 
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Camera size={14} />
                </Button>
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{displayName}</h1>
                <p className="opacity-90 mb-3">{userEmail}</p>
                <div className="flex flex-wrap gap-2">
                  {displayGoals.map((goal) => (
                    <Badge key={goal} variant="secondary" className="bg-white/20 text-white border-white/30">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Button
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <Save size={16} className="mr-2" /> : <Edit3 size={16} className="mr-2" />}
                {isEditing ? 'Save' : 'Edit Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="achievements">Awards</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.display_name}
                      onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userEmail}
                      disabled={true}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goalWeight">Goal Weight (lbs)</Label>
                    <Input
                      id="goalWeight"
                      type="number"
                      value={formData.goalWeight}
                      onChange={(e) => setFormData({...formData, goalWeight: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fitnessLevel">Fitness Level</Label>
                    <Input
                      id="fitnessLevel"
                      value={formData.fitness_level}
                      onChange={(e) => setFormData({...formData, fitness_level: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Goals Section */}
                <div className="mt-6">
                  <Label className="text-base font-medium mb-4 block">Fitness Goals</Label>
                  {!isEditing ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.goals.map((goal) => (
                        <Badge key={goal} variant="secondary">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <GoalsSelector
                      selectedGoals={formData.goals}
                      onGoalsChange={(goals) => setFormData({...formData, goals})}
                    />
                  )}
                </div>
                
                {isEditing && (
                  <div className="flex gap-2 mt-6">
                    <Button onClick={handleSave} className="bg-gradient-primary hover:shadow-glow transition-all">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="text-center shadow-card">
                <CardContent className="p-4">
                  <Calendar className="mx-auto mb-2 text-primary" size={24} />
                  <div className="text-2xl font-bold">{stats?.totalWorkouts || 0}</div>
                  <div className="text-xs text-muted-foreground">Total Workouts</div>
                </CardContent>
              </Card>
              
              <Card className="text-center shadow-card">
                <CardContent className="p-4">
                  <Activity className="mx-auto mb-2 text-success" size={24} />
                  <div className="text-2xl font-bold">{stats?.streakDays || 0}</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </CardContent>
              </Card>
              
              <Card className="text-center shadow-card">
                <CardContent className="p-4">
                  <Trophy className="mx-auto mb-2 text-yellow-500" size={24} />
                  <div className="text-2xl font-bold">{stats?.achievements || 0}</div>
                  <div className="text-xs text-muted-foreground">Achievements</div>
                </CardContent>
              </Card>
              
              <Card className="text-center shadow-card">
                <CardContent className="p-4">
                  <Target className="mx-auto mb-2 text-primary" size={24} />
                  <div className="text-2xl font-bold">{stats?.avgWeeklyWorkouts || 0}</div>
                  <div className="text-xs text-muted-foreground">Avg/Week</div>
                </CardContent>
              </Card>
              
              <Card className="text-center shadow-card">
                <CardContent className="p-4">
                  <User className="mx-auto mb-2 text-muted-foreground" size={24} />
                  <div className="text-lg font-bold">{stats?.joinDate || 'Recently'}</div>
                  <div className="text-xs text-muted-foreground">Member Since</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell size={20} className="text-primary" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Manage your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Workout Reminders</div>
                    <div className="text-sm text-muted-foreground">
                      Get reminded about your scheduled workouts
                    </div>
                  </div>
                  <Switch
                    checked={preferences?.workout_reminders || false}
                    onCheckedChange={(checked) =>
                      updatePreferences({ workout_reminders: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Meal Reminders</div>
                    <div className="text-sm text-muted-foreground">
                      Get reminded to log your meals
                    </div>
                  </div>
                  <Switch
                    checked={preferences?.meal_reminders || false}
                    onCheckedChange={(checked) =>
                      updatePreferences({ meal_reminders: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Progress Updates</div>
                    <div className="text-sm text-muted-foreground">
                      Weekly progress summaries
                    </div>
                  </div>
                  <Switch
                    checked={preferences?.progress_updates || false}
                    onCheckedChange={(checked) =>
                      updatePreferences({ progress_updates: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Achievement Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Celebrate your milestones
                    </div>
                  </div>
                  <Switch
                    checked={preferences?.achievement_notifications || false}
                    onCheckedChange={(checked) =>
                      updatePreferences({ achievement_notifications: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield size={20} className="text-primary" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Download My Data
                </Button>
                <Button variant="destructive" className="w-full justify-start">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy size={20} className="text-primary" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements && achievements.length > 0 ? (
                    achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Trophy size={20} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{achievement.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(achievement.achieved_at).toLocaleDateString()}
                          </div>
                          {achievement.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {achievement.description}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary">+{achievement.points} XP</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No achievements yet!</p>
                      <p className="text-sm">Complete workouts and reach your goals to earn achievements.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;