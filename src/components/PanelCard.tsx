'use client';

import { Panel } from '@/types/storyboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Edit2, Sparkles, GripVertical, ImageIcon } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';

interface PanelCardProps {
  panel: Panel;
  index: number;
  onEdit: (panel: Panel) => void;
}

export function PanelCard({ panel, index, onEdit }: PanelCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: panel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="relative group"
    >
      <Card
        className={cn(
          'overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-2',
          isDragging ? 'border-primary shadow-xl' : 'hover:border-primary/50'
        )}
        onClick={() => onEdit(panel)}
      >
        <CardContent className="p-0">
          <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
            {panel.imageUrl ? (
              <img
                src={panel.imageUrl}
                alt={panel.sceneContent.description || 'Panel image'}
                className="w-full h-full object-cover"
              />
            ) : panel.isGenerating ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-primary/5">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Generating...</span>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="h-10 w-10" />
                <span className="text-sm">Click to add image</span>
              </div>
            )}
            {panel.error && (
              <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center p-2">
                <span className="text-xs text-destructive text-center bg-background/90 px-2 py-1 rounded">
                  {panel.error}
                </span>
              </div>
            )}
          </div>
          {panel.sceneContent.description && (
            <div className="p-3">
              <p className="text-sm line-clamp-2 text-muted-foreground">
                {panel.sceneContent.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="absolute top-2 left-2 flex items-center gap-1">
        <div
          {...attributes}
          {...listeners}
          className="p-1.5 bg-background/80 backdrop-blur-sm rounded-md cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="px-1.5 py-1 bg-background/80 backdrop-blur-sm rounded text-xs font-medium text-muted-foreground">
          {index + 1}
        </span>
      </div>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(panel);
          }}
        >
          {panel.imageUrl ? <Edit2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </Button>
      </div>
    </motion.div>
  );
}
