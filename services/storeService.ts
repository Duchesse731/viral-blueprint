'use client';

import { CreatorProfile, Project, FreePlan, Platform, ContentGoal, ContentTone, AnalysisResult, ContentType } from '@/types';

// Storage keys
const STORAGE_KEYS = {
  PROFILE: 'viral-blueprint-profile',
  PROJECTS: 'viral-blueprint-projects',
  FREE_PLAN: 'viral-blueprint-free-plan',
  ONBOARDED: 'viral-blueprint-onboarded'
};

// Free users receive one successful analysis total.
export const FREE_ANALYSIS_LIMIT = 1;

const DEFAULT_FREE_PLAN: FreePlan = {
  totalAnalyses: FREE_ANALYSIS_LIMIT,
  usedAnalyses: 0
};

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Calculate expiration date (7 days from now)
function calculateExpiration(): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

// Profile management
export function getProfile(): CreatorProfile | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function saveProfile(profile: CreatorProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  localStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
}

export function isOnboarded(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
}

// Free plan management
export function getFreePlan(): FreePlan {
  if (typeof window === 'undefined') return DEFAULT_FREE_PLAN;
  
  const stored = localStorage.getItem(STORAGE_KEYS.FREE_PLAN);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as FreePlan;
      // Migrate older demo data that granted three free analyses.
      const normalizedPlan: FreePlan = {
        totalAnalyses: FREE_ANALYSIS_LIMIT,
        usedAnalyses: Math.min(parsed.usedAnalyses ?? 0, FREE_ANALYSIS_LIMIT)
      };
      if (
        parsed.totalAnalyses !== normalizedPlan.totalAnalyses ||
        parsed.usedAnalyses !== normalizedPlan.usedAnalyses
      ) {
        localStorage.setItem(STORAGE_KEYS.FREE_PLAN, JSON.stringify(normalizedPlan));
      }
      return normalizedPlan;
    } catch {
      return DEFAULT_FREE_PLAN;
    }
  }
  return DEFAULT_FREE_PLAN;
}

export function useAnalysis(): boolean {
  const plan = getFreePlan();
  if (plan.usedAnalyses < plan.totalAnalyses) {
    const updatedPlan = { ...plan, usedAnalyses: plan.usedAnalyses + 1 };
    localStorage.setItem(STORAGE_KEYS.FREE_PLAN, JSON.stringify(updatedPlan));
    return true;
  }
  return false;
}

export function getRemainingAnalyses(): number {
  const plan = getFreePlan();
  return Math.max(0, plan.totalAnalyses - plan.usedAnalyses);
}

// Projects management
export function getProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  if (stored) {
    try {
      const projects = JSON.parse(stored);
      // Permanently remove expired projects so the seven-day policy is real,
      // rather than only hiding expired records from the interface.
      const now = new Date();
      const activeProjects = projects.filter((p: Project) => new Date(p.expiresAt) > now);
      if (activeProjects.length !== projects.length) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(activeProjects));
      }
      return activeProjects;
    } catch {
      return [];
    }
  }
  return [];
}

export function getProject(id: string): Project | null {
  const projects = getProjects();
  return projects.find(p => p.id === id) || null;
}

export function createProject(data: {
  title: string;
  content: string;
  contentType: ContentType;
  targetPlatform: Platform;
  goal: ContentGoal;
  tone: ContentTone;
  targetAudience: string;
}): Project {
  const projects = getProjects();
  
  const newProject: Project = {
    id: generateId(),
    title: data.title,
    content: data.content,
    contentType: data.contentType,
    targetPlatform: data.targetPlatform,
    goal: data.goal,
    tone: data.tone,
    targetAudience: data.targetAudience,
    analysisResult: null,
    isAnalyzed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: calculateExpiration()
  };
  
  projects.push(newProject);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  
  return newProject;
}

export function updateProject(id: string, updates: Partial<Project>): Project | null {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date()
  };
  
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  return projects[index];
}

export function deleteProject(id: string): boolean {
  const projects = getProjects();
  const filtered = projects.filter(p => p.id !== id);
  
  if (filtered.length === projects.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
  return true;
}

export function duplicateProject(id: string): Project | null {
  const project = getProject(id);
  if (!project) return null;
  
  const projects = getProjects();
  
  const duplicated: Project = {
    ...project,
    id: generateId(),
    title: `${project.title} (Copy)`,
    isAnalyzed: false,
    analysisResult: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: calculateExpiration()
  };
  
  projects.push(duplicated);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  
  return duplicated;
}

export function saveAnalysisResult(projectId: string, result: AnalysisResult): Project | null {
  return updateProject(projectId, {
    analysisResult: result,
    isAnalyzed: true
  });
}

// Export project as JSON
export function exportProject(id: string): string | null {
  const project = getProject(id);
  if (!project) return null;
  
  return JSON.stringify(project, null, 2);
}

// Export report as text
export function exportReport(project: Project): string {
  const result = project.analysisResult;
  if (!result) return '';
  
  let report = `# Viral Blueprint Report\n`;
  report += `Generated: ${new Date(result.createdAt).toLocaleDateString()}\n`;
  report += `Expires: ${new Date(result.expiresAt).toLocaleDateString()}\n\n`;
  
  report += `## Original Submission\n`;
  report += `Title: ${project.title}\n`;
  report += `Platform: ${project.targetPlatform}\n`;
  report += `Goal: ${project.goal}\n`;
  report += `Content:\n${project.content}\n\n`;
  
  report += `## Overall Viral Score: ${result.overallScore}/100\n`;
  report += `Rating: ${result.overallLabel}\n\n`;
  
  report += `## Category Scores\n`;
  result.categoryScores.forEach(cat => {
    report += `- ${cat.name}: ${cat.score}/100\n`;
  });
  report += `\n`;
  
  report += `## Strengths\n`;
  result.strengths.forEach(s => {
    report += `- ${s}\n`;
  });
  report += `\n`;
  
  report += `## Areas for Improvement\n`;
  result.weaknesses.forEach(w => {
    report += `- ${w}\n`;
  });
  report += `\n`;
  
  report += `## Recommendations\n`;
  result.recommendedCorrections.forEach(r => {
    report += `- ${r}\n`;
  });
  report += `\n`;
  
  report += `## Improved Content\n`;
  report += `### Title\n${result.improvedTitle}\n\n`;
  report += `### Caption\n${result.caption}\n\n`;
  report += `### Call to Action\n${result.callToAction}\n\n`;
  report += `### Hashtags\n${result.hashtags.join(' ')}\n\n`;
  
  report += `## Publishing Checklist\n`;
  result.platformRecommendations.forEach(r => {
    report += `- [ ] ${r}\n`;
  });
  report += `\n`;
  
  report += `---\n`;
  report += `*This analysis is based on content structure and pattern recognition.`;
  report += `Actual viral performance depends on many factors including timing,`;
  report += `audience engagement, and platform algorithms.*\n`;
  
  return report;
}

// Clear all data
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.PROJECTS);
  localStorage.removeItem(STORAGE_KEYS.FREE_PLAN);
  localStorage.removeItem(STORAGE_KEYS.ONBOARDED);
}
