import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

const PREDEFINED_GOALS = [
  'Lose Weight',
  'Build Muscle',
  'Improve Endurance',
  'Gain Strength',
  'Improve Flexibility',
  'Better Sleep',
  'Reduce Stress',
  'Increase Energy',
  'Better Posture',
  'Improve Balance',
  'Train for Event',
  'General Fitness'
];

interface GoalsSelectorProps {
  selectedGoals: string[];
  onGoalsChange: (goals: string[]) => void;
}

const GoalsSelector = ({ selectedGoals, onGoalsChange }: GoalsSelectorProps) => {
  const [customGoal, setCustomGoal] = useState('');

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      onGoalsChange(selectedGoals.filter(g => g !== goal));
    } else {
      onGoalsChange([...selectedGoals, goal]);
    }
  };

  const addCustomGoal = () => {
    if (customGoal.trim() && !selectedGoals.includes(customGoal.trim())) {
      onGoalsChange([...selectedGoals, customGoal.trim()]);
      setCustomGoal('');
    }
  };

  const removeGoal = (goal: string) => {
    onGoalsChange(selectedGoals.filter(g => g !== goal));
  };

  return (
    <div className="space-y-4">
      {/* Selected Goals */}
      {selectedGoals.length > 0 && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Selected Goals</Label>
          <div className="flex flex-wrap gap-2">
            {selectedGoals.map((goal) => (
              <Badge 
                key={goal} 
                variant="default" 
                className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors group"
                onClick={() => removeGoal(goal)}
              >
                {goal}
                <X size={12} className="ml-1 group-hover:text-destructive" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Predefined Goals */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Common Goals</Label>
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_GOALS.map((goal) => (
            <Button
              key={goal}
              variant={selectedGoals.includes(goal) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleGoal(goal)}
              className="text-xs"
            >
              {goal}
            </Button>
          ))}
        </div>
      </div>

      {/* Add Custom Goal */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Add Custom Goal</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter your custom goal..."
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addCustomGoal();
              }
            }}
          />
          <Button 
            size="sm" 
            onClick={addCustomGoal}
            disabled={!customGoal.trim() || selectedGoals.includes(customGoal.trim())}
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GoalsSelector;