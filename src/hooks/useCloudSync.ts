import { useState, useEffect, useCallback, useRef } from 'react';
import { supabaseSyncService, SyncData, SyncStatus, UserSettings, AIConversation, HistorySnapshot } from '../services/supabaseSyncService';
import { useAuth } from '../contexts/AuthContext';
import { Project } from '../types/project';
import { CodeSnippet } from '../types';

interface UseCloudSyncProps {
    // Data getters
    getProjects: () => Project[];
    getSnippets: () => CodeSnippet[];
    getSettings: () => UserSettings;
    getAIConversations: () => AIConversation[];
    getCodeHistory: () => HistorySnapshot[];
    // Data setters (for loading from cloud)
    setProjects?: (projects: Project[]) => void;
    setSnippets?: (snippets: CodeSnippet[]) => void;
    setSettings?: (settings: UserSettings) => void;
    setAIConversations?: (conversations: AIConversation[]) => void;
}

interface UseCloudSyncReturn {
    syncStatus: SyncStatus;
    isSyncing: boolean;
    lastSyncedAt: string | null;
    saveToCloud: () => Promise<{ success: boolean; error?: string }>;
    loadFromCloud: () => Promise<boolean>;
    startAutoSave: () => void;
    stopAutoSave: () => void;
}

/**
 * React hook for cloud sync functionality
 * Handles auto-save every 1 minute and manual save
 */
export function useCloudSync(props: UseCloudSyncProps): UseCloudSyncReturn {
    const { user } = useAuth();
    const [syncStatus, setSyncStatus] = useState<SyncStatus>(supabaseSyncService.getStatus());
    const autoSaveStartedRef = useRef(false);

    const isAuthenticated = !!user;

    /**
     * Get all current data for syncing
     */
    const getAllData = useCallback(async (): Promise<SyncData> => {
        return {
            projects: props.getProjects(),
            snippets: props.getSnippets(),
            settings: props.getSettings(),
            aiConversations: props.getAIConversations(),
            codeHistory: props.getCodeHistory()
        };
    }, [props]);

    /**
     * Manual save to cloud
     */
    const saveToCloud = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        if (!isAuthenticated) {
            return { success: false, error: 'Not logged in' };
        }

        const data = await getAllData();
        return await supabaseSyncService.manualSave(data);
    }, [isAuthenticated, getAllData]);

    /**
     * Load data from cloud
     */
    const loadFromCloud = useCallback(async (): Promise<boolean> => {
        if (!isAuthenticated) return false;

        try {
            const cloudData = await supabaseSyncService.loadAllFromCloud();
            if (cloudData) {
                // Update local state with cloud data
                if (props.setProjects && cloudData.projects.length > 0) {
                    props.setProjects(cloudData.projects);
                }
                if (props.setSnippets && cloudData.snippets.length > 0) {
                    props.setSnippets(cloudData.snippets);
                }
                if (props.setSettings) {
                    props.setSettings(cloudData.settings);
                }
                if (props.setAIConversations && cloudData.aiConversations.length > 0) {
                    props.setAIConversations(cloudData.aiConversations);
                }
                console.log('[CloudSync] Loaded data from cloud');
                return true;
            }
            return false;
        } catch (error) {
            console.error('[CloudSync] Load from cloud error:', error);
            return false;
        }
    }, [isAuthenticated, props]);

    /**
     * Start auto-save
     */
    const startAutoSave = useCallback(() => {
        if (!autoSaveStartedRef.current && isAuthenticated) {
            supabaseSyncService.startAutoSave(getAllData);
            autoSaveStartedRef.current = true;
        }
    }, [isAuthenticated, getAllData]);

    /**
     * Stop auto-save
     */
    const stopAutoSave = useCallback(() => {
        supabaseSyncService.stopAutoSave();
        autoSaveStartedRef.current = false;
    }, []);

    /**
     * Subscribe to sync status changes
     */
    useEffect(() => {
        const unsubscribe = supabaseSyncService.subscribe(setSyncStatus);
        return () => {
            unsubscribe();
        };
    }, []);

    /**
     * Auto-start/stop sync when auth state changes
     */
    useEffect(() => {
        if (isAuthenticated) {
            // Start auto-save when user logs in
            startAutoSave();
            // Load existing data from cloud
            loadFromCloud();
        } else {
            // Stop auto-save when user logs out
            stopAutoSave();
        }

        return () => {
            stopAutoSave();
        };
    }, [isAuthenticated, startAutoSave, stopAutoSave, loadFromCloud]);

    return {
        syncStatus,
        isSyncing: syncStatus.isSyncing,
        lastSyncedAt: syncStatus.lastSyncedAt,
        saveToCloud,
        loadFromCloud,
        startAutoSave,
        stopAutoSave
    };
}
