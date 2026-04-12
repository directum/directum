import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CollectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  collection?: {
    id: string;
    name: string;
    description: string;
    is_public: boolean;
  };
}

export const CollectionForm: React.FC<CollectionFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  collection,
}) => {
  const { toast } = useToast();
  const [name, setName] = useState(collection?.name || '');
  const [description, setDescription] = useState(collection?.description || '');
  const [isPublic, setIsPublic] = useState(collection?.is_public ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Collection name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a collection",
          variant: "destructive",
        });
        return;
      }

      if (collection) {
        // Update existing collection
        const { error } = await supabase
          .from('collections')
          .update({
            name: name.trim(),
            description: description.trim() || null,
            is_public: isPublic,
          })
          .eq('id', collection.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Collection updated successfully",
        });
      } else {
        // Create new collection
        const { error } = await supabase
          .from('collections')
          .insert({
            name: name.trim(),
            description: description.trim() || null,
            is_public: isPublic,
            user_id: user.id,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Collection created successfully",
        });
      }

      onSuccess();
      onClose();
      setName('');
      setDescription('');
      setIsPublic(true);
    } catch (error) {
      console.error('Error saving collection:', error);
      toast({
        title: "Error Saving Collection",
        description: error.message || "Failed to save collection",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {collection ? 'Edit Collection' : 'Create New Collection'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Bots"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A collection of my favorite Discord bots..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="is-public">Make this collection public</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : collection ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};