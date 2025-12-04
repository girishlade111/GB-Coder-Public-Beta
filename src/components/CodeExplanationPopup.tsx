import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    Copy,
    Check,
    BookOpen,
    AlertTriangle,
    Shield,
    Zap,
    Lightbulb,
    MessageSquarePlus,
    Code
} from 'lucide-react';
import { CodeExplanation, UserLevel } from '../types';

interface CodeExplanationPopupProps {
    isOpen: boolean;
    onClose: () => void;
    explanation: CodeExplanation | null;
    isLoading: boolean;
    position: { top: number; left: number } | null;
    onUserLevelChange: (level: UserLevel) => void;
    onShowSimplified: () => void;
    onShowAnnotated: () => void;
    onAddComments: () => void;
}

const CodeExplanationPopup: React.FC<CodeExplanationPopupProps> = ({
    isOpen,
    onClose,
    explanation,
    isLoading,
    position,
    onUserLevelChange,
    onShowSimplified,
    onShowAnnotated,
    onAddComments
}) => {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'breakdown' | 'notes' | 'suggestions'>('breakdown');
    const popupRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleCopy = () => {
        if (!explanation) return;

        const text = `
Summary: ${explanation.summary}

Breakdown:
${explanation.breakdown.map(b => `- ${b.explanation}`).join('\n')}

Notes:
${explanation.notes.map(n => `- [${n.type.toUpperCase()}] ${n.title}: ${n.description}`).join('\n')}
    `.trim();

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    // Calculate position to keep within viewport
    const style: React.CSSProperties = position ? {
        top: Math.min(position.top, window.innerHeight - 500),
        left: Math.min(position.left, window.innerWidth - 400),
    } : {};

    return (
        <div
            ref={popupRef}
            className="fixed z-50 w-[450px] max-h-[80vh] bg-matte-black border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={style}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-dark-gray/50">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-500/20 rounded-lg">
                        <BookOpen className="w-4 h-4 text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-white">Code Explanation</h3>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={explanation?.userLevel || 'intermediate'}
                        onChange={(e) => onUserLevelChange(e.target.value as UserLevel)}
                        className="bg-dark-gray text-xs text-bright-white border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-purple-500"
                        disabled={isLoading}
                    >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>

                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-dark-gray rounded-md text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        <p className="text-sm">Analyzing code structure...</p>
                    </div>
                ) : explanation ? (
                    <div className="p-4 space-y-6">
                        {/* Summary */}
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                            <p className="text-sm text-gray-200 leading-relaxed">
                                {explanation.summary}
                            </p>
                        </div>

                        {/* Tabs */}
                        <div>
                            <div className="flex border-b border-gray-700 mb-4">
                                <button
                                    onClick={() => setActiveTab('breakdown')}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'breakdown'
                                        ? 'border-purple-500 text-purple-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-300'
                                        }`}
                                >
                                    Breakdown
                                </button>
                                <button
                                    onClick={() => setActiveTab('notes')}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'notes'
                                        ? 'border-purple-500 text-purple-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-300'
                                        }`}
                                >
                                    Notes ({explanation.notes.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('suggestions')}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'suggestions'
                                        ? 'border-purple-500 text-purple-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-300'
                                        }`}
                                >
                                    Suggestions
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="space-y-4">
                                {activeTab === 'breakdown' && (
                                    <div className="space-y-3">
                                        {explanation.breakdown.map((block) => (
                                            <div key={block.id} className="group">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1 p-1 bg-dark-gray rounded text-xs font-mono text-gray-500">
                                                        {block.lineStart}-{block.lineEnd}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-300">{block.explanation}</p>
                                                        {block.codeSnippet && (
                                                            <pre className="mt-1 p-2 bg-matte-black rounded text-xs text-gray-400 overflow-x-auto">
                                                                <code>{block.codeSnippet}</code>
                                                            </pre>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'notes' && (
                                    <div className="space-y-3">
                                        {explanation.notes.map((note) => (
                                            <div key={note.id} className={`p-3 rounded-lg border ${note.severity === 'high' ? 'bg-red-500/10 border-red-500/20' :
                                                note.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20' :
                                                    'bg-blue-500/10 border-blue-500/20'
                                                }`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    {note.type === 'security' && <Shield className="w-4 h-4 text-red-400" />}
                                                    {note.type === 'performance' && <Zap className="w-4 h-4 text-yellow-400" />}
                                                    {note.type === 'pitfall' && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                                                    {note.type === 'best-practice' && <Lightbulb className="w-4 h-4 text-blue-400" />}
                                                    <span className="text-sm font-medium text-bright-white">{note.title}</span>
                                                </div>
                                                <p className="text-sm text-gray-400">{note.description}</p>
                                            </div>
                                        ))}
                                        {explanation.notes.length === 0 && (
                                            <p className="text-sm text-gray-500 text-center py-4">No specific notes for this code.</p>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'suggestions' && (
                                    <ul className="space-y-2">
                                        {explanation.suggestions.map((suggestion, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                                <span>{suggestion}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Example Input/Output */}
                        {explanation.exampleInputOutput && (
                            <div className="bg-matte-black rounded-lg p-3 text-xs font-mono">
                                <div className="mb-2">
                                    <span className="text-gray-500 uppercase tracking-wider">Input:</span>
                                    <div className="text-gray-300 mt-1">{explanation.exampleInputOutput.input}</div>
                                </div>
                                <div>
                                    <span className="text-gray-500 uppercase tracking-wider">Output:</span>
                                    <div className="text-purple-300 mt-1">{explanation.exampleInputOutput.output}</div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <BookOpen className="w-12 h-12 mb-2 opacity-20" />
                        <p>Select code to view explanation</p>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            {explanation && (
                <div className="p-3 border-t border-gray-700 bg-dark-gray/30 flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                        <button
                            onClick={onShowSimplified}
                            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Show simplified version"
                        >
                            <span className="text-xs font-medium">Simple</span>
                        </button>
                        <button
                            onClick={onShowAnnotated}
                            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Show annotated code"
                        >
                            <Code className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={onAddComments}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                            <MessageSquarePlus className="w-3.5 h-3.5" />
                            Add Comments
                        </button>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeExplanationPopup;
