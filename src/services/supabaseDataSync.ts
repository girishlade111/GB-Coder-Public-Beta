import { supabase } from './supabaseClient';

/**
 * Complete Supabase Data Sync Utility
 * Syncs ALL data types: projects, snippets, settings, AI conversations, messages, profiles, and history
 * DEDUPLICATION: Checks for existing records to prevent duplicates
 * AUTO-SAVE: Every 60 seconds (1 minute)
 */

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

export async function getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
}

export async function isUserAuthenticated(): Promise<boolean> {
    const userId = await getCurrentUserId();
    return userId !== null;
}

// ============================================================================
// UUID HELPERS
// ============================================================================

function isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

// ============================================================================
// PROJECTS SYNC
// ============================================================================

export interface ProjectData {
    id: string;
    name: string;
    html: string;
    css: string;
    javascript: string;
    externalLibraries?: unknown[];
    createdAt?: string;
    updatedAt?: string;
}

export async function saveProjectToSupabase(project: ProjectData): Promise<{ success: boolean; error?: string }> {
    try {
        const userId = await getCurrentUserId();
        if (!userId) return { success: false, error: 'Not authenticated' };

        const { data: existing } = await supabase
            .from('projects')
            .select('id')
            .eq('user_id', userId)
            .eq('name', project.name)
            .is('deleted_at', null);

        let projectId = existing && existing.length > 0
            ? existing[0].id
            : (isValidUUID(project.id) ? project.id : crypto.randomUUID());

        const { error } = await supabase.from('projects').upsert({
            id: projectId,
            user_id: userId,
            name: project.name,
            html: project.html,
            css: project.css,
            javascript: project.javascript,
            external_libraries: project.externalLibraries || [],
            updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('[Sync] Project error:', error);
        return { success: false, error: String(error) };
    }
}

// ============================================================================
// SNIPPETS SYNC
// ============================================================================

export interface SnippetData {
    id: string;
    name: string;
    description?: string;
    html: string;
    css: string;
    javascript: string;
    category?: string;
    tags?: string[];
    type?: string;
    scope?: string;
}

export async function saveSnippetToSupabase(snippet: SnippetData): Promise<{ success: boolean; error?: string }> {
    try {
        const userId = await getCurrentUserId();
        if (!userId) return { success: false, error: 'Not authenticated' };

        const { data: existing } = await supabase
            .from('snippets')
            .select('id')
            .eq('user_id', userId)
            .eq('name', snippet.name)
            .is('deleted_at', null);

        let snippetId = existing && existing.length > 0
            ? existing[0].id
            : (isValidUUID(snippet.id) ? snippet.id : crypto.randomUUID());

        const { error } = await supabase.from('snippets').upsert({
            id: snippetId,
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
            updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('[Sync] Snippet error:', error);
        return { success: false, error: String(error) };
    }
}

// ============================================================================
// SETTINGS SYNC
// ============================================================================

export interface UserSettingsData {
    editorFontFamily: string;
    editorFontSize: number;
    theme: string;
    autoRunJs: boolean;
    previewDelay: number;
}

export async function saveSettingsToSupabase(settings: UserSettingsData): Promise<{ success: boolean; error?: string }> {
    try {
        const userId = await getCurrentUserId();
        if (!userId) return { success: false, error: 'Not authenticated' };

        const { error } = await supabase.from('user_settings').upsert({
            user_id: userId,
            editor_font_family: settings.editorFontFamily,
            editor_font_size: settings.editorFontSize,
            theme: settings.theme,
            auto_run_js: settings.autoRunJs,
            preview_delay: settings.previewDelay
        }, { onConflict: 'user_id' });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('[Sync] Settings error:', error);
        return { success: false, error: String(error) };
    }
}

// ============================================================================
// AI CONVERSATIONS & MESSAGES SYNC
// ============================================================================

export interface AIMessageData {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt?: string;
}

export interface AIConversationData {
    id: string;
    title: string;
    messages: AIMessageData[];
    projectId?: string;
}

export async function saveAIConversationToSupabase(conversation: AIConversationData): Promise<{ success: boolean; error?: string }> {
    try {
        const userId = await getCurrentUserId();
        if (!userId) return { success: false, error: 'Not authenticated' };

        const { data: existing } = await supabase
            .from('ai_conversations')
            .select('id')
            .eq('user_id', userId)
            .eq('title', conversation.title)
            .is('deleted_at', null);

        let conversationId = existing && existing.length > 0
            ? existing[0].id
            : (isValidUUID(conversation.id) ? conversation.id : crypto.randomUUID());

        const { error: convoError } = await supabase.from('ai_conversations').upsert({
            id: conversationId,
            user_id: userId,
            project_id: conversation.projectId || null,
            title: conversation.title,
            updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

        if (convoError) throw convoError;

        // Save messages
        for (const msg of conversation.messages) {
            const messageId = isValidUUID(msg.id) ? msg.id : crypto.randomUUID();
            await supabase.from('ai_messages').upsert({
                id: messageId,
                conversation_id: conversationId,
                role: msg.role,
                content: msg.content,
                created_at: msg.createdAt || new Date().toISOString()
            }, { onConflict: 'id' });
        }

        return { success: true };
    } catch (error) {
        console.error('[Sync] AI conversation error:', error);
        return { success: false, error: String(error) };
    }
}

// ============================================================================
// PROJECT SNAPSHOTS / HISTORY SYNC
// ============================================================================

export interface SnapshotData {
    id: string;
    projectId: string;
    html: string;
    css: string;
    javascript: string;
    label?: string;
    createdAt?: string;
}

export async function saveSnapshotToSupabase(snapshot: SnapshotData): Promise<{ success: boolean; error?: string }> {
    try {
        const userId = await getCurrentUserId();
        if (!userId) return { success: false, error: 'Not authenticated' };

        const snapshotId = isValidUUID(snapshot.id) ? snapshot.id : crypto.randomUUID();

        const { data: existing } = await supabase
            .from('project_snapshots')
            .select('id')
            .eq('id', snapshotId)
            .single();

        if (!existing) {
            const { error } = await supabase.from('project_snapshots').insert({
                id: snapshotId,
                project_id: snapshot.projectId,
                html: snapshot.html,
                css: snapshot.css,
                javascript: snapshot.javascript,
                label: snapshot.label || null,
                created_at: snapshot.createdAt || new Date().toISOString()
            });

            if (error) throw error;
        }

        return { success: true };
    } catch (error) {
        console.error('[Sync] Snapshot error:', error);
        return { success: false, error: String(error) };
    }
}

// ============================================================================
// PROFILES SYNC
// ============================================================================

export interface ProfileData {
    username?: string;
    fullName?: string;
    avatarUrl?: string;
}

export async function saveProfileToSupabase(profile: ProfileData): Promise<{ success: boolean; error?: string }> {
    try {
        const userId = await getCurrentUserId();
        if (!userId) return { success: false, error: 'Not authenticated' };

        const { error } = await supabase.from('profiles').upsert({
            id: userId,
            username: profile.username,
            full_name: profile.fullName,
            avatar_url: profile.avatarUrl
        }, { onConflict: 'id' });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('[Sync] Profile error:', error);
        return { success: false, error: String(error) };
    }
}

// ============================================================================
// SYNC ALL DATA
// ============================================================================

export interface AllDataToSync {
    project?: ProjectData;
    snippets?: SnippetData[];
    settings?: UserSettingsData;
    conversations?: AIConversationData[];
    snapshots?: SnapshotData[];
    profile?: ProfileData;
}

export async function syncAllDataToSupabase(data: AllDataToSync): Promise<{ success: boolean; errors: string[] }> {
    const isAuth = await isUserAuthenticated();
    if (!isAuth) return { success: false, errors: ['Not authenticated'] };

    console.log('[Sync] Starting full sync...');
    const errors: string[] = [];

    // Sync all data types
    if (data.project) {
        const result = await saveProjectToSupabase(data.project);
        if (!result.success && result.error) errors.push(`Project: ${result.error}`);
    }

    if (data.snippets) {
        for (const snippet of data.snippets) {
            const result = await saveSnippetToSupabase(snippet);
            if (!result.success && result.error) errors.push(`Snippet: ${result.error}`);
        }
    }

    if (data.settings) {
        const result = await saveSettingsToSupabase(data.settings);
        if (!result.success && result.error) errors.push(`Settings: ${result.error}`);
    }

    if (data.conversations) {
        for (const convo of data.conversations) {
            const result = await saveAIConversationToSupabase(convo);
            if (!result.success && result.error) errors.push(`AI Conversation: ${result.error}`);
        }
    }

    if (data.snapshots) {
        for (const snapshot of data.snapshots) {
            const result = await saveSnapshotToSupabase(snapshot);
            if (!result.success && result.error) errors.push(`Snapshot: ${result.error}`);
        }
    }

    if (data.profile) {
        const result = await saveProfileToSupabase(data.profile);
        if (!result.success && result.error) errors.push(`Profile: ${result.error}`);
    }

    console.log(`[Sync] Complete. Errors: ${errors.length}`);
    return { success: errors.length === 0, errors };
}

// ============================================================================
// AUTO-SAVE (Every 60 seconds)
// ============================================================================

let autoSaveInterval: number | null = null;

export function startAutoSave(getDataFn: () => AllDataToSync): void {
    stopAutoSave();
    console.log('[AutoSave] Starting (60s interval)');

    autoSaveInterval = window.setInterval(async () => {
        if (await isUserAuthenticated()) {
            console.log('[AutoSave] Syncing...');
            await syncAllDataToSupabase(getDataFn());
        }
    }, 60000); // 1 minute
}

export function stopAutoSave(): void {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
        console.log('[AutoSave] Stopped');
    }
}
