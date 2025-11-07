import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Save } from "lucide-react";

interface CardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: {
    _id?: string;
    title: string;
    description?: string;
    tags?: string[];
  } | null;
  onSave: (data: { title: string; description: string; tags: string[] }) => void;
  onDelete?: () => void;
  mode: 'create' | 'edit';
}

export function CardDialog({ open, onOpenChange, card, onSave, onDelete, mode }: CardDialogProps) {
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [tags, setTags] = useState(card?.tags?.join(', ') || '');

  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setDescription(card.description || '');
      setTags(card.tags?.join(', ') || '');
    } else {
      setTitle('');
      setDescription('');
      setTags('');
    }
  }, [card, open]);

  const handleSave = () => {
    if (!title.trim()) return;
    
    onSave({
      title: title.trim(),
      description: description.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900/95 to-black/95 border border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            {mode === 'create' ? '✨ Create New Card' : '✏️ Edit Card'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white/90">Card Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card title..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-indigo-500/50"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white/90">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-indigo-500/50 min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-white/90">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="urgent, design, frontend"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-indigo-500/50"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {mode === 'edit' && onDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white/5 hover:bg-white/10 border-white/10 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim()}
              className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white border-0"
            >
              <Save className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
