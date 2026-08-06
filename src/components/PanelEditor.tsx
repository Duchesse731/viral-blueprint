'use client';

import { useState, useEffect } from 'react';
import { Panel, SceneContent, AIProvider, AI_PROVIDERS } from '@/types/storyboard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Loader2, AlertCircle, ImageIcon, Bot } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PanelEditorProps {
  panel: Panel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (panel: Panel) => void;
  onGenerateImage: (panel: Panel, prompt: string, provider: AIProvider) => Promise<void>;
  styleNotes: string;
  defaultProvider?: AIProvider;
}

export function PanelEditor({
  panel,
  open,
  onOpenChange,
  onSave,
  onGenerateImage,
  styleNotes,
  defaultProvider = 'openai',
}: PanelEditorProps) {
  const [prompt, setPrompt] = useState('');
  const [sceneContent, setSceneContent] = useState<SceneContent>({
    description: '',
    dialogue: '',
    notes: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(defaultProvider);

  useEffect(() => {
    if (panel) {
      setPrompt(panel.prompt);
      setSceneContent(panel.sceneContent);
      setError(panel.error || null);
      setSelectedProvider(panel.aiProvider || defaultProvider);
    }
  }, [panel, defaultProvider]);

  if (!panel) return null;

  const providerName = AI_PROVIDERS[selectedProvider]?.name || 'AI';

  const handleSave = () => {
    const updatedPanel: Panel = {
      ...panel,
      prompt,
      sceneContent,
      aiProvider: selectedProvider,
      error: null,
    };
    onSave(updatedPanel);
    onOpenChange(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const fullPrompt = styleNotes
      ? `${prompt}\n\nVisual style notes: ${styleNotes}`
      : prompt;

    const updatedPanel: Panel = {
      ...panel,
      prompt,
      sceneContent,
      aiProvider: selectedProvider,
      isGenerating: true,
      error: null,
    };
    onSave(updatedPanel);

    try {
      await onGenerateImage(updatedPanel, fullPrompt, selectedProvider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
      const errorPanel: Panel = {
        ...panel,
        prompt,
        sceneContent,
        aiProvider: selectedProvider,
        isGenerating: false,
        error: err instanceof Error ? err.message : 'Failed to generate image',
      };
      onSave(errorPanel);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Edit Panel
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* Image Preview */}
            <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden flex items-center justify-center">
              {panel.imageUrl ? (
                <img
                  src={panel.imageUrl}
                  alt="Panel preview"
                  className="w-full h-full object-contain"
                />
              ) : panel.isGenerating ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Generating your image...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-12 w-12" />
                  <span className="text-sm">No image generated yet</span>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* AI Provider Selector */}
            <div className="space-y-2">
              <Label htmlFor="provider">AI Provider</Label>
              <Select value={selectedProvider} onValueChange={(v) => setSelectedProvider(v as AIProvider)}>
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Select AI provider" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AI_PROVIDERS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        {config.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AI Prompt Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="prompt">AI Image Prompt</Label>
                <span className="text-xs text-muted-foreground">{providerName}</span>
              </div>
              <Textarea
                id="prompt"
                placeholder="Describe the visual you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                disabled={isGenerating}
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Image
                  </>
                )}
              </Button>
            </div>

            {/* Scene Content */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Scene Content</h3>
              
              <div className="space-y-2">
                <Label htmlFor="description">Scene Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what happens in this scene..."
                  value={sceneContent.description}
                  onChange={(e) =>
                    setSceneContent({ ...sceneContent, description: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dialogue">Dialogue / Text</Label>
                <Textarea
                  id="dialogue"
                  placeholder="Character dialogue or on-screen text..."
                  value={sceneContent.dialogue}
                  onChange={(e) =>
                    setSceneContent({ ...sceneContent, dialogue: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Production Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Camera angles, lighting, timing notes..."
                  value={sceneContent.notes}
                  onChange={(e) =>
                    setSceneContent({ ...sceneContent, notes: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
