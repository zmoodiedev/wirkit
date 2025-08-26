import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProgressPhotos } from '@/hooks/useProgressPhotos';

interface AddProgressPhotoDialogProps {
  onPhotoAdded?: () => void;
}

const AddProgressPhotoDialog = ({ onPhotoAdded }: AddProgressPhotoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [photoType, setPhotoType] = useState<'front' | 'side' | 'back' | 'other'>('front');
  const [notes, setNotes] = useState('');
  const [takenAt, setTakenAt] = useState(new Date().toISOString().split('T')[0]);
  const [uploading, setUploading] = useState(false);
  
  const { uploadPhoto } = useProgressPhotos();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      await uploadPhoto(file, photoType, notes || undefined, takenAt);
      
      toast({
        title: "Photo uploaded",
        description: "Your progress photo has been saved successfully."
      });

      // Reset form
      setFile(null);
      setPhotoType('front');
      setNotes('');
      setTakenAt(new Date().toISOString().split('T')[0]);
      setOpen(false);
      onPhotoAdded?.();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Camera className="mr-2 h-4 w-4" />
          Add Progress Photo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Progress Photo</DialogTitle>
          <DialogDescription>
            Upload a photo to track your fitness progress over time.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="photo">Photo</Label>
            <div className="flex items-center gap-4">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="flex-1"
                required
              />
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  {file.name}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo-type">Photo Type</Label>
            <Select value={photoType} onValueChange={(value: any) => setPhotoType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="front">Front View</SelectItem>
                <SelectItem value="side">Side View</SelectItem>
                <SelectItem value="back">Back View</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taken-at">Date Taken</Label>
            <Input
              id="taken-at"
              type="date"
              value={takenAt}
              onChange={(e) => setTakenAt(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this photo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file || uploading}>
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProgressPhotoDialog;