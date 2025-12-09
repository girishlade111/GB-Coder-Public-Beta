import { useState, useEffect, useCallback } from 'react';
import { Project, ProjectMetadata } from '../types/project';
import { projectStore } from '../services/projectStore';
import { supabaseProjectService } from '../services/supabaseProjectService';
import { useAuth } from '../contexts/AuthContext';
import { ExternalLibrary } from '../services/externalLibraryService';

interface UseProjectReturn {
    currentProject: Project | null;
    projectList: ProjectMetadata[];
    isLoading: boolean;
    isSaving: boolean;
    isSyncing: boolean;
    createNewProject: (name: string) => Promise<boolean>;
    saveCurrentProject: () => Promise<boolean>;
    duplicateCurrentProject: () => Promise<boolean>;
    switchProject: (id: string) => Promise<boolean>;
    updateProjectName: (name: string) => Promise<boolean>;
    updateProjectCode: (html: string, css: string, javascript: string) => void;
    updateExternalLibraries: (libraries: ExternalLibrary[]) => void;
    deleteProject: (id: string) => Promise<boolean>;
    refreshProjectList: () => void;
    syncToCloud: () => Promise<boolean>;
}

/**
 * React hook for managing projects
 * Provides state management and operations for the active project
 * Syncs to Supabase for authenticated users
 */
export function useProject(
    initialHtml: string = '',
    initialCss: string = '',
    initialJavascript: string = '',
    initialLibraries: ExternalLibrary[] = []
): UseProjectReturn {
    const { user } = useAuth();
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [projectList, setProjectList] = useState<ProjectMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const isAuthenticated = !!user;

    /**
     * Load the active project or create default
     */
    const loadActiveProject = useCallback(async () => {
        setIsLoading(true);
        try {
            if (isAuthenticated) {
                // Try to load from Supabase first
                const cloudProjects = await supabaseProjectService.listProjects();
                if (cloudProjects.length > 0) {
                    const project = await supabaseProjectService.loadProject(cloudProjects[0].id);
                    if (project) {
                        setCurrentProject(project);
                        console.log('Loaded cloud project:', project.name);
                        return;
                    }
                }
            }

            // Fall back to local storage
            const project = projectStore.initializeDefaultProject(
                initialHtml,
                initialCss,
                initialJavascript,
                initialLibraries
            );
            setCurrentProject(project);
            console.log('Loaded local project:', project.name);
        } catch (error) {
            console.error('Failed to load active project:', error);
            // Fall back to local
            const project = projectStore.initializeDefaultProject(
                initialHtml,
                initialCss,
                initialJavascript,
                initialLibraries
            );
            setCurrentProject(project);
        } finally {
            setIsLoading(false);
        }
    }, [initialHtml, initialCss, initialJavascript, initialLibraries, isAuthenticated]);

    /**
     * Refresh the project list
     */
    const refreshProjectList = useCallback(async () => {
        try {
            if (isAuthenticated) {
                // Load from Supabase
                const cloudList = await supabaseProjectService.listProjects();
                // Also get local projects
                const localList = projectStore.listProjects();

                // Merge lists, preferring cloud projects
                const cloudIds = new Set(cloudList.map(p => p.id));
                const mergedList = [
                    ...cloudList,
                    ...localList.filter(p => !cloudIds.has(p.id))
                ];
                setProjectList(mergedList);
            } else {
                // Only local projects when not authenticated
                const list = projectStore.listProjects();
                setProjectList(list);
            }
        } catch (error) {
            console.error('Failed to refresh project list:', error);
            // Fall back to local
            const list = projectStore.listProjects();
            setProjectList(list);
        }
    }, [isAuthenticated]);

    /**
     * Sync current project to cloud
     */
    const syncToCloud = useCallback(async (): Promise<boolean> => {
        if (!isAuthenticated || !currentProject) {
            return false;
        }

        setIsSyncing(true);
        try {
            const result = await supabaseProjectService.syncProjectToCloud(currentProject);
            if (result.success) {
                console.log('Project synced to cloud:', currentProject.name);
                await refreshProjectList();
                return true;
            }
            console.error('Sync failed:', result.error);
            return false;
        } catch (error) {
            console.error('Sync error:', error);
            return false;
        } finally {
            setIsSyncing(false);
        }
    }, [isAuthenticated, currentProject, refreshProjectList]);

    /**
     * Initialize on mount and when auth state changes
     */
    useEffect(() => {
        loadActiveProject();
        refreshProjectList();
    }, [loadActiveProject, refreshProjectList]);

    /**
     * Auto-sync when user logs in
     */
    useEffect(() => {
        if (isAuthenticated && currentProject) {
            // Debounce to avoid multiple syncs
            const timer = setTimeout(() => {
                syncToCloud();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated]); // Only trigger on auth change

    /**
     * Create a new project
     */
    const createNewProject = useCallback(async (name: string): Promise<boolean> => {
        setIsSaving(true);
        try {
            if (isAuthenticated) {
                // Create in Supabase
                const result = await supabaseProjectService.createProject(name, '', '', '', []);
                if (result.success && result.projectId) {
                    const newProject = await supabaseProjectService.loadProject(result.projectId);
                    if (newProject) {
                        setCurrentProject(newProject);
                        await refreshProjectList();
                        console.log('Created cloud project:', name);
                        return true;
                    }
                }
            }

            // Fall back to local
            const result = projectStore.createProject(name, '', '', '', []);
            if (result.success && result.projectId) {
                const newProject = projectStore.loadProject(result.projectId);
                if (newProject) {
                    setCurrentProject(newProject);
                    refreshProjectList();
                    console.log('Created local project:', name);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Failed to create project:', error);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [isAuthenticated, refreshProjectList]);

    /**
     * Save the current project
     */
    const saveCurrentProject = useCallback(async (): Promise<boolean> => {
        if (!currentProject) {
            console.warn('No current project to save');
            return false;
        }

        setIsSaving(true);
        try {
            // Always save to local first
            projectStore.saveProject(currentProject);

            // Also save to Supabase if authenticated
            if (isAuthenticated) {
                const result = await supabaseProjectService.saveProject(currentProject);
                if (!result.success) {
                    // If project doesn't exist in cloud yet, create it
                    await supabaseProjectService.syncProjectToCloud(currentProject);
                }
            }

            refreshProjectList();
            console.log('Saved project:', currentProject.name);
            return true;
        } catch (error) {
            console.error('Failed to save project:', error);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [currentProject, isAuthenticated, refreshProjectList]);

    /**
     * Duplicate the current project
     */
    const duplicateCurrentProject = useCallback(async (): Promise<boolean> => {
        if (!currentProject) {
            console.warn('No current project to duplicate');
            return false;
        }

        setIsSaving(true);
        try {
            if (isAuthenticated) {
                const result = await supabaseProjectService.duplicateProject(currentProject.id);
                if (result.success && result.projectId) {
                    const duplicated = await supabaseProjectService.loadProject(result.projectId);
                    if (duplicated) {
                        setCurrentProject(duplicated);
                        await refreshProjectList();
                        console.log('Duplicated cloud project:', duplicated.name);
                        return true;
                    }
                }
            }

            // Fall back to local
            const result = projectStore.duplicateProject(currentProject.id);
            if (result.success && result.projectId) {
                const duplicated = projectStore.loadProject(result.projectId);
                if (duplicated) {
                    setCurrentProject(duplicated);
                    refreshProjectList();
                    console.log('Duplicated local project:', duplicated.name);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Failed to duplicate project:', error);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [currentProject, isAuthenticated, refreshProjectList]);

    /**
     * Switch to a different project
     */
    const switchProject = useCallback(async (id: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            // Try Supabase first if authenticated
            if (isAuthenticated) {
                const project = await supabaseProjectService.loadProject(id);
                if (project) {
                    projectStore.setCurrentProjectId(id);
                    setCurrentProject(project);
                    console.log('Switched to cloud project:', project.name);
                    return true;
                }
            }

            // Fall back to local
            const project = projectStore.loadProject(id);
            if (project) {
                projectStore.setCurrentProjectId(id);
                setCurrentProject(project);
                console.log('Switched to local project:', project.name);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to switch project:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    /**
     * Update the current project name
     */
    const updateProjectName = useCallback(async (name: string): Promise<boolean> => {
        if (!currentProject) return false;

        try {
            // Update locally
            projectStore.updateProjectName(currentProject.id, name);

            // Update in Supabase if authenticated
            if (isAuthenticated) {
                await supabaseProjectService.updateProjectName(currentProject.id, name);
            }

            setCurrentProject(prev => prev ? { ...prev, name } : null);
            refreshProjectList();
            console.log('Updated project name:', name);
            return true;
        } catch (error) {
            console.error('Failed to update project name:', error);
            return false;
        }
    }, [currentProject, isAuthenticated, refreshProjectList]);

    /**
     * Update the current project code (in memory)
     * Note: This doesn't save immediately; call saveCurrentProject() to persist
     */
    const updateProjectCode = useCallback(
        (html: string, css: string, javascript: string) => {
            if (!currentProject) return;

            setCurrentProject(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    html,
                    css,
                    javascript,
                    updatedAt: new Date().toISOString(),
                };
            });
        },
        [currentProject]
    );

    /**
     * Update external libraries for the current project
     */
    const updateExternalLibraries = useCallback(
        (libraries: ExternalLibrary[]) => {
            if (!currentProject) return;

            setCurrentProject(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    externalLibraries: libraries,
                    updatedAt: new Date().toISOString(),
                };
            });
        },
        [currentProject]
    );

    /**
     * Delete a project
     */
    const deleteProject = useCallback(
        async (id: string): Promise<boolean> => {
            try {
                // Delete locally
                projectStore.deleteProject(id);

                // Delete from Supabase if authenticated
                if (isAuthenticated) {
                    await supabaseProjectService.deleteProject(id);
                }

                await refreshProjectList();

                // If we deleted the current project, load another or create new
                if (currentProject?.id === id) {
                    await loadActiveProject();
                }

                console.log('Deleted project');
                return true;
            } catch (error) {
                console.error('Failed to delete project:', error);
                return false;
            }
        },
        [currentProject, isAuthenticated, refreshProjectList, loadActiveProject]
    );

    return {
        currentProject,
        projectList,
        isLoading,
        isSaving,
        isSyncing,
        createNewProject,
        saveCurrentProject,
        duplicateCurrentProject,
        switchProject,
        updateProjectName,
        updateProjectCode,
        updateExternalLibraries,
        deleteProject,
        refreshProjectList,
        syncToCloud,
    };
}
