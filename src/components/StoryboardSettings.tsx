'use client';

import { Storyboard } from '@/types/storyboard';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, Palette, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StoryboardSettingsProps {
  storyboard: Storyboard;
  onSave: (storyboard: Storyboard) => void;
  trigger?: React.ReactNode;
}

export function StoryboardSettings({ storyboard, onSave, trigger }: StoryboardSettingsProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(storyboard.title);
  const [description, setDescription] = useState(storyboard.description);
  const [styleNotes, setStyleNotes] = useState(storyboard.styleNotes);

  useEffect(() => {
    setTitle(storyboard.title);
    setDescription(storyboard.description);
    setStyleNotes(storyboard.styleNotes);
  }, [storyboard]);

  const handleSave = () => {
    const updatedStoryboard: Storyboard = {
      ...storyboard,
      title,
      description,
      styleNotes,
      updatedAt: new Date().toISOString(),
    };
    onSave(updatedStoryboard);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Storyboard Settings
          </SheetTitle>
          <SheetDescription>
            Manage your storyboard metadata and visual style preferences.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100%-8rem)] -mx-6 px-6">
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="settings-title">Title</Label>
              <Input
                id="settings-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Storyboard"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-description">Description</Label>
              <Textarea
                id="settings-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of your storyboard..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="settings-style">Visual Style Notes</Label>
              </div>
              <Textarea
                id="settings-style"
                value={styleNotes}
                onChange={(e) => setStyleNotes(e.target.value)}
                placeholder="E.g., 'Cinematic, warm lighting, 35mm film grain. Character designs should be minimalist with bold outlines.'"
                rows={4}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                These notes will be included with each AI image generation prompt to maintain visual consistency.
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
