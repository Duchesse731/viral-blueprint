'use client';

import { useState } from 'react';
import { Storyboard } from '@/types/storyboard';
import { exportStoryboard, importStoryboard } from '@/lib/storage';
import { exportToPdf } from '@/lib/pdf';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download, Upload, FileJson, FileText, Check, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ExportMenuProps {
  storyboard: Storyboard;
  onImport: (storyboard: Storyboard) => void;
}

export function ExportMenu({ storyboard, onImport }: ExportMenuProps) {
  const [importOpen, setImportOpen] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportJson = () => {
    const json = exportStoryboard(storyboard);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storyboard.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_storyboard.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportToPdf(storyboard);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleImport = () => {
    setImportError(null);
    setImportSuccess(false);
    
    if (!importJson.trim()) {
      setImportError('Please paste the JSON content');
      return;
    }

    const imported = importStoryboard(importJson.trim());
    
    if (!imported) {
      setImportError('Invalid storyboard JSON format');
      return;
    }

    // Generate new IDs to avoid conflicts
    const newStoryboard: Storyboard = {
      ...imported,
      id: crypto.randomUUID(),
      title: `${imported.title} (Imported)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      panels: imported.panels.map((panel) => ({
        ...panel,
        id: crypto.randomUUID(),
      })),
    };

    onImport(newStoryboard);
    setImportSuccess(true);
    
    setTimeout(() => {
      setImportOpen(false);
      setImportJson('');
      setImportSuccess(false);
    }, 1000);
  };

  const handleOpenImport = () => {
    setImportOpen(true);
    setImportJson('');
    setImportError(null);
    setImportSuccess(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleExportJson} className="cursor-pointer">
            <FileJson className="mr-2 h-4 w-4" />
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportPdf} className="cursor-pointer" disabled={isExportingPdf}>
            {isExportingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleOpenImport} className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Import JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import Storyboard</DialogTitle>
            <DialogDescription>
              Paste the JSON content of a previously exported storyboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="import-json">JSON Content</Label>
              <Textarea
                id="import-json"
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='{"id": "...", "title": "...", ...}'
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            {importError && (
              <p className="text-sm text-destructive">{importError}</p>
            )}
            {importSuccess && (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Storyboard imported successfully!
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={importSuccess}>
              {importSuccess ? 'Imported!' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
