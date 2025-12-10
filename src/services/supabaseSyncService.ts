import { supabase } from './supabaseClient';
import { supabaseProjectService } from './supabaseProjectService';
import { Project } from '../types/project';
import { CodeSnippet } from '../types';
import { ExternalLibrary } from './externalLibraryService';

/**
 * Unified Supabase Sync Service
 * Handles auto-save and manual save for all user data
 */

// Types for sync data
export interface SyncData {
    projects: Project[];
    snippets: CodeSnippet[];
    settings: UserSettings;
    aiConversations: AIConversation[];
    codeHistory: HistorySnapshot[];
}

export interface UserSettings {
    editorFontFamily: string;
    editorFontSize: number;
    theme: string;
    autoRunJs: boolean;
    previewDelay: number;
    aiModel: string;
    aiAutoSuggest: boolean;
    customSettings: Record<string, unknown>;
}

export interface AIConversation {
    id: string;
    title: string;
    messages: AIMessage[];
    createdAt: string;
    updatedAt: string;
}

export interface AIMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: string;
}

export interface HistorySnapshot {
    id: string;
    projectId?: string;
    html: string;
    css: string;
    javascript: string;
    label?: string;
    createdAt: string;
}

export interface SyncStatus {
    isOnline: boolean;
    lastSyncedAt: string | null;
    isSyncing: boolean;
    pendingChanges: boolean;
    error: string | null;
}

class SupabaseSyncService {
    private autoSaveInterval: number | null = null;
    private syncStatus: SyncStatus = {
        isOnline: true,
        lastSyncedAt: null,
        isSyncing: false,
        pendingChanges: false,
        error: null
    };
    private listeners: ((status: SyncStatus) => void)[] = [];

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
     * Get sync status
     */
    getStatus(): SyncStatus {
        return { ...this.syncStatus };
    }

    /**
     * Subscribe to sync status changes
     */
    subscribe(listener: (status: SyncStatus) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(l => l(this.getStatus()));
    }

    /**
     * Start auto-save (every 1 minute)
     */
    startAutoSave(getData: () => Promise<SyncData>): void {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        // Auto-save every 60 seconds (1 minute)
        this.autoSaveInterval = window.setInterval(async () => {
            const isAuth = await this.isAuthenticated();
            if (isAuth) {
                console.log('[AutoSave] Triggering auto-save...');
                const data = await getData();
                await this.syncAll(data);
            }
        }, 60000); // 60 seconds

        console.log('[AutoSave] Started auto-save (60s interval)');
    }

    /**
     * Stop auto-save
     */
    stopAutoSave(): void {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('[AutoSave] Stopped auto-save');
        }
    }

    /**
     * Manual save - sync all data immediately
     */
    async manualSave(data: SyncData): Promise<{ success: boolean; error?: string }> {
        const isAuth = await this.isAuthenticated();
        if (!isAuth) {
            return { success: false, error: 'Not authenticated' };
        }

        console.log('[ManualSave] Saving all data to cloud...');
        return await this.syncAll(data);
    }

    /**
     * Sync all data to Supabase
     */
    async syncAll(data: SyncData): Promise<{ success: boolean; error?: string }> {
        this.syncStatus.isSyncing = true;
        this.syncStatus.error = null;
        this.notifyListeners();

        try {
            const userId = await this.getCurrentUserId();
            if (!userId) {
                throw new Error('Not authenticated');
            }

            // Sync all data types in parallel
            const results = await Promise.allSettled([
                this.syncProjects(data.projects),
                this.syncSnippets(data.snippets, userId),
                this.syncSettings(data.settings, userId),
                this.syncAIConversations(data.aiConversations, userId),
                this.syncCodeHistory(data.codeHistory, userId)
            ]);

            // Check for any failures
            const failures = results.filter(r => r.status === 'rejected');
            if (failures.length > 0) {
                console.error('[Sync] Some sync operations failed:', failures);
            }

            this.syncStatus.lastSyncedAt = new Date().toISOString();
            this.syncStatus.pendingChanges = false;
            this.syncStatus.isSyncing = false;
            this.notifyListeners();

            console.log('[Sync] All data synced successfully');
            return { success: true };
        } catch (error) {
            console.error('[Sync] Error:', error);
            this.syncStatus.error = error instanceof Error ? error.message : 'Sync failed';
            this.syncStatus.isSyncing = false;
            this.notifyListeners();
            return { success: false, error: this.syncStatus.error };
        }
    }

    /**
     * Sync projects
     */
    private async syncProjects(projects: Project[]): Promise<void> {
        for (const project of projects) {
            await supabaseProjectService.syncProjectToCloud(project);
        }
        console.log(`[Sync] Synced ${projects.length} projects`);
    }

    /**
     * Sync snippets
     */
    private async syncSnippets(snippets: CodeSnippet[], userId: string): Promise<void> {
        if (snippets.length === 0) return;

        for (const snippet of snippets) {
            // Check if snippet exists
            const { data: existing } = await supabase
                .from('snippets')
                .select('id')
                .eq('id', snippet.id)
                .eq('user_id', userId)
                .single();

            if (existing) {
                // Update
                await supabase
                    .from('snippets')
                    .update({
                        name: snippet.name,
                        description: snippet.description || '',
                        html: snippet.html,
                        css: snippet.css,
                        javascript: snippet.javascript,
                        category: snippet.category || null,
                        tags: snippet.tags || [],
                        snippet_type: snippet.type || 'full',
                        scope: snippet.scope || 'private',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', snippet.id)
                    .eq('user_id', userId);
            } else {
                // Insert new
                await supabase
                    .from('snippets')
                    .insert({
                        id: snippet.id,
                        user_id: userId,
                        name: snippet.name,
                        description: snippet.description || '',
                        html: snippet.html,
                        css: snippet.css,
                        javascript: snippet.javascript,
                        category: snippet.category || null,
                        tags: snippet.tags || [],
                        snippet_type: snippet.type || 'full',
                        scope: snippet.scope || 'private',
                        created_at: snippet.createdAt || new Date().toISOString()
                    });
            }
        }
        console.log(`[Sync] Synced ${snippets.length} snippets`);
    }

    /**
     * Sync user settings
     */
    private async syncSettings(settings: UserSettings, userId: string): Promise<void> {
        const { error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: userId,
                editor_font_family: settings.editorFontFamily,
                editor_font_size: settings.editorFontSize,
                theme: settings.theme,
                auto_run_js: settings.autoRunJs,
                preview_delay: settings.previewDelay,
                ai_model: settings.aiModel,
                ai_auto_suggest: settings.aiAutoSuggest,
                custom_settings: settings.customSettings,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });

        if (error) {
            console.error('[Sync] Settings sync error:', error);
            throw error;
        }
        console.log('[Sync] Synced user settings');
    }

    /**
     * Sync AI conversations
     */
    private async syncAIConversations(conversations: AIConversation[], userId: string): Promise<void> {
        if (conversations.length === 0) return;

        for (const convo of conversations) {
            // Sync conversation
            const { data: existing } = await supabase
                .from('ai_conversations')
                .select('id')
                .eq('id', convo.id)
                .eq('user_id', userId)
                .single();

            if (existing) {
                await supabase
                    .from('ai_conversations')
                    .update({
                        title: convo.title,
                        updated_at: convo.updatedAt
                    })
                    .eq('id', convo.id)
                    .eq('user_id', userId);
            } else {
                await supabase
                    .from('ai_conversations')
                    .insert({
                        id: convo.id,
                        user_id: userId,
                        title: convo.title,
                        created_at: convo.createdAt,
                        updated_at: convo.updatedAt
                    });
            }

            // Sync messages for this conversation
            for (const msg of convo.messages) {
                const { data: existingMsg } = await supabase
                    .from('ai_messages')
                    .select('id')
                    .eq('id', msg.id)
                    .single();

                if (!existingMsg) {
                    await supabase
                        .from('ai_messages')
                        .insert({
                            id: msg.id,
                            conversation_id: convo.id,
                            role: msg.role,
                            content: msg.content,
                            created_at: msg.createdAt
                        });
                }
            }
        }
        console.log(`[Sync] Synced ${conversations.length} AI conversations`);
    }

    /**
     * Sync code history/snapshots
     */
    private async syncCodeHistory(snapshots: HistorySnapshot[], userId: string): Promise<void> {
        if (snapshots.length === 0) return;

        // Get user's projects to link snapshots
        const projects = await supabaseProjectService.listProjects();
        const defaultProjectId = projects.length > 0 ? projects[0].id : null;

        for (const snapshot of snapshots) {
            const { data: existing } = await supabase
                .from('project_snapshots')
                .select('id')
                .eq('id', snapshot.id)
                .single();

            if (!existing) {
                // Only insert new snapshots (snapshots are immutable)
                const projectId = snapshot.projectId || defaultProjectId;
                if (projectId) {
                    await supabase
                        .from('project_snapshots')
                        .insert({
                            id: snapshot.id,
                            project_id: projectId,
                            html: snapshot.html,
                            css: snapshot.css,
                            javascript: snapshot.javascript,
                            label: snapshot.label || null,
                            snapshot_type: 'auto',
                            created_at: snapshot.createdAt
                        });
                }
            }
        }
        console.log(`[Sync] Synced ${snapshots.length} history snapshots`);
    }

    /**
     * Load all data from Supabase
     */
    async loadAllFromCloud(): Promise<SyncData | null> {
        const userId = await this.getCurrentUserId();
        if (!userId) return null;

        try {
            // Load all data in parallel
            const [projectsData, snippetsData, settingsData, conversationsData] = await Promise.all([
                supabaseProjectService.fetchAllCloudProjects(),
                this.loadSnippets(userId),
                this.loadSettings(userId),
                this.loadAIConversations(userId)
            ]);

            return {
                projects: projectsData,
                snippets: snippetsData,
                settings: settingsData,
                aiConversations: conversationsData,
                codeHistory: [] // History is loaded per-project
            };
        } catch (error) {
            console.error('[Sync] Load from cloud error:', error);
            return null;
        }
    }

    /**
     * Load snippets from Supabase
     */
    private async loadSnippets(userId: string): Promise<CodeSnippet[]> {
        const { data, error } = await supabase
            .from('snippets')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .order('updated_at', { ascending: false });

        if (error || !data) return [];

        return data.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            html: s.html,
            css: s.css,
            javascript: s.javascript,
            category: s.category,
            tags: s.tags,
            type: s.snippet_type,
            scope: s.scope,
            createdAt: s.created_at,
            updatedAt: s.updated_at
        }));
    }

    /**
     * Load settings from Supabase
     */
    private async loadSettings(userId: string): Promise<UserSettings> {
        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            // Return defaults
            return {
                editorFontFamily: 'JetBrains Mono',
                editorFontSize: 14,
                theme: 'dark',
                autoRunJs: true,
                previewDelay: 300,
                aiModel: 'gemini-2.0-flash-exp',
                aiAutoSuggest: true,
                customSettings: {}
            };
        }

        return {
            editorFontFamily: data.editor_font_family,
            editorFontSize: data.editor_font_size,
            theme: data.theme,
            autoRunJs: data.auto_run_js,
            previewDelay: data.preview_delay,
            aiModel: data.ai_model,
            aiAutoSuggest: data.ai_auto_suggest,
            customSettings: data.custom_settings || {}
        };
    }

    /**
     * Load AI conversations from Supabase
     */
    private async loadAIConversations(userId: string): Promise<AIConversation[]> {
        const { data: convos, error: convosError } = await supabase
            .from('ai_conversations')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .order('updated_at', { ascending: false });

        if (convosError || !convos) return [];

        const conversations: AIConversation[] = [];

        for (const convo of convos) {
            const { data: messages } = await supabase
                .from('ai_messages')
                .select('*')
                .eq('conversation_id', convo.id)
                .order('created_at', { ascending: true });

            conversations.push({
                id: convo.id,
                title: convo.title,
                messages: (messages || []).map(m => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    createdAt: m.created_at
                })),
                createdAt: convo.created_at,
                updatedAt: convo.updated_at
            });
        }

        return conversations;
    }
}

// Export singleton instance
export const supabaseSyncService = new SupabaseSyncService();
