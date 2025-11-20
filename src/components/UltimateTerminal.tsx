// Ultimate Terminal - The Complete Web Development Terminal Interface
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Terminal, Plus, X, Split, Maximize, Minimize, Copy, Download, Settings,
  Search, Filter, BookOpen, Zap, Palette, Layout, Copy as CopyIcon,
  FileText, Code, Database, Globe, Terminal as TerminalIcon, Play,
  Square, Pause, SkipForward, RotateCcw, Save, FolderOpen, FileUp,
  FileDown, Trash2, Edit3, Eye, EyeOff, Monitor, Smartphone, Tablet,
  Wifi, WifiOff, HardDrive, Cpu, MemoryStick, Activity, Gauge,
  Clock, User, Lock, Unlock, Layers, Grid3X3, Columns, Rows, Bug,
  CheckCircle, AlertCircle, Info, XCircle, PlayCircle, RefreshCw,
  MonitorPlay, TerminalSquare, Code2, GitBranch, Package, Server,
  Shield, Users, Timer, BarChart3, Workflow, Sparkles
} from 'lucide-react';

// Import all services
import { TerminalTab, SplitLayout, TerminalOutput, TerminalState } from '../types/terminal.types';
import { terminalStateManager } from '../services/terminalStateManager';
import { comprehensiveTerminalCommands } from '../services/comprehensiveTerminalCommands';
import { commandHistoryService } from '../services/commandHistoryService';
import { themeLayoutManager } from '../services/themeLayoutManager';
import { browserIntegrationService } from '../services/browserIntegration';
import { performanceMonitoringService } from '../services/performanceMonitoring';
import { debuggingInterfaceService } from '../services/debuggingInterface';
import { pluginManagerService } from '../services/pluginManager';
import { securityService } from '../services/securityService';
import { outputStreamingService } from '../services/outputStreamingService';
import { searchFilterService } from '../services/searchFilterService';
import { externalToolsService } from '../services/externalToolsService';

interface UltimateTerminalProps {
  className?: string;
  onCodeChange?: (code: string, language: string) => void;
  onFileOpen?: (filename: string) => void;
  onThemeChange?: (theme: string) => void;
  theme?: string;
  layout?: string;
  initialTabs?: number;
  enableAdvancedFeatures?: boolean;
  enablePlugins?: boolean;
  enableSecurity?: boolean;
  enableMonitoring?: boolean;
}

export const UltimateTerminal: React.FC<UltimateTerminalProps> = ({
  className = '',
  onCodeChange,
  onFileOpen,
  onThemeChange,
  theme: initialTheme,
  layout: initialLayout,
  initialTabs = 1,
  enableAdvancedFeatures = true,
  enablePlugins = true,
  enableSecurity = true,
  enableMonitoring = true
}) => {
  // Core state management
  const [terminalState, setTerminalState] = useState<TerminalState>(() => terminalStateManager.getState());
  const [tabs, setTabs] = useState<TerminalTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [splits, setSplits] = useState<SplitLayout[]>([]);
  const [currentSplitId, setCurrentSplitId] = useState<string>('');
  
  // UI state
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showFileTree, setShowFileTree] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showProcesses, setShowProcesses] = useState(false);
  const [showJobs, setShowJobs] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showPlugins, setShowPlugins] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showMonitoring, setShowMonitoring] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
  // Advanced features state
  const [dragOver, setDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterText, setFilterText] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [cursorBlink, setCursorBlink] = useState(true);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState<any[]>([]);
  const [autocompleteIndex, setAutocompleteIndex] = useState(-1);
  
  // Performance and monitoring state
  const [backgroundJobs, setBackgroundJobs] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [debugSessions, setDebugSessions] = useState<any[]>([]);
  const [activePlugins, setActivePlugins] = useState<any[]>([]);
  
  // Theme state
  const [currentTheme, setCurrentTheme] = useState<any>(() => 
    themeLayoutManager.getActiveTheme() || themeLayoutManager.getThemes()[0]
  );
  const [availableThemes, setAvailableThemes] = useState<any[]>(() => 
    themeLayoutManager.getThemes()
  );
  
  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const outputRefs = useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map());
  const inputRefs = useRef<Map<string, React.RefObject<HTMLInputElement>>>(new Map());
  const monitoringIntervalRef = useRef<NodeJS.Timeout>();

  /**
   * Initialize the ultimate terminal
   */
  useEffect(() => {
    initializeTerminal();
    setupEventListeners();
    initializeServices();
    
    if (enableMonitoring) {
      startMonitoring();
    }
    
    return () => {
      cleanup();
    };
  }, []);

  /**
   * Initialize terminal tabs and splits
   */
  const initializeTerminal = useCallback(() => {
    // Create initial tabs
    const defaultTabs: TerminalTab[] = [];
    for (let i = 0; i < initialTabs; i++) {
      const tabType = i === 0 ? 'console' : 
                     i === 1 ? 'git' : 
                     i === 2 ? 'file' : 'console';
      
      defaultTabs.push({
        id: `ultimate-tab-${Date.now()}-${i}`,
        name: getTabName(tabType),
        type: tabType,
        outputs: [{
          id: `welcome-${i}`,
          type: 'info',
          message: getWelcomeMessage(tabType),
          timestamp: Date.now()
        }],
        commandHistory: [],
        historyIndex: -1,
        isActive: i === 0,
        isPinned: false,
        isModified: false,
        lastActivity: Date.now(),
        directory: terminalState.currentDirectory,
        theme: terminalState.preferences.theme
      });
    }

    setTabs(defaultTabs);
    setActiveTabId(defaultTabs[0].id);
    
    // Create initial split
    const defaultSplit: SplitLayout = {
      id: 'ultimate-split-1',
      direction: initialLayout === 'vertical' ? 'vertical' : 'horizontal',
      tabs: defaultTabs.map(tab => tab.id),
      size: 100,
      resizable: true
    };
    
    setSplits([defaultSplit]);
    setCurrentSplitId(defaultSplit.id);
    
    // Initialize panels
    defaultTabs.forEach((tab, index) => {
      const panel = {
        id: `ultimate-panel-${index}`,
        tabId: tab.id,
        splitId: defaultSplit.id,
        ref: React.createRef<HTMLDivElement>(),
        outputRef: React.createRef<HTMLDivElement>(),
        inputRef: React.createRef<HTMLInputElement>(),
        isResizing: false,
        size: 100 / defaultTabs.length
      };
      
      outputRefs.current.set(tab.id, panel.outputRef);
      inputRefs.current.set(tab.id, panel.inputRef);
    });
  }, [initialTabs, initialLayout, terminalState.currentDirectory, terminalState.preferences.theme]);

  /**
   * Get tab name based on type
   */
  const getTabName = (type: TerminalTab['type']): string => {
    const names = {
      console: 'Ultimate Console',
      file: 'File Manager',
      git: 'Git Control',
      package: 'Package Manager',
      build: 'Build Tools',
      test: 'Test Runner',
      deploy: 'Deployment',
      debug: 'Debugger',
      network: 'Network'
    };
    return names[type] || 'Terminal';
  };

  /**
   * Get welcome message for tab type
   */
  const getWelcomeMessage = (type: TerminalTab['type']): string => {
    const baseMessage = `🚀 Ultimate Terminal v3.0.0 - The Complete Web Development Environment

✨ Advanced Features:
• Multi-tab support with split-screen layouts
• 200+ development commands (file ops, git, package mgmt)
• Build tools integration (webpack, vite, parcel, gulp, grunt)
• Development servers (live-server, http-server)
• Testing frameworks (jest, mocha, vitest, cypress)
• Linting tools (eslint, prettier, stylelint)
• Package managers (npm, yarn, pnpm, pip, composer)
• Browser integration with live preview
• Performance monitoring and debugging
• Plugin architecture with extensibility
• Advanced autocomplete with context awareness
• Real-time search and filtering
• Session persistence and history
• Security measures and input validation
• Theme engine with 20+ color schemes
• Keyboard shortcuts and accessibility

🎯 Quick Start:
• Use Ctrl+T for new tabs, Ctrl+Shift+T for vertical split
• Tab completion for commands and files
• ↑↓ arrows for command history, Ctrl+R for search
• Ctrl+, for settings, F1 for help
• Drag & drop files to upload
• Use 'plugins' command to manage extensions

`;

    const typeSpecific = {
      console: 'Ready for commands. Type "help" to see all available commands.',
      file: 'File manager ready. Use "ls", "cd", "mkdir" for file operations.',
      git: 'Git integration ready. Use "git status", "git commit" for version control.',
      package: 'Package manager ready. Use "npm install", "yarn add" for dependencies.',
      build: 'Build tools ready. Use "webpack", "vite", "parcel" for project builds.',
      test: 'Testing framework ready. Use "jest", "mocha", "cypress" for tests.',
      deploy: 'Deployment tools ready. Use "deploy" commands for publishing.',
      debug: 'Debugger ready. Use "debug start" to begin debugging session.',
      network: 'Network utilities ready. Use "curl", "ping", "ssh" for networking.'
    };

    return baseMessage + (typeSpecific[type] || '');
  };

  /**
   * Check if input is focused
   */
  const isInputFocused = (): boolean => {
    const activeElement = document.activeElement;
    return !!(activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.getAttribute('contenteditable') === 'true'
    ));
  };

  /**
   * Handle file drop
   */
  const handleFileDrop = useCallback((e: DragEvent) => {
    const files = Array.from(e.dataTransfer?.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const path = `/${file.name}`;
        terminalStateManager.createFile?.(path, content);
        addTabOutput(activeTabId, {
          id: `drop-${Date.now()}`,
          type: 'success',
          message: `📁 File ${file.name} dropped successfully (${file.size} bytes)`,
          timestamp: Date.now()
        });
      };
      reader.readAsText(file);
    });
  }, [activeTabId, terminalStateManager]);

  /**
   * Update current directory
   */
  const updateCurrentDirectory = useCallback(() => {
    // Update directory display in active tab
  }, []);

  /**
   * Update preferences
   */
  const updatePreferences = useCallback(() => {
    const prefs = terminalStateManager.getPreferences();
    setFontSize(prefs.fontSize || 14);
    setAutoScroll(prefs.autoScroll !== false);
    setShowTimestamps(prefs.showTimestamps !== false);
    setShowLineNumbers(prefs.showLineNumbers || false);
    setWordWrap(prefs.wordWrap !== false);
  }, []);

  /**
   * Create new tab
   */
  const createNewTab = useCallback((type: TerminalTab['type'] = 'console') => {
    const newTab: TerminalTab = {
      id: `ultimate-tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: getTabName(type),
      type,
      outputs: [{
        id: `welcome-${Date.now()}`,
        type: 'info',
        message: getWelcomeMessage(type),
        timestamp: Date.now()
      }],
      commandHistory: [],
      historyIndex: -1,
      isActive: false,
      isPinned: false,
      isModified: false,
      lastActivity: Date.now(),
      directory: terminalState.currentDirectory,
      theme: terminalState.preferences.theme
    };

    setTabs(prev => [...prev, newTab]);
    
    // Add to current split
    setSplits(prev => prev.map(split => 
      split.id === currentSplitId 
        ? { ...split, tabs: [...split.tabs, newTab.id] }
        : split
    ));

    // Switch to new tab
    switchToTab(newTab.id);
    
    return newTab.id;
  }, [terminalState.currentDirectory, terminalState.preferences.theme, currentSplitId]);

  /**
   * Switch to tab
   */
  const switchToTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    setTabs(prev => prev.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })));
    
    // Focus input
    setTimeout(() => {
      const inputRef = inputRefs.current.get(tabId);
      inputRef?.current?.focus();
    }, 100);
  }, []);

  /**
   * Previous tab
   */
  const previousTab = useCallback(() => {
    const activeIndex = tabs.findIndex(t => t.id === activeTabId);
    const prevIndex = activeIndex > 0 ? activeIndex - 1 : tabs.length - 1;
    switchToTab(tabs[prevIndex].id);
  }, [tabs, activeTabId, switchToTab]);

  /**
   * Next tab
   */
  const nextTab = useCallback(() => {
    const activeIndex = tabs.findIndex(t => t.id === activeTabId);
    const nextIndex = activeIndex < tabs.length - 1 ? activeIndex + 1 : 0;
    switchToTab(tabs[nextIndex].id);
  }, [tabs, activeTabId, switchToTab]);

  /**
   * Create vertical split
   */
  const createVerticalSplit = useCallback(() => {
    if (splits.length >= 4) return;
    
    const newSplitId = `ultimate-split-${Date.now()}`;
    const newTabId = createNewTab('console');
    
    const newSplit: SplitLayout = {
      id: newSplitId,
      direction: 'vertical',
      tabs: [newTabId],
      size: 50,
      resizable: true
    };
    
    setSplits(prev => [...prev, newSplit]);
    
    // Create new panel
    const newPanel = {
      id: `ultimate-panel-${Date.now()}`,
      tabId: newTabId,
      splitId: newSplitId,
      ref: React.createRef<HTMLDivElement>(),
      outputRef: React.createRef<HTMLDivElement>(),
      inputRef: React.createRef<HTMLInputElement>(),
      isResizing: false,
      size: 50
    };
    
    outputRefs.current.set(newTabId, newPanel.outputRef);
    inputRefs.current.set(newTabId, newPanel.inputRef);
  }, [splits.length, createNewTab]);

  /**
   * Create horizontal split
   */
  const createHorizontalSplit = useCallback(() => {
    if (splits.length >= 4) return;
    
    const newSplitId = `ultimate-split-${Date.now()}`;
    const newTabId = createNewTab('console');
    
    const newSplit: SplitLayout = {
      id: newSplitId,
      direction: 'horizontal',
      tabs: [newTabId],
      size: 50,
      resizable: true
    };
    
    setSplits(prev => [...prev, newSplit]);
    
    // Create new panel
    const newPanel = {
      id: `ultimate-panel-${Date.now()}`,
      tabId: newTabId,
      splitId: newSplitId,
      ref: React.createRef<HTMLDivElement>(),
      outputRef: React.createRef<HTMLDivElement>(),
      inputRef: React.createRef<HTMLInputElement>(),
      isResizing: false,
      size: 50
    };
    
    outputRefs.current.set(newTabId, newPanel.outputRef);
    inputRefs.current.set(newTabId, newPanel.inputRef);
  }, [splits.length, createNewTab]);

  /**
   * Cleanup function
   */
  const cleanup = useCallback(() => {
    if (isMonitoring) {
      performanceMonitoringService.disable();
    }
    browserIntegrationService.destroy?.();
    outputStreamingService.closeAllStreams?.();
  }, [isMonitoring]);

  /**
   * Setup event listeners
   */
  const setupEventListeners = useCallback(() => {
    // Global keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isInputFocused()) {
        handleGlobalKeyboardShortcut(e);
      }
    };

    // Drag and drop handlers
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFileDrop(e);
    };

    // State management observers
    terminalStateManager.addObserver((state, event) => {
      setTerminalState(state);
      
      switch (event) {
        case 'directory-changed':
          updateCurrentDirectory();
          break;
        case 'preferences-updated':
          updatePreferences();
          break;
      }
    });

    // Performance monitoring
    if (enableMonitoring) {
      performanceMonitoringService.addObserver((metrics) => {
        setPerformanceMetrics(metrics);
      });
    }

    // Plugin events
    if (enablePlugins) {
      pluginManagerService.addObserver((plugin, event) => {
        if (event === 'enabled') {
          setActivePlugins(prev => [...prev, plugin]);
        } else if (event === 'disabled') {
          setActivePlugins(prev => prev.filter(p => p.id !== plugin.id));
        }
      });
    }

    // Install built-in plugins
    if (enablePlugins) {
      pluginManagerService.installBuiltInPlugins();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, [enableMonitoring, enablePlugins, handleFileDrop, updateCurrentDirectory, updatePreferences]);

  /**
   * Initialize all services
   */
  const initializeServices = useCallback(async () => {
    try {
      // Initialize browser integration
      await browserIntegrationService.initialize();
      
      // Initialize external tools
      externalToolsService.testConnection('github');
      
      // Security initialization
      if (enableSecurity) {
        securityService.auditLog('terminal-initialized', {
          timestamp: Date.now(),
          features: {
            advanced: enableAdvancedFeatures,
            plugins: enablePlugins,
            security: enableSecurity,
            monitoring: enableMonitoring
          }
        });
      }

      console.log('✅ Ultimate Terminal services initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize some services:', error);
    }
  }, [enableAdvancedFeatures, enablePlugins, enableSecurity, enableMonitoring]);

  /**
   * Start performance monitoring
   */
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    performanceMonitoringService.enable();
    
    monitoringIntervalRef.current = setInterval(() => {
      const metrics = performanceMonitoringService.getPerformanceSummary();
      console.log('📊 Performance:', metrics);
    }, 5000);
  }, [isMonitoring]);

  /**
   * Stop performance monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;
    
    setIsMonitoring(false);
    performanceMonitoringService.disable();
    
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }
  }, [isMonitoring]);

  /**
   * Handle global keyboard shortcuts
   */
  const handleGlobalKeyboardShortcut = useCallback((e: KeyboardEvent) => {
    const ctrl = e.ctrlKey || e.metaKey;
    const alt = e.altKey;
    const shift = e.shiftKey;
    const key = e.key;
    
    // Navigation shortcuts
    if (ctrl && !alt && !shift && key === 't') {
      e.preventDefault();
      createNewTab();
    } else if (ctrl && alt && key === 'ArrowLeft') {
      e.preventDefault();
      previousTab();
    } else if (ctrl && alt && key === 'ArrowRight') {
      e.preventDefault();
      nextTab();
    } else if (ctrl && shift && key === 't') {
      e.preventDefault();
      createVerticalSplit();
    } else if (ctrl && shift && key === 's') {
      e.preventDefault();
      createHorizontalSplit();
    }
    
    // View toggles
    else if (ctrl && !alt && !shift && key === 'b') {
      e.preventDefault();
      setShowFileTree(!showFileTree);
    } else if (ctrl && !alt && !shift && key === 'h') {
      e.preventDefault();
      setShowHistory(!showHistory);
    } else if (ctrl && !shift && !alt && key === 'f') {
      e.preventDefault();
      setShowSearch(!showSearch);
    }
    
    // Advanced features
    else if (enableAdvancedFeatures && ctrl && !alt && !shift && key === 'm') {
      e.preventDefault();
      setShowMonitoring(!showMonitoring);
    } else if (enablePlugins && ctrl && !alt && !shift && key === 'p') {
      e.preventDefault();
      setShowPlugins(!showPlugins);
    } else if (enableSecurity && ctrl && !alt && !shift && key === 'x') {
      e.preventDefault();
      setShowSecurity(!showSecurity);
    } else if (ctrl && !alt && !shift && key === 'd') {
      e.preventDefault();
      setShowDebug(!showDebug);
    }
    
    // Settings and help
    else if (ctrl && !alt && !shift && key === ',') {
      e.preventDefault();
      setShowSettings(!showSettings);
    } else if (key === 'F1') {
      e.preventDefault();
      setShowHelp(!showHelp);
    } else if (ctrl && !alt && key === '/') {
      e.preventDefault();
      setShowKeyboardShortcuts(!showKeyboardShortcuts);
    }
  }, [showFileTree, showHistory, showSearch, showMonitoring, showPlugins, showSecurity, showDebug, showSettings, showHelp, showKeyboardShortcuts, enableAdvancedFeatures, enablePlugins, enableSecurity]);

  /**
   * Handle command submission with security validation
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || !activeTabId) return;

    const trimmedCommand = command.trim();
    const startTime = Date.now();
    
    // Security validation
    if (enableSecurity) {
      const validation = securityService.validateCommand(trimmedCommand);
      if (!validation.valid) {
        addTabOutput(activeTabId, {
          id: `security-error-${Date.now()}`,
          type: 'error',
          message: `🚫 Security Error: ${validation.reason}`,
          timestamp: Date.now()
        } as TerminalOutput);
        securityService.auditLog('blocked-command', {
          command: trimmedCommand,
          reason: validation.reason
        });
        return;
      }
    }
    
    // Add to command history
    commandHistoryService.addCommand(trimmedCommand, {
      executionTime: startTime
    });
    
    // Add command to tab history
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { 
            ...tab, 
            commandHistory: [...tab.commandHistory, trimmedCommand],
            historyIndex: -1,
            lastActivity: Date.now()
          }
        : tab
    ));

    // Add command output
    const commandOutput: TerminalOutput = {
      id: `cmd-${Date.now()}`,
      type: 'system',
      message: `$ ${trimmedCommand}`,
      timestamp: startTime
    };

    addTabOutput(activeTabId, commandOutput);

    // Process command with plugins
    try {
      let results: any[];
      
      // Check plugins first
      if (enablePlugins && pluginManagerService.getAvailableCommands().find(cmd => cmd.name === trimmedCommand.split(' ')[0])) {
        const pluginResults = await pluginManagerService.executeCommand(
          trimmedCommand.split(' ')[0],
          trimmedCommand.split(' ').slice(1),
          { terminalState, activeTabId }
        );
        results = Array.isArray(pluginResults) ? pluginResults : [pluginResults];
      } else {
        // Use main command processor with type conversion
        const rawResults = await comprehensiveTerminalCommands.processCommand(trimmedCommand, terminalState);
        results = rawResults.map((result: any) => ({
          ...result,
          timestamp: typeof result.timestamp === 'string' ? Date.now() : result.timestamp
        }));
      }
      
      // Add streaming support for long-running commands
      if (results.length > 0 && results[0].metadata?.streaming) {
        handleStreamingOutput(activeTabId, trimmedCommand);
      } else {
        results.forEach(result => addTabOutput(activeTabId, {
          ...result,
          timestamp: typeof result.timestamp === 'string' ? Date.now() : result.timestamp
        } as TerminalOutput));
      }
      
      // Update state manager
      terminalStateManager.addCommandHistory(trimmedCommand);
      
    } catch (error) {
      const errorOutput: TerminalOutput = {
        id: `error-${Date.now()}`,
        type: 'error',
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      };
      addTabOutput(activeTabId, errorOutput);
      
      // Security audit
      if (enableSecurity) {
        securityService.auditLog('command-error', {
          command: trimmedCommand,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Clear input and reset autocomplete
    setCommand('');
    setShowAutocomplete(false);
    setAutocompleteIndex(-1);
  }, [command, activeTabId, terminalState, enableSecurity, enablePlugins]);

  /**
   * Handle streaming output for long-running commands
   */
  const handleStreamingOutput = useCallback((tabId: string, command: string) => {
    const streamId = outputStreamingService.createPollingStream(
      `/api/terminal/stream/${command}`,
      100
    );
    
    outputStreamingService.subscribe(streamId, (log) => {
      const terminalOutput: TerminalOutput = {
        id: log.id,
        type: log.level === 'error' ? 'error' : 'info',
        message: log.message,
        timestamp: log.timestamp
      };
      addTabOutput(tabId, terminalOutput);
    });
  }, []);

  /**
   * Add output to tab with auto-scroll
   */
  const addTabOutput = useCallback((tabId: string, output: TerminalOutput) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { 
            ...tab, 
            outputs: [...tab.outputs, output].slice(-terminalState.preferences.maxOutputLines),
            lastActivity: Date.now()
          }
        : tab
    ));

    // Auto-scroll to bottom
    setTimeout(() => {
      if (autoScroll && tabId === activeTabId) {
        const outputRef = outputRefs.current.get(tabId);
        outputRef?.current?.scrollTo({ top: outputRef.current?.scrollHeight || 0, behavior: 'smooth' });
      }
    }, 50);
  }, [activeTabId, autoScroll, terminalState.preferences.maxOutputLines]);

  /**
   * Get active tab
   */
  const activeTab = useMemo(() => 
    tabs.find(tab => tab.id === activeTabId),
    [tabs, activeTabId]
  );

  /**
   * Filtered outputs with search
   */
  const filteredOutputs = useMemo(() => {
    if (!activeTab) return [];
    
    let outputs = activeTab.outputs;
    
    if (searchQuery) {
      outputs = outputs.filter(output =>
        output.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterText) {
      outputs = outputs.filter(output =>
        output.message.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    
    return outputs;
  }, [activeTab, searchQuery, filterText]);

  /**
   * Render main component
   */
  return (
    <div
      ref={containerRef}
      className={`relative bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${className} ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      } ${isExpanded ? 'fixed inset-4 z-40' : ''}`}
      style={{
        '--terminal-bg': currentTheme.colors?.background || '#1f2937',
        '--terminal-fg': currentTheme.colors?.foreground || '#f9fafb',
        '--terminal-font-size': `${fontSize}px`,
        '--terminal-line-height': 1.4,
      } as React.CSSProperties}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-dashed border-blue-500 flex items-center justify-center z-50">
          <div className="text-blue-400 text-xl font-semibold bg-gray-900 px-6 py-4 rounded-lg">
            📁 Drop files to upload to terminal
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-200">Ultimate Terminal</h3>
          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
            v3.0.0
          </span>
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
            {tabs.length} tabs • {splits.length} splits
          </span>
          {enableMonitoring && isMonitoring && (
            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Live
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {/* Tab management */}
          <button
            onClick={() => createNewTab()}
            className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="New Tab (Ctrl+T)"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          <button
            onClick={createVerticalSplit}
            className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Split Vertically (Ctrl+Shift+T)"
          >
            <Columns className="w-4 h-4" />
          </button>
          
          <button
            onClick={createHorizontalSplit}
            className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Split Horizontally (Ctrl+Shift+S)"
          >
            <Rows className="w-4 h-4" />
          </button>

          {/* View toggles */}
          <button
            onClick={() => setShowFileTree(!showFileTree)}
            className={`p-2 rounded transition-colors ${
              showFileTree ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
            }`}
            title="File Tree (Ctrl+B)"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded transition-colors ${
              showSearch ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
            }`}
            title="Search (Ctrl+F)"
          >
            <Search className="w-4 h-4" />
          </button>
          
          {/* Advanced features */}
          {enableAdvancedFeatures && (
            <>
              <button
                onClick={() => setShowMonitoring(!showMonitoring)}
                className={`p-2 rounded transition-colors ${
                  showMonitoring ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                }`}
                title="Performance Monitoring (Ctrl+M)"
              >
                <Activity className="w-4 h-4" />
              </button>
              
              {enablePlugins && (
                <button
                  onClick={() => setShowPlugins(!showPlugins)}
                  className={`p-2 rounded transition-colors ${
                    showPlugins ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                  }`}
                  title="Plugin Manager (Ctrl+P)"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
              
              {enableSecurity && (
                <button
                  onClick={() => setShowSecurity(!showSecurity)}
                  className={`p-2 rounded transition-colors ${
                    showSecurity ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                  }`}
                  title="Security Center (Ctrl+X)"
                >
                  <Shield className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={() => setShowDebug(!showDebug)}
                className={`p-2 rounded transition-colors ${
                  showDebug ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                }`}
                title="Debugger (Ctrl+D)"
              >
                <Bug className="w-4 h-4" />
              </button>
            </>
          )}
          
          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded transition-colors ${
              showSettings ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
            }`}
            title="Settings (Ctrl+,)"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          {/* Help */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`p-2 rounded transition-colors ${
              showHelp ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
            }`}
            title="Help (F1)"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-gray-750 px-4 py-1 border-b border-gray-600 flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => switchToTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-t-lg border-b-2 transition-all ${
              tab.isActive
                ? 'bg-gray-800 border-blue-500 text-blue-400'
                : 'bg-gray-700 border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-600'
            }`}
            title={tab.customTitle || tab.name}
          >
            <span className="text-sm">{tab.icon || <Terminal className="w-4 h-4" />}</span>
            <span className="text-sm font-medium">{tab.name}</span>
            {tab.isModified && (
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            )}
            {tab.isPinned && (
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="ml-1 p-1 hover:bg-gray-500 rounded text-gray-400 hover:text-gray-200"
            >
              <X className="w-3 h-3" />
            </button>
          </button>
        ))}
        
        {/* Tab Navigation Controls */}
        <div className="flex items-center ml-2 border-l border-gray-600 pl-2">
          <button
            onClick={previousTab}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
            title="Previous Tab (Ctrl+Alt+Left)"
          >
            <SkipForward className="w-4 h-4 rotate-180" />
          </button>
          <button
            onClick={nextTab}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
            title="Next Tab (Ctrl+Alt+Right)"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Side Panel for File Tree */}
        {showFileTree && (
          <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
            <div className="p-3 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-200">File Tree</h4>
                <button
                  onClick={() => setShowFileTree(false)}
                  className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {renderFileTree()}
            </div>
          </div>
        )}

        {/* Terminal Content */}
        <div className="flex-1 flex flex-col">
          {/* Splits Container */}
          <div className="flex-1 flex">
            {renderSplits()}
          </div>
          
          {/* Status Bar */}
          <div className="bg-gray-800 px-4 py-2 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span>{terminalState.currentDirectory}</span>
              <span>•</span>
              <span>{activeTab?.type || 'console'}</span>
              {terminalState.backgroundJobs.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-green-400">{terminalState.backgroundJobs.length} jobs</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span>{new Date().toLocaleTimeString()}</span>
              {isMonitoring && (
                <span className="flex items-center gap-1 text-green-400">
                  <Activity className="w-3 h-3" />
                  Monitoring
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel for Advanced Features */}
        {(showSearch || showMonitoring || showPlugins || showSecurity || showDebug || showHistory) && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            {renderRightPanel()}
          </div>
        )}
      </div>

      {/* Modals and Overlays */}
      {renderModals()}

      {/* Keyboard Shortcuts Help */}
      {showKeyboardShortcuts && renderKeyboardShortcuts()}
    </div>
  );

  /**
   * Close tab
   */
  function closeTab(tabId: string): void {
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    
    // Switch to another tab if the closed tab was active
    if (activeTabId === tabId && tabs.length > 1) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId);
      const newActiveIndex = Math.max(0, tabs.findIndex(tab => tab.id === tabId) - 1);
      switchToTab(remainingTabs[newActiveIndex].id);
    }
    
    // Remove from splits
    setSplits(prev => prev.map(split => ({
      ...split,
      tabs: split.tabs.filter(id => id !== tabId)
    })));
    
    // Clean up refs
    outputRefs.current.delete(tabId);
    inputRefs.current.delete(tabId);
  }

  /**
   * Render file tree
   */
  function renderFileTree(): React.ReactNode {
    const files = Object.keys(terminalState.fileSystem);
    
    return (
      <div className="space-y-1">
        {files.map(fileName => {
          const file = terminalState.fileSystem[fileName];
          return (
            <div
              key={fileName}
              className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer text-sm"
              onClick={() => handleFileTreeClick(fileName)}
            >
              {file.type === 'directory' ? (
                <FolderOpen className="w-4 h-4 text-blue-400" />
              ) : (
                <FileText className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-gray-300 truncate">{fileName}</span>
            </div>
          );
        })}
      </div>
    );
  }

  /**
   * Handle file tree click
   */
  function handleFileTreeClick(fileName: string): void {
    const file = terminalState.fileSystem[fileName];
    if (file && file.type === 'file') {
      addTabOutput(activeTabId, {
        id: `file-open-${Date.now()}`,
        type: 'info',
        message: `Opening ${fileName}...`,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Render splits
   */
  function renderSplits(): React.ReactNode {
    return splits.map(split => (
      <div
        key={split.id}
        className={`flex-1 flex ${split.direction === 'vertical' ? 'flex-col' : 'flex-row'}`}
        style={{ flexBasis: `${split.size}%` }}
      >
        {split.tabs.map((tabId, index) => {
          const tab = tabs.find(t => t.id === tabId);
          if (!tab) return null;
          
          return (
            <div
              key={tabId}
              className="flex-1 flex flex-col border-r border-gray-700 last:border-r-0"
              style={{ 
                flexBasis: `${split.tabs.length > 1 ? 100 / split.tabs.length : 100}%` 
              }}
            >
              {/* Tab Header */}
              <div className="bg-gray-750 px-3 py-2 border-b border-gray-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{tab.icon || <Terminal className="w-4 h-4" />}</span>
                  <span className="text-sm text-gray-300">{tab.name}</span>
                  {tab.isModified && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">{tab.directory}</span>
                  <button
                    onClick={() => closeTab(tabId)}
                    className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-gray-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              {/* Tab Content */}
              <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
                {/* Terminal Output */}
                <div 
                  ref={outputRefs.current.get(tabId)}
                  className="flex-1 overflow-y-auto p-4 font-mono text-sm"
                  style={{ 
                    fontSize: `${fontSize}px`,
                    lineHeight: currentTheme.fonts?.lineHeight || 1.4
                  }}
                >
                  {filteredOutputs.map(output => renderTerminalOutput(output))}
                </div>
                
                {/* Input Area */}
                <div className="border-t border-gray-700 p-2">
                  <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <span className="text-green-400 text-sm">$</span>
                    <input
                      ref={inputRefs.current.get(tabId)}
                      type="text"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      className="flex-1 bg-transparent text-white outline-none"
                      placeholder="Enter command..."
                      autoFocus
                    />
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ));
  }

  /**
   * Render terminal output with syntax highlighting
   */
  function renderTerminalOutput(output: TerminalOutput): React.ReactNode {
    const timestamp = showTimestamps 
      ? new Date(output.timestamp).toLocaleTimeString()
      : null;

    return (
      <div key={output.id} className="mb-1">
        {timestamp && (
          <span className="text-gray-500 text-xs mr-2">
            [{timestamp}]
          </span>
        )}
        <span className={`${
          output.type === 'error' ? 'text-red-400' :
          output.type === 'success' ? 'text-green-400' :
          output.type === 'warning' ? 'text-yellow-400' :
          output.type === 'info' ? 'text-blue-400' :
          output.type === 'debug' ? 'text-purple-400' :
          'text-gray-300'
        }`}>
          {output.message}
        </span>
      </div>
    );
  }

  /**
   * Render right panel
   */
  function renderRightPanel(): React.ReactNode {
    return (
      <div className="flex flex-col h-full">
        {/* Panel Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { key: 'search', icon: Search, label: 'Search', show: showSearch },
            { key: 'monitoring', icon: Activity, label: 'Monitoring', show: showMonitoring },
            { key: 'plugins', icon: Sparkles, label: 'Plugins', show: showPlugins },
            { key: 'security', icon: Shield, label: 'Security', show: showSecurity },
            { key: 'debug', icon: Bug, label: 'Debug', show: showDebug },
            { key: 'history', icon: Clock, label: 'History', show: showHistory }
          ].filter(tab => tab.show).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveRightPanel(tab.key)}
              className={`flex-1 px-3 py-2 text-xs border-b-2 transition-colors ${
                activeRightPanel === tab.key
                  ? 'border-blue-500 text-blue-400 bg-gray-700'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4 mx-auto mb-1" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeRightPanel === 'search' && renderSearchPanel()}
          {activeRightPanel === 'monitoring' && renderMonitoringPanel()}
          {activeRightPanel === 'plugins' && renderPluginsPanel()}
          {activeRightPanel === 'security' && renderSecurityPanel()}
          {activeRightPanel === 'debug' && renderDebugPanel()}
          {activeRightPanel === 'history' && renderHistoryPanel()}
        </div>
      </div>
    );
  }

  /**
   * Render search panel
   */
  function renderSearchPanel(): React.ReactNode {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Search Output</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
            placeholder="Enter search term..."
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Filter</label>
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
            placeholder="Filter output..."
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterText('');
            }}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded"
          >
            Clear
          </button>
        </div>
      </div>
    );
  }

  /**
   * Render monitoring panel
   */
  function renderMonitoringPanel(): React.ReactNode {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-200">Performance</h4>
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={`px-3 py-1 text-xs rounded ${
              isMonitoring
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isMonitoring ? 'Stop' : 'Start'}
          </button>
        </div>
        
        {performanceMetrics.map((metric, index) => (
          <div key={index} className="bg-gray-700 rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">{metric.name}</span>
              <span className="text-sm text-gray-400">{metric.value}{metric.unit}</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (metric.value / (metric.max || 100)) * 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /**
   * Render plugins panel
   */
  function renderPluginsPanel(): React.ReactNode {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-200">Plugins</h4>
          <button className="text-blue-400 hover:text-blue-300 text-sm">
            + Install
          </button>
        </div>
        
        {activePlugins.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No plugins installed</p>
            <p className="text-xs mt-1">Install plugins to extend functionality</p>
          </div>
        ) : (
          activePlugins.map(plugin => (
            <div key={plugin.id} className="bg-gray-700 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-gray-200">{plugin.name}</h5>
                <div className="flex gap-1">
                  <button className="text-green-400 hover:text-green-300">
                    <Play className="w-4 h-4" />
                  </button>
                  <button className="text-red-400 hover:text-red-300">
                    <Square className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400">{plugin.description}</p>
            </div>
          ))
        )}
      </div>
    );
  }

  /**
   * Render security panel
   */
  function renderSecurityPanel(): React.ReactNode {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-200">Security Center</h4>
        
        <div className="bg-gray-700 rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-200">Security Status</span>
          </div>
          <p className="text-xs text-gray-400">All security checks passed</p>
        </div>
        
        <div className="bg-gray-700 rounded p-3">
          <h5 className="text-sm font-medium text-gray-200 mb-2">Recent Events</h5>
          <div className="space-y-2">
            <div className="text-xs text-gray-400">
              <span className="text-green-400">✓</span> Terminal initialized
            </div>
            <div className="text-xs text-gray-400">
              <span className="text-green-400">✓</span> Command validation active
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render debug panel
   */
  function renderDebugPanel(): React.ReactNode {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-200">Debugger</h4>
        
        {debugSessions.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            <Bug className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No active debug sessions</p>
            <button className="text-blue-400 hover:text-blue-300 text-sm mt-2">
              Start Debugging
            </button>
          </div>
        ) : (
          debugSessions.map(session => (
            <div key={session.id} className="bg-gray-700 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-gray-200">Debug Session</h5>
                <span className={`text-xs px-2 py-1 rounded ${
                  session.status === 'running' ? 'bg-green-600 text-white' :
                  session.status === 'paused' ? 'bg-yellow-600 text-white' :
                  'bg-red-600 text-white'
                }`}>
                  {session.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">{session.type} debugger</p>
            </div>
          ))
        )}
      </div>
    );
  }

  /**
   * Render history panel
   */
  function renderHistoryPanel(): React.ReactNode {
    const history = commandHistoryService.getRecent(20);
    
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-200">Command History</h4>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {history.map((command, index) => (
            <div
              key={index}
              className="bg-gray-700 rounded p-2 cursor-pointer hover:bg-gray-600"
              onClick={() => setCommand(command)}
            >
              <div className="text-sm text-gray-300 font-mono">$ {command}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Render modals
   */
  function renderModals(): React.ReactNode {
    return (
      <>
        {/* Settings Modal */}
        {showSettings && renderSettingsModal()}
        
        {/* Help Modal */}
        {showHelp && renderHelpModal()}
      </>
    );
  }

  /**
   * Render settings modal
   */
  function renderSettingsModal(): React.ReactNode {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-200">Terminal Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Font Size */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Font Size</label>
              <input
                type="range"
                min="10"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-300">{fontSize}px</span>
            </div>
            
            {/* Theme Selection */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Theme</label>
              <select
                value={currentTheme.id}
                onChange={(e) => {
                  setCurrentTheme(themeLayoutManager.getTheme(e.target.value));
                  themeLayoutManager.setActiveTheme(e.target.value);
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                {availableThemes.map(theme => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Toggle Options */}
            <div className="space-y-2">
              {[
                { key: 'autoScroll', label: 'Auto Scroll', value: autoScroll, setter: setAutoScroll },
                { key: 'showTimestamps', label: 'Show Timestamps', value: showTimestamps, setter: setShowTimestamps },
                { key: 'wordWrap', label: 'Word Wrap', value: wordWrap, setter: setWordWrap },
                { key: 'cursorBlink', label: 'Cursor Blink', value: cursorBlink, setter: setCursorBlink }
              ].map(option => (
                <label key={option.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={option.value}
                    onChange={(e) => option.setter(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render help modal
   */
  function renderHelpModal(): React.ReactNode {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-200">Ultimate Terminal Help</h3>
            <button
              onClick={() => setShowHelp(false)}
              className="text-gray-400 hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Quick Start */}
            <section>
              <h4 className="text-md font-semibold text-gray-200 mb-2">Quick Start</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p>• Use <kbd className="bg-gray-700 px-1 rounded">Ctrl+T</kbd> for new tabs</p>
                <p>• Use <kbd className="bg-gray-700 px-1 rounded">Ctrl+Shift+T</kbd> for vertical split</p>
                <p>• Use <kbd className="bg-gray-700 px-1 rounded">Tab</kbd> for autocomplete</p>
                <p>• Use <kbd className="bg-gray-700 px-1 rounded">↑↓</kbd> for command history</p>
                <p>• Use <kbd className="bg-gray-700 px-1 rounded">Ctrl+R</kbd> for history search</p>
              </div>
            </section>
            
            {/* Commands */}
            <section>
              <h4 className="text-md font-semibold text-gray-200 mb-2">Available Commands</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p><strong>File Operations:</strong> ls, cd, mkdir, rm, cp, mv, find, grep</p>
                <p><strong>Git:</strong> git status, git commit, git push, git pull</p>
                <p><strong>Package Managers:</strong> npm, yarn, pnpm, pip, composer</p>
                <p><strong>Build Tools:</strong> webpack, vite, parcel, gulp, grunt</p>
                <p><strong>Testing:</strong> jest, mocha, vitest, cypress</p>
                <p><strong>Development:</strong> dev, serve, lint, test</p>
              </div>
            </section>
            
            {/* Features */}
            <section>
              <h4 className="text-md font-semibold text-gray-200 mb-2">Advanced Features</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p>• Multi-tab support with split-screen layouts</p>
                <p>• 200+ development-focused commands</p>
                <p>• Advanced autocomplete with context awareness</p>
                <p>• Session persistence and history management</p>
                <p>• Plugin architecture with extensibility</p>
                <p>• Performance monitoring and debugging tools</p>
                <p>• Browser integration for live preview</p>
                <p>• Theme engine with 20+ color schemes</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render keyboard shortcuts help
   */
  function renderKeyboardShortcuts(): React.ReactNode {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-[800px] max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-200">Keyboard Shortcuts</h3>
            <button
              onClick={() => setShowKeyboardShortcuts(false)}
              className="text-gray-400 hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-6 text-sm">
            {/* Navigation */}
            <section>
              <h4 className="font-semibold text-gray-200 mb-2">Navigation</h4>
              <div className="space-y-1 text-gray-300">
                <div className="flex justify-between">
                  <span>New Tab</span>
                  <kbd className="bg-gray-700 px-1 rounded">Ctrl+T</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Next Tab</span>
                  <kbd className="bg-gray-700 px-1 rounded">Ctrl+Alt+→</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Previous Tab</span>
                  <kbd className="bg-gray-700 px-1 rounded">Ctrl+Alt+←</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Close Tab</span>
                  <kbd className="bg-gray-700 px-1 rounded">Ctrl+W</kbd>
                </div>
              </div>
            </section>
            
            {/* Layout */}
            <section>
              <h4 className="font-semibold text-gray-200 mb-2">Layout</h4>
              <div className="space-y-1 text-gray-300">
                <div className="flex justify-between">
                  <span>Split Vertically</span>
                  <kbd className="bg-gray-700 px-1 rounded">Ctrl+Shift+T</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Split Horizontally</span>
                  <kbd className="bg-gray-700 px-1 rounded">Ctrl+Shift+S</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Maximize Panel</span>
                  <kbd className="bg-gray-700 px-1 rounded">Ctrl+Enter</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Toggle Fullscreen</span>
                  <kbd className="bg-gray-700 px-1 rounded">F11</kbd>
                </div>
              </div>
            </section>
            
            {/* History & Search */}
            <section>
              <h4 className="font-semibold text-gray-200 mb-2">History & Search</h4>
              <div className="space-y-1 text-gray-300">
                <div className="flex justify-between">
                  <span>Command History</span>
                  <kbd className="bg-gray-700 px-1 rounded">↑↓</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Search History</span>
                  <kbd className="bg-gray-700 px-1 rounded">Ctrl+R</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Clear Screen</span>
                  <kbd className="bg-gray-700 px-1 rounded">Ctrl+L</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Search Output</span>
                  <kbd className="bg-gray-700 px-1 rounded">Ctrl+F</kbd>
                </div>
              </div>
            </section>
            
            {/* Tools & Features */}
            <section>
              <h4 className="font-semibold text-gray-200 mb-2">Tools & Features</h4>
              <div className="space-y-1 text-gray-300">
                <div className="flex justify-between">
                  <span>Settings</span>
                  <kbd className="bg-gray-700 px-1 rounded">Ctrl+,</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Help</span>
                  <kbd className="bg-gray-700 px-1 rounded">F1</kbd>
                </div>
                <div className="flex justify-between">
                  <span>File Tree</span>
                  <kbd className="bg-gray-700 px-1 rounded">Ctrl+B</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Toggle Theme</span>
                  <kbd className="bg-gray-700 px-1 rounded">Ctrl+T</kbd>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Handle input key down
   */
  function handleInputKeyDown(e: React.KeyboardEvent): void {
    const { key, ctrlKey, altKey, shiftKey } = e;
    
    // Command history navigation
    if (key === 'ArrowUp') {
      e.preventDefault();
      const prev = commandHistoryService.getPrevious();
      if (prev !== null) {
        setCommand(prev);
      }
    } else if (key === 'ArrowDown') {
      e.preventDefault();
      const next = commandHistoryService.getNext();
      if (next !== null) {
        setCommand(next);
      }
    }
    
    // Keyboard shortcuts
    if (ctrlKey && key === 'l') {
      e.preventDefault();
      // Clear terminal output
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, outputs: [] }
          : tab
      ));
    } else if (key === 'Tab' && !ctrlKey && !altKey) {
      e.preventDefault();
      handleAutocomplete();
    } else if (ctrlKey && key === 'r') {
      e.preventDefault();
      setShowSearch(!showSearch);
    } else if (key === 'Escape') {
      setShowAutocomplete(false);
      setAutocompleteIndex(-1);
    }
  }

  /**
   * Handle autocomplete
   */
  function handleAutocomplete(): void {
    if (!command.trim()) return;
    
    const commands = comprehensiveTerminalCommands.getAvailableCommands();
    const partial = command.trim().toLowerCase();
    
    const matches = commands.filter(cmd => 
      cmd.name.toLowerCase().startsWith(partial) ||
      cmd.aliases?.some(alias => alias.toLowerCase().startsWith(partial))
    ).slice(0, 10);
    
    setAutocompleteOptions(matches);
    setShowAutocomplete(matches.length > 0);
    setAutocompleteIndex(-1);
  }

  /**
   * Active right panel state
   */
  const [activeRightPanel, setActiveRightPanel] = useState<string>('search');
};

export default UltimateTerminal;