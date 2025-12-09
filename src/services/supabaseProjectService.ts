import { supabase } from './supabaseClient';
import { Project, ProjectMetadata, ProjectOperationResult } from '../types/project';
import { ExternalLibrary } from './externalLibraryService';

/**
 * Supabase Project Service
 * Handles cloud storage of projects for authenticated users
 */

export interface SupabaseProject {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    html: string;
    css: string;
    javascript: string;
    external_libraries: ExternalLibrary[];
    settings: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

class SupabaseProjectService {
    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        return !!user;
    }

    /**
     * Get current user ID
     */
    async getCurrentUserId(): Promise<string | null> {
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id ?? null;
    }

    /**
     * Create a new project in Supabase
     */
    async createProject(
        name: string,
        html: string = '',
        css: string = '',
        javascript: string = '',
        externalLibraries: ExternalLibrary[] = [],
        description: string = ''
    ): Promise<ProjectOperationResult> {
        try {
            const userId = await this.getCurrentUserId();
            if (!userId) {
                return { success: false, error: 'User not authenticated' };
            }

            const { data, error } = await supabase
                .from('projects')
                .insert({
                    user_id: userId,
                    name,
                    description,
                    html,
                    css,
                    javascript,
                    external_libraries: externalLibraries,
                    settings: { autoSaveEnabled: true, theme: 'dark', editorFontSize: 14 }
                })
                .select()
                .single();

            if (error) {
                console.error('Supabase create project error:', error);
                return { success: false, error: error.message };
            }

            return { success: true, projectId: data.id };
        } catch (error) {
            console.error('Create project error:', error);
            return { success: false, error: 'Failed to create project' };
        }
    }

    /**
     * Save/update an existing project in Supabase
     */
    async saveProject(project: Project): Promise<ProjectOperationResult> {
        try {
            const userId = await this.getCurrentUserId();
            if (!userId) {
                return { success: false, error: 'User not authenticated' };
            }

            const { error } = await supabase
                .from('projects')
                .update({
                    name: project.name,
                    html: project.html,
                    css: project.css,
                    javascript: project.javascript,
                    external_libraries: project.externalLibraries || [],
                    updated_at: new Date().toISOString()
                })
                .eq('id', project.id)
                .eq('user_id', userId);

            if (error) {
                console.error('Supabase save project error:', error);
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error) {
            console.error('Save project error:', error);
            return { success: false, error: 'Failed to save project' };
        }
    }

    /**
     * Load a project from Supabase
     */
    async loadProject(id: string): Promise<Project | null> {
        try {
            const userId = await this.getCurrentUserId();
            if (!userId) return null;

            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .eq('user_id', userId)
                .is('deleted_at', null)
                .single();

            if (error || !data) {
                console.error('Supabase load project error:', error);
                return null;
            }

            return this.mapToProject(data);
        } catch (error) {
            console.error('Load project error:', error);
            return null;
        }
    }

    /**
     * List all projects for the current user
     */
    async listProjects(): Promise<ProjectMetadata[]> {
        try {
            const userId = await this.getCurrentUserId();
            if (!userId) return [];

            const { data, error } = await supabase
                .from('projects')
                .select('id, name, created_at, updated_at')
                .eq('user_id', userId)
                .is('deleted_at', null)
                .order('updated_at', { ascending: false });

            if (error) {
                console.error('Supabase list projects error:', error);
                return [];
            }

            return data.map(p => ({
                id: p.id,
                name: p.name,
                createdAt: p.created_at,
                updatedAt: p.updated_at
            }));
        } catch (error) {
            console.error('List projects error:', error);
            return [];
        }
    }

    /**
     * Delete a project (soft delete)
     */
    async deleteProject(id: string): Promise<ProjectOperationResult> {
        try {
            const userId = await this.getCurrentUserId();
            if (!userId) {
                return { success: false, error: 'User not authenticated' };
            }

            const { error } = await supabase
                .from('projects')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id)
                .eq('user_id', userId);

            if (error) {
                console.error('Supabase delete project error:', error);
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error) {
            console.error('Delete project error:', error);
            return { success: false, error: 'Failed to delete project' };
        }
    }

    /**
     * Duplicate a project
     */
    async duplicateProject(id: string, newName?: string): Promise<ProjectOperationResult> {
        try {
            const original = await this.loadProject(id);
            if (!original) {
                return { success: false, error: 'Project not found' };
            }

            return await this.createProject(
                newName || `${original.name} (Copy)`,
                original.html,
                original.css,
                original.javascript,
                original.externalLibraries || []
            );
        } catch (error) {
            console.error('Duplicate project error:', error);
            return { success: false, error: 'Failed to duplicate project' };
        }
    }

    /**
     * Update project name
     */
    async updateProjectName(id: string, name: string): Promise<ProjectOperationResult> {
        try {
            const userId = await this.getCurrentUserId();
            if (!userId) {
                return { success: false, error: 'User not authenticated' };
            }

            const { error } = await supabase
                .from('projects')
                .update({ name, updated_at: new Date().toISOString() })
                .eq('id', id)
                .eq('user_id', userId);

            if (error) {
                console.error('Supabase update project name error:', error);
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error) {
            console.error('Update project name error:', error);
            return { success: false, error: 'Failed to update project name' };
        }
    }

    /**
     * Sync local project to Supabase (upload)
     */
    async syncProjectToCloud(project: Project): Promise<ProjectOperationResult> {
        try {
            const userId = await this.getCurrentUserId();
            if (!userId) {
                return { success: false, error: 'User not authenticated' };
            }

            // Check if project already exists in cloud
            const { data: existing } = await supabase
                .from('projects')
                .select('id')
                .eq('id', project.id)
                .eq('user_id', userId)
                .single();

            if (existing) {
                // Update existing
                return await this.saveProject(project);
            } else {
                // Create new with specific ID
                const { error } = await supabase
                    .from('projects')
                    .insert({
                        id: project.id,
                        user_id: userId,
                        name: project.name,
                        html: project.html,
                        css: project.css,
                        javascript: project.javascript,
                        external_libraries: project.externalLibraries || [],
                        settings: { autoSaveEnabled: true, theme: 'dark', editorFontSize: 14 },
                        created_at: project.createdAt || new Date().toISOString()
                    });

                if (error) {
                    // If ID conflict, create with new ID
                    if (error.code === '23505') {
                        return await this.createProject(
                            project.name,
                            project.html,
                            project.css,
                            project.javascript,
                            project.externalLibraries || []
                        );
                    }
                    return { success: false, error: error.message };
                }

                return { success: true, projectId: project.id };
            }
        } catch (error) {
            console.error('Sync project error:', error);
            return { success: false, error: 'Failed to sync project' };
        }
    }

    /**
     * Fetch all cloud projects to local
     */
    async fetchAllCloudProjects(): Promise<Project[]> {
        try {
            const userId = await this.getCurrentUserId();
            if (!userId) return [];

            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', userId)
                .is('deleted_at', null)
                .order('updated_at', { ascending: false });

            if (error) {
                console.error('Fetch cloud projects error:', error);
                return [];
            }

            return data.map(p => this.mapToProject(p));
        } catch (error) {
            console.error('Fetch cloud projects error:', error);
            return [];
        }
    }

    /**
     * Map Supabase project to local Project type
     */
    private mapToProject(data: SupabaseProject): Project {
        return {
            id: data.id,
            name: data.name,
            html: data.html || '',
            css: data.css || '',
            javascript: data.javascript || '',
            externalLibraries: data.external_libraries || [],
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    }
}

// Export singleton instance  
export const supabaseProjectService = new SupabaseProjectService();
