import { Panel } from '@/types/storyboard';

export interface PanelTemplate {
  id: string;
  name: string;
  description: string;
  aspectRatio: 'square' | 'landscape' | 'portrait' | 'ultrawide';
  layout: 'single' | 'horizontal-split' | 'vertical-split' | 'grid';
  panels: number;
}

export const PANEL_TEMPLATES: PanelTemplate[] = [
  {
    id: 'single-square',
    name: 'Single Square',
    description: 'Classic 1:1 aspect ratio, perfect for social media',
    aspectRatio: 'square',
    layout: 'single',
    panels: 1,
  },
  {
    id: 'single-landscape',
    name: 'Single Landscape',
    description: '16:9 cinematic format for video content',
    aspectRatio: 'landscape',
    layout: 'single',
    panels: 1,
  },
  {
    id: 'single-portrait',
    name: 'Single Portrait',
    description: '9:16 vertical format for mobile stories',
    aspectRatio: 'portrait',
    layout: 'single',
    panels: 1,
  },
  {
    id: 'storyboard-horizontal',
    name: 'Storyboard (Horizontal)',
    description: 'Traditional horizontal panels, 2:3 aspect ratio each',
    aspectRatio: 'landscape',
    layout: 'horizontal-split',
    panels: 6,
  },
  {
    id: 'storyboard-vertical',
    name: 'Storyboard (Vertical)',
    description: 'Vertical panels for mobile-first content',
    aspectRatio: 'portrait',
    layout: 'vertical-split',
    panels: 6,
  },
  {
    id: 'grid-2x2',
    name: 'Grid 2×2',
    description: 'Four equal panels in a grid',
    aspectRatio: 'square',
    layout: 'grid',
    panels: 4,
  },
  {
    id: 'grid-3x3',
    name: 'Grid 3×3',
    description: 'Nine equal panels in a grid',
    aspectRatio: 'square',
    layout: 'grid',
    panels: 9,
  },
];

export function createPanelsFromTemplate(template: PanelTemplate): Omit<Panel, 'id'>[] {
  return Array.from({ length: template.panels }, (_, i) => ({
    order: i,
    imageUrl: null,
    prompt: '',
    sceneContent: {
      description: '',
      dialogue: '',
      notes: '',
    },
  }));
}
