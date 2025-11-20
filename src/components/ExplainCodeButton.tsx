import React from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { EditorLanguage } from '../types';

interface ExplainCodeButtonProps {
    language: EditorLanguage;
    onExplain: () => void;
    isLoading?: boolean;
    hasContent: boolean;
}

const ExplainCodeButton: React.FC<ExplainCodeButtonProps> = ({
    language,
    onExplain,
    isLoading = false,
    hasContent,
}) => {
    if (!hasContent) return null;

    return (
        <button
            onClick={onExplain}
            disabled={isLoading}
            className="absolute bottom-4 right-32 z-10 flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-md shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Explain ${language} code (Ctrl+E)`}
        >
            {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
                <BookOpen className="w-3.5 h-3.5" />
            )}
            Explain
        </button>
    );
};

export default ExplainCodeButton;
