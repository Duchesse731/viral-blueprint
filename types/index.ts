// Platform types
export type Platform = 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'youtube-shorts';

// Content goals
export type ContentGoal = 'views' | 'engagement' | 'followers' | 'leads' | 'sales';

// Content types
export type ContentType = 'topic' | 'hook' | 'caption' | 'script' | 'transcript' | 'image' | 'video' | 'video-link';

// Tone options
export type ContentTone = 'professional' | 'casual' | 'humorous' | 'inspirational' | 'educational' | 'entertaining' | 'dramatic';

// Score labels
export type ScoreLabel = 'needs-major-improvement' | 'has-potential' | 'strong' | 'high-potential' | 'exceptional-potential';

// Creator profile
export interface CreatorProfile {
  name: string;
  niche: string;
  targetAudience: string;
  preferredPlatforms: Platform[];
  mainGoal: ContentGoal;
  preferredTone: ContentTone;
  email?: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
  };
}

// Category scores
export interface CategoryScore {
  name: string;
  score: number;
  label: ScoreLabel;
  evidence: string;
  working: string;
  needsImprovement: string;
}

// Analysis result schema
export interface AnalysisResult {
  overallScore: number;
  overallLabel: ScoreLabel;
  categoryScores: CategoryScore[];
  strengths: string[];
  weaknesses: string[];
  recommendedCorrections: string[];
  improvedHooks: string[];
  improvedTitle: string;
  improvedScript: string;
  caption: string;
  callToAction: string;
  visualRecommendations: string[];
  platformRecommendations: string[];
  hashtags: string[];
  confidenceNotes: string;
  createdAt: Date;
  expiresAt: Date;
}

// Analysis stages
export type AnalysisStage = 'content-review' | 'scoring' | 'recommendations';

// Project
export interface Project {
  id: string;
  title: string;
  content: string;
  contentType: ContentType;
  targetPlatform: Platform;
  goal: ContentGoal;
  tone: ContentTone;
  targetAudience: string;
  analysisResult: AnalysisResult | null;
  isAnalyzed: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

// Free plan
export interface FreePlan {
  totalAnalyses: number;
  usedAnalyses: number;
}

// Subscription plans
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  isActive: boolean;
  features: string[];
}

// App state
export interface AppState {
  isAuthenticated: boolean;
  creatorProfile: CreatorProfile | null;
  projects: Project[];
  currentProject: Project | null;
  freePlan: FreePlan;
  subscriptionPlan: SubscriptionPlan | null;
  isProcessing: boolean;
  analysisStage: AnalysisStage | null;
}

// Analysis input
export interface AnalysisInput {
  content: string;
  contentType: ContentType;
  targetPlatform: Platform;
  goal: ContentGoal;
  tone: ContentTone;
  targetAudience: string;
}

// Navigation items
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

// Toast notification
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
