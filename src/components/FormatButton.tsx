import React from 'react';
import { Wand2 } from 'lucide-react';
import { EditorLanguage } from '../types';

interface FormatButtonProps {
    language: EditorLanguage;
    onFormat: () => void;
    isLoading?: boolean;
    hasContent: boolean;
}

const FormatButton: React.FC<FormatButtonProps> = ({
    language,
    onFormat,
    isLoading = false,
    hasContent,
}) => {
    if (!hasContent) return null;

    return (
        <button
            onClick={onFormat}
            disabled={isLoading}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg shadow-lg transition-all duration-200 text-sm font-medium z-10 group"
            title={`Auto-format ${language.toUpperCase()} (Ctrl+Shift+F)`}
        >
            <Wand2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
            <span>{isLoading ? 'Formatting...' : 'Auto-format'}</span>
        </button>
    );
};

export default FormatButton;
