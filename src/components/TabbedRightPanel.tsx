import React, { useState, Suspense } from 'react';
import { Eye, Terminal, Sparkles } from 'lucide-react';
import PreviewPanel from './PreviewPanel';
import { ConsoleLog, AISuggestion } from '../types';

// Lazy load heavy components
const EnhancedConsole = React.lazy(() => import('./EnhancedConsole'));
const AISuggestionPanel = React.lazy(() => import('./AISuggestionPanel'));

type TabType = 'preview' | 'console' | 'suggestions';

interface TabbedRightPanelProps {
    // Error and suggestion counts for badges
    errorCount: number;
    suggestionCount: number;
    showAISuggestions: boolean;

    // Preview Panel props
    html: string;
    css: string;
    javascript: string;
    onConsoleLog: (log: ConsoleLog) => void;
    autoRunJS?: boolean;
    previewDelay?: number;

    // Console props
    consoleLogs: ConsoleLog[];
    onClearConsole: () => void;
    onCommand?: (command: string) => Promise<void>;
    onApplyErrorFix?: (fixedHtml: string, fixedCss: string, fixedJavascript: string) => void;

    // AI Suggestions props
    aiSuggestions: AISuggestion[];
    onApplySuggestion?: (suggestion: AISuggestion) => void;
    onDismissSuggestion?: (suggestionId: string) => void;
}

const TabbedRightPanel: React.FC<TabbedRightPanelProps> = ({
    errorCount,
    suggestionCount,
    showAISuggestions,
    // Preview props
    html,
    css,
    javascript,
    onConsoleLog,
    autoRunJS = true,
    previewDelay = 300,
    // Console props
    consoleLogs,
    onClearConsole,
    onCommand,
    onApplyErrorFix,
    // AI Suggestions props
    aiSuggestions,
    onApplySuggestion,
    onDismissSuggestion,
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('preview');

    const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
        {
            id: 'preview',
            label: 'Live Preview',
            icon: <Eye className="w-4 h-4" />,
        },
        {
            id: 'console',
            label: 'Console',
            icon: <Terminal className="w-4 h-4" />,
            badge: errorCount > 0 ? errorCount : undefined,
            badgeColor: 'bg-red-500',
        },
        {
            id: 'suggestions',
            label: 'AI Suggestions',
            icon: <Sparkles className="w-4 h-4" />,
            badge: suggestionCount > 0 ? suggestionCount : undefined,
            badgeColor: 'bg-purple-500',
        },
    ];

    // Filter out AI Suggestions tab if disabled
    const visibleTabs = showAISuggestions ? tabs : tabs.filter(tab => tab.id !== 'suggestions');

    // If current tab is suggestions but it's hidden, switch to preview
    React.useEffect(() => {
        if (!showAISuggestions && activeTab === 'suggestions') {
            setActiveTab('preview');
        }
    }, [showAISuggestions, activeTab]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'preview':
                return (
                    <PreviewPanel
                        html={html}
                        css={css}
                        javascript={javascript}
                        onConsoleLog={onConsoleLog}
                        autoRunJS={autoRunJS}
                        previewDelay={previewDelay}
                    />
                );
            case 'console':
                return (
                    <Suspense fallback={
                        <div className="bg-matte-black border border-gray-700 rounded-lg p-4 text-center">
                            <div className="w-6 h-6 border-3 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">Loading Console...</p>
                        </div>
                    }>
                        <EnhancedConsole
                            logs={consoleLogs}
                            onClear={onClearConsole}
                            html={html}
                            css={css}
                            javascript={javascript}
                            onCommand={onCommand}
                            onApplyErrorFix={onApplyErrorFix}
                            className="h-full"
                        />
                    </Suspense>
                );
            case 'suggestions':
                return showAISuggestions ? (
                    <Suspense fallback={null}>
                        <AISuggestionPanel
                            suggestions={aiSuggestions}
                            onApplySuggestion={onApplySuggestion}
                            onDismiss={onDismissSuggestion}
                        />
                    </Suspense>
                ) : null;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-matte-black border border-gray-700 rounded-lg overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex items-center bg-dark-gray border-b border-gray-700">
                {visibleTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200
              border-b-2 -mb-[1px]
              ${activeTab === tab.id
                                ? 'text-white border-purple-500 bg-matte-black'
                                : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-750'
                            }
            `}
                        aria-selected={activeTab === tab.id}
                        role="tab"
                    >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                        {tab.badge !== undefined && tab.badge > 0 && (
                            <span
                                className={`
                  ${tab.badgeColor} text-white text-xs font-bold
                  px-1.5 py-0.5 rounded-full min-w-[20px] text-center
                  flex items-center justify-center
                `}
                            >
                                {tab.badge > 99 ? '99+' : tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default TabbedRightPanel;
