import { useState, useCallback, useEffect } from 'react';
import { EditorLanguage } from '../types';
import { FormatResult, FormatSettings, FormatHistory, FormatTrigger } from '../types/formatting';
import { formattingService } from '../services/formattingService';
import { useLocalStorage } from './useLocalStorage';

export const useAutoFormat = () => {
    const [formatSettings, setFormatSettings] = useLocalStorage<FormatSettings>(
        'gb-coder-format-settings',
        formattingService.getSettings()
    );
    const [isFormatting, setIsFormatting] = useState(false);
    const [lastFormatResult, setLastFormatResult] = useState<FormatResult | null>(null);
    const [formatHistory, setFormatHistory] = useLocalStorage<FormatHistory[]>(
        'gb-coder-format-history',
        []
    );

    // Update service settings when local settings change
    useEffect(() => {
        formattingService.updateSettings(formatSettings);
    }, [formatSettings]);

    /**
     * Format code for a specific language
     */
    const formatCode = useCallback(
        async (
            code: string,
            language: EditorLanguage,
            triggerType: FormatTrigger['type'] = 'manual'
        ): Promise<FormatResult> => {
            setIsFormatting(true);

            try {
                const result = await formattingService.formatCode(code, language);
                setLastFormatResult(result);

                // Save to history
                const historyEntry: FormatHistory = {
                    id: Date.now().toString(),
                    trigger: {
                        type: triggerType,
                        timestamp: new Date().toISOString(),
                        language,
                    },
                    result,
                    originalCode: code,
                    timestamp: new Date().toISOString(),
                };

                setFormatHistory(prev => [...prev.slice(-49), historyEntry]); // Keep last 50

                // Dispatch custom event for other components
                window.dispatchEvent(
                    new CustomEvent('code-formatted', {
                        detail: { result, language, triggerType },
                    })
                );

                return result;
            } catch (error) {
                console.error('Format error:', error);
                const errorResult: FormatResult = {
                    success: false,
                    formattedCode: code,
                    changelog: [],
                    isUnsafe: false,
                    diff: [],
                    error: error instanceof Error ? error.message : 'Unknown error',
                    language,
                };
                setLastFormatResult(errorResult);
                return errorResult;
            } finally {
                setIsFormatting(false);
            }
        },
        [setFormatHistory]
    );

    /**
     * Update formatting settings
     */
    const updateSettings = useCallback(
        (updates: Partial<FormatSettings>) => {
            setFormatSettings(prev => ({ ...prev, ...updates }));
        },
        [setFormatSettings]
    );

    /**
     * Toggle format on save
     */
    const toggleFormatOnSave = useCallback(() => {
        setFormatSettings(prev => ({ ...prev, formatOnSave: !prev.formatOnSave }));
    }, [setFormatSettings]);

    /**
     * Toggle format on paste
     */
    const toggleFormatOnPaste = useCallback(() => {
        setFormatSettings(prev => ({ ...prev, formatOnPaste: !prev.formatOnPaste }));
    }, [setFormatSettings]);

    /**
     * Clear format history
     */
    const clearHistory = useCallback(() => {
        setFormatHistory([]);
    }, [setFormatHistory]);

    /**
     * Get format statistics
     */
    const getStatistics = useCallback(() => {
        const stats = {
            totalFormats: formatHistory.length,
            byLanguage: {
                html: formatHistory.filter(h => h.trigger.language === 'html').length,
                css: formatHistory.filter(h => h.trigger.language === 'css').length,
                javascript: formatHistory.filter(h => h.trigger.language === 'javascript').length,
            },
            byTrigger: {
                manual: formatHistory.filter(h => h.trigger.type === 'manual').length,
                save: formatHistory.filter(h => h.trigger.type === 'save').length,
                paste: formatHistory.filter(h => h.trigger.type === 'paste').length,
                shortcut: formatHistory.filter(h => h.trigger.type === 'shortcut').length,
            },
        };
        return stats;
    }, [formatHistory]);

    return {
        formatCode,
        isFormatting,
        lastFormatResult,
        formatSettings,
        updateSettings,
        toggleFormatOnSave,
        toggleFormatOnPaste,
        formatHistory,
        clearHistory,
        getStatistics,
    };
};
