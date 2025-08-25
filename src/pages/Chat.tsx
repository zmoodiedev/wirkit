import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  Lightbulb,
  Activity,
  Apple,
  Target,
  Calendar,
  MessageCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  type?: 'text' | 'suggestion' | 'quick-action';
}

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hi! I'm your AI fitness coach. I can help you log workouts, track meals, get exercise suggestions, and answer any fitness questions. What would you like to do today?",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
  ]);

  const quickActions = [
    { text: "Log today's workout", icon: Activity },
    { text: "What should I eat for lunch?", icon: Apple },
    { text: "Plan tomorrow's exercises", icon: Calendar },
    { text: "Check my weekly progress", icon: Target },
  ];

  const suggestions = [
    "Log a meal",
    "Get workout suggestions",
    "Check calorie intake",
    "Plan next workout",
    "Review progress"
  ];

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    const userMessage = message.trim();
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      content: userMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('fitness-coach', {
        body: {
          message: userMessage,
          userId: user.id
        }
      });

      if (error) {
        throw error;
      }

      if (data && data.success) {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error(data?.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get response from AI coach. Please try again.",
        variant: "destructive",
      });

      // Add fallback message
      const fallbackResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment! 🤖",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement actual voice recording with Web Speech API
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setMessage("I just finished a chest workout with bench press and push-ups");
      }, 2000);
    }
  };

  const handleQuickAction = (action: string) => {
    setMessage(action);
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <Card className="bg-gradient-hero text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <MessageCircle size={24} />
              AI Fitness Coach
            </CardTitle>
            <CardDescription className="text-white/80">
              Chat with your personal AI trainer for workouts, nutrition, and motivation
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb size={20} className="text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.text}
                    variant="outline"
                    className="h-auto p-3 flex items-center gap-2 text-left"
                    onClick={() => handleQuickAction(action.text)}
                  >
                    <Icon size={16} className="text-primary flex-shrink-0" />
                    <span className="text-sm">{action.text}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={msg.sender === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                      {msg.sender === 'ai' ? <Bot size={16} /> : <User size={16} />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`max-w-xs lg:max-w-md ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`p-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot size={16} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2 mb-3">
                <div className="text-xs text-muted-foreground">Suggestions:</div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 3).map((suggestion) => (
                    <Badge
                      key={suggestion}
                      variant="secondary"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => handleQuickAction(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isRecording ? "Recording..." : "Ask about workouts, meals, or progress..."}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isRecording || isLoading}
                    className={isRecording ? "bg-red-50 border-red-200" : ""}
                  />
                  {isRecording && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleRecording}
                  className={`transition-colors ${
                    isRecording 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'hover:bg-accent'
                  }`}
                >
                  {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                </Button>
                
                <Button 
                  onClick={handleSend} 
                  disabled={!message.trim() || isLoading}
                  className="bg-gradient-primary hover:shadow-glow transition-all"
                >
                  <Send size={16} />
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2 text-center">
                💡 Try voice input by clicking the microphone or type your questions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Chat;