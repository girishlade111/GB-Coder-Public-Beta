import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Environment Variables
// ============================================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// ============================================================================
// Supabase Client Configuration
// ============================================================================

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if Supabase is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
    return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.length > 0 && supabaseAnonKey.length > 0);
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Error fetching user:', error.message);
        return null;
    }
    return user;
};

/**
 * Get current session
 */
export const getCurrentSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Error fetching session:', error.message);
        return null;
    }
    return session;
};

// ============================================================================
// Database Type Definitions
// ============================================================================

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    username: string | null;
                    full_name: string | null;
                    avatar_url: string | null;
                    website: string | null;
                    bio: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    username?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    website?: string | null;
                    bio?: string | null;
                };
                Update: {
                    username?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    website?: string | null;
                    bio?: string | null;
                };
            };
            projects: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    description: string | null;
                    html: string;
                    css: string;
                    javascript: string;
                    external_libraries: any;
                    settings: any;
                    created_at: string;
                    updated_at: string;
                    deleted_at: string | null;
                };
                Insert: {
                    user_id: string;
                    name: string;
                    description?: string | null;
                    html?: string;
                    css?: string;
                    javascript?: string;
                    external_libraries?: any;
                    settings?: any;
                };
                Update: {
                    name?: string;
                    description?: string | null;
                    html?: string;
                    css?: string;
                    javascript?: string;
                    external_libraries?: any;
                    settings?: any;
                };
            };
            project_snapshots: {
                Row: {
                    id: string;
                    project_id: string;
                    html: string | null;
                    css: string | null;
                    javascript: string | null;
                    label: string | null;
                    description: string | null;
                    snapshot_type: string;
                    created_at: string;
                };
                Insert: {
                    project_id: string;
                    html?: string | null;
                    css?: string | null;
                    javascript?: string | null;
                    label?: string | null;
                    description?: string | null;
                    snapshot_type?: string;
                };
                Update: {
                    label?: string | null;
                    description?: string | null;
                };
            };
            ai_conversations: {
                Row: {
                    id: string;
                    user_id: string;
                    project_id: string | null;
                    title: string;
                    summary: string | null;
                    created_at: string;
                    updated_at: string;
                    deleted_at: string | null;
                };
                Insert: {
                    user_id: string;
                    project_id?: string | null;
                    title?: string;
                    summary?: string | null;
                };
                Update: {
                    title?: string;
                    summary?: string | null;
                    project_id?: string | null;
                };
            };
            ai_messages: {
                Row: {
                    id: string;
                    conversation_id: string;
                    role: 'user' | 'assistant' | 'system';
                    content: string;
                    code_blocks: any;
                    attachments: any;
                    model: string | null;
                    tokens_used: number | null;
                    created_at: string;
                };
                Insert: {
                    conversation_id: string;
                    role: 'user' | 'assistant' | 'system';
                    content: string;
                    code_blocks?: any;
                    attachments?: any;
                    model?: string | null;
                    tokens_used?: number | null;
                };
                Update: {
                    content?: string;
                    code_blocks?: any;
                };
            };
            snippets: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    description: string | null;
                    html: string;
                    css: string;
                    javascript: string;
                    category: string | null;
                    tags: string[];
                    snippet_type: 'full' | 'html' | 'css' | 'javascript';
                    scope: 'private' | 'public';
                    created_at: string;
                    updated_at: string;
                    deleted_at: string | null;
                };
                Insert: {
                    user_id: string;
                    name: string;
                    description?: string | null;
                    html?: string;
                    css?: string;
                    javascript?: string;
                    category?: string | null;
                    tags?: string[];
                    snippet_type?: 'full' | 'html' | 'css' | 'javascript';
                    scope?: 'private' | 'public';
                };
                Update: {
                    name?: string;
                    description?: string | null;
                    html?: string;
                    css?: string;
                    javascript?: string;
                    category?: string | null;
                    tags?: string[];
                    snippet_type?: 'full' | 'html' | 'css' | 'javascript';
                    scope?: 'private' | 'public';
                };
            };
            user_settings: {
                Row: {
                    user_id: string;
                    editor_font_family: string;
                    editor_font_size: number;
                    theme: 'dark' | 'dark-blue' | 'dark-purple' | 'light';
                    auto_run_js: boolean;
                    preview_delay: number;
                    ai_model: string;
                    ai_auto_suggest: boolean;
                    custom_settings: any;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    editor_font_family?: string;
                    editor_font_size?: number;
                    theme?: 'dark' | 'dark-blue' | 'dark-purple' | 'light';
                    auto_run_js?: boolean;
                    preview_delay?: number;
                    ai_model?: string;
                    ai_auto_suggest?: boolean;
                    custom_settings?: any;
                };
                Update: {
                    editor_font_family?: string;
                    editor_font_size?: number;
                    theme?: 'dark' | 'dark-blue' | 'dark-purple' | 'light';
                    auto_run_js?: boolean;
                    preview_delay?: number;
                    ai_model?: string;
                    ai_auto_suggest?: boolean;
                    custom_settings?: any;
                };
            };
        };
    };
};

// Export typed client
export type SupabaseClient = typeof supabase;
