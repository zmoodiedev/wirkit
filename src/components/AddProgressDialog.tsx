import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressEntry } from '@/hooks/useProgress';

interface AddProgressDialogProps {
  onAdd: (entry: Omit<ProgressEntry, 'id'>) => void;
  children?: React.ReactNode;
}

export const AddProgressDialog = ({ onAdd, children }: AddProgressDialogProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [arms, setArms] = useState('');
  const [thighs, setThighs] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setDate(new Date());
    setWeight('');
    setBodyFat('');
    setChest('');
    setWaist('');
    setArms('');
    setThighs('');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const entry: Omit<ProgressEntry, 'id'> = {
      date: format(date, 'yyyy-MM-dd'),
      weight: weight ? parseFloat(weight) : undefined,
      body_fat_percentage: bodyFat ? parseFloat(bodyFat) : undefined,
      chest_measurement: chest ? parseFloat(chest) : undefined,
      waist_measurement: waist ? parseFloat(waist) : undefined,
      arm_measurement: arms ? parseFloat(arms) : undefined,
      thigh_measurement: thighs ? parseFloat(thighs) : undefined,
      notes: notes || undefined
    };

    onAdd(entry);
    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus size={16} className="mr-2" />
            Add Progress
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Progress Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="165.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyFat">Body Fat (%)</Label>
              <Input
                id="bodyFat"
                type="number"
                step="0.1"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="12.5"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Body Measurements (inches)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chest" className="text-sm">Chest</Label>
                <Input
                  id="chest"
                  type="number"
                  step="0.1"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                  placeholder="42.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waist" className="text-sm">Waist</Label>
                <Input
                  id="waist"
                  type="number"
                  step="0.1"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  placeholder="32.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arms" className="text-sm">Arms</Label>
                <Input
                  id="arms"
                  type="number"
                  step="0.1"
                  value={arms}
                  onChange={(e) => setArms(e.target.value)}
                  placeholder="15.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thighs" className="text-sm">Thighs</Label>
                <Input
                  id="thighs"
                  type="number"
                  step="0.1"
                  value={thighs}
                  onChange={(e) => setThighs(e.target.value)}
                  placeholder="24.0"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling? Any observations..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};