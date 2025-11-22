import React, { useState, useMemo } from 'react';
import { X, Sparkles, AlertCircle, Check, Code, FileText } from 'lucide-react';
import { ErrorFixResponse } from '../../types';
import { aiEnhancementService } from '../../services/aiEnhancementService';

interface AIErrorFixModalProps {
    isOpen: boolean;
    onClose: () => void;
    fixResponse: ErrorFixResponse | null;
    originalCode: {
        html: string;
        css: string;
        javascript: string;
    };
    onApplyFix: (fixedHtml: string, fixedCss: string, fixedJavascript: string) => void;
    isLoading?: boolean;
}

const AIErrorFixModal: React.FC<AIErrorFixModalProps> = ({
    isOpen,
    onClose,
    fixResponse,
    originalCode,
    onApplyFix,
    isLoading = false,
}) => {
    const [activeTab, setActiveTab] = useState<'html' | 'css' | 'javascript'>('javascript');

    // Generate diff for each language
    const htmlComparison = useMemo(() => {
        if (!fixResponse || !fixResponse.changesApplied.html) return null;
        return aiEnhancementService.generateComparison(originalCode.html, fixResponse.fixedHtml);
    }, [fixResponse, originalCode.html]);

    const cssComparison = useMemo(() => {
        if (!fixResponse || !fixResponse.changesApplied.css) return null;
        return aiEnhancementService.generateComparison(originalCode.css, fixResponse.fixedCss);
    }, [fixResponse, originalCode.css]);

    const javascriptComparison = useMemo(() => {
        if (!fixResponse || !fixResponse.changesApplied.javascript) return null;
        return aiEnhancementService.generateComparison(originalCode.javascript, fixResponse.fixedJavascript);
    }, [fixResponse, originalCode.javascript]);

    const handleApply = () => {
        if (!fixResponse) return;
        onApplyFix(fixResponse.fixedHtml, fixResponse.fixedCss, fixResponse.fixedJavascript);
        onClose();
    };

    if (!isOpen) return null;

    const getActiveComparison = () => {
        switch (activeTab) {
            case 'html':
                return htmlComparison;
            case 'css':
                return cssComparison;
            case 'javascript':
                return javascriptComparison;
            default:
                return null;
        }
    };

    const activeComparison = getActiveComparison();
    const hasChanges = fixResponse && (
        fixResponse.changesApplied.html ||
        fixResponse.changesApplied.css ||
        fixResponse.changesApplied.javascript
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-blue-400" />
                        <div>
                            <h2 className="text-xl font-bold text-white">AI Error Fix</h2>
                            <p className="text-sm text-gray-400">Gemini AI has analyzed your error and suggested a fix</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col p-6">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Sparkles className="w-12 h-12 text-blue-400 animate-pulse mx-auto mb-4" />
                                <p className="text-gray-300 text-lg">AI is analyzing your error...</p>
                                <p className="text-gray-500 text-sm mt-2">This may take a few seconds</p>
                            </div>
                        </div>
                    ) : fixResponse ? (
                        <>
                            {/* Error Message */}
                            <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-red-300 font-semibold mb-1">Original Error</h3>
                                        <p className="text-red-200 text-sm font-mono">{fixResponse.originalError}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Explanation */}
                            <div className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-blue-300 font-semibold mb-2">Explanation</h3>
                                        <p className="text-gray-300 text-sm leading-relaxed">{fixResponse.explanation}</p>
                                        <div className="mt-3 flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 text-xs">Confidence:</span>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                                                            style={{ width: `${fixResponse.confidence}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-blue-400 text-xs font-semibold">{fixResponse.confidence}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs for Code Changes */}
                            {hasChanges && (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <div className="flex gap-2 mb-4">
                                        {fixResponse.changesApplied.html && (
                                            <button
                                                onClick={() => setActiveTab('html')}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'html'
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Code className="w-4 h-4" />
                                                    HTML
                                                </div>
                                            </button>
                                        )}
                                        {fixResponse.changesApplied.css && (
                                            <button
                                                onClick={() => setActiveTab('css')}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'css'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Code className="w-4 h-4" />
                                                    CSS
                                                </div>
                                            </button>
                                        )}
                                        {fixResponse.changesApplied.javascript && (
                                            <button
                                                onClick={() => setActiveTab('javascript')}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'javascript'
                                                    ? 'bg-yellow-500 text-white'
                                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Code className="w-4 h-4" />
                                                    JavaScript
                                                </div>
                                            </button>
                                        )}
                                    </div>

                                    {/* Diff View */}
                                    <div className="flex-1 overflow-auto bg-gray-950 rounded-lg p-4 border border-gray-700">
                                        {activeComparison ? (
                                            <div className="space-y-1">
                                                {activeComparison.differences.map((diff, index) => (
                                                    <div
                                                        key={index}
                                                        className={`flex items-start gap-3 px-3 py-2 rounded font-mono text-sm ${diff.type === 'addition'
                                                            ? 'bg-green-500 bg-opacity-10 border-l-2 border-green-500'
                                                            : diff.type === 'deletion'
                                                                ? 'bg-red-500 bg-opacity-10 border-l-2 border-red-500'
                                                                : 'bg-yellow-500 bg-opacity-10 border-l-2 border-yellow-500'
                                                            }`}
                                                    >
                                                        <span className="text-gray-500 min-w-[3rem] text-right">{diff.lineNumber}</span>
                                                        <span
                                                            className={`${diff.type === 'addition'
                                                                ? 'text-green-300'
                                                                : diff.type === 'deletion'
                                                                    ? 'text-red-300'
                                                                    : 'text-yellow-300'
                                                                }`}
                                                        >
                                                            {diff.type === 'addition' ? '+' : diff.type === 'deletion' ? '-' : '~'}
                                                        </span>
                                                        <code className="text-gray-200 flex-1">{diff.content}</code>
                                                    </div>
                                                ))}
                                                {activeComparison.differences.length === 0 && (
                                                    <p className="text-gray-500 text-center py-8">No changes in this file</p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-8">No changes to display</p>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    {activeComparison && activeComparison.differences.length > 0 && (
                                        <div className="mt-4 flex gap-4 text-sm">
                                            <span className="text-green-400">
                                                +{activeComparison.stats.linesAdded} added
                                            </span>
                                            <span className="text-red-400">
                                                -{activeComparison.stats.linesRemoved} removed
                                            </span>
                                            <span className="text-yellow-400">
                                                ~{activeComparison.stats.linesModified} modified
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-gray-400">No fix response available</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isLoading && fixResponse && (
                    <div className="flex items-center justify-between p-6 border-t border-gray-700">
                        <p className="text-sm text-gray-400">
                            Review the changes above and click Apply to update your code
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApply}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Apply Fix
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIErrorFixModal;

