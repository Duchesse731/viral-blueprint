'use client';

import { useState, useEffect } from 'react';
import { Storyboard } from '@/types/storyboard';
import { loadStoryboards, saveStoryboard, deleteStoryboard as deleteFromStorage } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { StoryboardCard } from '@/components/StoryboardCard';
import { CreateStoryboardDialog } from '@/components/CreateStoryboardDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Film } from 'lucide-react';

export default function Dashboard() {
  const [storyboards, setStoryboards] = useState<Storyboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loaded = loadStoryboards();
    setStoryboards(loaded.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ));
    setIsLoading(false);
  }, []);

  const handleCreate = async (title: string, description: string) => {
    const newStoryboard: Storyboard = {
      id: generateId(),
      title,
      description,
      styleNotes: '',
      aiProvider: 'openai',
      panels: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    saveStoryboard(newStoryboard);
    setStoryboards([newStoryboard, ...storyboards]);
  };

  const handleDelete = async (id: string) => {
    deleteFromStorage(id);
    setStoryboards(storyboards.filter((s) => s.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Film className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Storyboard</h1>
                <p className="text-sm text-muted-foreground">Create visual storyboards with AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <CreateStoryboardDialog onCreate={handleCreate} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {storyboards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 bg-muted rounded-full mb-6">
              <Film className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No storyboards yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first storyboard to start building visual narratives with AI-generated images.
            </p>
            <CreateStoryboardDialog
              onCreate={handleCreate}
              trigger={
                <Button size="lg" className="gap-2">
                  <Film className="h-5 w-5" />
                  Create Your First Storyboard
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">Your Storyboards</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {storyboards.map((storyboard) => (
                  <StoryboardCard
                    key={storyboard.id}
                    storyboard={storyboard}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
