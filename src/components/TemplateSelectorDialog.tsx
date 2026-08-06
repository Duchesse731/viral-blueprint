'use client';

import { useState } from 'react';
import { PanelTemplate, PANEL_TEMPLATES } from '@/lib/templates';
import { generateId } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LayoutTemplate, Columns2, Rows2, Grid2x2, Smartphone } from 'lucide-react';

interface TemplateSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: PanelTemplate) => void;
  onStartBlank: () => void;
}

const templateIcons = {
  'single': LayoutTemplate,
  'horizontal-split': Columns2,
  'vertical-split': Rows2,
  'grid': Grid2x2,
};

export function TemplateSelectorDialog({
  open,
  onOpenChange,
  onSelectTemplate,
  onStartBlank,
}: TemplateSelectorDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<PanelTemplate | null>(null);

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onOpenChange(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Start Your Storyboard</DialogTitle>
          <DialogDescription>
            Choose a template to get started, or start with a blank canvas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Blank option */}
          <button
            onClick={() => setSelectedTemplate(null)}
            className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50 ${
              selectedTemplate === null
                ? 'border-primary bg-primary/5'
                : 'border-border'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Blank Canvas</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Start with an empty storyboard and add panels as you go.
            </p>
          </button>

          {/* Templates */}
          {PANEL_TEMPLATES.map((template) => {
            const Icon = templateIcons[template.layout] || LayoutTemplate;
            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50 ${
                  selectedTemplate?.id === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{template.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelect}>
            {selectedTemplate ? `Create ${selectedTemplate.panels} Panels` : 'Start Blank'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
