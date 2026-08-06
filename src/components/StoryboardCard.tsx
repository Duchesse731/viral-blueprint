'use client';

import { Storyboard } from '@/types/storyboard';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';
import { Film, MoreHorizontal, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StoryboardCardProps {
  storyboard: Storyboard;
  onDelete: (id: string) => void;
}

export function StoryboardCard({ storyboard, onDelete }: StoryboardCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(storyboard.id);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-1 cursor-pointer hover:text-primary" onClick={() => router.push(`/storyboard/${storyboard.id}`)}>
            {storyboard.title || 'Untitled Storyboard'}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-destructive cursor-pointer" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
          onClick={() => router.push(`/storyboard/${storyboard.id}`)}
        >
          {storyboard.panels.length > 0 ? (
            <div className="grid grid-cols-2 gap-1 p-2 w-full h-full">
              {storyboard.panels.slice(0, 4).map((panel, index) => (
                <div key={panel.id} className="bg-muted-foreground/20 rounded overflow-hidden">
                  {panel.imageUrl ? (
                    <img src={panel.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
              ))}
              {storyboard.panels.length < 4 && Array.from({ length: 4 - storyboard.panels.length }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-muted/50 rounded" />
              ))}
            </div>
          ) : (
            <Film className="h-12 w-12 text-muted-foreground/30" />
          )}
        </div>
        {storyboard.description && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{storyboard.description}</p>
        )}
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        <span>{storyboard.panels.length} panels</span>
        <span className="mx-2">•</span>
        <span>Updated {formatRelativeTime(storyboard.updatedAt)}</span>
      </CardFooter>
    </Card>
  );
}
