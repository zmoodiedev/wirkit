import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExerciseRecord } from '@/hooks/useProgress';

interface AddRecordDialogProps {
  onAdd: (record: Omit<ExerciseRecord, 'id'>) => void;
  children?: React.ReactNode;
}

export const AddRecordDialog = ({ onAdd, children }: AddRecordDialogProps) => {
  const [open, setOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [recordType, setRecordType] = useState<'weight' | 'reps' | 'distance' | 'time'>('weight');
  const [date, setDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  const [distance, setDistance] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');

  const resetForm = () => {
    setExerciseName('');
    setRecordType('weight');
    setDate(new Date());
    setWeight('');
    setReps('');
    setSets('');
    setDistance('');
    setMinutes('');
    setSeconds('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!exerciseName) return;

    const duration = recordType === 'time' 
      ? (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0)
      : undefined;

    const record: Omit<ExerciseRecord, 'id'> = {
      exercise_name: exerciseName,
      record_type: recordType,
      record_date: format(date, 'yyyy-MM-dd'),
      weight: recordType === 'weight' ? parseFloat(weight) : undefined,
      reps: reps ? parseInt(reps) : undefined,
      sets: sets ? parseInt(sets) : undefined,
      distance: recordType === 'distance' ? parseFloat(distance) : undefined,
      duration
    };

    onAdd(record);
    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-gradient-primary hover:shadow-glow transition-all">
            <TrendingUp size={16} className="mr-2" />
            Log New PR
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Personal Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exerciseName">Exercise Name</Label>
            <Input
              id="exerciseName"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="Bench Press"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recordType">Record Type</Label>
            <Select value={recordType} onValueChange={(value: 'weight' | 'reps' | 'distance' | 'time') => setRecordType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight">Max Weight</SelectItem>
                <SelectItem value="reps">Max Reps</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="time">Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {recordType === 'weight' && (
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="185"
                required
              />
            </div>
          )}

          {(recordType === 'weight' || recordType === 'reps') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reps">Reps</Label>
                <Input
                  id="reps"
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sets">Sets</Label>
                <Input
                  id="sets"
                  type="number"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  placeholder="3"
                />
              </div>
            </div>
          )}

          {recordType === 'distance' && (
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (miles)</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="5.0"
                required
              />
            </div>
          )}

          {recordType === 'time' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minutes">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seconds">Seconds</Label>
                <Input
                  id="seconds"
                  type="number"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  placeholder="30"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Record
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};