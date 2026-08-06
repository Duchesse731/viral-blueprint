'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ShortcutItem {
  key: string;
  description: string;
}

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUTS: ShortcutItem[] = [
  { key: 'N', description: 'Add new panel' },
  { key: 'S', description: 'Open settings' },
  { key: 'E', description: 'Export storyboard' },
  { key: 'Esc', description: 'Close dialogs' },
  { key: '?', description: 'Show keyboard shortcuts' },
];

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-2 py-4">
            {SHORTCUTS.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between py-2 px-1 rounded hover:bg-muted/50"
              >
                <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
