import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import TerminalView from './TerminalView';

interface TerminalTab {
    id: string;
    label: string;
}

let terminalCounter = 1;

const TerminalConsolePanel: React.FC = () => {
    const [terminals, setTerminals] = useState<TerminalTab[]>([
        { id: '1', label: 'bash' }
    ]);
    const [activeId, setActiveId] = useState<string>('1');

    const handleNewTerminal = () => {
        terminalCounter++;
        const newTerminal: TerminalTab = {
            id: Date.now().toString(),
            label: `sh #${terminalCounter}`
        };
        setTerminals(prev => [...prev, newTerminal]);
        setActiveId(newTerminal.id);
    };

    const handleCloseTab = (id: string) => {
        setTerminals(prev => {
            const filtered = prev.filter(t => t.id !== id);

            // If we closed the active tab, activate another one
            if (id === activeId && filtered.length > 0) {
                const closedIndex = prev.findIndex(t => t.id === id);
                // Activate the next tab, or the previous one if this was the last
                const newActiveIndex = closedIndex >= filtered.length ? filtered.length - 1 : closedIndex;
                setActiveId(filtered[newActiveIndex].id);
            }

            // If no tabs left, create a default one
            if (filtered.length === 0) {
                const defaultTab: TerminalTab = {
                    id: Date.now().toString(),
                    label: 'bash'
                };
                setActiveId(defaultTab.id);
                return [defaultTab];
            }

            return filtered;
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-900">
            {/* Header with tabs */}
            <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-2 py-1">
                {/* Left: Tabs */}
                <div className="flex items-center gap-1 flex-1 overflow-x-auto">
                    {terminals.map(terminal => (
                        <div
                            key={terminal.id}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-t cursor-pointer transition-colors ${activeId === terminal.id
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-650'
                                }`}
                            onClick={() => setActiveId(terminal.id)}
                        >
                            <span>{terminal.label}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCloseTab(terminal.id);
                                }}
                                className="hover:text-red-400 transition-colors"
                                title="Close terminal"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}

                    {/* New terminal button */}
                    <button
                        onClick={handleNewTerminal}
                        className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                        title="New Terminal"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* Right: Terminal label */}
                <div className="text-[11px] tracking-wide text-slate-500 font-medium uppercase ml-4">
                    TERMINAL
                </div>
            </div>

            {/* Terminal body */}
            <div className="flex-1 overflow-hidden relative bg-slate-950">
                {terminals.map(terminal => (
                    <TerminalView
                        key={terminal.id}
                        id={terminal.id}
                        active={terminal.id === activeId}
                        onClosed={() => {
                            // Optional: handle terminal disconnect
                            console.log(`Terminal ${terminal.id} closed`);
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default TerminalConsolePanel;
