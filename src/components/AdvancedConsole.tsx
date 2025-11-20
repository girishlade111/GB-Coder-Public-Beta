import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Terminal, X, Plus, Search, Settings, Download, Upload, Copy, Maximize2, Minimize2,
  Filter, Trash2, Pin, PinOff, ChevronDown, ChevronRight, AlertCircle, Info,
  AlertTriangle, Bug, Zap, Clock, BarChart2, Shield, Keyboard, Palette, Command, Database,
  Activity
} from 'lucide-react';
import {
  ConsoleLogEntry, ConsoleTab, ConsoleFilter, LogLevel, ConsoleTheme,
  AutoCompleteItem, SearchResult, LayoutConfig
} from '../types/console.types';
import { syntaxHighlighter } from '../services/syntaxHighlighter';
import { autoCompleteService } from '../services/autoCompleteService';
import { searchFilterService } from '../services/searchFilterService';
import { keyboardShortcutManager } from '../services/keyboardShortcutManager';
import { themeLayoutManager } from '../services/themeLayoutManager';
import { commandHistoryService } from '../services/commandHistoryService';
import { performanceAnalyticsService } from '../services/performanceAnalyticsService';
import { securityService } from '../services/securityService';
import { sessionDataService } from '../services/sessionDataService';
import { outputStreamingService } from '../services/outputStreamingService';
import { debugToolsService } from '../services/debugToolsService';
import { externalToolsService } from '../services/externalToolsService';
import ShortcutsManager from './ShortcutsManager';
import SessionManager from './SessionManager';

interface AdvancedConsoleProps {
  onCommand?: (command: string) => Promise<void>;
  initialLogs?: ConsoleLogEntry[];
  className?: string;
}

const AdvancedConsole: React.FC<AdvancedConsoleProps> = ({
  onCommand,
  initialLogs = [],
  className = '',
}) => {
  // State
  const [tabs, setTabs] = useState<ConsoleTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [command, setCommand] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [autoCompleteItems, setAutoCompleteItems] = useState<AutoCompleteItem[]>([]);
  const [selectedAutoCompleteIndex, setSelectedAutoCompleteIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ConsoleTheme>('dark');
  const [layout, setLayout] = useState<LayoutConfig>(themeLayoutManager.getCurrentLayout());
  const [showPerformance, setShowPerformance] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showShortcutsManager, setShowShortcutsManager] = useState(false);
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandPaletteQuery, setCommandPaletteQuery] = useState('');
  const [commandPaletteItems, setCommandPaletteItems] = useState<Array<{
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    action: () => void;
  }>>([]);
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);
  const [serviceHealth, setServiceHealth] = useState<Record<string, 'healthy' | 'warning' | 'error'>>({});
  const [showServiceMonitor, setShowServiceMonitor] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showExternalTools, setShowExternalTools] = useState(false);
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [streamingStatus, setStreamingStatus] = useState<Record<string, string>>({});
  const [debugSession, setDebugSession] = useState<any>(null);
  const [externalTools, setExternalTools] = useState<any[]>([]);
  const [availableCommands, setAvailableCommands] = useState<any[]>([]);

  // Service health monitoring
  const startServiceHealthMonitoring = () => {
    const healthInterval = setInterval(() => {
      const health: Record<string, 'healthy' | 'warning' | 'error'> = {};
      
      try {
        // Check syntaxHighlighter service
        const tokens = syntaxHighlighter.highlight('const test = 42;', 'javascript');
        health.syntaxHighlighter = tokens.length > 0 ? 'healthy' : 'warning';
      } catch (error) {
        health.syntaxHighlighter = 'error';
      }

      try {
        // Check autoComplete service
        const suggestions = autoCompleteService.getSuggestions({
          currentInput: 'npm',
          cursorPosition: 3,
          history: [],
          environment: {},
        });
        health.autoComplete = suggestions.length >= 0 ? 'healthy' : 'warning';
      } catch (error) {
        health.autoComplete = 'error';
      }

      try {
        // Check searchFilter service
        const filter: ConsoleFilter = {
          levels: [],
          searchQuery: 'test',
          caseSensitive: false,
          includeStackTrace: false,
        };
        const results = searchFilterService.searchLogs([], filter);
        health.searchFilter = Array.isArray(results) ? 'healthy' : 'warning';
      } catch (error) {
        health.searchFilter = 'error';
      }

      try {
        // Check commandHistory service
        const recent = commandHistoryService.getRecent(1);
        health.commandHistory = Array.isArray(recent) ? 'healthy' : 'warning';
      } catch (error) {
        health.commandHistory = 'error';
      }

      try {
        // Check performanceAnalytics service
        const metrics = performanceAnalyticsService.getMetrics();
        health.performanceAnalytics = metrics && typeof metrics.commandCount === 'number' ? 'healthy' : 'warning';
      } catch (error) {
        health.performanceAnalytics = 'error';
      }

      try {
        // Check security service
        const validation = securityService.validateCommand('help');
        health.security = validation && typeof validation.valid === 'boolean' ? 'healthy' : 'warning';
      } catch (error) {
        health.security = 'error';
      }

      try {
        // Check sessionData service
        const session = sessionDataService.getCurrentSession();
        health.sessionData = session || true ? 'healthy' : 'warning';
      } catch (error) {
        health.sessionData = 'error';
      }

      setServiceHealth(health);
    }, 5000);

    return () => clearInterval(healthInterval);
  };

  const stopServiceHealthMonitoring = () => {
    // Will be handled by the interval cleanup in startServiceHealthMonitoring
  };

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize
  useEffect(() => {
    // Create default tab if none exist
    if (tabs.length === 0) {
      const defaultTab = createTab('Console');
      setTabs([defaultTab]);
      setActiveTabId(defaultTab.id);
    }

    // Register keyboard shortcuts
    registerShortcuts();

    // Load theme
    const theme = themeLayoutManager.getCurrentTheme();
    setCurrentTheme(theme.name);

    // Start service health monitoring
    const cleanup = startServiceHealthMonitoring();

    return () => {
      // Cleanup
      performanceAnalyticsService.stopMonitoring();
      if (cleanup) cleanup();
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [tabs, activeTabId]);

  // Create new tab
  const createTab = (name: string): ConsoleTab => {
    return {
      id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      logs: [],
      filters: {
        levels: [],
        searchQuery: '',
        caseSensitive: false,
        includeStackTrace: false,
      },
      isPinned: false,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  };

  // Get active tab
  const activeTab = useMemo(() => {
    return tabs.find(t => t.id === activeTabId);
  }, [tabs, activeTabId]);

  // Get filtered logs
  const filteredLogs = useMemo(() => {
    if (!activeTab) return [];

    if (searchQuery) {
      const filter: ConsoleFilter = {
        ...activeTab.filters,
        searchQuery,
      };
      const results = searchFilterService.searchLogs(activeTab.logs, filter);
      return results.map(r => r.logEntry);
    }

    return activeTab.logs;
  }, [activeTab, searchQuery]);

  // Initialize new services and components
  useEffect(() => {
    // Initialize external tools
    const tools = externalToolsService.getAllTools();
    setExternalTools(tools);
    
    // Initialize available commands
    const commands = externalToolsService.getAllCommands();
    setAvailableCommands(commands);

    // Subscribe to debug session updates
    const unsubscribeDebug = debugToolsService.subscribe((session) => {
      setDebugSession(session);
    });

    // Start service health monitoring
    const cleanup = startServiceHealthMonitoring();

    return () => {
      unsubscribeDebug();
      outputStreamingService.closeAllStreams();
      if (cleanup) cleanup();
    };
  }, []);

  // Initialize command palette items
  const initializeCommandPalette = () => {
    const items = [
      {
        id: 'clear-logs',
        title: 'Clear Logs',
        description: 'Clear all logs in the current tab',
        icon: <Trash2 className="w-4 h-4" />,
        action: clearLogs,
      },
      {
        id: 'search-logs',
        title: 'Search Logs',
        description: 'Open the search panel',
        icon: <Search className="w-4 h-4" />,
        action: () => setShowSearch(true),
      },
      {
        id: 'new-tab',
        title: 'New Tab',
        description: 'Create a new console tab',
        icon: <Plus className="w-4 h-4" />,
        action: addTab,
      },
      {
        id: 'toggle-fullscreen',
        title: 'Toggle Fullscreen',
        description: 'Toggle fullscreen mode',
        icon: isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />,
        action: () => setIsExpanded(!isExpanded),
      },
      {
        id: 'export-session',
        title: 'Export Session',
        description: 'Export current session data',
        icon: <Download className="w-4 h-4" />,
        action: exportSession,
      },
      {
        id: 'copy-output',
        title: 'Copy Output',
        description: 'Copy console output to clipboard',
        icon: <Copy className="w-4 h-4" />,
        action: copyOutput,
      },
      {
        id: 'performance',
        title: 'Performance Dashboard',
        description: 'Show performance metrics',
        icon: <BarChart2 className="w-4 h-4" />,
        action: () => setShowPerformance(!showPerformance),
      },
      {
        id: 'shortcuts',
        title: 'Keyboard Shortcuts',
        description: 'Manage keyboard shortcuts',
        icon: <Keyboard className="w-4 h-4" />,
        action: () => setShowShortcutsManager(true),
      },
      {
        id: 'session-manager',
        title: 'Session Manager',
        description: 'Manage console sessions',
        icon: <Database className="w-4 h-4" />,
        action: () => setShowSessionManager(true),
      },
      {
        id: 'settings',
        title: 'Settings',
        description: 'Open console settings',
        icon: <Settings className="w-4 h-4" />,
        action: () => setShowSettings(!showSettings),
      },
      {
        id: 'help',
        title: 'Help',
        description: 'Show available commands',
        icon: <Info className="w-4 h-4" />,
        action: showHelp,
      },
      {
        id: 'service-monitor',
        title: 'Service Monitor',
        description: 'Show service health status',
        icon: <BarChart2 className="w-4 h-4" />,
        action: () => setShowServiceMonitor(!showServiceMonitor),
      },
      {
        id: 'debug-panel',
        title: 'Debug Panel',
        description: 'Toggle debug tools and error tracking',
        icon: <Bug className="w-4 h-4" />,
        action: () => setShowDebugPanel(!showDebugPanel),
      },
      {
        id: 'external-tools',
        title: 'External Tools',
        description: 'Manage external tool integrations',
        icon: <Database className="w-4 h-4" />,
        action: () => setShowExternalTools(!showExternalTools),
      },
      {
        id: 'start-stream',
        title: 'Start WebSocket Stream',
        description: 'Start real-time data streaming',
        icon: <Zap className="w-4 h-4" />,
        action: startWebSocketStream,
      },
    ];
    setCommandPaletteItems(items);
  };

  // Start WebSocket stream
  const startWebSocketStream = () => {
    const streamId = outputStreamingService.createWebSocketStream(
      'wss://echo.websocket.org',
      {
        onOpen: () => {
          addLog({
            id: Date.now().toString(),
            timestamp: Date.now(),
            level: 'info',
            message: 'WebSocket stream connected',
          });
        },
        onError: (error) => {
          addLog({
            id: Date.now().toString(),
            timestamp: Date.now(),
            level: 'error',
            message: `WebSocket error: ${error}`,
          });
        },
      }
    );
    
    setActiveStreamId(streamId);
    
    // Subscribe to stream data
    outputStreamingService.subscribe(streamId, (log) => {
      addLog(log);
    });
    
    // Update streaming status
    setStreamingStatus(prev => ({
      ...prev,
      [streamId]: 'connected'
    }));
  };

  // Stop WebSocket stream
  const stopWebSocketStream = (streamId?: string) => {
    const idToStop = streamId || activeStreamId;
    if (idToStop) {
      outputStreamingService.closeStream(idToStop);
      if (activeStreamId === idToStop) {
        setActiveStreamId(null);
      }
      setStreamingStatus(prev => {
        const updated = { ...prev };
        delete updated[idToStop];
        return updated;
      });
    }
  };

  // Execute external command
  const executeExternalCommand = async (commandName: string, args: string[] = []) => {
    try {
      const result = await externalToolsService.executeCommand(commandName, args);
      addLog({
        id: Date.now().toString(),
        timestamp: Date.now(),
        level: 'system',
        message: `$ ${commandName} ${args.join(' ')}`,
      });
      addLog({
        id: Date.now().toString(),
        timestamp: Date.now(),
        level: 'info',
        message: result,
      });
    } catch (error) {
      addLog({
        id: Date.now().toString(),
        timestamp: Date.now(),
        level: 'error',
        message: `Command failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  // Register keyboard shortcuts
  const registerShortcuts = () => {
    keyboardShortcutManager.registerAction('clear', () => clearLogs());
    keyboardShortcutManager.registerAction('focus', () => inputRef.current?.focus());
    keyboardShortcutManager.registerAction('search', () => setShowSearch(true));
    keyboardShortcutManager.registerAction('newTab', () => addTab());
    keyboardShortcutManager.registerAction('closeTab', () => closeTab(activeTabId));
    keyboardShortcutManager.registerAction('toggleFullscreen', () => setIsExpanded(!isExpanded));
    keyboardShortcutManager.registerAction('export', () => exportSession());
    keyboardShortcutManager.registerAction('settings', () => setShowSettings(!showSettings));
    keyboardShortcutManager.registerAction('help', () => showHelp());
    keyboardShortcutManager.registerAction('commandPalette', () => {
      setShowCommandPalette(true);
      initializeCommandPalette();
    });
    keyboardShortcutManager.registerAction('shortcuts', () => setShowShortcutsManager(true));
    keyboardShortcutManager.registerAction('performance', () => setShowPerformance(!showPerformance));
    keyboardShortcutManager.registerAction('debug', () => setShowDebugPanel(!showDebugPanel));
    keyboardShortcutManager.registerAction('externalTools', () => setShowExternalTools(!showExternalTools));
    keyboardShortcutManager.registerAction('startStream', startWebSocketStream);
  };

  // Add log entry
  const addLog = useCallback((log: ConsoleLogEntry) => {
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        return {
          ...tab,
          logs: [...tab.logs, log],
          updatedAt: Date.now(),
        };
      }
      return tab;
    }));

    // Track in analytics
    if (log.level === 'error') {
      performanceAnalyticsService.trackError(new Error(log.message));
    }
  }, [activeTabId]);

  // Clear logs
  const clearLogs = useCallback(() => {
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        return {
          ...tab,
          logs: [],
          updatedAt: Date.now(),
        };
      }
      return tab;
    }));
  }, [activeTabId]);

  // Add new tab
  const addTab = () => {
    const newTab = createTab(`Console ${tabs.length + 1}`);
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  // Close tab
  const closeTab = (tabId: string) => {
    if (tabs.length <= 1) return;

    const tabIndex = tabs.findIndex(t => t.id === tabId);
    setTabs(prev => prev.filter(t => t.id !== tabId));

    if (activeTabId === tabId) {
      const newActiveIndex = Math.max(0, tabIndex - 1);
      setActiveTabId(tabs[newActiveIndex]?.id || '');
    }
  };

  // Toggle pin tab
  const togglePinTab = (tabId: string) => {
    setTabs(prev => prev.map(tab => {
      if (tab.id === tabId) {
        return { ...tab, isPinned: !tab.isPinned };
      }
      return tab;
    }));
  };

  // Handle command submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const trimmedCommand = command.trim();

    // Validate command
    const validation = securityService.validateCommand(trimmedCommand);
    if (!validation.valid) {
      addLog({
        id: Date.now().toString(),
        timestamp: Date.now(),
        level: 'error',
        message: `Security: ${validation.reason}`,
      });
      return;
    }

    // Add command to output
    addLog({
      id: Date.now().toString(),
      timestamp: Date.now(),
      level: 'system',
      message: `$ ${trimmedCommand}`,
    });

    // Add to history
    commandHistoryService.addCommand(trimmedCommand);
    autoCompleteService.addToHistory(trimmedCommand);

    // Track command
    const startTime = performance.now();

    try {
      // Check if it's an external command first
      const externalCommand = availableCommands.find(cmd => trimmedCommand.startsWith(cmd.name));
      if (externalCommand) {
        const args = trimmedCommand.slice(externalCommand.name.length).trim().split(/\s+/).filter(Boolean);
        await executeExternalCommand(externalCommand.name, args);
      } else if (onCommand) {
        await onCommand(trimmedCommand);
      }

      const executionTime = performance.now() - startTime;
      performanceAnalyticsService.trackCommand(trimmedCommand, executionTime, true);
    } catch (error) {
      const executionTime = performance.now() - startTime;
      performanceAnalyticsService.trackCommand(trimmedCommand, executionTime, false);

      addLog({
        id: Date.now().toString(),
        timestamp: Date.now(),
        level: 'error',
        message: error instanceof Error ? error.message : 'Command failed',
        stackTrace: error instanceof Error ? error.stack : undefined,
      });
    }

    setCommand('');
    setShowAutoComplete(false);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCommand(value);

    // Get auto-complete suggestions
    if (value.length >= 2) {
      const suggestions = autoCompleteService.getSuggestions({
        currentInput: value,
        cursorPosition: e.target.selectionStart || value.length,
        history: commandHistoryService.getRecent(20),
        environment: {},
      });
      setAutoCompleteItems(suggestions);
      setShowAutoComplete(suggestions.length > 0);
      setSelectedAutoCompleteIndex(0);
    } else {
      setShowAutoComplete(false);
    }
  };

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showAutoComplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedAutoCompleteIndex(prev => 
          Math.min(prev + 1, autoCompleteItems.length - 1)
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedAutoCompleteIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        if (autoCompleteItems[selectedAutoCompleteIndex]) {
          e.preventDefault();
          setCommand(autoCompleteItems[selectedAutoCompleteIndex].value);
          setShowAutoComplete(false);
        }
      } else if (e.key === 'Escape') {
        setShowAutoComplete(false);
      }
    } else {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = commandHistoryService.getPrevious();
        if (prev) setCommand(prev);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = commandHistoryService.getNext();
        if (next !== null) setCommand(next);
      }
    }
  };

  // Select auto-complete item
  const selectAutoCompleteItem = (item: AutoCompleteItem) => {
    setCommand(item.value);
    setShowAutoComplete(false);
    inputRef.current?.focus();
  };

  // Export session
  const exportSession = () => {
    sessionDataService.downloadSession('json');
  };

  // Import session
  const importSession = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (sessionDataService.importSession(content)) {
        addLog({
          id: Date.now().toString(),
          timestamp: Date.now(),
          level: 'success',
          message: 'Session imported successfully',
        });
      } else {
        addLog({
          id: Date.now().toString(),
          timestamp: Date.now(),
          level: 'error',
          message: 'Failed to import session',
        });
      }
    };
    reader.readAsText(file);
  };

  // Copy output
  const copyOutput = () => {
    const text = filteredLogs.map(log => 
      `[${new Date(log.timestamp).toISOString()}] [${log.level.toUpperCase()}] ${log.message}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      addLog({
        id: Date.now().toString(),
        timestamp: Date.now(),
        level: 'info',
        message: 'Output copied to clipboard',
      });
    });
  };

  // Show help
  const showHelp = () => {
    addLog({
      id: Date.now().toString(),
      timestamp: Date.now(),
      level: 'info',
      message: `Available commands:
• help - Show this help message
• clear - Clear console output
• theme <name> - Change theme (dark, light, monokai, solarized, dracula, nord)
• export - Export session data
• history - Show command history
• shortcuts - Show keyboard shortcuts
• performance - Show performance metrics`,
    });
  };

  // Change theme
  const changeTheme = (theme: ConsoleTheme) => {
    themeLayoutManager.setTheme(theme);
    setCurrentTheme(theme);
  };

  // Command palette functionality
  const filteredCommandPaletteItems = useMemo(() => {
    if (!commandPaletteQuery) return commandPaletteItems;
    
    const query = commandPaletteQuery.toLowerCase();
    return commandPaletteItems.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  }, [commandPaletteItems, commandPaletteQuery]);

  const executeCommandPaletteItem = (item: typeof commandPaletteItems[0]) => {
    item.action();
    setShowCommandPalette(false);
    setCommandPaletteQuery('');
    setSelectedPaletteIndex(0);
  };

  const handleCommandPaletteKeyDown = (e: React.KeyboardEvent) => {
    if (!showCommandPalette) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedPaletteIndex(prev => 
          Math.min(prev + 1, filteredCommandPaletteItems.length - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedPaletteIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommandPaletteItems[selectedPaletteIndex]) {
          executeCommandPaletteItem(filteredCommandPaletteItems[selectedPaletteIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowCommandPalette(false);
        setCommandPaletteQuery('');
        setSelectedPaletteIndex(0);
        break;
    }
  };

  // Get log icon
  const getLogIcon = (level: LogLevel) => {
    switch (level) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
      case 'debug': return <Bug className="w-4 h-4 text-purple-400" />;
      case 'success': return <Zap className="w-4 h-4 text-green-400" />;
      default: return <Terminal className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get log color
  const getLogColor = (level: LogLevel) => {
    switch (level) {
      case 'error': return 'text-red-300';
      case 'warn': return 'text-yellow-300';
      case 'info': return 'text-blue-300';
      case 'debug': return 'text-purple-300';
      case 'success': return 'text-green-300';
      case 'system': return 'text-purple-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 ${
      isExpanded ? 'fixed inset-4 z-50' : 'relative'
    } ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-medium text-gray-300">Advanced Console</h3>
          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
            {filteredLogs.length} logs
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Search (Ctrl+F)"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowPerformance(!showPerformance)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Performance"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowServiceMonitor(!showServiceMonitor)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Service Monitor"
          >
            <Database className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Debug Panel"
          >
            <Bug className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowExternalTools(!showExternalTools)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="External Tools"
          >
            <Activity className="w-4 h-4" />
          </button>
          {activeStreamId && (
            <button
              onClick={() => stopWebSocketStream()}
              className="p-1.5 hover:bg-red-600 rounded text-red-400 hover:text-white transition-colors"
              title="Stop Stream"
            >
              <Zap className="w-4 h-4" />
            </button>
          )}
          {!activeStreamId && (
            <button
              onClick={startWebSocketStream}
              className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
              title="Start Stream"
            >
              <Zap className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={copyOutput}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Copy Output"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={exportSession}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Export Session"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Import Session"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowShortcutsManager(true)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setShowCommandPalette(true);
              initializeCommandPalette();
            }}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Command Palette (Ctrl+Shift+P)"
          >
            <Command className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 flex items-center overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-3 py-2 border-r border-gray-700 cursor-pointer ${
              tab.id === activeTabId ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveTabId(tab.id)}
          >
            {tab.isPinned && <Pin className="w-3 h-3" />}
            <span className="text-sm">{tab.name}</span>
            <span className="text-xs bg-gray-700 px-1 rounded">{tab.logs.length}</span>
            {!tab.isPinned && tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addTab}
          className="p-2 text-gray-400 hover:text-gray-200"
          title="New Tab"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="bg-gray-800 border-b border-gray-700 p-2">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 outline-none text-sm"
              autoFocus
            />
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearch(false);
              }}
              className="text-gray-400 hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-800 border-b border-gray-700 p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <label className="text-gray-400 block mb-1">Theme</label>
              <select
                value={currentTheme}
                onChange={(e) => changeTheme(e.target.value as ConsoleTheme)}
                className="w-full bg-gray-700 text-gray-200 rounded px-2 py-1"
              >
                {themeLayoutManager.getAvailableThemes().map(theme => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-400 block mb-1">Font Size</label>
              <input
                type="number"
                value={layout.fontSize}
                onChange={(e) => {
                  const newLayout = { ...layout, fontSize: parseInt(e.target.value) };
                  setLayout(newLayout);
                  themeLayoutManager.updateLayout(newLayout);
                }}
                className="w-full bg-gray-700 text-gray-200 rounded px-2 py-1"
                min="10"
                max="24"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={layout.showTimestamps}
                onChange={(e) => {
                  const newLayout = { ...layout, showTimestamps: e.target.checked };
                  setLayout(newLayout);
                  themeLayoutManager.updateLayout(newLayout);
                }}
                className="rounded"
              />
              <label className="text-gray-300">Show Timestamps</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={layout.wordWrap}
                onChange={(e) => {
                  const newLayout = { ...layout, wordWrap: e.target.checked };
                  setLayout(newLayout);
                  themeLayoutManager.updateLayout(newLayout);
                }}
                className="rounded"
              />
              <label className="text-gray-300">Word Wrap</label>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={clearLogs}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
            >
              Clear Logs
            </button>
            <button
              onClick={() => commandHistoryService.clear()}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs"
            >
              Clear History
            </button>
          </div>
        </div>
      )}

      {/* Performance Panel */}
      {showPerformance && (
        <div className="bg-gray-800 border-b border-gray-700 p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {Object.entries(performanceAnalyticsService.getPerformanceReport()).map(([key, value]) => (
              <div key={key}>
                <span className="text-gray-400 block">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="text-gray-200 font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Health Monitor Panel */}
      {showServiceMonitor && (
        <div className="bg-gray-800 border-b border-gray-700 p-3">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Service Health Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {Object.entries(serviceHealth).map(([service, status]) => (
                <div key={service} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'healthy' ? 'bg-green-400' :
                    status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  <span className="text-gray-300">{service}</span>
                  <span className="text-xs text-gray-500">({status})</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Services are checked every 5 seconds for availability and performance.
          </div>
        </div>
      )}

      {/* Debug Panel */}
      {showDebugPanel && (
        <div className="bg-gray-800 border-b border-gray-700 p-3">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Debug Tools</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400 block mb-2">Session Status</span>
                <span className="text-gray-200 capitalize">{debugSession?.status || 'idle'}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-2">Breakpoints</span>
                <span className="text-gray-200">{debugSession?.breakpoints?.length || 0}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-2">Variables</span>
                <span className="text-gray-200">{debugSession?.variables?.length || 0}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-2">Errors</span>
                <span className="text-gray-200">{debugSession?.errors?.length || 0}</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => debugToolsService.startDebugging()}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
              >
                Start Debugging
              </button>
              <button
                onClick={() => debugToolsService.stopDebugging()}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
              >
                Stop Debugging
              </button>
              <button
                onClick={() => debugToolsService.clearErrors()}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs"
              >
                Clear Errors
              </button>
            </div>
          </div>
        </div>
      )}

      {/* External Tools Panel */}
      {showExternalTools && (
        <div className="bg-gray-800 border-b border-gray-700 p-3">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-300 mb-2">External Tools</h4>
            <div className="mb-3">
              <span className="text-gray-400 block mb-2">Available Tools</span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {externalTools.map(tool => (
                  <div key={tool.id} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                    <div className={`w-2 h-2 rounded-full ${
                      tool.enabled ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <span className="text-gray-200 text-xs">{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <span className="text-gray-400 block mb-2">Quick Commands</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableCommands.slice(0, 6).map(cmd => (
                  <button
                    key={cmd.name}
                    onClick={() => executeExternalCommand(cmd.name)}
                    className="text-left p-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-200"
                  >
                    <div className="font-medium">{cmd.name}</div>
                    <div className="text-gray-400">{cmd.description}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Click any command to execute it in the console.
            </div>
          </div>
        </div>
      )}

      {/* Output Area */}
      <div
        ref={outputRef}
        className={`bg-black p-4 font-mono overflow-y-auto ${
          isExpanded ? 'h-[calc(100vh-300px)]' : 'h-64'
        }`}
        style={{ fontSize: `${layout.fontSize}px` }}
      >
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 italic text-center py-8">
            Console output will appear here...
            <br />
            <span className="text-xs">Type 'help' for available commands</span>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 py-1">
                {layout.showTimestamps && (
                  <span className="text-gray-500 text-xs mt-0.5 flex-shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                )}
                {getLogIcon(log.level)}
                <pre className={`flex-1 ${layout.wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'} ${getLogColor(log.level)}`}>
                  {log.message}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="bg-gray-800 border-t border-gray-700 p-3 relative">
        {/* Auto-complete dropdown */}
        {showAutoComplete && autoCompleteItems.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-t-lg max-h-48 overflow-y-auto">
            {autoCompleteItems.map((item, index) => (
              <div
                key={item.value}
                className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                  index === selectedAutoCompleteIndex ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
                onClick={() => selectAutoCompleteItem(item)}
              >
                <div>
                  <span className="text-gray-200">{item.value}</span>
                  {item.description && (
                    <span className="text-gray-500 text-xs ml-2">{item.description}</span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{item.type}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono text-sm flex-shrink-0">$</span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter command... (Tab for autocomplete, ↑↓ for history)"
            className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 outline-none font-mono text-sm"
            autoFocus
          />
        </div>
      </form>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={importSession}
        className="hidden"
      />

      {/* Command Palette Modal */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Command className="w-5 h-5 text-blue-400" />
                <input
                  type="text"
                  value={commandPaletteQuery}
                  onChange={(e) => setCommandPaletteQuery(e.target.value)}
                  onKeyDown={handleCommandPaletteKeyDown}
                  placeholder="Type a command..."
                  className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 outline-none text-lg"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {filteredCommandPaletteItems.length === 0 ? (
                <div className="p-4 text-gray-400 text-center">
                  No commands found
                </div>
              ) : (
                filteredCommandPaletteItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      index === selectedPaletteIndex 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-gray-700 text-gray-200'
                    }`}
                    onClick={() => executeCommandPaletteItem(item)}
                  >
                    <div className="text-gray-400">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-400">{item.description}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-3 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 bg-gray-700 rounded">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 bg-gray-700 rounded">↵</kbd>
                  Execute
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 bg-gray-700 rounded">Esc</kbd>
                  Close
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Manager Modal */}
      <ShortcutsManager
        isOpen={showShortcutsManager}
        onClose={() => setShowShortcutsManager(false)}
      />
    </div>
  );
};

export default AdvancedConsole;
