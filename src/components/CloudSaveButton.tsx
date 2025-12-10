import React, { useEffect, useRef, useCallback } from 'react';
import { Cloud, CloudOff, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import {
    syncAllDataToSupabase,
    startAutoSave,
    stopAutoSave,
    isUserAuthenticated,
    AllDataToSync,
    ProjectData,
    SnippetData,
    UserSettingsData,
    AIConversationData,
    SnapshotData,
    ProfileData
} from '../services/supabaseDataSync';

interface CloudSaveButtonProps {
    // Data getters
    getCurrentProject?: () => ProjectData | null;
    getSnippets?: () => SnippetData[];
    getSettings?: () => UserSettingsData;
    getConversations?: () => AIConversationData[];
    getSnapshots?: () => SnapshotData[];
    getProfile?: () => ProfileData | null;
}

/**
 * Cloud Save Button Component
 * Shows sync status and allows manual save to cloud
 * Starts auto-save when user is authenticated
 */
const CloudSaveButton: React.FC<CloudSaveButtonProps> = ({
    getCurrentProject,
    getSnippets,
    getSettings,
    getConversations,
    getSnapshots,
    getProfile
}) => {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [isSyncing, setIsSyncing] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [lastSyncedAt, setLastSyncedAt] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isHovered, setIsHovered] = React.useState(false);
    const autoSaveStarted = useRef(false);

    // Collect all data for sync
    const collectDataForSync = useCallback((): AllDataToSync => {
        const data: AllDataToSync = {};

        if (getCurrentProject) {
            const project = getCurrentProject();
            if (project) data.project = project;
        }

        if (getSnippets) {
            data.snippets = getSnippets();
        }

        if (getSettings) {
            data.settings = getSettings();
        }

        if (getConversations) {
            data.conversations = getConversations();
        }

        if (getSnapshots) {
            data.snapshots = getSnapshots();
        }

        if (getProfile) {
            const profile = getProfile();
            if (profile) data.profile = profile;
        }

        return data;
    }, [getCurrentProject, getSnippets, getSettings, getConversations, getSnapshots, getProfile]);

    // Manual save handler
    const handleClick = async () => {
        if (!user || isSyncing) return;

        setIsSyncing(true);
        setError(null);

        try {
            console.log('[CloudSave] Manual save triggered');
            const data = collectDataForSync();
            const result = await syncAllDataToSupabase(data);

            if (result.success) {
                setLastSyncedAt(new Date().toISOString());
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
            } else {
                setError(result.errors.join(', '));
            }
        } catch (err) {
            console.error('[CloudSave] Error:', err);
            setError('Sync failed');
        } finally {
            setIsSyncing(false);
        }
    };

    // Start/stop auto-save based on auth state
    useEffect(() => {
        const setupAutoSave = async () => {
            const isAuth = await isUserAuthenticated();

            if (isAuth && !autoSaveStarted.current) {
                console.log('[CloudSave] Starting auto-save (60s interval)');
                startAutoSave(() => collectDataForSync(), 60000);
                autoSaveStarted.current = true;
            } else if (!isAuth && autoSaveStarted.current) {
                console.log('[CloudSave] Stopping auto-save');
                stopAutoSave();
                autoSaveStarted.current = false;
            }
        };

        setupAutoSave();

        return () => {
            if (autoSaveStarted.current) {
                stopAutoSave();
                autoSaveStarted.current = false;
            }
        };
    }, [user, collectDataForSync]);

    // Format last synced time
    const formatTime = (isoString: string | null) => {
        if (!isoString) return 'Never';
        const date = new Date(isoString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    // Not logged in
    if (!user) {
        return (
            <button
                disabled
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm opacity-50 cursor-not-allowed ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                    }`}
                title="Sign in to save to cloud"
            >
                <CloudOff className="w-4 h-4" />
                <span className="hidden sm:inline">Cloud Save</span>
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={handleClick}
                disabled={isSyncing}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isSyncing
                    ? isDark
                        ? 'bg-blue-600/50 text-white cursor-wait'
                        : 'bg-blue-500/50 text-white cursor-wait'
                    : showSuccess
                        ? isDark
                            ? 'bg-green-600 text-white'
                            : 'bg-green-500 text-white'
                        : error
                            ? isDark
                                ? 'bg-red-600 text-white hover:bg-red-500'
                                : 'bg-red-500 text-white hover:bg-red-400'
                            : isDark
                                ? 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105'
                                : 'bg-blue-500 text-white hover:bg-blue-400 hover:scale-105'
                    }`}
                title={error || `Last saved: ${formatTime(lastSyncedAt)}`}
            >
                {isSyncing ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">Saving...</span>
                    </>
                ) : showSuccess ? (
                    <>
                        <Check className="w-4 h-4" />
                        <span className="hidden sm:inline">Saved!</span>
                    </>
                ) : error ? (
                    <>
                        <AlertCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Retry</span>
                    </>
                ) : (
                    <>
                        <Cloud className="w-4 h-4" />
                        <span className="hidden sm:inline">Save to Cloud</span>
                    </>
                )}
            </button>

            {/* Tooltip on hover */}
            {isHovered && !isSyncing && !showSuccess && (
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap z-50 shadow-lg ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700 border'
                    }`}>
                    {error ? error : `Last saved: ${formatTime(lastSyncedAt)}`}
                    <br />
                    <span className="text-gray-500">Auto-saves every 60s</span>
                    <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${isDark ? 'bg-gray-800' : 'bg-white border-l border-t'
                        }`} />
                </div>
            )}
        </div>
    );
};

export default CloudSaveButton;
