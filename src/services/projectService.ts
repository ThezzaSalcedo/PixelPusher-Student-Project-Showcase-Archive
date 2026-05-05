// src/services/projectService.ts
import supabase from '../lib/supabase';
import type { Project, ProjectAttachment, Contributor } from '../types/project';

interface FetchOptions {
  status?: string;
  limit?: number;
}

// ====================== FETCH FUNCTIONS ======================

export const fetchProjects = async (options: FetchOptions = {}) => {
  let query = supabase
    .from('projects')
    .select(`
      *,
      contributors(*),
      attachments(*)
    `)
    .order('created_at', { ascending: false });

  if (options.status) query = query.eq('status', options.status);
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) console.error('fetchProjects:', error);
  return data || [];
};

export const fetchStudentProjects = async (userId: string) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      contributors(*),
      attachments(*)
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false });

  if (error) console.error('fetchStudentProjects:', error);
  return data || [];
};

export const fetchPendingProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      contributors(*),
      attachments(*)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) console.error('fetchPendingProjects:', error);
  return data || [];
};

export const fetchBookmarkedProjects = async (userId: string) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      project:projects (
        *,
        contributors(*),
        attachments(*)
      )
    `)
    .eq('user_id', userId);

  if (error) console.error('fetchBookmarkedProjects:', error);
  return (data || []).map((b: any) => b.project).filter(Boolean);
};

export const fetchVersionHistory = async (versionGroupId: string) => {
  if (!versionGroupId) return [];
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      contributors(*),
      attachments(*)
    `)
    .eq('version_group_id', versionGroupId)
    .order('version_number', { ascending: true });

  if (error) console.error('fetchVersionHistory:', error);
  return data || [];
};

// ====================== MUTATION FUNCTIONS ======================

export const createProject = async (projectData: any) => {
  const { data, error } = await supabase
    .from('projects')
    .insert(projectData)
    .select()
    .single();

  if (error) {
    console.error('createProject error:', error);
    return null;
  }
  return data;
};

export const createProjectVersion = async (
  baseId: number, 
  newVersionData: any, 
  userId?: string
) => {
  // Mark previous versions in the same group as not latest
  const { error: updateError } = await supabase
    .from('projects')
    .update({ is_latest_version: false })
    .eq('version_group_id', newVersionData.version_group_id);

  if (updateError) {
    console.error('Failed to update previous versions:', updateError);
  }

  // Insert new version
  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...newVersionData,
      version_number: newVersionData.version_number || 2,
      is_latest_version: true,
    })
    .select()
    .single();

  if (error) {
    console.error('createProjectVersion error:', error);
    return null;
  }
  return data;
};

export const updateProject = async (projectId: number, updates: any) => {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('updateProject error:', error);
    return null;
  }
  return data;
};

export const deleteProject = async (projectId: number) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    console.error('deleteProject error:', error);
    return false;
  }
  return true;
};

export const approveProject = async (projectId: number) => {
  const { data, error } = await supabase
    .from('projects')
    .update({ status: 'approved' })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('approveProject error:', error);
    return null;
  }
  return data;
};

export const rejectProject = async (projectId: number) => {
  const { data, error } = await supabase
    .from('projects')
    .update({ status: 'rejected' })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('rejectProject error:', error);
    return null;
  }
  return data;
};

export const toggleBookmark = async (projectId: number, userId: string) => {
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('bookmarks')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);
  } else {
    await supabase
      .from('bookmarks')
      .insert({ project_id: projectId, user_id: userId });
  }
};

export const sendContactMessage = async (
  senderId: string,
  recipientEmail: string,
  projectId: number,
  message: string
) => {
  console.log('Contact Message Sent:', { senderId, recipientEmail, projectId, message });
  // Optional: Save to messages table later
  return true;
};