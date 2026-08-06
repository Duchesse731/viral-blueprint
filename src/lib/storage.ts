import { Storyboard, Panel } from '@/types/storyboard';

const STORAGE_KEY = 'ai-storyboard-data';

export interface StorageData {
  storyboards: Storyboard[];
}

function getStorageData(): StorageData {
  if (typeof window === 'undefined') {
    return { storyboards: [] };
  }
  
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return { storyboards: [] };
  }
  
  try {
    return JSON.parse(data);
  } catch {
    return { storyboards: [] };
  }
}

function setStorageData(data: StorageData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveStoryboard(storyboard: Storyboard): void {
  const data = getStorageData();
  const existingIndex = data.storyboards.findIndex((s) => s.id === storyboard.id);
  
  if (existingIndex >= 0) {
    data.storyboards[existingIndex] = { ...storyboard, updatedAt: new Date().toISOString() };
  } else {
    data.storyboards.push({
      ...storyboard,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  
  setStorageData(data);
}

export function loadStoryboards(): Storyboard[] {
  return getStorageData().storyboards;
}

export function loadStoryboard(id: string): Storyboard | null {
  const data = getStorageData();
  return data.storyboards.find((s) => s.id === id) || null;
}

export function deleteStoryboard(id: string): void {
  const data = getStorageData();
  data.storyboards = data.storyboards.filter((s) => s.id !== id);
  setStorageData(data);
}

export function updatePanel(storyboardId: string, panel: Panel): void {
  const data = getStorageData();
  const storyboard = data.storyboards.find((s) => s.id === storyboardId);
  
  if (!storyboard) return;
  
  const panelIndex = storyboard.panels.findIndex((p) => p.id === panel.id);
  
  if (panelIndex >= 0) {
    storyboard.panels[panelIndex] = panel;
  } else {
    storyboard.panels.push(panel);
  }
  
  storyboard.updatedAt = new Date().toISOString();
  setStorageData(data);
}

export function reorderPanels(storyboardId: string, panels: Panel[]): void {
  const data = getStorageData();
  const storyboard = data.storyboards.find((s) => s.id === storyboardId);
  
  if (!storyboard) return;
  
  storyboard.panels = panels.map((panel, index) => ({ ...panel, order: index }));
  storyboard.updatedAt = new Date().toISOString();
  setStorageData(data);
}

export function exportStoryboard(storyboard: Storyboard): string {
  return JSON.stringify(storyboard, null, 2);
}

export function importStoryboard(jsonString: string): Storyboard | null {
  try {
    const data = JSON.parse(jsonString);
    if (data.id && data.title && Array.isArray(data.panels)) {
      return data as Storyboard;
    }
    return null;
  } catch {
    return null;
  }
}
