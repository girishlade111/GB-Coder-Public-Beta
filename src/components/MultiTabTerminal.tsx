// Multi-Tab Terminal with Split-Screen Layouts
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Terminal, Plus, X, Split, Maximize, Minimize, Copy, Download,
  Settings, Search, Filter, BookOpen, Zap, Palette, Layout,
  Copy as CopyIcon, FileText, Code, Database, Globe, Terminal as TerminalIcon
} from 'lucide-react';
import { TerminalOutput, TerminalState } from '../types/index';
import { comprehensiveTerminalCommands } from '../services/comprehensiveTerminalCommands';
import { commandHistoryService } from '../services/commandHistoryService';
import { syntaxHighlighter } from '../services/syntaxHighlighter';

interface TerminalTab {
  id: string;
  name: string;
  type: 'console' | 'file' | 'git' | 'package' | 'build' | 'test' | 'deploy';
  outputs: TerminalOutput[];
  commandHistory: string[];
  isActive: boolean;
  isPinned: boolean;
  lastActivity: number;
  theme: 'dark' | 'light' | 'monokai' | 'solarized' | 'dracula' | 'nord';
}

interface SplitLayout {
  id: string;
  direction: 'horizontal' | 'vertical';
  tabs: string[]; // Array of tab IDs
  size: number; // 0-100 percentage
}

interface MultiTabTerminalProps {
  onCodeChange?: (code: string, language: string) => void;
  onFileOpen?: (filename: string) => void;
  onThemeChange?: (theme: string) => void;
  className?: string;
}

const MultiTabTerminal: React.FC<MultiTabTerminalProps> = ({
  onCodeChange,
  onFileOpen,
  onThemeChange,
  className = ''
}) => {
  // Core state
  const [tabs, setTabs] = useState<TerminalTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [splits, setSplits] = useState<SplitLayout[]>([]);
  const [currentSplitId, setCurrentSplitId] = useState<string>('');
  
  // UI state
  const [command, setCommand] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // References
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<HTMLDivElement>(null);

  // Initialize terminal state
  const [terminalState] = useState<TerminalState>(() => {
    const saved = localStorage.getItem('multi-tab-terminal-state');
    const defaultState: TerminalState = {
      currentDirectory: '/',
      commandHistory: [],
      fileSystem: {
        'README.md': {
          name: 'README.md',
          type: 'file',
          content: '# Welcome to Multi-Tab Terminal\n\nThis is your enhanced terminal environment!',
          size: 45,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        },
        'projects': {
          name: 'projects',
          type: 'directory',
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        }
      },
      npmPackages: JSON.parse(localStorage.getItem('terminal-npm-packages') || '{}'),
      environment: {
        USER: 'developer',
        HOME: '/home/developer',
        PATH: '/usr/local/bin:/usr/bin:/bin',
        SHELL: '/bin/bash',
        TERM: 'xterm-256color',
        NODE_ENV: 'development',
      },
    };
    
    return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
  });

  // Initialize tabs and splits
  useEffect(() => {
    if (tabs.length === 0) {
      const initialTab: TerminalTab = {
        id: 'console-1',
        name: 'Console',
        type: 'console',
        outputs: [],
        commandHistory: [],
        isActive: true,
        isPinned: false,
        lastActivity: Date.now(),
        theme: 'dark'
      };
      
      setTabs([initialTab]);
      setActiveTabId(initialTab.id);
      setSplits([{
        id: 'split-1',
        direction: 'horizontal',
        tabs: [initialTab.id],
        size: 100
      }]);
      setCurrentSplitId('split-1');
      
      // Add welcome message
      const welcomeOutput: TerminalOutput = {
        id: 'welcome',
        type: 'info',
        message: `🚀 Multi-Tab Terminal v2.0.0
Type 'help' for available commands, 'history' for command history, or 'split' to create new terminal splits.
Current directory: ${terminalState.currentDirectory}`,
        timestamp: new Date().toISOString()
      };
      
      setTabs(prev => prev.map(tab => 
        tab.id === initialTab.id 
          ? { ...tab, outputs: [welcomeOutput] }
          : tab
      ));
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [tabs, autoScroll]);

  // Save state
  useEffect(() => {
    localStorage.setItem('multi-tab-terminal-state', JSON.stringify(terminalState));
  }, [terminalState]);

  // Handle command submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || !activeTabId) return;

    const trimmedCommand = command.trim();
    const startTime = Date.now();
    
    // Add command to history
    commandHistoryService.addCommand(trimmedCommand, {
      executionTime: startTime,
      output: 'Processing...'
    });

    // Add command output to active tab
    const commandOutput: TerminalOutput = {
      id: `cmd-${Date.now()}`,
      type: 'system',
      message: `$ ${trimmedCommand}`,
      timestamp: new Date().toISOString(),
    };

    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { 
            ...tab, 
            outputs: [...tab.outputs, commandOutput],
            commandHistory: [...tab.commandHistory, trimmedCommand],
            lastActivity: Date.now()
          }
        : tab
    ));

    // Process command
    if (trimmedCommand === 'clear') {
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, outputs: [] }
          : tab
      ));
    } else if (trimmedCommand.startsWith('split')) {
      handleSplitCommand(trimmedCommand);
    } else {
      comprehensiveTerminalCommands.processCommand(trimmedCommand, terminalState)
        .then(results => {
          setTabs(prev => prev.map(tab => 
            tab.id === activeTabId 
              ? { ...tab, outputs: [...tab.outputs, ...results] }
              : tab
          ));
        })
        .catch(error => {
          const errorOutput: TerminalOutput = {
            id: `error-${Date.now()}`,
            type: 'error',
            message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            timestamp: new Date().toISOString(),
          };
          setTabs(prev => prev.map(tab => 
            tab.id === activeTabId 
              ? { ...tab, outputs: [...tab.outputs, errorOutput] }
              : tab
          ));
        });
    }

    setCommand('');
    setHistoryIndex(-1);
  }, [command, activeTabId, terminalState]);

  // Handle split commands
  const handleSplitCommand = useCallback((cmd: string) => {
    const args = cmd.split(' ');
    
    if (args[1] === 'vertical') {
      createVerticalSplit();
    } else if (args[1] === 'horizontal') {
      createHorizontalSplit();
    } else if (args[1] === 'new') {
      createNewTab();
    }
  }, []);

  // Create new tab
  const createNewTab = useCallback((type: TerminalTab['type'] = 'console') => {
    const newTab: TerminalTab = {
      id: `tab-${Date.now()}`,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type,
      outputs: [],
      commandHistory: [],
      isActive: false,
      isPinned: false,
      lastActivity: Date.now(),
      theme: 'dark'
    };
    
    setTabs(prev => [...prev, newTab]);
    
    // Add to current split
    setSplits(prev => prev.map(split => 
      split.id === currentSplitId 
        ? { ...split, tabs: [...split.tabs, newTab.id] }
        : split
    ));
    
    return newTab.id;
  }, [currentSplitId]);

  // Create vertical split
  const createVerticalSplit = useCallback(() => {
    const newSplitId = `split-${Date.now()}`;
    const newTabId = createNewTab('console');
    
    const newSplit: SplitLayout = {
      id: newSplitId,
      direction: 'vertical',
      tabs: [newTabId],
      size: 50
    };
    
    setSplits(prev => [...prev, newSplit]);
  }, [createNewTab]);

  // Create horizontal split
  const createHorizontalSplit = useCallback(() => {
    const newSplitId = `split-${Date.now()}`;
    const newTabId = createNewTab('console');
    
    const newSplit: SplitLayout = {
      id: newSplitId,
      direction: 'horizontal',
      tabs: [newTabId],
      size: 50
    };
    
    setSplits(prev => [...prev, newSplit]);
  }, [createNewTab]);

  // Close tab
  const closeTab = useCallback((tabId: string) => {
    if (tabs.length === 1) return; // Don't close last tab
    
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    setSplits(prev => prev.map(split => ({
      ...split,
      tabs: split.tabs.filter(id => id !== tabId)
    })));
    
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId);
      if (remainingTabs.length > 0) {
        setActiveTabId(remainingTabs[0].id);
      }
    }
  }, [tabs, activeTabId]);

  // Switch to tab
  const switchToTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    setTabs(prev => prev.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })));
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const history = commandHistoryService.getRecent(50);
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const history = commandHistoryService.getRecent(50);
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCommand(history[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleAutocomplete();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  }, [historyIndex]);

  // Autocomplete
  const handleAutocomplete = useCallback(() => {
    if (!command) return;
    
    const availableCommands = comprehensiveTerminalCommands.getAvailableCommands();
    const matches = availableCommands
      .map(cmd => cmd.name)
      .filter(cmd => cmd.startsWith(command));
    
    setSuggestions(matches);
    if (matches.length === 1) {
      setCommand(matches[0]);
    }
  }, [command]);

  // Get tab icon
  const getTabIcon = (type: TerminalTab['type']) => {
    switch (type) {
      case 'console': return <TerminalIcon className="w-4 h-4" />;
      case 'file': return <FileText className="w-4 h-4" />;
      case 'git': return <Code className="w-4 h-4" />;
      case 'package': return <Database className="w-4 h-4" />;
      case 'build': return <Zap className="w-4 h-4" />;
      case 'test': return <Filter className="w-4 h-4" />;
      case 'deploy': return <Globe className="w-4 h-4" />;
      default: return <TerminalIcon className="w-4 h-4" />;
    }
  };

  // Get active tab
  const getActiveTab = () => tabs.find(tab => tab.id === activeTabId);

  // Filter outputs
  const getFilteredOutputs = (outputs: TerminalOutput[]) => {
    if (!filterText) return outputs;
    return outputs.filter(output => 
      output.message.toLowerCase().includes(filterText.toLowerCase())
    );
  };

  const activeTab = getActiveTab();
  const filteredOutputs = activeTab ? getFilteredOutputs(activeTab.outputs) : [];

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${className} ${
      isMaximized ? 'fixed inset-4 z-50' : ''
    }`}>
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-medium text-gray-300">Multi-Tab Terminal</h3>
          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
            {tabs.length} tabs
          </span>
          {splits.length > 1 && (
            <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
              {splits.length} splits
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => createNewTab()}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="New Tab"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          <button
            onClick={createVerticalSplit}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Split Vertical"
          >
            <Split className="w-4 h-4 rotate-90" />
          </button>
          
          <button
            onClick={createHorizontalSplit}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Split Horizontal"
          >
            <Split className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Command History"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-800 border-b border-gray-700 p-3">
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded"
              />
              Auto-scroll
            </label>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter output..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-gray-200 placeholder-gray-400"
              />
            </div>
            
            <button
              onClick={() => {
                if (activeTab) {
                  setTabs(prev => prev.map(tab => 
                    tab.id === activeTabId 
                      ? { ...tab, outputs: [] }
                      : tab
                  ));
                }
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
            >
              Clear Tab
            </button>
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div className="bg-gray-800 border-b border-gray-700 flex items-center overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-3 py-2 border-r border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
              tab.isActive ? 'bg-gray-900 text-white' : 'text-gray-400'
            } ${tab.isPinned ? 'bg-yellow-600 bg-opacity-20' : ''}`}
            onClick={() => switchToTab(tab.id)}
            ref={tabRef}
          >
            {getTabIcon(tab.type)}
            <span className="text-sm">{tab.name}</span>
            {tab.id !== 'console-1' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="p-0.5 hover:bg-gray-600 rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Terminal Content */}
      <div className="flex">
        {/* Main Terminal Area */}
        <div className="flex-1">
          {/* Output Area */}
          <div 
            ref={outputRef}
            className={`bg-black p-4 font-mono text-sm overflow-y-auto ${
              isMaximized ? 'h-[calc(100vh-300px)]' : 'h-80'
            }`}
          >
            {filteredOutputs.length === 0 ? (
              <div className="text-gray-500 italic text-center py-8">
                Terminal ready. Type 'help' for available commands...
                <br />
                <span className="text-xs">Use Tab for autocomplete, ↑↓ for history, Ctrl+Enter to execute</span>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredOutputs.map((output) => (
                  <div key={output.id} className="flex items-start gap-2">
                    <span className="text-gray-500 text-xs mt-0.5 flex-shrink-0">
                      {new Date(output.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`flex-shrink-0 mt-0.5 ${
                      output.type === 'success' ? 'text-green-400' :
                      output.type === 'error' ? 'text-red-400' :
                      output.type === 'warning' ? 'text-yellow-400' :
                      output.type === 'info' ? 'text-blue-400' :
                      output.type === 'system' ? 'text-purple-400' :
                      'text-gray-300'
                    }`}>
                      {output.type === 'success' ? '✅' :
                       output.type === 'error' ? '❌' :
                       output.type === 'warning' ? '⚠️' :
                       output.type === 'info' ? 'ℹ️' :
                       output.type === 'system' ? '$' : '•'}
                    </span>
                    <pre className={`flex-1 whitespace-pre-wrap ${
                      output.type === 'success' ? 'text-green-300' :
                      output.type === 'error' ? 'text-red-300' :
                      output.type === 'warning' ? 'text-yellow-300' :
                      output.type === 'info' ? 'text-blue-300' :
                      output.type === 'system' ? 'text-purple-300' :
                      'text-gray-300'
                    }`}>
                      {output.message}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="bg-gray-800 border-t border-gray-700 p-3">
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-mono text-sm flex-shrink-0">
                {terminalState.currentDirectory}$
              </span>
              <input
                ref={inputRef}
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter command... (Tab for autocomplete, ↑↓ for history, Ctrl+Enter to execute)"
                className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 outline-none font-mono text-sm"
                autoFocus
              />
              <button
                type="submit"
                className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors flex-shrink-0"
                title="Execute Command (Enter or Ctrl+Enter)"
              >
                <TerminalIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-4">
              <span>💡 Quick commands:</span>
              <button 
                type="button"
                onClick={() => setCommand('help')}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                help
              </button>
              <button 
                type="button"
                onClick={() => setCommand('split new')}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                split new
              </button>
              <button 
                type="button"
                onClick={() => setCommand('npm list')}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                npm list
              </button>
              <button 
                type="button"
                onClick={() => setCommand('git status')}
                className="text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                git status
              </button>
            </div>
          </form>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="w-80 bg-gray-850 border-l border-gray-700 p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Command History</h4>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {commandHistoryService.getRecent(20).map((cmd, index) => (
                <div
                  key={index}
                  className="text-xs font-mono text-gray-400 hover:text-gray-200 hover:bg-gray-700 p-1 rounded cursor-pointer"
                  onClick={() => setCommand(cmd)}
                >
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Split Layout Visualization */}
      {splits.length > 1 && (
        <div className="bg-gray-800 border-t border-gray-700 p-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Layout:</span>
            {splits.map(split => (
              <span key={split.id} className="bg-gray-700 px-2 py-1 rounded">
                {split.direction} ({split.tabs.length} tabs)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiTabTerminal;