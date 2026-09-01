'use client';

import type { Project } from '@/types';
import { getSupabaseClient } from '@/services/supabaseClient';

type CloudProject = {
  id: string;
  title: string;
  content: string;
  content_type: string;
  target_platform: string;
  goal: string;
  tone: string;
  target_audience: string;
  analysis_result: Project['analysisResult'];
  is_analyzed: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string;
};

function toProject(row: CloudProject): Project {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    contentType: row.content_type as Project['contentType'],
    targetPlatform: row.target_platform as Project['targetPlatform'],
    goal: row.goal as Project['goal'],
    tone: row.tone as Project['tone'],
    targetAudience: row.target_audience,
    analysisResult: row.analysis_result,
    isAnalyzed: row.is_analyzed,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    expiresAt: new Date(row.expires_at),
  };
}

function toRow(project: Project) {
  return {
    id: project.id,
    title: project.title,
    content: project.content,
    content_type: project.contentType,
    target_platform: project.targetPlatform,
    goal: project.goal,
    tone: project.tone,
    target_audience: project.targetAudience,
    analysis_result: project.analysisResult,
    is_analyzed: project.isAnalyzed,
  };
}

export async function loadCloudProjects(): Promise<Project[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('viral_blueprint_projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error || !data) return null;
  return (data as CloudProject[]).map(toProject);
}

export async function saveCloudProject(project: Project): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from('viral_blueprint_projects')
    .upsert(toRow(project), { onConflict: 'id' });

  return !error;
}

export async function removeCloudProject(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from('viral_blueprint_projects')
    .delete()
    .eq('id', id);

  return !error;
}
