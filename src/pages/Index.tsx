import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dumbbell, 
  Apple, 
  TrendingUp, 
  MessageCircle, 
  Target,
  Users,
  Smartphone,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Dumbbell,
      title: 'Workout Tracking',
      description: 'Log exercises, sets, reps, and weights with intelligent progress tracking'
    },
    {
      icon: Apple,
      title: 'Nutrition Monitoring',
      description: 'Track calories, macros, and hydration with detailed meal logging'
    },
    {
      icon: TrendingUp,
      title: 'Progress Analytics',
      description: 'Visualize your fitness journey with comprehensive charts and statistics'
    },
    {
      icon: MessageCircle,
      title: 'AI Coach Integration',
      description: 'Chat with AI for personalized workout suggestions and nutrition advice'
    },
    {
      icon: Target,
      title: 'Goal Setting',
      description: 'Set and track fitness goals with intelligent milestone tracking'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Responsive design that works perfectly on all your devices'
    }
  ];

  const benefits = [
    'Comprehensive workout and diet tracking',
    'AI-powered fitness coaching',
    'Beautiful progress visualization',
    'Smart goal setting and planning',
    'Mobile-first responsive design'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center text-white space-y-8 max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Transform Your Fitness Journey with{' '}
              <span className="text-transparent bg-gradient-to-r from-white to-blue-200 bg-clip-text">
                WirkIt
              </span>
            </h1>
            <p className="text-xl lg:text-2xl opacity-90 max-w-2xl mx-auto">
              The ultimate fitness companion with AI-powered coaching, comprehensive tracking, 
              and beautiful progress visualization. Start your transformation today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button asChild size="lg" variant="hero">
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight size={20} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="hero">
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Everything You Need to{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive fitness tracking meets intelligent AI coaching in one beautiful, 
              easy-to-use platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                      <Icon size={24} className="text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                  Why Choose{' '}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    WirkIt?
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Built for serious fitness enthusiasts who want more than basic tracking. 
                  Get intelligent insights, AI coaching, and comprehensive analytics.
                </p>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="text-success flex-shrink-0" size={20} />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow transition-all">
                <Link to="/signup">
                  Start Your Journey
                  <ArrowRight size={20} />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <Card className="shadow-elevated">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Users className="text-primary" size={32} />
                      <div>
                        <div className="text-2xl font-bold">10,000+</div>
                        <div className="text-muted-foreground">Active Users</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Target className="text-success" size={32} />
                      <div>
                        <div className="text-2xl font-bold">500K+</div>
                        <div className="text-muted-foreground">Workouts Tracked</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <TrendingUp className="text-warning" size={32} />
                      <div>
                        <div className="text-2xl font-bold">95%</div>
                        <div className="text-muted-foreground">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Ready to Transform Your Fitness?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of users who have already transformed their fitness journey 
              with our comprehensive tracking and AI coaching platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button asChild size="lg" variant="hero">
                <Link to="/signup">
                  Get Started Now - It's Free
                  <ArrowRight size={20} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="hero">
                <Link to="/dashboard">
                  View Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              WirkIt
            </h3>
            <p className="text-muted-foreground">
              Your personal fitness companion with AI-powered insights
            </p>
            <div className="flex justify-center gap-6">
              <Link to="/login" className="text-primary hover:underline">Sign In</Link>
              <Link to="/signup" className="text-primary hover:underline">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
