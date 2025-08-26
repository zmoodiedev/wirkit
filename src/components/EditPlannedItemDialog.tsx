import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parse } from 'date-fns';
import { CalendarIcon, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlannedItem } from '@/hooks/usePlannedItems';

interface EditPlannedItemDialogProps {
  item: PlannedItem;
  onUpdate: (id: string, updates: Partial<PlannedItem>) => void;
  children?: React.ReactNode;
}

export const EditPlannedItemDialog = ({ item, onUpdate, children }: EditPlannedItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [type, setType] = useState<'workout' | 'meal'>(item.type as 'workout' | 'meal');
  const [date, setDate] = useState<Date>(parse(item.date, 'yyyy-MM-dd', new Date()));
  const [time, setTime] = useState(item.time);
  const [duration, setDuration] = useState(item.duration?.toString() || '');
  const [calories, setCalories] = useState(item.calories?.toString() || '');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(item.difficulty as 'easy' | 'medium' | 'hard' || 'medium');

  // Reset form when item changes
  useEffect(() => {
    setTitle(item.title);
    setType(item.type as 'workout' | 'meal');
    setDate(parse(item.date, 'yyyy-MM-dd', new Date()));
    setTime(item.time);
    setDuration(item.duration?.toString() || '');
    setCalories(item.calories?.toString() || '');
    setDifficulty(item.difficulty as 'easy' | 'medium' | 'hard' || 'medium');
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !time) return;

    const updates: Partial<PlannedItem> = {
      title,
      type,
      date: format(date, 'yyyy-MM-dd'),
      time,
      duration: duration ? parseInt(duration) : undefined,
      calories: calories ? parseInt(calories) : undefined,
      difficulty: type === 'workout' ? difficulty : undefined,
    };

    onUpdate(item.id, updates);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <Edit3 size={14} />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Planned Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter item title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value: 'workout' | 'meal') => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workout">Workout</SelectItem>
                <SelectItem value="meal">Meal</SelectItem>
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

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          {type === 'workout' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {type === 'meal' && (
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="400"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Update Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};