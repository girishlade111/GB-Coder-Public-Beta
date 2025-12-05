import React from 'react';
import { Lightbulb, Bug, Zap, Palette, Loader2 } from 'lucide-react';
import { SelectionOperationType } from '../services/selectionOperationsService';
import { EditorLanguage } from '../types';

interface SelectionToolbarProps {
    position: { top: number; left: number };
    language: EditorLanguage;
    onOperation: (operation: SelectionOperationType) => void;
    isLoading: boolean;
    currentOperation?: SelectionOperationType;
}

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
    position,
    language,
    onOperation,
    isLoading,
    currentOperation,
}) => {
    const operations = [
        {
            type: 'explain' as SelectionOperationType,
            icon: Lightbulb,
            label: 'Explain',
            tooltip: 'Explain selected code',
            color: 'text-purple-400 hover:text-purple-300',
            enabled: true,
        },
        {
            type: 'debug' as SelectionOperationType,
            icon: Bug,
            label: 'Debug',
            tooltip: 'Find and fix issues',
            color: 'text-red-400 hover:text-red-300',
            enabled: true,
        },
        {
            type: 'optimize' as SelectionOperationType,
            icon: Zap,
            label: 'Optimize',
            tooltip: 'Optimize performance',
            color: 'text-yellow-400 hover:text-yellow-300',
            enabled: true,
        },
        {
            type: 'improveUI' as SelectionOperationType,
            icon: Palette,
            label: 'Improve UI',
            tooltip: 'Enhance visual design',
            color: 'text-blue-400 hover:text-blue-300',
            enabled: language === 'html' || language === 'css', // Only for HTML/CSS
        },
    ];

    return (
        <div
            className="fixed z-50 bg-dark-gray border border-gray-600 rounded-lg shadow-2xl p-1 flex items-center gap-1"
            style={{
                top: `${position.top + 20}px`,
                left: `${position.left}px`,
            }}
        >
            {operations.map((op) => {
                const Icon = op.icon;
                const isCurrentOp = currentOperation === op.type;
                const isDisabled = !op.enabled || (isLoading && !isCurrentOp);

                return (
                    <button
                        key={op.type}
                        onClick={() => !isDisabled && onOperation(op.type)}
                        disabled={isDisabled}
                        className={`p-2 rounded transition-all duration-200 ${isDisabled
                                ? 'opacity-40 cursor-not-allowed'
                                : `${op.color} hover:bg-gray-700`
                            }`}
                        title={op.tooltip}
                    >
                        {isLoading && isCurrentOp ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Icon className="w-4 h-4" />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default SelectionToolbar;
