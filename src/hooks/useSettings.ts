import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type ThemeVariant = 'dark' | 'dark-blue' | 'dark-purple' | 'light';
export type EditorFontFamily = 'JetBrains Mono' | 'Fira Code' | 'Monaco' | 'Consolas' | 'Default';

export interface AppSettings {
    editorFontFamily: EditorFontFamily;
    editorFontSize: number;
    theme: ThemeVariant;
    autoRunJS: boolean;
    previewDelay: number;
}

// Default settings matching current behavior
export const DEFAULT_SETTINGS: AppSettings = {
    editorFontFamily: 'JetBrains Mono',
    editorFontSize: 14,
    theme: 'dark',
    autoRunJS: true,
    previewDelay: 300,
};

export const useSettings = () => {
    const [settings, setSettings] = useLocalStorage<AppSettings>(
        'gb-coder-settings',
        DEFAULT_SETTINGS
    );

    // Update individual settings
    const updateSettings = useCallback((partial: Partial<AppSettings>) => {
        setSettings((prev) => ({
            ...prev,
            ...partial,
        }));
    }, [setSettings]);

    // Reset to defaults
    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
    }, [setSettings]);

    // Get font family CSS value
    const getFontFamilyCSS = useCallback((fontFamily: EditorFontFamily): string => {
        switch (fontFamily) {
            case 'JetBrains Mono':
                return 'JetBrains Mono, Monaco, Consolas, monospace';
            case 'Fira Code':
                return 'Fira Code, Monaco, Consolas, monospace';
            case 'Monaco':
                return 'Monaco, Consolas, monospace';
            case 'Consolas':
                return 'Consolas, monospace';
            case 'Default':
                return 'monospace';
            default:
                return 'JetBrains Mono, Monaco, Consolas, monospace';
        }
    }, []);

    return {
        settings,
        updateSettings,
        resetSettings,
        getFontFamilyCSS,
    };
};
