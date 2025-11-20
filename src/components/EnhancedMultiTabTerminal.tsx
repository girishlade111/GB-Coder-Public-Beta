// Enhanced Multi-Tab Terminal with Comprehensive Features
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Terminal, Plus, X, Split, Maximize, Minimize, Copy, Download, Settings, 
  Search, Filter, BookOpen, Zap, Palette, Layout, Copy as CopyIcon, 
  FileText, Code, Database, Globe, Terminal as TerminalIcon, Play, 
  Square, Pause, SkipForward, RotateCcw, Save, FolderOpen, FileUp, 
  FileDown, Trash2, Edit3, Eye, EyeOff, Monitor, Smartphone, Tablet,
  Wifi, WifiOff, HardDrive, Cpu, MemoryStick, Activity, Gauge,
  Clock, User, Lock, Unlock, Layers, Grid3X3, Columns, Rows, Bug
} from 'lucide-react';

import { 
  TerminalTab, 
  SplitLayout, 
  TerminalOutput, 
  TerminalState, 
  BackgroundJob,
  ProcessInfo,
  KeyboardShortcut,
  ColorScheme,
  AutoCompleteOption,
  DragDropFile,
  DebugSession,
  PerformanceMetric,
  SearchResult,
  NPMPackage,
  GitRepository,
  BuildTool,
  TestFramework,
  DatabaseConnection,
  APIEndpoint
} from '../types/terminal.types';

import { terminalStateManager } from '../services/terminalStateManager';
import { comprehensiveTerminalCommands } from '../services/comprehensiveTerminalCommands';
import { commandHistoryService } from '../services/commandHistoryService';
import { themeLayoutManager } from '../services/themeLayoutManager';
import { outputStreamingService } from '../services/outputStreamingService';
import { performanceAnalyticsService } from '../services/performanceAnalyticsService';
import { debugToolsService } from '../services/debugToolsService';
import { browserIntegration } from '../services/browserIntegration';

interface EnhancedMultiTabTerminalProps {
  className?: string;
  onCodeChange?: (code: string, language: string) => void;
  onFileOpen?: (filename: string) => void;
  onThemeChange?: (theme: string) => void;
  initialTabs?: Partial<TerminalTab>[];
  theme?: string;
  layout?: string;
}

interface TerminalPanel {
  id: string;
  tabId: string;
  splitId: string;
  ref: React.RefObject<HTMLDivElement>;
  outputRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  isResizing: boolean;
  size: number;
}

export const EnhancedMultiTabTerminal: React.FC<EnhancedMultiTabTerminalProps> = ({
  className = '',
  onCodeChange,
  onFileOpen,
  onThemeChange,
  initialTabs = [],
  theme: initialTheme,
  layout: initialLayout
}) => {
  // Core state management
  const [terminalState, setTerminalState] = useState<TerminalState>(() => terminalStateManager.getState());
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [splits, setSplits] = useState<SplitLayout[]>([]);
  const [currentSplitId, setCurrentSplitId] = useState<string>('');
  const [tabs, setTabs] = useState<TerminalTab[]>([]);
  
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
  const [showDebug, setShowDebug] = useState(false);
  const [showGit, setShowGit] = useState(false);
  const [showPackages, setShowPackages] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);
  const [showDatabase, setShowDatabase] = useState(false);
  const [showAPI, setShowAPI] = useState(false);
  
  // Panel management
  const [panels, setPanels] = useState<TerminalPanel[]>([]);
  const [dragOver, setDragOver] = useState(false);
  
  // Input/Output state
  const [filterText, setFilterText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [cursorBlink, setCursorBlink] = useState(true);
  
  // Performance state
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [backgroundJobs, setBackgroundJobs] = useState<BackgroundJob[]>([]);
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [debugSession, setDebugSession] = useState<DebugSession | null>(null);
  const [gitRepo, setGitRepo] = useState<GitRepository | null>(null);
  const [npmPackages, setNpmPackages] = useState<NPMPackage[]>([]);
  const [databaseConnections, setDatabaseConnections] = useState<DatabaseConnection[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([]);
  const [buildTools, setBuildTools] = useState<BuildTool[]>([]);
  const [testFrameworks, setTestFrameworks] = useState<TestFramework[]>([]);
  
  // Theme and styling
  const [currentTheme, setCurrentTheme] = useState<any>(() => 
    themeLayoutManager.getActiveTheme() || themeLayoutManager.getThemes()[0]
  );
  const [availableThemes, setAvailableThemes] = useState<any[]>(() => 
    themeLayoutManager.getThemes()
  );
  const [currentLayout, setCurrentLayout] = useState(() => 
    themeLayoutManager.getActiveLayout()
  );
  const [availableLayouts, setAvailableLayouts] = useState(() => 
    themeLayoutManager.getLayouts()
  );
  
  // Autocomplete and suggestions
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState<AutoCompleteOption[]>([]);
  const [autocompleteIndex, setAutocompleteIndex] = useState(-1);
  
  // Drag and drop
  const [dragData, setDragData] = useState<DragDropFile | null>(null);
  
  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const outputRefs = useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map());
  const inputRefs = useRef<Map<string, React.RefObject<HTMLInputElement>>>(new Map());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Performance monitoring
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [memoryUsage, setMemoryUsage] = useState({ used: 0, total: 0 });
  const [cpuUsage, setCpuUsage] = useState(0);

  /**
   * Initialize terminal
   */
  useEffect(() => {
    initializeTerminal();
    const cleanup = setupEventListeners();
    const performanceCleanup = startPerformanceMonitoring();
    
    return () => {
      cleanup?.();
      performanceCleanup?.();
      // Any other cleanup
    };
  }, []);

  /**
   * Initialize terminal tabs and splits
   */
  const initializeTerminal = useCallback(() => {
    const defaultTabs: TerminalTab[] = [
      {
        id: 'console-1',
        name: 'Console',
        type: 'console',
        outputs: [{
          id: 'welcome',
          type: 'info',
          message: `🚀 Comprehensive Terminal v2.0.0
          
Features:
• Multi-tab support with split layouts
• 200+ development commands
• Git integration & package management  
• Build tools & testing frameworks
• Linting & code formatting
• Process management & debugging
• Network utilities & API testing
• Browser integration & live preview
• Performance monitoring
• Advanced autocomplete
• Drag & drop support
• Session persistence
• Plugin architecture
• 20+ themes & layouts

Type 'help' for available commands or 'help [category]' for specific categories.

Quick Start:
- Use Ctrl+T for new tabs, Ctrl+Shift+T for vertical split
- Tab completion for commands and files
- ↑↓ arrows for command history
- Ctrl+R for search, Ctrl+F for output search
- Settings available via Ctrl+, 

Current directory: ${terminalState.currentDirectory}`,
          timestamp: Date.now()
        }],
        commandHistory: [],
        historyIndex: -1,
        isActive: true,
        isPinned: false,
        isModified: false,
        lastActivity: Date.now(),
        directory: terminalState.currentDirectory,
        theme: terminalState.preferences.theme
      },
      ...initialTabs
    ];

    setTabs(defaultTabs);
    setActiveTabId(defaultTabs[0].id);
    
    const defaultSplit: SplitLayout = {
      id: 'split-1',
      direction: 'horizontal',
      tabs: [defaultTabs[0].id],
      size: 100,
      resizable: true
    };
    
    setSplits([defaultSplit]);
    setCurrentSplitId(defaultSplit.id);
    
    // Initialize panel references
    const initialPanel: TerminalPanel = {
      id: 'panel-1',
      tabId: defaultTabs[0].id,
      splitId: defaultSplit.id,
      ref: React.createRef<HTMLDivElement>(),
      outputRef: React.createRef<HTMLDivElement>(),
      inputRef: React.createRef<HTMLInputElement>(),
      isResizing: false,
      size: 100
    };
    
    setPanels([initialPanel]);
    outputRefs.current.set(defaultTabs[0].id, initialPanel.outputRef);
    inputRefs.current.set(defaultTabs[0].id, initialPanel.inputRef);
  }, [terminalState.currentDirectory, terminalState.preferences.theme, initialTabs]);

  /**
   * Setup event listeners
   */
  const setupEventListeners = useCallback(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isInputFocused()) {
        handleKeyboardShortcut(e);
      }
    };

    // Drag and drop
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

    // Global shortcuts
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    // State management observer
    terminalStateManager.addObserver((state, event) => {
      setTerminalState(state);
      
      switch (event) {
        case 'directory-changed':
          updateCurrentDirectory();
          break;
        case 'preferences-updated':
          updatePreferences();
          break;
        case 'process-added':
        case 'process-removed':
        case 'process-updated':
          refreshProcesses();
          break;
        case 'background-job-added':
        case 'background-job-removed':
        case 'background-job-updated':
          refreshBackgroundJobs();
          break;
      }
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  /**
   * Start performance monitoring
   */
  const startPerformanceMonitoring = useCallback(() => {
    const interval = setInterval(() => {
      // Update memory usage
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        setMemoryUsage({
          used: Math.round(memInfo.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memInfo.totalJSHeapSize / 1024 / 1024)
        });
      }

      // Update performance metrics
      const metrics = performanceAnalyticsService.getMetrics();
      setPerformanceMetrics(metrics);

      // Update last activity
      if (Date.now() - lastActivity > 60000) {
        // Auto-hide UI after 1 minute of inactivity
        hideNonEssentialUI();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [lastActivity]);

  /**
   * Check if input is focused
   */
  const isInputFocused = (): boolean => {
    const activeElement = document.activeElement;
    return activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.getAttribute('contenteditable') === 'true'
    );
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyboardShortcut = useCallback((e: KeyboardEvent) => {
    const { ctrl, alt, shift, meta, key } = e;
    
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
    } else if (ctrl && shift && key === 'n') {
      e.preventDefault();
      createGridSplit();
    }
    
    // Tab management
    else if (ctrl && !alt && !shift && key === 'w') {
      e.preventDefault();
      closeActiveTab();
    } else if (ctrl && shift && !alt && key === 'w') {
      e.preventDefault();
      closeAllTabs();
    }
    
    // View controls
    else if (ctrl && !alt && !shift && key === 'b') {
      e.preventDefault();
      setShowFileTree(!showFileTree);
    } else if (ctrl && !alt && !shift && key === 'h') {
      e.preventDefault();
      setShowHistory(!showHistory);
    } else if (ctrl && !shift && !alt && key === 'f') {
      e.preventDefault();
      if (showSearch) {
        clearSearch();
      } else {
        setShowSearch(true);
      }
    } else if (ctrl && shift && !alt && key === 'f') {
      e.preventDefault();
      setShowSearch(!showSearch);
    }
    
    // Settings and help
    else if (ctrl && !alt && !shift && key === ',') {
      e.preventDefault();
      setShowSettings(!showSettings);
    } else if (ctrl && !alt && !shift && key === '?') {
      e.preventDefault();
      setShowHelp(!showHelp);
    } else if (ctrl && shift && !alt && key === 'p') {
      e.preventDefault();
      setShowPerformance(!showPerformance);
    } else if (ctrl && !alt && !shift && key === 'd') {
      e.preventDefault();
      if (debugSession) {
        stopDebugSession();
      } else {
        startDebugSession();
      }
    }
    
    // Theme and appearance
    else if (ctrl && shift && !alt && key === 'k') {
      e.preventDefault();
      cycleTheme();
    } else if (ctrl && !alt && key === '+') {
      e.preventDefault();
      increaseFontSize();
    } else if (ctrl && !alt && key === '-') {
      e.preventDefault();
      decreaseFontSize();
    } else if (ctrl && !alt && key === '0') {
      e.preventDefault();
      resetFontSize();
    }
    
    // Window controls
    else if (ctrl && !alt && !shift && key === 'Enter') {
      e.preventDefault();
      toggleMaximize();
    } else if (F11 === e.keyCode || (ctrl && shift && key === 'F')) {
      e.preventDefault();
      toggleFullscreen();
    }
    
    // Process management
    else if (ctrl && !alt && !shift && key === 'z') {
      e.preventDefault();
      toggleBackgroundJob();
    } else if (ctrl && !alt && !shift && key === 'c') {
      e.preventDefault();
      if (terminalState.backgroundJobs.length > 0) {
        cancelBackgroundJob();
      }
    }
    
    // Utility shortcuts
    else if (ctrl && !alt && !shift && key === 'c') {
      if (e.target === document.body) {
        e.preventDefault();
        copySelection();
      }
    } else if (ctrl && !alt && !shift && key === 'l') {
      e.preventDefault();
      clearActiveTab();
    } else if (ctrl && !alt && !shift && key === 'u') {
      e.preventDefault();
      clearCommandLine();
    }
  }, [showFileTree, showHistory, showSearch, showSettings, showHelp, showPerformance, showFileTree, debugSession, showFileTree]);

  /**
   * Create new tab
   */
  const createNewTab = useCallback((type: TerminalTab['type'] = 'console') => {
    const newTab: TerminalTab = {
      id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: getTabName(type),
      type,
      outputs: [],
      commandHistory: [],
      historyIndex: -1,
      isActive: false,
      isPinned: false,
      isModified: false,
      lastActivity: Date.now(),
      directory: terminalState.currentDirectory,
      theme: currentTheme.id
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
    
    // Add welcome message
    addTabOutput(newTab.id, {
      id: `welcome-${newTab.id}`,
      type: 'info',
      message: `New ${type} tab created. Ready for input.`,
      timestamp: Date.now()
    });

    return newTab.id;
  }, [terminalState.currentDirectory, currentTheme.id, currentSplitId]);

  /**
   * Get tab name based on type
   */
  const getTabName = (type: TerminalTab['type']): string => {
    const names = {
      console: 'Console',
      file: 'Files',
      git: 'Git',
      package: 'Packages',
      build: 'Build',
      test: 'Tests',
      deploy: 'Deploy',
      debug: 'Debug',
      network: 'Network'
    };
    return names[type] || 'Terminal';
  };

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
   * Close tab
   */
  const closeTab = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || tabs.length === 1) return;
    
    // Don't close pinned tabs
    if (tab.isPinned) return;
    
    setTabs(prev => prev.filter(t => t.id !== tabId));
    setSplits(prev => prev.map(split => ({
      ...split,
      tabs: split.tabs.filter(id => id !== tabId)
    })));
    
    // Remove panel
    setPanels(prev => prev.filter(p => p.tabId !== tabId));
    outputRefs.current.delete(tabId);
    inputRefs.current.delete(tabId);
    
    // Switch to another tab if this was active
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter(t => t.id !== tabId);
      if (remainingTabs.length > 0) {
        switchToTab(remainingTabs[0].id);
      }
    }
  }, [tabs, activeTabId]);

  /**
   * Close all tabs
   */
  const closeAllTabs = useCallback(() => {
    const consoleTab = tabs.find(t => t.type === 'console' && !t.isPinned);
    if (consoleTab) {
      setTabs([consoleTab]);
      setSplits([{
        id: 'split-1',
        direction: 'horizontal',
        tabs: [consoleTab.id],
        size: 100,
        resizable: true
      }]);
      setActiveTabId(consoleTab.id);
    }
  }, [tabs]);

  /**
   * Create horizontal split
   */
  const createHorizontalSplit = useCallback(() => {
    if (splits.length >= 4) return; // Limit splits
    
    const newSplitId = `split-${Date.now()}`;
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
    const newPanel: TerminalPanel = {
      id: `panel-${Date.now()}`,
      tabId: newTabId,
      splitId: newSplitId,
      ref: React.createRef<HTMLDivElement>(),
      outputRef: React.createRef<HTMLDivElement>(),
      inputRef: React.createRef<HTMLInputElement>(),
      isResizing: false,
      size: 50
    };
    
    setPanels(prev => [...prev, newPanel]);
    outputRefs.current.set(newTabId, newPanel.outputRef);
    inputRefs.current.set(newTabId, newPanel.inputRef);
  }, [splits.length, createNewTab]);

  /**
   * Create vertical split
   */
  const createVerticalSplit = useCallback(() => {
    if (splits.length >= 4) return;
    
    const newSplitId = `split-${Date.now()}`;
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
    const newPanel: TerminalPanel = {
      id: `panel-${Date.now()}`,
      tabId: newTabId,
      splitId: newSplitId,
      ref: React.createRef<HTMLDivElement>(),
      outputRef: React.createRef<HTMLDivElement>(),
      inputRef: React.createRef<HTMLInputElement>(),
      isResizing: false,
      size: 50
    };
    
    setPanels(prev => [...prev, newPanel]);
    outputRefs.current.set(newTabId, newPanel.outputRef);
    inputRefs.current.set(newTabId, newPanel.inputRef);
  }, [splits.length, createNewTab]);

  /**
   * Create grid split
   */
  const createGridSplit = useCallback(() => {
    if (splits.length >= 3) return;
    
    const gridSplitId = `grid-${Date.now()}`;
    const tabIds = [createNewTab('console'), createNewTab('file'), createNewTab('git')];
    
    const newSplit: SplitLayout = {
      id: gridSplitId,
      direction: 'grid',
      tabs: tabIds,
      size: 100,
      resizable: true,
      nested: [
        { id: 'grid-h1', direction: 'horizontal', tabs: tabIds.slice(0, 2), size: 60, resizable: true },
        { id: 'grid-v1', direction: 'vertical', tabs: [tabIds[2]], size: 40, resizable: true }
      ]
    };
    
    setSplits(prev => [...prev, newSplit]);
    
    // Create panels for grid
    const newPanels: TerminalPanel[] = tabIds.map((tabId, index) => ({
      id: `panel-grid-${index}`,
      tabId,
      splitId: gridSplitId,
      ref: React.createRef<HTMLDivElement>(),
      outputRef: React.createRef<HTMLDivElement>(),
      inputRef: React.createRef<HTMLInputElement>(),
      isResizing: false,
      size: 100 / tabIds.length
    }));
    
    setPanels(prev => [...prev, ...newPanels]);
    newPanels.forEach(panel => {
      outputRefs.current.set(panel.tabId, panel.outputRef);
      inputRefs.current.set(panel.tabId, panel.inputRef);
    });
  }, [splits.length, createNewTab]);

  /**
   * Handle command submission
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || !activeTabId) return;

    const trimmedCommand = command.trim();
    const startTime = Date.now();
    
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

    // Process command
    try {
      const results = await comprehensiveTerminalCommands.processCommand(trimmedCommand, terminalState);
      if (Array.isArray(results)) {
        results.forEach(result => addTabOutput(activeTabId, result));
      } else {
        addTabOutput(activeTabId, results);
      }
      
      // Update state manager
      terminalStateManager.addCommandHistory(trimmedCommand);
      
      // Handle special commands
      await handleSpecialCommands(trimmedCommand, results);
      
    } catch (error) {
      const errorOutput: TerminalOutput = {
        id: `error-${Date.now()}`,
        type: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      };
      addTabOutput(activeTabId, errorOutput);
    }

    // Clear input and reset autocomplete
    setCommand('');
    setShowAutocomplete(false);
    setAutocompleteIndex(-1);
    setLastActivity(Date.now());
  }, [command, activeTabId, terminalState]);

  /**
   * Handle special commands
   */
  const handleSpecialCommands = useCallback(async (command: string, results: TerminalOutput[]) => {
    const [cmd, ...args] = command.split(' ');
    
    switch (cmd.toLowerCase()) {
      case 'cd':
        const newDir = args[0] || '/home/developer';
        terminalStateManager.setCurrentDirectory(newDir);
        break;
        
      case 'clear':
        clearActiveTab();
        break;
        
      case 'theme':
        if (args[0]) {
          changeTheme(args[0]);
        }
        break;
        
      case 'layout':
        if (args[0]) {
          changeLayout(args[0]);
        }
        break;
        
      case 'font':
        if (args[0] === 'size' && args[1]) {
          const size = parseInt(args[1]);
          if (!isNaN(size) && size >= 8 && size <= 72) {
            setFontSize(size);
            terminalStateManager.updatePreferences({ fontSize: size });
          }
        }
        break;
        
      case 'split':
        if (args[0] === 'h' || args[0] === 'horizontal') {
          createHorizontalSplit();
        } else if (args[0] === 'v' || args[0] === 'vertical') {
          createVerticalSplit();
        } else if (args[0] === 'g' || args[0] === 'grid') {
          createGridSplit();
        }
        break;
        
      case 'tab':
        if (args[0] === 'new') {
          createNewTab(args[1] as TerminalTab['type'] || 'console');
        } else if (args[0] === 'close') {
          closeActiveTab();
        }
        break;
        
      case 'help':
        showHelpCommand();
        break;
        
      case 'status':
        showStatusCommand();
        break;
        
      case 'top':
      case 'ps':
        showProcessesCommand();
        break;
        
      case 'jobs':
        showJobsCommand();
        break;
    }
  }, [createHorizontalSplit, createVerticalSplit, createGridSplit, createNewTab, closeActiveTab]);

  /**
   * Add output to tab
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
        outputRef?.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 50);
  }, [activeTabId, autoScroll, terminalState.preferences.maxOutputLines]);

  /**
   * Handle keyboard input
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const { key, ctrlKey, altKey, shiftKey, metaKey } = e;
    
    // Command history navigation
    if (key === 'ArrowUp') {
      e.preventDefault();
      navigateCommandHistory(-1);
    } else if (key === 'ArrowDown') {
      e.preventDefault();
      navigateCommandHistory(1);
    } else if (key === 'Tab') {
      e.preventDefault();
      handleAutocomplete();
    } else if (key === 'Escape') {
      e.preventDefault();
      handleEscape();
    }
    // Copy selection
    else if (ctrlKey && key === 'c' && !altKey && !shiftKey && !metaKey) {
      e.preventDefault();
      copySelection();
    }
    // Paste
    else if (ctrlKey && key === 'v' && !altKey && !shiftKey && !metaKey) {
      e.preventDefault();
      pasteFromClipboard();
    }
    // Interrupt
    else if (ctrlKey && key === 'c' && !altKey && !shiftKey && !metaKey) {
      e.preventDefault();
      sendInterrupt();
    }
    // Submit command
    else if (key === 'Enter' && !ctrlKey && !altKey && !shiftKey && !metaKey) {
      // Let form submission handle this
    }
    // Autocomplete navigation
    else if (showAutocomplete && (key === 'ArrowUp' || key === 'ArrowDown')) {
      e.preventDefault();
      navigateAutocomplete(key === 'ArrowUp' ? -1 : 1);
    }
    // Accept autocomplete suggestion
    else if (showAutocomplete && key === 'Enter' && autocompleteIndex >= 0) {
      e.preventDefault();
      acceptAutocompleteSuggestion();
    }
  }, [showAutocomplete, autocompleteIndex]);

  /**
   * Navigate command history
   */
  const navigateCommandHistory = useCallback((direction: number) => {
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? (() => {
            const history = tab.commandHistory;
            let newIndex = tab.historyIndex;
            
            if (newIndex === -1) {
              newIndex = direction === -1 ? history.length - 1 : 0;
            } else {
              newIndex += direction;
              if (newIndex < 0 || newIndex >= history.length) {
                newIndex = -1;
                return { ...tab, historyIndex: newIndex, command: '' };
              }
            }
            
            return { 
              ...tab, 
              historyIndex: newIndex, 
              command: newIndex === -1 ? '' : history[newIndex] 
            };
          })()
        : tab
    ));
  }, [activeTabId]);

  /**
   * Handle autocomplete
   */
  const handleAutocomplete = useCallback(() => {
    if (!command) return;
    
    // Get autocomplete options
    const options = getAutocompleteOptions(command);
    setAutocompleteOptions(options);
    
    if (options.length === 1) {
      // Single match - auto-complete
      setCommand(options[0].value + ' ');
    } else if (options.length > 1) {
      // Multiple matches - show suggestions
      setShowAutocomplete(true);
      setAutocompleteIndex(0);
    }
  }, [command]);

  /**
   * Get autocomplete options
   */
  const getAutocompleteOptions = useCallback((input: string): AutoCompleteOption[] => {
    const options: AutoCompleteOption[] = [];
    
    // Command completion
    const commands = comprehensiveTerminalCommands.getAvailableCommands();
    commands.forEach(cmd => {
      if (cmd.name.startsWith(input) || cmd.aliases?.some(alias => alias.startsWith(input))) {
        options.push({
          value: cmd.name,
          description: cmd.description,
          type: 'command',
          score: cmd.name.startsWith(input) ? 1 : 0.5
        });
      }
    });
    
    // File completion
    if (input.includes('/') || input.includes('.')) {
      const files = terminalStateManager.listDirectory();
      files.forEach(file => {
        if (file.name.startsWith(input.split('/').pop() || '')) {
          options.push({
            value: file.name,
            description: `${file.type} - ${file.size} bytes`,
            type: file.type === 'directory' ? 'directory' : 'file',
            score: 0.8
          });
        }
      });
    }
    
    // Environment variable completion
    if (input.startsWith('$')) {
      Object.keys(terminalState.environment).forEach(envVar => {
        if (envVar.toLowerCase().startsWith(input.slice(1).toLowerCase())) {
          options.push({
            value: `$${envVar}`,
            description: terminalState.environment[envVar],
            type: 'variable',
            score: 0.9
          });
        }
      });
    }
    
    // Sort by score
    return options.sort((a, b) => b.score - a.score).slice(0, 10);
  }, [terminalState]);

  /**
   * Navigate autocomplete
   */
  const navigateAutocomplete = useCallback((direction: number) => {
    setAutocompleteIndex(prev => {
      const newIndex = prev + direction;
      if (newIndex < 0) return autocompleteOptions.length - 1;
      if (newIndex >= autocompleteOptions.length) return 0;
      return newIndex;
    });
  }, [autocompleteOptions.length]);

  /**
   * Accept autocomplete suggestion
   */
  const acceptAutocompleteSuggestion = useCallback(() => {
    if (autocompleteIndex >= 0 && autocompleteIndex < autocompleteOptions.length) {
      const option = autocompleteOptions[autocompleteIndex];
      setCommand(option.value);
      setShowAutocomplete(false);
      setAutocompleteIndex(-1);
    }
  }, [autocompleteIndex, autocompleteOptions]);

  /**
   * Handle escape key
   */
  const handleEscape = useCallback(() => {
    setShowAutocomplete(false);
    setAutocompleteIndex(-1);
    setShowSearch(false);
    setSearchQuery('');
  }, []);

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
        terminalStateManager.createFile(path, content);
        addTabOutput(activeTabId, {
          id: `drop-${Date.now()}`,
          type: 'success',
          message: `File ${file.name} dropped successfully (${file.size} bytes)`,
          timestamp: Date.now()
        });
      };
      reader.readAsText(file);
    });
  }, [activeTabId]);

  /**
   * Utility functions
   */
  const previousTab = useCallback(() => {
    const activeIndex = tabs.findIndex(t => t.id === activeTabId);
    const prevIndex = activeIndex > 0 ? activeIndex - 1 : tabs.length - 1;
    switchToTab(tabs[prevIndex].id);
  }, [tabs, activeTabId, switchToTab]);

  const nextTab = useCallback(() => {
    const activeIndex = tabs.findIndex(t => t.id === activeTabId);
    const nextIndex = activeIndex < tabs.length - 1 ? activeIndex + 1 : 0;
    switchToTab(tabs[nextIndex].id);
  }, [tabs, activeTabId, switchToTab]);

  const closeActiveTab = useCallback(() => closeTab(activeTabId), [activeTabId, closeTab]);

  const clearActiveTab = useCallback(() => {
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, outputs: [] }
        : tab
    ));
  }, [activeTabId]);

  const clearCommandLine = useCallback(() => {
    setCommand('');
    setShowAutocomplete(false);
    setAutocompleteIndex(-1);
  }, []);

  const copySelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      navigator.clipboard.writeText(selection.toString());
      addTabOutput(activeTabId, {
        id: `copy-${Date.now()}`,
        type: 'success',
        message: 'Selection copied to clipboard',
        timestamp: Date.now()
      });
    }
  }, [activeTabId]);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCommand(prev => prev + text);
    } catch (error) {
      addTabOutput(activeTabId, {
        id: `paste-error-${Date.now()}`,
        type: 'error',
        message: 'Failed to paste from clipboard',
        timestamp: Date.now()
      });
    }
  }, [activeTabId]);

  const sendInterrupt = useCallback(() => {
    addTabOutput(activeTabId, {
      id: `interrupt-${Date.now()}`,
      type: 'warning',
      message: '^C',
      timestamp: Date.now()
    });
    // Handle interrupt logic here
  }, [activeTabId]);

  const toggleMaximize = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const increaseFontSize = useCallback(() => {
    const newSize = Math.min(fontSize + 1, 72);
    setFontSize(newSize);
    terminalStateManager.updatePreferences({ fontSize: newSize });
  }, [fontSize]);

  const decreaseFontSize = useCallback(() => {
    const newSize = Math.max(fontSize - 1, 8);
    setFontSize(newSize);
    terminalStateManager.updatePreferences({ fontSize: newSize });
  }, [fontSize]);

  const resetFontSize = useCallback(() => {
    setFontSize(14);
    terminalStateManager.updatePreferences({ fontSize: 14 });
  }, []);

  const cycleTheme = useCallback(() => {
    const currentIndex = availableThemes.findIndex(t => t.id === currentTheme.id);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    changeTheme(availableThemes[nextIndex].id);
  }, [currentTheme.id, availableThemes]);

  const changeTheme = useCallback((themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      themeLayoutManager.setActiveTheme(themeId);
      onThemeChange?.(themeId);
    }
  }, [availableThemes, onThemeChange]);

  const changeLayout = useCallback((layoutId: string) => {
    const layout = availableLayouts.find(l => l.id === layoutId);
    if (layout) {
      setCurrentLayout(layout);
      themeLayoutManager.setActiveLayout(layoutId);
    }
  }, [availableLayouts]);

  const hideNonEssentialUI = useCallback(() => {
    if (Date.now() - lastActivity > 60000) {
      setShowSettings(false);
      setShowHistory(false);
      setShowHelp(false);
      setShowSearch(false);
    }
  }, [lastActivity]);

  const updateCurrentDirectory = useCallback(() => {
    // Update directory display
  }, []);

  const updatePreferences = useCallback(() => {
    const prefs = terminalStateManager.getPreferences();
    setFontSize(prefs.fontSize);
    setAutoScroll(prefs.autoScroll);
    setShowTimestamps(prefs.showTimestamps);
    setShowLineNumbers(prefs.showLineNumbers);
    setWordWrap(prefs.wordWrap);
  }, []);

  const refreshProcesses = useCallback(() => {
    const procs = terminalStateManager.getProcesses();
    setProcesses(procs);
  }, []);

  const refreshBackgroundJobs = useCallback(() => {
    const jobs = terminalStateManager.getBackgroundJobs();
    setBackgroundJobs(jobs);
  }, []);

  // Command functions
  const showHelpCommand = useCallback(() => {
    setShowHelp(true);
  }, []);

  const showStatusCommand = useCallback(() => {
    addTabOutput(activeTabId, {
      id: `status-${Date.now()}`,
      type: 'info',
      message: `System Status:
Tabs: ${tabs.length}
Splits: ${splits.length}
Background Jobs: ${backgroundJobs.length}
Processes: ${processes.length}
Memory Usage: ${memoryUsage.used}MB / ${memoryUsage.total}MB
CPU Usage: ${cpuUsage.toFixed(1)}%
Current Directory: ${terminalState.currentDirectory}
Theme: ${currentTheme.name}`,
      timestamp: Date.now()
    });
  }, [tabs.length, splits.length, backgroundJobs.length, processes.length, memoryUsage, cpuUsage, terminalState.currentDirectory, currentTheme.name, activeTabId]);

  const showProcessesCommand = useCallback(() => {
    setShowProcesses(true);
  }, []);

  const showJobsCommand = useCallback(() => {
    setShowJobs(true);
  }, []);

  // Debug session functions
  const startDebugSession = useCallback(() => {
    const session = debugToolsService.startSession('node', {
      port: 9229,
      host: 'localhost'
    });
    setDebugSession(session);
  }, []);

  const stopDebugSession = useCallback(() => {
    if (debugSession) {
      debugToolsService.stopSession(debugSession.id);
      setDebugSession(null);
    }
  }, [debugSession]);

  // Get active tab
  const activeTab = useMemo(() => 
    tabs.find(tab => tab.id === activeTabId),
    [tabs, activeTabId]
  );

  // Filtered outputs
  const filteredOutputs = useMemo(() => {
    if (!activeTab) return [];
    
    let outputs = activeTab.outputs;
    
    if (filterText) {
      outputs = outputs.filter(output =>
        output.message.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    
    if (searchQuery) {
      outputs = outputs.filter(output =>
        output.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return outputs;
  }, [activeTab, filterText, searchQuery]);

  // Search functionality
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setShowSearch(false);
  }, []);

  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query) {
      setShowSearch(true);
    }
  }, []);

  // Panel rendering
  const renderPanel = useCallback((panel: TerminalPanel) => {
    const panelTab = tabs.find(t => t.id === panel.tabId);
    if (!panelTab || !panelTab.isActive) return null;

    const panelOutputs = filteredOutputs;

    return (
      <div
        key={panel.id}
        ref={panel.ref}
        className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden"
        style={{ width: `${panel.size}%` }}
      >
        {/* Panel Header */}
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <h3 className="text-sm font-medium text-gray-300">{panelTab.name}</h3>
            <span className="text-xs text-gray-400">{panelTab.directory}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => closeTab(panel.tabId)}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Output Area */}
        <div
          ref={panel.outputRef}
          className="flex-1 bg-black p-4 font-mono text-sm overflow-y-auto"
          style={{ fontSize: `${fontSize}px`, lineHeight: terminalState.preferences.lineHeight }}
        >
          {panelOutputs.length === 0 ? (
            <div className="text-gray-500 italic">
              Terminal ready. Type 'help' for available commands...
            </div>
          ) : (
            <div className="space-y-1">
              {panelOutputs.map((output) => (
                <div key={output.id} className="flex items-start gap-2">
                  {showTimestamps && (
                    <span className="text-gray-500 text-xs mt-0.5 flex-shrink-0 min-w-[60px]">
                      {new Date(output.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                  {showLineNumbers && (
                    <span className="text-gray-600 text-xs mt-0.5 flex-shrink-0 min-w-[30px]">
                      {output.id.split('-').pop()}
                    </span>
                  )}
                  <span className="flex-shrink-0 mt-0.5">
                    {getOutputIcon(output.type)}
                  </span>
                  <pre className={`flex-1 whitespace-pre-wrap ${getOutputColor(output.type)} ${
                    wordWrap ? 'break-words' : 'overflow-x-auto'
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
              ref={panel.inputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter command... (Tab for autocomplete, ↑↓ for history)"
              className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 outline-none font-mono text-sm"
              autoFocus={panelTab.isActive}
            />
            <button
              type="submit"
              className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors flex-shrink-0"
            >
              <TerminalIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showAutocomplete && autocompleteOptions.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-t-lg max-h-60 overflow-y-auto z-50">
              {autocompleteOptions.map((option, index) => (
                <div
                  key={`${option.value}-${index}`}
                  className={`px-3 py-2 cursor-pointer ${
                    index === autocompleteIndex ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    setCommand(option.value);
                    setShowAutocomplete(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-400">{option.value}</span>
                    {option.description && (
                      <span className="text-gray-400 text-sm">- {option.description}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>
    );
  }, [tabs, filteredOutputs, fontSize, terminalState.preferences.lineHeight, showTimestamps, showLineNumbers, wordWrap, showAutocomplete, autocompleteOptions, autocompleteIndex, command, terminalState.currentDirectory, handleSubmit, handleKeyDown, closeTab]);

  /**
   * Get output color
   */
  const getOutputColor = (type: TerminalOutput['type']): string => {
    const colors = {
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400',
      system: 'text-purple-400',
      debug: 'text-gray-400'
    };
    return colors[type] || 'text-gray-300';
  };

  /**
   * Get output icon
   */
  const getOutputIcon = (type: TerminalOutput['type']): string => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      system: '$',
      debug: '🐛'
    };
    return icons[type] || '•';
  };

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
        '--terminal-bg': currentTheme.colors.background,
        '--terminal-fg': currentTheme.colors.foreground,
        '--terminal-font-size': `${fontSize}px`,
        '--terminal-line-height': terminalState.preferences.lineHeight,
      } as React.CSSProperties}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-dashed border-blue-500 flex items-center justify-center z-50">
          <div className="text-blue-400 text-xl font-semibold">
            Drop files to add to terminal
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-200">Comprehensive Terminal</h3>
          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
            v2.0.0
          </span>
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
            {tabs.length} tabs • {splits.length} splits
          </span>
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
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded transition-colors ${
              showHistory ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
            }`}
            title="History (Ctrl+H)"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowProcesses(!showProcesses)}
            className={`p-2 rounded transition-colors ${
              showProcesses ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
            }`}
            title="Processes (Ctrl+Shift+P)"
          >
            <Activity className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowThemes(!showThemes)}
            className={`p-2 rounded transition-colors ${
              showThemes ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
            }`}
            title="Themes (Ctrl+Shift+K)"
          >
            <Palette className="w-4 h-4" />
          </button>
          
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
          
          {/* Window controls */}
          <button
            onClick={toggleMaximize}
            className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Maximize (Ctrl+Enter)"
          >
            {isExpanded ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-gray-800 border-b border-gray-700 flex items-center overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-3 py-2 border-r border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
              tab.isActive ? 'bg-gray-900 text-white' : 'text-gray-400'
            } ${tab.isPinned ? 'bg-yellow-600 bg-opacity-20' : ''}`}
            onClick={() => switchToTab(tab.id)}
          >
            <div className="flex items-center gap-1">
              {tab.type === 'console' && <TerminalIcon className="w-4 h-4" />}
              {tab.type === 'file' && <FileText className="w-4 h-4" />}
              {tab.type === 'git' && <Code className="w-4 h-4" />}
              {tab.type === 'package' && <Database className="w-4 h-4" />}
              {tab.type === 'build' && <Zap className="w-4 h-4" />}
              {tab.type === 'test' && <Filter className="w-4 h-4" />}
              {tab.type === 'deploy' && <Globe className="w-4 h-4" />}
              {tab.type === 'debug' && <Bug className="w-4 h-4" />}
              {tab.type === 'network' && <Wifi className="w-4 h-4" />}
            </div>
            <span className="text-sm">{tab.name}</span>
            {tab.isModified && <div className="w-2 h-2 bg-orange-400 rounded-full"></div>}
            {tab.badge && (
              <span className="text-xs bg-red-600 text-white px-1 py-0.5 rounded">
                {tab.badge}
              </span>
            )}
            {!tab.isPinned && (
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

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* File Tree Sidebar */}
        {showFileTree && (
          <div className="w-80 bg-gray-850 border-r border-gray-700 p-4 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-300 mb-3">File System</h4>
            <div className="space-y-1">
              {Object.values(terminalState.fileSystem).map(file => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-700 p-1 rounded cursor-pointer"
                  onClick={() => onFileOpen?.(file.name)}
                >
                  {file.type === 'directory' ? (
                    <FolderOpen className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span className="truncate">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terminal Panels */}
        <div className="flex flex-1 p-4 gap-4 overflow-auto">
          {splits.map(split => {
            const splitTabs = tabs.filter(tab => split.tabs.includes(tab.id));
            
            if (split.direction === 'grid' && split.nested) {
              return (
                <div key={split.id} className="flex flex-1 gap-2">
                  {split.nested.map(nestedSplit => (
                    <div
                      key={nestedSplit.id}
                      className="flex-1 flex flex-col"
                      style={{ width: `${nestedSplit.size}%` }}
                    >
                      {nestedSplit.tabs.map(tabId => {
                        const panel = panels.find(p => p.tabId === tabId);
                        return panel ? renderPanel(panel) : null;
                      })}
                    </div>
                  ))}
                </div>
              );
            }
            
            return (
              <div
                key={split.id}
                className={`flex ${split.direction === 'horizontal' ? 'flex-row' : 'flex-col'}`}
                style={{ width: `${split.size}%` }}
              >
                {splitTabs.map(tabId => {
                  const panel = panels.find(p => p.tabId === tabId);
                  return panel ? renderPanel(panel) : null;
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>{terminalState.currentDirectory}</span>
          <span>Memory: {memoryUsage.used}MB / {memoryUsage.total}MB</span>
          <span>CPU: {cpuUsage.toFixed(1)}%</span>
          <span>Theme: {currentTheme.name}</span>
          <span>Font: {fontSize}px</span>
        </div>
        <div className="flex items-center gap-2">
          {debugSession && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Bug className="w-3 h-3" />
              <span>Debugging</span>
            </div>
          )}
          {backgroundJobs.length > 0 && (
            <div className="flex items-center gap-1 text-blue-400">
              <Play className="w-3 h-3" />
              <span>{backgroundJobs.length} jobs</span>
            </div>
          )}
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Side Panels */}
      {/* History Panel */}
      {showHistory && (
        <div className="absolute top-16 right-4 w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-30">
          <div className="p-4">
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
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 w-96 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-30">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-4">Terminal Settings</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Font Size</label>
                <div className="flex items-center gap-2">
                  <button onClick={decreaseFontSize} className="p-1 hover:bg-gray-700 rounded">-</button>
                  <span className="text-sm text-gray-300 min-w-[2rem] text-center">{fontSize}</span>
                  <button onClick={increaseFontSize} className="p-1 hover:bg-gray-700 rounded">+</button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Auto Scroll</label>
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Show Timestamps</label>
                <input
                  type="checkbox"
                  checked={showTimestamps}
                  onChange={(e) => setShowTimestamps(e.target.checked)}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Word Wrap</label>
                <input
                  type="checkbox"
                  checked={wordWrap}
                  onChange={(e) => setWordWrap(e.target.checked)}
                  className="rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Panel */}
      {showSearch && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-96 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-30">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search output..."
                value={searchQuery}
                onChange={(e) => performSearch(e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-400"
                autoFocus
              />
              <button onClick={clearSearch} className="p-2 hover:bg-gray-700 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            {searchQuery && (
              <div className="mt-2 text-xs text-gray-400">
                Found {filteredOutputs.length} matches
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMultiTabTerminal;