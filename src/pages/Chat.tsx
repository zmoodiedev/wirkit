import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Layout from '@/components/Layout';
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
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hi! I'm your AI fitness coach. I can help you log workouts, track meals, get exercise suggestions, and answer any fitness questions. What would you like to do today?",
      sender: 'ai',
      timestamp: '10:30 AM'
    },
    {
      id: '2',
      content: "I just finished a 30-minute run and want to log it",
      sender: 'user',
      timestamp: '10:32 AM'
    },
    {
      id: '3',
      content: "Great job on your run! 🏃‍♂️ I've logged 30 minutes of running for you. Based on your pace and weight, you burned approximately 280 calories. How did you feel during the run?",
      sender: 'ai',
      timestamp: '10:32 AM'
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

  const handleSend = () => {
    if (!message.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMessage]);
    setMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(message),
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
      return "I'd be happy to help with your workout! Here are some exercises I recommend based on your goals: Push-ups (3 sets of 12), Squats (3 sets of 15), and Planks (3 sets of 30 seconds). Would you like me to create a full workout plan for you?";
    }
    
    if (lowerMessage.includes('meal') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
      return "For a healthy meal, I suggest grilled chicken with quinoa and roasted vegetables. This gives you about 450 calories with 35g protein, 45g carbs, and 12g fat. Would you like me to log this meal for you or suggest other options?";
    }
    
    if (lowerMessage.includes('progress') || lowerMessage.includes('stats')) {
      return "Your progress is looking great! This week you've completed 4 out of 6 planned workouts and stayed within your calorie goals 5 out of 7 days. Your consistency is improving - keep it up! 💪";
    }
    
    return "I understand you're asking about fitness and nutrition. Could you be more specific about what you'd like help with? I can assist with workout planning, meal logging, progress tracking, or answering any fitness questions you have!";
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

        {/* API Setup Notice */}
        <Card className="shadow-card border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-orange-500 flex-shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-medium text-orange-900 mb-1">OpenAI API Setup Required</h4>
                <p className="text-sm text-orange-800 mb-2">
                  To enable real ChatGPT integration, add your OpenAI API key to the environment variables.
                </p>
                <code className="text-xs bg-orange-100 px-2 py-1 rounded">
                  VITE_OPENAI_API_KEY=your_api_key_here
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Chat;