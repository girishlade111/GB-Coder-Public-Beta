import { useState, useEffect, useCallback } from 'react';
import { Project, ProjectMetadata } from '../types/project';
import { projectStore } from '../services/projectStore';
import { ExternalLibrary } from '../services/externalLibraryService';

interface UseProjectReturn {
    currentProject: Project | null;
    projectList: ProjectMetadata[];
    isLoading: boolean;
    isSaving: boolean;
    createNewProject: (name: string) => Promise<boolean>;
    saveCurrentProject: () => Promise<boolean>;
    duplicateCurrentProject: () => Promise<boolean>;
    switchProject: (id: string) => Promise<boolean>;
    updateProjectName: (name: string) => Promise<boolean>;
    updateProjectCode: (html: string, css: string, javascript: string) => void;
    updateExternalLibraries: (libraries: ExternalLibrary[]) => void;
    deleteProject: (id: string) => Promise<boolean>;
    refreshProjectList: () => void;
}

/**
 * React hook for managing projects
 * Provides state management and operations for the active project
 */
export function useProject(
    initialHtml: string = '',
    initialCss: string = '',
    initialJavascript: string = '',
    initialLibraries: ExternalLibrary[] = []
): UseProjectReturn {
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [projectList, setProjectList] = useState<ProjectMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    /**
     * Load the active project or create default
     */
    const loadActiveProject = useCallback(() => {
        setIsLoading(true);
        try {
            const project = projectStore.initializeDefaultProject(
                initialHtml,
                initialCss,
                initialJavascript,
                initialLibraries
            );
            setCurrentProject(project);
            console.log('Loaded active project:', project.name);
        } catch (error) {
            console.error('Failed to load active project:', error);
        } finally {
            setIsLoading(false);
        }
    }, [initialHtml, initialCss, initialJavascript, initialLibraries]);

    /**
     * Refresh the project list
     */
    const refreshProjectList = useCallback(() => {
        const list = projectStore.listProjects();
        setProjectList(list);
    }, []);

    /**
     * Initialize on mount
     */
    useEffect(() => {
        loadActiveProject();
        refreshProjectList();
    }, [loadActiveProject, refreshProjectList]);

    /**
     * Create a new project
     */
    const createNewProject = useCallback(async (name: string): Promise<boolean> => {
        setIsSaving(true);
        try {
            const result = projectStore.createProject(name, '', '', '', []);
            if (result.success && result.projectId) {
                const newProject = projectStore.loadProject(result.projectId);
                if (newProject) {
                    setCurrentProject(newProject);
                    refreshProjectList();
                    console.log('Created new project:', name);
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
    }, [refreshProjectList]);

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
            const result = projectStore.saveProject(currentProject);
            if (result.success) {
                refreshProjectList();
                console.log('Saved project:', currentProject.name);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to save project:', error);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [currentProject, refreshProjectList]);

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
            const result = projectStore.duplicateProject(currentProject.id);
            if (result.success && result.projectId) {
                const duplicated = projectStore.loadProject(result.projectId);
                if (duplicated) {
                    setCurrentProject(duplicated);
                    refreshProjectList();
                    console.log('Duplicated project:', duplicated.name);
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
    }, [currentProject, refreshProjectList]);

    /**
     * Switch to a different project
     */
    const switchProject = useCallback(async (id: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const project = projectStore.loadProject(id);
            if (project) {
                projectStore.setCurrentProjectId(id);
                setCurrentProject(project);
                console.log('Switched to project:', project.name);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to switch project:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Update the current project name
     */
    const updateProjectName = useCallback(async (name: string): Promise<boolean> => {
        if (!currentProject) return false;

        try {
            const result = projectStore.updateProjectName(currentProject.id, name);
            if (result.success) {
                setCurrentProject(prev => prev ? { ...prev, name } : null);
                refreshProjectList();
                console.log('Updated project name:', name);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update project name:', error);
            return false;
        }
    }, [currentProject, refreshProjectList]);

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
                const result = projectStore.deleteProject(id);
                if (result.success) {
                    refreshProjectList();

                    // If we deleted the current project, load another or create new
                    if (currentProject?.id === id) {
                        loadActiveProject();
                    }

                    console.log('Deleted project');
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Failed to delete project:', error);
                return false;
            }
        },
        [currentProject, refreshProjectList, loadActiveProject]
    );

    return {
        currentProject,
        projectList,
        isLoading,
        isSaving,
        createNewProject,
        saveCurrentProject,
        duplicateCurrentProject,
        switchProject,
        updateProjectName,
        updateProjectCode,
        updateExternalLibraries,
        deleteProject,
        refreshProjectList,
    };
}
