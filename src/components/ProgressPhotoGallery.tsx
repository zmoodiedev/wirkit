import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Camera, Trash2, Edit3, ImageIcon } from 'lucide-react';
import { useProgressPhotos } from '@/hooks/useProgressPhotos';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const ProgressPhotoGallery = () => {
  const { photos, loading, deletePhoto } = useProgressPhotos();
  const { toast } = useToast();
  const [deletingPhoto, setDeletingPhoto] = useState<string | null>(null);

  const handleDeletePhoto = async () => {
    if (!deletingPhoto) return;

    try {
      await deletePhoto(deletingPhoto);
      toast({
        title: "Photo deleted",
        description: "Your progress photo has been removed."
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingPhoto(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <ImageIcon size={48} className="mx-auto text-muted-foreground mb-2" />
          <div className="text-muted-foreground">No progress photos yet</div>
          <div className="text-sm text-muted-foreground">Upload your first photo to start tracking visual progress</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {photos.slice(0, 6).map((photo) => (
          <div key={photo.id} className="group relative">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img 
                src={photo.photo_url} 
                alt={`Progress photo - ${photo.photo_type}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            
            {/* Overlay with photo info */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-between p-2">
              <div className="flex justify-between items-start">
                <Badge variant="secondary" className="text-xs">
                  {photo.photo_type}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-white hover:text-red-400"
                  onClick={() => setDeletingPhoto(photo.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
              
              <div className="text-white text-xs">
                <div>{format(new Date(photo.taken_at), 'MMM dd, yyyy')}</div>
                {photo.notes && (
                  <div className="truncate mt-1 opacity-80">{photo.notes}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {photos.length > 6 && (
        <div className="text-center mt-3">
          <Button variant="ghost" size="sm">
            View all {photos.length} photos
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPhoto} onOpenChange={(open) => !open && setDeletingPhoto(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Progress Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this progress photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePhoto} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProgressPhotoGallery;