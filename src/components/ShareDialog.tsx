'use client';

import { useState } from 'react';
import { Storyboard } from '@/types/storyboard';
import { exportStoryboard } from '@/lib/storage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Link, Check, Share2 } from 'lucide-react';

interface ShareDialogProps {
  storyboard: Storyboard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ storyboard, open, onOpenChange }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [copyJson, setCopyJson] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/storyboard/${storyboard.id}`
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyJson = async () => {
    try {
      const json = exportStoryboard(storyboard);
      await navigator.clipboard.writeText(json);
      setCopyJson(true);
      setTimeout(() => setCopyJson(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: storyboard.title || 'AI Storyboard',
          text: `Check out my storyboard: ${storyboard.title}`,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Failed to share:', err);
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Storyboard
          </DialogTitle>
          <DialogDescription>
            Share your storyboard with others or save it for later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Share Link */}
          <div className="space-y-2">
            <Label htmlFor="share-url">Share Link</Label>
            <div className="flex gap-2">
              <Input
                id="share-url"
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="secondary"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can view your storyboard
            </p>
          </div>

          {/* Copy as JSON */}
          <div className="space-y-2">
            <Label htmlFor="share-json">Copy as JSON</Label>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleCopyJson}
            >
              {copyJson ? (
                <Check className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copyJson ? 'Copied!' : 'Copy storyboard data'}
            </Button>
            <p className="text-xs text-muted-foreground">
              Copy the full storyboard data to import elsewhere
            </p>
          </div>

          {/* Native Share (mobile) */}
          {'share' in navigator && (
            <div className="space-y-2">
              <Label>Share via</Label>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleShare}
              >
                <Link className="mr-2 h-4 w-4" />
                Share...
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
