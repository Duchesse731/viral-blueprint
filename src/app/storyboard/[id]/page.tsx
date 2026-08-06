'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Storyboard, Panel, AIProvider } from '@/types/storyboard';
import { loadStoryboard, saveStoryboard, reorderPanels } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { useHistory } from '@/lib/useHistory';
import { useKeyboardShortcuts } from '@/lib/useKeyboardShortcuts';
import { SortablePanelGrid } from '@/components/SortablePanelGrid';
import { PanelEditor } from '@/components/PanelEditor';
import { StoryboardSettings } from '@/components/StoryboardSettings';
import { ExportMenu } from '@/components/ExportMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ShareDialog } from '@/components/ShareDialog';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Undo2, Redo2, Share2 } from 'lucide-react';

export default function StoryboardEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPanel, setEditingPanel] = useState<Panel | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // History for undo/redo
  const history = useHistory<Storyboard | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const loaded = loadStoryboard(id);
    if (loaded) {
      setStoryboard(loaded);
      history.reset(loaded);
    }
    setIsLoading(false);
  }, [id]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'n', action: () => {
      const event = new CustomEvent('addPanel');
      window.dispatchEvent(event);
    }},
    { key: 's', action: () => setSettingsOpen(true) },
    { key: 'e', action: () => setShareOpen(true) },
    { key: '?', action: () => setShortcutsOpen(true) },
    { key: 'z', ctrl: true, action: () => history.undo() },
    { key: 'z', meta: true, action: () => history.undo() },
    { key: 'y', ctrl: true, action: () => history.redo() },
    { key: 'y', meta: true, action: () => history.redo() },
  ], !!storyboard);

  const handleSaveStoryboard = useCallback((updatedStoryboard: Storyboard) => {
    setStoryboard(updatedStoryboard);
    saveStoryboard(updatedStoryboard);
    history.setState(updatedStoryboard);
  }, [history]);

  const handleUpdatePanel = useCallback((panel: Panel) => {
    if (!storyboard) return;
    
    const updatedPanels = storyboard.panels.map((p) =>
      p.id === panel.id ? panel : p
    );
    
    const updatedStoryboard = {
      ...storyboard,
      panels: updatedPanels,
      updatedAt: new Date().toISOString(),
    };
    
    setStoryboard(updatedStoryboard);
    saveStoryboard(updatedStoryboard);
    history.setState(updatedStoryboard);
  }, [storyboard, history]);

  const handleGenerateImage = useCallback(async (panel: Panel, prompt: string, provider: AIProvider) => {
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, provider }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const data = await response.json();
      
      const updatedPanel: Panel = {
        ...panel,
        imageUrl: data.imageUrl,
        aiProvider: provider,
        isGenerating: false,
        error: null,
      };
      
      handleUpdatePanel(updatedPanel);
    } catch (error) {
      const updatedPanel: Panel = {
        ...panel,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Failed to generate image',
      };
      handleUpdatePanel(updatedPanel);
      throw error;
    }
  }, [handleUpdatePanel]);

  const handleAddPanel = useCallback(() => {
    if (!storyboard) return;
    
    const newPanel: Panel = {
      id: generateId(),
      order: storyboard.panels.length,
      imageUrl: null,
      prompt: '',
      sceneContent: {
        description: '',
        dialogue: '',
        notes: '',
      },
      aiProvider: storyboard.aiProvider || 'openai',
    };
    
    const updatedStoryboard = {
      ...storyboard,
      panels: [...storyboard.panels, newPanel],
      updatedAt: new Date().toISOString(),
    };
    
    setStoryboard(updatedStoryboard);
    saveStoryboard(updatedStoryboard);
    
    // Open editor for new panel
    setEditingPanel(newPanel);
    setEditorOpen(true);
  }, [storyboard]);

  const handleEditPanel = useCallback((panel: Panel) => {
    setEditingPanel(panel);
    setEditorOpen(true);
  }, []);

  const handlePanelsChange = useCallback((newPanels: Panel[]) => {
    if (!storyboard) return;
    
    const updatedStoryboard = {
      ...storyboard,
      panels: newPanels,
      updatedAt: new Date().toISOString(),
    };
    
    setStoryboard(updatedStoryboard);
    reorderPanels(storyboard.id, newPanels);
  }, [storyboard]);

  const handleSavePanelEditor = useCallback((panel: Panel) => {
    handleUpdatePanel(panel);
  }, [handleUpdatePanel]);

  const handleImport = useCallback((importedStoryboard: Storyboard) => {
    saveStoryboard(importedStoryboard);
    router.push('/');
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!storyboard) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Storyboard not found</h1>
        <Button onClick={() => router.push('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{storyboard.title || 'Untitled Storyboard'}</h1>
                <p className="text-sm text-muted-foreground">
                  {storyboard.panels.length} panel{storyboard.panels.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Undo/Redo */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (history.canUndo) {
                    history.undo();
                    const restored = history.state;
                    if (restored) {
                      setStoryboard(restored);
                      saveStoryboard(restored);
                    }
                  }
                }}
                disabled={!history.canUndo}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (history.canRedo) {
                    history.redo();
                    const restored = history.state;
                    if (restored) {
                      setStoryboard(restored);
                      saveStoryboard(restored);
                    }
                  }
                }}
                disabled={!history.canRedo}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
              
              {storyboard && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShortcutsOpen(true)}
                    title="Keyboard shortcuts (?)"
                  >
                    <span className="text-sm font-medium">?</span>
                  </Button>
                  <ThemeToggle />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShareOpen(true)}
                    className="gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <StoryboardSettings
                    storyboard={storyboard}
                    onSave={handleSaveStoryboard}
                  />
                  <ExportMenu storyboard={storyboard} onImport={handleImport} />
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <SortablePanelGrid
          panels={storyboard.panels.sort((a, b) => a.order - b.order)}
          onPanelsChange={handlePanelsChange}
          onEditPanel={handleEditPanel}
          onAddPanel={handleAddPanel}
        />
      </main>

      <PanelEditor
        panel={editingPanel}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={handleSavePanelEditor}
        onGenerateImage={handleGenerateImage}
        styleNotes={storyboard.styleNotes}
        defaultProvider={storyboard.aiProvider}
      />

      <ShareDialog
        storyboard={storyboard}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />

      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />
    </div>
  );
}
