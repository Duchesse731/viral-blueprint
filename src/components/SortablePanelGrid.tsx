'use client';

import { useState } from 'react';
import { Panel } from '@/types/storyboard';
import { PanelCard } from './PanelCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';

interface SortablePanelGridProps {
  panels: Panel[];
  onPanelsChange: (panels: Panel[]) => void;
  onEditPanel: (panel: Panel) => void;
  onAddPanel: () => void;
}

export function SortablePanelGrid({
  panels,
  onPanelsChange,
  onEditPanel,
  onAddPanel,
}: SortablePanelGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = panels.findIndex((p) => p.id === active.id);
      const newIndex = panels.findIndex((p) => p.id === over.id);
      
      const newPanels = arrayMove(panels, oldIndex, newIndex).map((panel, index) => ({
        ...panel,
        order: index,
      }));
      
      onPanelsChange(newPanels);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Panels</h2>
          <span className="text-sm text-muted-foreground">({panels.length})</span>
        </div>
        <Button onClick={onAddPanel} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Panel
        </Button>
      </div>

      {panels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Grid3X3 className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">No panels yet</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
            Start building your storyboard by adding panels. Each panel can have an AI-generated image and scene content.
          </p>
          <Button onClick={onAddPanel} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Panel
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={panels.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {panels.map((panel, index) => (
                  <PanelCard
                    key={panel.id}
                    panel={panel}
                    index={index}
                    onEdit={onEditPanel}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
