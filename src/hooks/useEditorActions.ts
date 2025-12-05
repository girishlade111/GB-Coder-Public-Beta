import { useState, useCallback } from 'react';
import { EditorLanguage } from '../types';

interface UseEditorActionsProps {
    value: string;
    language: EditorLanguage;
    onFormat?: () => void;
    isFormatLoading?: boolean;
}

interface UseEditorActionsReturn {
    // Lock/Unlock
    isLocked: boolean;
    toggleLock: () => void;

    // Copy
    handleCopy: () => Promise<void>;
    showCopyToast: boolean;
    copyToastMessage: string;
    closeCopyToast: () => void;

    // Format (delegates to existing handler)
    handleFormat: () => void;
    canFormat: boolean;

    // File name
    fileName: string;
}

const FILE_NAME_MAP: Record<EditorLanguage, string> = {
    html: 'index.html',
    css: 'style.css',
    javascript: 'script.js',
};

export const useEditorActions = ({
    value,
    language,
    onFormat,
    isFormatLoading = false,
}: UseEditorActionsProps): UseEditorActionsReturn => {
    const [isLocked, setIsLocked] = useState(false);
    const [showCopyToast, setShowCopyToast] = useState(false);
    const [copyToastMessage, setCopyToastMessage] = useState('');

    const fileName = FILE_NAME_MAP[language];

    const toggleLock = useCallback(() => {
        setIsLocked(prev => !prev);
    }, []);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopyToastMessage('Copied to clipboard!');
            setShowCopyToast(true);

            // Auto-hide toast after 2 seconds
            setTimeout(() => {
                setShowCopyToast(false);
            }, 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            setCopyToastMessage('Failed to copy');
            setShowCopyToast(true);

            setTimeout(() => {
                setShowCopyToast(false);
            }, 2000);
        }
    }, [value]);

    const closeCopyToast = useCallback(() => {
        setShowCopyToast(false);
    }, []);

    const handleFormat = useCallback(() => {
        if (onFormat && !isFormatLoading) {
            onFormat();
        }
    }, [onFormat, isFormatLoading]);

    const canFormat = !!onFormat && !isFormatLoading && value.trim().length > 0;

    return {
        isLocked,
        toggleLock,
        handleCopy,
        showCopyToast,
        copyToastMessage,
        closeCopyToast,
        handleFormat,
        canFormat,
        fileName,
    };
};
