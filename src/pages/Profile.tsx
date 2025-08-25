import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
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
  Activity
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    mealReminders: true,
    progressUpdates: false,
    achievements: true
  });

  const [userProfile, setUserProfile] = useState({
    name: user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    age: 28,
    height: '5\'10"',
    weight: 165,
    fitnessLevel: 'Intermediate',
    goals: ['Lose Weight', 'Build Muscle', 'Improve Endurance']
  });

  const stats = {
    joinDate: 'January 2024',
    totalWorkouts: 48,
    streakDays: 12,
    achievements: 8,
    avgWeeklyWorkouts: 4.2
  };

  const achievements = [
    { title: 'First Week Complete', date: '2 weeks ago', icon: Trophy },
    { title: '10 Workouts Done', date: '1 week ago', icon: Activity },
    { title: 'Protein Goal Met', date: '3 days ago', icon: Target },
    { title: 'New PR: Bench Press', date: 'Today', icon: Trophy },
  ];

  const handleSave = () => {
    setIsEditing(false);
    // TODO: Save profile data to backend
    console.log('Profile saved:', userProfile);
  };

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
                    {userProfile.name.split(' ').map(n => n[0]).join('')}
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
                <h1 className="text-2xl font-bold mb-2">{userProfile.name}</h1>
                <p className="opacity-90 mb-3">{userProfile.email}</p>
                <div className="flex flex-wrap gap-2">
                  {userProfile.goals.map((goal) => (
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
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={userProfile.age}
                      onChange={(e) => setUserProfile({...userProfile, age: parseInt(e.target.value)})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      value={userProfile.height}
                      onChange={(e) => setUserProfile({...userProfile, height: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={userProfile.weight}
                      onChange={(e) => setUserProfile({...userProfile, weight: parseInt(e.target.value)})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fitnessLevel">Fitness Level</Label>
                    <Input
                      id="fitnessLevel"
                      value={userProfile.fitnessLevel}
                      onChange={(e) => setUserProfile({...userProfile, fitnessLevel: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
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
                  <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
                  <div className="text-xs text-muted-foreground">Total Workouts</div>
                </CardContent>
              </Card>
              
              <Card className="text-center shadow-card">
                <CardContent className="p-4">
                  <Activity className="mx-auto mb-2 text-success" size={24} />
                  <div className="text-2xl font-bold">{stats.streakDays}</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </CardContent>
              </Card>
              
              <Card className="text-center shadow-card">
                <CardContent className="p-4">
                  <Trophy className="mx-auto mb-2 text-yellow-500" size={24} />
                  <div className="text-2xl font-bold">{stats.achievements}</div>
                  <div className="text-xs text-muted-foreground">Achievements</div>
                </CardContent>
              </Card>
              
              <Card className="text-center shadow-card">
                <CardContent className="p-4">
                  <Target className="mx-auto mb-2 text-primary" size={24} />
                  <div className="text-2xl font-bold">{stats.avgWeeklyWorkouts}</div>
                  <div className="text-xs text-muted-foreground">Avg/Week</div>
                </CardContent>
              </Card>
              
              <Card className="text-center shadow-card">
                <CardContent className="p-4">
                  <User className="mx-auto mb-2 text-muted-foreground" size={24} />
                  <div className="text-lg font-bold">{stats.joinDate}</div>
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
                    checked={notifications.workoutReminders}
                    onCheckedChange={(checked) =>
                      setNotifications({...notifications, workoutReminders: checked})
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
                    checked={notifications.mealReminders}
                    onCheckedChange={(checked) =>
                      setNotifications({...notifications, mealReminders: checked})
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
                    checked={notifications.progressUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications({...notifications, progressUpdates: checked})
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
                    checked={notifications.achievements}
                    onCheckedChange={(checked) =>
                      setNotifications({...notifications, achievements: checked})
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
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon size={20} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{achievement.title}</div>
                          <div className="text-sm text-muted-foreground">{achievement.date}</div>
                        </div>
                        <Badge variant="secondary">+10 XP</Badge>
                      </div>
                    );
                  })}
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