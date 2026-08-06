export interface SceneContent {
  description: string;
  dialogue: string;
  notes: string;
}

export interface Panel {
  id: string;
  order: number;
  imageUrl: string | null;
  prompt: string;
  sceneContent: SceneContent;
  isGenerating?: boolean;
  error?: string | null;
  aiProvider?: AIProvider;
}

export type AIProvider = 'openai' | 'openrouter' | 'replicate' | 'mock';

export interface AIProviderConfig {
  provider: AIProvider;
  model?: string;
}

export interface Storyboard {
  id: string;
  title: string;
  description: string;
  styleNotes: string;
  aiProvider: AIProvider;
  panels: Panel[];
  createdAt: string;
  updatedAt: string;
}

export interface StoryboardProject {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export const AI_PROVIDERS: Record<AIProvider, { name: string; models: string[] }> = {
  openai: {
    name: 'OpenAI DALL-E',
    models: ['dall-e-3', 'dall-e-2'],
  },
  openrouter: {
    name: 'OpenRouter (Flux)',
    models: ['black-forest-labs/flux-1-schnell', 'stability-ai/stable-diffusion-3-medium'],
  },
  replicate: {
    name: 'Replicate (SDXL)',
    models: ['stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89ad5decf85d1c5f76cad881c637e484a', 'stability-ai/sdxl'],
  },
  mock: {
    name: 'Mock (Demo)',
    models: ['mock-model'],
  },
};

export type CreateStoryboardInput = Pick<Storyboard, 'title' | 'description' | 'styleNotes' | 'aiProvider'>;
export type UpdateStoryboardInput = Partial<Omit<Storyboard, 'id' | 'createdAt'>>;
export type CreatePanelInput = Pick<Panel, 'prompt' | 'sceneContent' | 'aiProvider'>;
export type UpdatePanelInput = Partial<Omit<Panel, 'id'>>;
