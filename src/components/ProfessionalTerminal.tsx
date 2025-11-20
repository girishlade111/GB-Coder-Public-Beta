/**
 * Professional Terminal - Comprehensive Web Development Terminal Interface
 * 
 * A feature-rich terminal emulator optimized for web development environments
 * with advanced functionality including multi-tab support, split-screen layouts,
 * customizable themes, and extensive development-focused commands.
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useReducer,
} from 'react';
import {
  Terminal,
  Plus,
  X,
  Split,
  Maximize,
  Minimize,
  Copy,
  Download,
  Settings,
  Search,
  Filter,
  BookOpen,
  Zap,
  Palette,
  Layout,
  Copy as CopyIcon,
  FileText,
  Code,
  Database,
  Globe,
  Play,
  Square,
  Pause,
  SkipForward,
  RotateCcw,
  Save,
  FolderOpen,
  FileUp,
  FileDown,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Tablet,
  Wifi,
  WifiOff,
  HardDrive,
  Cpu,
  MemoryStick,
  Activity,
  Gauge,
  Clock,
  User,
  Lock,
  Unlock,
  Layers,
  Grid3X3,
  Columns,
  Rows,
  Bug,
  Terminal as TerminalIcon,
  Send,
  Moon,
  Sun,
  Menu,
  HelpCircle,
  History,
  Scissors,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  Loader,
  ExternalLink,
  RefreshCw,
  GitBranch,
  Package,
  TestTube,
  Wrench,
  Network,
  Cloud,
  Server,
  Cpu as CpuIcon,
  Zap as ZapIcon,
} from 'lucide-react';

// Import services and types
import {
  TerminalTab,
  SplitLayout,
  TerminalOutput,
  TerminalState,
  ProcessInfo,
  BackgroundJob,
  Plugin,
  NetworkConnection,
  PerformanceMetric,
  DebugSession,
  BrowserIntegration,
} from '../types/terminal.types';
import { terminalStateManager } from '../services/terminalStateManager';
import { comprehensiveTerminalCommands } from '../services/comprehensiveTerminalCommands';
import { commandHistoryService } from '../services/commandHistoryService';
import { themeLayoutManager } from '../services/themeLayoutManager';
import { browserIntegrationService } from '../services/browserIntegration';
import { performanceMonitoringService } from '../services/performanceMonitoring';
import { debuggingInterfaceService } from '../services/debuggingInterface';
import { pluginManagerService } from '../services/pluginManager';
import { advancedAutocompleteService } from '../services/advancedAutocomplete';
import { sessionPersistenceService } from '../services/sessionPersistence';
import { exportImportService } from '../services/exportImportService';

// Initial state interface
interface TerminalUIState {
  activeTabId: string;
  currentSplitId: string;
  isExpanded: boolean;
  isFullscreen: boolean;
  showSettings: boolean;
  showHistory: boolean;
  showHelp: boolean;
  showSearch: boolean;
  showFileTree: boolean;
  showThemes: boolean;
  showProcesses: boolean;
  showJobs: boolean;
  showPerformance: boolean;
  showDebugger: boolean;
  showBrowser: boolean;
  showPlugins: boolean;
  showExportImport: boolean;
  showPerformanceMonitor: boolean;
  showNetworkMonitor: boolean;
  showAPITester: boolean;
  showDocGenerator: boolean;
  filterText: string;
  searchQuery: string;
  autoScroll: boolean;
  showLineNumbers: boolean;
  showTimestamps: boolean;
  wordWrap: boolean;
  fontSize: number;
  cursorBlink: boolean;
  backgroundJobs: BackgroundJob[];
  processes: ProcessInfo[];
  performanceMetrics: PerformanceMetric[];
  currentTheme: any;
  availableThemes: any[];
  showAutocomplete: boolean;
  autocompleteOptions: any[];
  autocompleteIndex: number;
  dragOver: boolean;
  isLoading: boolean;
  error: string | null;
}

// Action types
type TerminalAction =
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_CURRENT_SPLIT'; payload: string }
  | { type: 'TOGGLE_EXPANDED' }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'TOGGLE_PANEL'; payload: keyof TerminalUIState }
  | { type: 'SET_FILTER_TEXT'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'UPDATE_PREFERENCE'; payload: { key: keyof TerminalUIState; value: any } }
  | { type: 'ADD_BACKGROUND_JOB'; payload: BackgroundJob }
  | { type: 'UPDATE_PROCESS'; payload: { pid: string; updates: Partial<ProcessInfo> } }
  | { type: 'ADD_PERFORMANCE_METRIC'; payload: PerformanceMetric }
  | { type: 'SET_THEME'; payload: any }
  | { type: 'SET_AUTOCOMPLETE_OPTIONS'; payload: any[] }
  | { type: 'SET_AUTOCOMPLETE_INDEX'; payload: number }
  | { type: 'TOGGLE_AUTOCOMPLETE' }
  | { type: 'SET_DRAG_OVER'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: TerminalUIState = {
  activeTabId: '',
  currentSplitId: '',
  isExpanded: false,
  isFullscreen: false,
  showSettings: false,
  showHistory: false,
  showHelp: false,
  showSearch: false,
  showFileTree: false,
  showThemes: false,
  showProcesses: false,
  showJobs: false,
  showPerformance: false,
  showDebugger: false,
  showBrowser: false,
  showPlugins: false,
  showExportImport: false,
  showPerformanceMonitor: false,
  showNetworkMonitor: false,
  showAPITester: false,
  showDocGenerator: false,
  filterText: '',
  searchQuery: '',
  autoScroll: true,
  showLineNumbers: false,
  showTimestamps: true,
  wordWrap: true,
  fontSize: 14,
  cursorBlink: true,
  backgroundJobs: [],
  processes: [],
  performanceMetrics: [],
  currentTheme: themeLayoutManager.getActiveTheme(),
  availableThemes: themeLayoutManager.getThemes(),
  showAutocomplete: false,
  autocompleteOptions: [],
  autocompleteIndex: -1,
  dragOver: false,
  isLoading: false,
  error: null,
};

// Reducer function
function terminalReducer(state: TerminalUIState, action: TerminalAction): TerminalUIState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTabId: action.payload };
    case 'SET_CURRENT_SPLIT':
      return { ...state, currentSplitId: action.payload };
    case 'TOGGLE_EXPANDED':
      return { ...state, isExpanded: !state.isExpanded };
    case 'TOGGLE_FULLSCREEN':
      return { ...state, isFullscreen: !state.isFullscreen };
    case 'TOGGLE_PANEL':
      return { ...state, [action.payload]: !state[action.payload] };
    case 'SET_FILTER_TEXT':
      return { ...state, filterText: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'UPDATE_PREFERENCE':
      return { ...state, [action.payload.key]: action.payload.value };
    case 'ADD_BACKGROUND_JOB':
      return {
        ...state,
        backgroundJobs: [...state.backgroundJobs, action.payload],
      };
    case 'UPDATE_PROCESS':
      return {
        ...state,
        processes: state.processes.map((proc) =>
          proc.pid === action.payload.pid
            ? { ...proc, ...action.payload.updates }
            : proc
        ),
      };
    case 'ADD_PERFORMANCE_METRIC':
      return {
        ...state,
        performanceMetrics: [...state.performanceMetrics, action.payload].slice(-100),
      };
    case 'SET_THEME':
      return { ...state, currentTheme: action.payload };
    case 'SET_AUTOCOMPLETE_OPTIONS':
      return {
        ...state,
        autocompleteOptions: action.payload,
        showAutocomplete: action.payload.length > 0,
      };
    case 'SET_AUTOCOMPLETE_INDEX':
      return { ...state, autocompleteIndex: action.payload };
    case 'TOGGLE_AUTOCOMPLETE':
      return { ...state, showAutocomplete: !state.showAutocomplete };
    case 'SET_DRAG_OVER':
      return { ...state, dragOver: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Main Professional Terminal Component
export const ProfessionalTerminal: React.FC<{
  className?: string;
  onCodeChange?: (code: string, language: string) => void;
  onFileOpen?: (filename: string) => void;
  onThemeChange?: (theme: string) => void;
  theme?: string;
  layout?: string;
  initialTabs?: TerminalTab[];
  initialSplits?: SplitLayout[];
}> = ({
  className = '',
  onCodeChange,
  onFileOpen,
  onThemeChange,
  theme: initialTheme,
  layout: initialLayout,
  initialTabs = [],
  initialSplits = [],
}) => {
  // State management
  const [terminalState, setTerminalState] = useState<TerminalState>(() => terminalStateManager.getState());
  const [tabs, setTabs] = useState<TerminalTab[]>(initialTabs);
  const [splits, setSplits] = useState<SplitLayout[]>(initialSplits);
  const [panels, setPanels] = useState<any[]>([]);
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // UI State using reducer
  const [state, dispatch] = useReducer(terminalReducer, initialState);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const outputRefs = useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map());
  const inputRefs = useRef<Map<string, React.RefObject<HTMLInputElement>>>(new Map());

  /**
   * Initialize terminal with default setup
   */
  useEffect(() => {
    initializeTerminal();
    setupEventListeners();
    setupPerformanceMonitoring();
    setupSessionPersistence();

    return () => {
      cleanup();
    };
  }, []);

  /**
   * Initialize terminal tabs, splits, and panels
   */
  const initializeTerminal = useCallback(() => {
    // Create default console tab
    const defaultTab: TerminalTab = {
      id: `console-${Date.now()}`,
      name: 'Console',
      type: 'console',
      outputs: [
        {
          id: 'welcome',
          type: 'info',
          message: `🚀 Professional Terminal v3.0.0

Features:
• Multi-tab support with split layouts
• 300+ development commands
• Git integration & package management  
• Build tools & testing frameworks
• Browser integration & live preview
• Performance monitoring & debugging
• Advanced autocomplete & syntax highlighting
• Drag & drop file support
• Session persistence & export/import
• Plugin architecture & customization
• Network monitoring & API testing
• Documentation generators
• 20+ themes & layouts

Type 'help' for available commands.

Quick Start:
- Use Ctrl+T for new tabs
- Tab completion for commands and files
- ↑↓ arrows for command history
- Ctrl+R for search
- Settings via Ctrl+, 

Current directory: ${terminalState.currentDirectory}`,
          timestamp: Date.now(),
        },
      ],
      commandHistory: [],
      historyIndex: -1,
      isActive: true,
      isPinned: false,
      isModified: false,
      lastActivity: Date.now(),
      directory: terminalState.currentDirectory,
      theme: state.currentTheme.id || 'dark',
    };

    setTabs([defaultTab]);
    dispatch({ type: 'SET_ACTIVE_TAB', payload: defaultTab.id });

    // Create default split
    const defaultSplit: SplitLayout = {
      id: `split-${Date.now()}`,
      direction: 'horizontal',
      tabs: [defaultTab.id],
      size: 100,
      resizable: true,
    };

    setSplits([defaultSplit]);
    dispatch({ type: 'SET_CURRENT_SPLIT', payload: defaultSplit.id });

    // Create initial panel
    const initialPanel = {
      id: `panel-${Date.now()}`,
      tabId: defaultTab.id,
      splitId: defaultSplit.id,
      ref: React.createRef<HTMLDivElement>(),
      outputRef: React.createRef<HTMLDivElement>(),
      inputRef: React.createRef<HTMLInputElement>(),
      isResizing: false,
      size: 100,
    };

    setPanels([initialPanel]);
    outputRefs.current.set(defaultTab.id, initialPanel.outputRef);
    inputRefs.current.set(defaultTab.id, initialPanel.inputRef);
  }, [terminalState.currentDirectory, state.currentTheme]);

  /**
   * Setup event listeners for keyboard shortcuts, drag-drop, etc.
   */
  const setupEventListeners = useCallback(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isInputFocused()) {
        handleKeyboardShortcut(e);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      dispatch({ type: 'SET_DRAG_OVER', payload: true });
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dispatch({ type: 'SET_DRAG_OVER', payload: false });
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dispatch({ type: 'SET_DRAG_OVER', payload: false });
      handleFileDrop(e);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    // Setup terminal state observer
    terminalStateManager.addObserver((newState, event) => {
      setTerminalState(newState);
      
      switch (event) {
        case 'directory-changed':
          updateCurrentDirectory();
          break;
        case 'preferences-updated':
          updatePreferences();
          break;
        case 'process-added':
        case 'process-updated':
        case 'process-removed':
          updateProcesses();
          break;
        case 'background-job-added':
        case 'background-job-updated':
        case 'background-job-removed':
          updateBackgroundJobs();
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
   * Setup performance monitoring
   */
  const setupPerformanceMonitoring = useCallback(() => {
    const updatePerformanceMetrics = () => {
      const metrics = performanceMonitoringService.getCurrentMetrics();
      metrics.forEach((metric) => {
        dispatch({ type: 'ADD_PERFORMANCE_METRIC', payload: metric });
      });
    };

    const interval = setInterval(updatePerformanceMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Setup session persistence
   */
  const setupSessionPersistence = useCallback(() => {
    sessionPersistenceService.enableAutoSave();
    
    return () => {
      sessionPersistenceService.disableAutoSave();
    };
  }, []);

  /**
   * Check if input is focused
   */
  const isInputFocused = (): boolean => {
    const activeElement = document.activeElement;
    return !!(
      activeElement &&
      (activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.getAttribute('contenteditable') === 'true')
    );
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyboardShortcut = useCallback(
    (e: KeyboardEvent) => {
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

      // Tab management
      else if (ctrl && !alt && !shift && key === 'w') {
        e.preventDefault();
        closeActiveTab();
      }

      // View controls
      else if (ctrl && !alt && !shift && key === 'b') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_PANEL', payload: 'showFileTree' });
      } else if (ctrl && !alt && !shift && key === 'h') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_PANEL', payload: 'showHistory' });
      } else if (ctrl && !shift && !alt && key === 'f') {
        e.preventDefault();
        if (state.showSearch) {
          clearSearch();
        } else {
          dispatch({ type: 'TOGGLE_PANEL', payload: 'showSearch' });
        }
      }

      // Settings and help
      else if (ctrl && !alt && !shift && key === ',') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_PANEL', payload: 'showSettings' });
      } else if (ctrl && !alt && !shift && key === '?') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_PANEL', payload: 'showHelp' });
      }

      // Theme controls
      else if (ctrl && shift && !alt && key === 'k') {
        e.preventDefault();
        cycleTheme();
      } else if (ctrl && !alt && key === '=') {
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
        dispatch({ type: 'TOGGLE_EXPANDED' });
      }

      // Terminal shortcuts
      else if (ctrl && !alt && !shift && key === 'l') {
        e.preventDefault();
        clearActiveTab();
      } else if (ctrl && !alt && !shift && key === 'u') {
        e.preventDefault();
        clearCommandLine();
      }

      // Performance monitoring
      else if (ctrl && shift && key === 'p') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_PANEL', payload: 'showPerformance' });
      }

      // Debugger
      else if (ctrl && shift && key === 'd') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_PANEL', payload: 'showDebugger' });
      }

      // Browser integration
      else if (ctrl && shift && key === 'b') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_PANEL', payload: 'showBrowser' });
      }
    },
    [state.showSearch, state.showFileTree, state.showHistory]
  );

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
      theme: state.currentTheme.id || 'dark',
    };

    setTabs((prev) => [...prev, newTab]);

    // Add to current split
    setSplits((prev) =>
      prev.map((split) =>
        split.id === state.currentSplitId
          ? { ...split, tabs: [...split.tabs, newTab.id] }
          : split
      )
    );

    switchToTab(newTab.id);

    addTabOutput(newTab.id, {
      id: `welcome-${newTab.id}`,
      type: 'info',
      message: `New ${type} tab created. Ready for input.`,
      timestamp: Date.now(),
    });

    return newTab.id;
  }, [terminalState.currentDirectory, state.currentTheme.id, state.currentSplitId]);

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
      network: 'Network',
    };
    return names[type] || 'Terminal';
  };

  /**
   * Switch to tab
   */
  const switchToTab = useCallback((tabId: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tabId });
    setTabs((prev) =>
      prev.map((tab) => ({
        ...tab,
        isActive: tab.id === tabId,
      }))
    );

    // Focus input
    setTimeout(() => {
      const inputRef = inputRefs.current.get(tabId);
      inputRef?.current?.focus();
    }, 100);
  }, []);

  /**
   * Handle command submission
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!command.trim() || !state.activeTabId) return;

      dispatch({ type: 'SET_LOADING', payload: true });

      const trimmedCommand = command.trim();
      const startTime = Date.now();

      try {
        // Add to command history
        commandHistoryService.addCommand(trimmedCommand, {
          executionTime: startTime,
        });

        // Add command to tab history
        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === state.activeTabId
              ? {
                  ...tab,
                  commandHistory: [...tab.commandHistory, trimmedCommand],
                  historyIndex: -1,
                  lastActivity: Date.now(),
                }
              : tab
          )
        );

        // Add command output
        const commandOutput: TerminalOutput = {
          id: `cmd-${Date.now()}`,
          type: 'system',
          message: `$ ${trimmedCommand}`,
          timestamp: startTime,
        };

        addTabOutput(state.activeTabId, commandOutput);

        // Process command
        const results = await comprehensiveTerminalCommands.processCommand(
          trimmedCommand,
          terminalState
        );

        if (Array.isArray(results)) {
          results.forEach((result) => {
            const convertedOutput: TerminalOutput = {
              id: `output-${Date.now()}-${Math.random()}`,
              type: (result as any).type || 'info',
              message: (result as any).message || 'No output',
              timestamp: Date.now(),
            };
            addTabOutput(state.activeTabId, convertedOutput);
          });
        } else {
          const convertedOutput: TerminalOutput = {
            id: `output-${Date.now()}-${Math.random()}`,
            type: (results as any).type || 'info',
            message: (results as any).message || 'No output',
            timestamp: Date.now(),
          };
          addTabOutput(state.activeTabId, convertedOutput);
        }

        // Update state manager
        terminalStateManager.addCommandHistory(trimmedCommand);

      } catch (error) {
        const errorOutput: TerminalOutput = {
          id: `error-${Date.now()}`,
          type: 'error',
          message: `Error: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
          timestamp: Date.now(),
        };
        addTabOutput(state.activeTabId, errorOutput);
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }

      // Clear input and reset autocomplete
      setCommand('');
      dispatch({ type: 'SET_AUTOCOMPLETE_OPTIONS', payload: [] });
      dispatch({ type: 'SET_AUTOCOMPLETE_INDEX', payload: -1 });
    },
    [command, state.activeTabId, terminalState]
  );

  /**
   * Add output to tab
   */
  const addTabOutput = useCallback(
    (tabId: string, output: TerminalOutput) => {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === tabId
            ? {
                ...tab,
                outputs: [...tab.outputs, output].slice(
                  -terminalState.preferences.maxOutputLines
                ),
                lastActivity: Date.now(),
              }
            : tab
        )
      );

      // Auto-scroll to bottom
      setTimeout(() => {
        if (state.autoScroll && tabId === state.activeTabId) {
          const outputRef = outputRefs.current.get(tabId);
          outputRef?.current?.scrollTo({
            top: outputRef.current?.scrollHeight || 0,
            behavior: 'smooth',
          });
        }
      }, 50);
    },
    [state.activeTabId, state.autoScroll, terminalState.preferences.maxOutputLines]
  );

  /**
   * Handle keyboard input in terminal
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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
      // Submit command
      else if (key === 'Enter' && !ctrlKey && !altKey && !shiftKey && !metaKey) {
        // Let form submission handle this
      }
      // Autocomplete navigation
      else if (state.showAutocomplete && (key === 'ArrowUp' || key === 'ArrowDown')) {
        e.preventDefault();
        navigateAutocomplete(key === 'ArrowUp' ? -1 : 1);
      }
      // Accept autocomplete suggestion
      else if (state.showAutocomplete && key === 'Enter' && state.autocompleteIndex >= 0) {
        e.preventDefault();
        acceptAutocompleteSuggestion();
      }
    },
    [state.showAutocomplete, state.autocompleteIndex]
  );

  /**
   * Handle autocomplete
   */
  const handleAutocomplete = useCallback(() => {
    if (!command) return;

    const options = advancedAutocompleteService.getSuggestions(command, {
      currentDirectory: terminalState.currentDirectory,
      availableCommands: comprehensiveTerminalCommands.getAvailableCommands(),
      fileSystem: terminalState.fileSystem,
      environment: terminalState.environment,
      aliases: terminalState.aliases,
    });

    dispatch({ type: 'SET_AUTOCOMPLETE_OPTIONS', payload: options });

    if (options.length === 1) {
      setCommand(options[0].value + ' ');
    } else if (options.length > 1) {
      dispatch({ type: 'TOGGLE_AUTOCOMPLETE' });
    }
  }, [command, terminalState]);

  /**
   * Navigate autocomplete options
   */
  const navigateAutocomplete = useCallback((direction: number) => {
    dispatch((prev) => ({
      type: 'SET_AUTOCOMPLETE_INDEX',
      payload:
        prev.autocompleteIndex + direction < 0
          ? prev.autocompleteOptions.length - 1
          : prev.autocompleteIndex + direction >= prev.autocompleteOptions.length
          ? 0
          : prev.autocompleteIndex + direction,
    }));
  }, []);

  /**
   * Accept autocomplete suggestion
   */
  const acceptAutocompleteSuggestion = useCallback(() => {
    if (
      state.autocompleteIndex >= 0 &&
      state.autocompleteIndex < state.autocompleteOptions.length
    ) {
      const option = state.autocompleteOptions[state.autocompleteIndex];
      setCommand(option.value);
      dispatch({ type: 'TOGGLE_AUTOCOMPLETE' });
      dispatch({ type: 'SET_AUTOCOMPLETE_INDEX', payload: -1 });
    }
  }, [state.autocompleteIndex, state.autocompleteOptions]);

  /**
   * Handle escape key
   */
  const handleEscape = useCallback(() => {
    dispatch({ type: 'TOGGLE_AUTOCOMPLETE' });
    dispatch({ type: 'SET_AUTOCOMPLETE_INDEX', payload: -1 });
    clearSearch();
  }, []);

  /**
   * Handle file drop
   */
  const handleFileDrop = useCallback((e: DragEvent) => {
    const files = Array.from(e.dataTransfer?.files || []);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const path = `/${file.name}`;
        terminalStateManager.createFile(path, content);
        addTabOutput(state.activeTabId, {
          id: `drop-${Date.now()}`,
          type: 'success',
          message: `File ${file.name} dropped successfully (${file.size} bytes)`,
          timestamp: Date.now(),
        });
      };
      reader.readAsText(file);
    });
  }, [state.activeTabId]);

  /**
   * Utility functions
   */
  const previousTab = useCallback(() => {
    const activeIndex = tabs.findIndex((t) => t.id === state.activeTabId);
    const prevIndex = activeIndex > 0 ? activeIndex - 1 : tabs.length - 1;
    switchToTab(tabs[prevIndex].id);
  }, [tabs, state.activeTabId, switchToTab]);

  const nextTab = useCallback(() => {
    const activeIndex = tabs.findIndex((t) => t.id === state.activeTabId);
    const nextIndex = activeIndex < tabs.length - 1 ? activeIndex + 1 : 0;
    switchToTab(tabs[nextIndex].id);
  }, [tabs, state.activeTabId, switchToTab]);

  const closeActiveTab = useCallback(() => {
    closeTab(state.activeTabId);
  }, [state.activeTabId]);

  const closeTab = useCallback((tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab || tabs.length === 1) return;

    // Don't close pinned tabs
    if (tab.isPinned) return;

    setTabs((prev) => prev.filter((t) => t.id !== tabId));
    setSplits((prev) =>
      prev.map((split) => ({
        ...split,
        tabs: split.tabs.filter((id) => id !== tabId),
      }))
    );

    // Remove panel
    setPanels((prev) => prev.filter((p) => p.tabId !== tabId));
    outputRefs.current.delete(tabId);
    inputRefs.current.delete(tabId);

    // Switch to another tab if this was active
    if (state.activeTabId === tabId) {
      const remainingTabs = tabs.filter((t) => t.id !== tabId);
      if (remainingTabs.length > 0) {
        switchToTab(remainingTabs[0].id);
      }
    }
  }, [tabs, state.activeTabId, switchToTab]);

  const createHorizontalSplit = useCallback(() => {
    if (splits.length >= 4) return;

    const newSplitId = `split-${Date.now()}`;
    const newTabId = createNewTab('console');

    const newSplit: SplitLayout = {
      id: newSplitId,
      direction: 'horizontal',
      tabs: [newTabId],
      size: 50,
      resizable: true,
    };

    setSplits((prev) => [...prev, newSplit]);

    // Create new panel
    const newPanel = {
      id: `panel-${Date.now()}`,
      tabId: newTabId,
      splitId: newSplitId,
      ref: React.createRef<HTMLDivElement>(),
      outputRef: React.createRef<HTMLDivElement>(),
      inputRef: React.createRef<HTMLInputElement>(),
      isResizing: false,
      size: 50,
    };

    setPanels((prev) => [...prev, newPanel]);
    outputRefs.current.set(newTabId, newPanel.outputRef);
    inputRefs.current.set(newTabId, newPanel.inputRef);
  }, [splits.length, createNewTab]);

  const createVerticalSplit = useCallback(() => {
    if (splits.length >= 4) return;

    const newSplitId = `split-${Date.now()}`;
    const newTabId = createNewTab('console');

    const newSplit: SplitLayout = {
      id: newSplitId,
      direction: 'vertical',
      tabs: [newTabId],
      size: 50,
      resizable: true,
    };

    setSplits((prev) => [...prev, newSplit]);

    // Create new panel
    const newPanel = {
      id: `panel-${Date.now()}`,
      tabId: newTabId,
      splitId: newSplitId,
      ref: React.createRef<HTMLDivElement>(),
      outputRef: React.createRef<HTMLDivElement>(),
      inputRef: React.createRef<HTMLInputElement>(),
      isResizing: false,
      size: 50,
    };

    setPanels((prev) => [...prev, newPanel]);
    outputRefs.current.set(newTabId, newPanel.outputRef);
    inputRefs.current.set(newTabId, newPanel.inputRef);
  }, [splits.length, createNewTab]);

  const navigateCommandHistory = useCallback((direction: number) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === state.activeTabId
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
                command: newIndex === -1 ? '' : history[newIndex],
              };
            })()
          : tab
      )
    );
  }, [state.activeTabId]);

  const clearActiveTab = useCallback(() => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === state.activeTabId ? { ...tab, outputs: [] } : tab
      )
    );
  }, [state.activeTabId]);

  const clearCommandLine = useCallback(() => {
    setCommand('');
    dispatch({ type: 'TOGGLE_AUTOCOMPLETE' });
    dispatch({ type: 'SET_AUTOCOMPLETE_INDEX', payload: -1 });
  }, []);

  const copySelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      navigator.clipboard.writeText(selection.toString());
      addTabOutput(state.activeTabId, {
        id: `copy-${Date.now()}`,
        type: 'success',
        message: 'Selection copied to clipboard',
        timestamp: Date.now(),
      });
    }
  }, [state.activeTabId]);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCommand((prev) => prev + text);
    } catch (error) {
      addTabOutput(state.activeTabId, {
        id: `paste-error-${Date.now()}`,
        type: 'error',
        message: 'Failed to paste from clipboard',
        timestamp: Date.now(),
      });
    }
  }, [state.activeTabId]);

  const increaseFontSize = useCallback(() => {
    const newSize = Math.min(state.fontSize + 1, 72);
    dispatch({
      type: 'UPDATE_PREFERENCE',
      payload: { key: 'fontSize', value: newSize },
    });
    terminalStateManager.updatePreferences({ fontSize: newSize });
  }, [state.fontSize]);

  const decreaseFontSize = useCallback(() => {
    const newSize = Math.max(state.fontSize - 1, 8);
    dispatch({
      type: 'UPDATE_PREFERENCE',
      payload: { key: 'fontSize', value: newSize },
    });
    terminalStateManager.updatePreferences({ fontSize: newSize });
  }, [state.fontSize]);

  const resetFontSize = useCallback(() => {
    dispatch({ type: 'UPDATE_PREFERENCE', payload: { key: 'fontSize', value: 14 } });
    terminalStateManager.updatePreferences({ fontSize: 14 });
  }, []);

  const cycleTheme = useCallback(() => {
    const currentIndex = state.availableThemes.findIndex((t: any) => t.id === state.currentTheme.id);
    const nextIndex = (currentIndex + 1) % state.availableThemes.length;
    changeTheme(state.availableThemes[nextIndex].id);
  }, [state.currentTheme.id, state.availableThemes]);

  const changeTheme = useCallback(
    (themeId: string) => {
      const theme = state.availableThemes.find((t: any) => t.id === themeId);
      if (theme) {
        themeLayoutManager.setActiveTheme(themeId);
        dispatch({ type: 'SET_THEME', payload: theme });
        onThemeChange?.(themeId);
      }
    },
    [state.availableThemes, onThemeChange]
  );

  const clearSearch = useCallback(() => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
    dispatch({ type: 'TOGGLE_PANEL', payload: 'showSearch' });
  }, []);

  // Update functions
  const updateCurrentDirectory = useCallback(() => {
    // Update directory display logic
  }, []);

  const updatePreferences = useCallback(() => {
    const prefs = terminalStateManager.getPreferences();
    dispatch({ type: 'UPDATE_PREFERENCE', payload: { key: 'fontSize', value: prefs.fontSize } });
    dispatch({ type: 'UPDATE_PREFERENCE', payload: { key: 'autoScroll', value: prefs.autoScroll } });
    dispatch({ type: 'UPDATE_PREFERENCE', payload: { key: 'showTimestamps', value: prefs.showTimestamps } });
    dispatch({ type: 'UPDATE_PREFERENCE', payload: { key: 'showLineNumbers', value: prefs.showLineNumbers } });
    dispatch({ type: 'UPDATE_PREFERENCE', payload: { key: 'wordWrap', value: prefs.wordWrap } });
  }, []);

  const updateProcesses = useCallback(() => {
    const processes = terminalStateManager.getProcesses();
    setProcesses(processes);
  }, []);

  const updateBackgroundJobs = useCallback(() => {
    const jobs = terminalStateManager.getBackgroundJobs();
    dispatch({ type: 'UPDATE_PREFERENCE', payload: { key: 'backgroundJobs', value: jobs } });
  }, []);

  const cleanup = useCallback(() => {
    // Cleanup logic
  }, []);

  // Get active tab
  const activeTab = useMemo(() => tabs.find((tab) => tab.id === state.activeTabId), [tabs, state.activeTabId]);

  // Filtered outputs
  const filteredOutputs = useMemo(() => {
    if (!activeTab) return [];

    let outputs = activeTab.outputs;

    if (state.filterText) {
      outputs = outputs.filter((output) =>
        output.message.toLowerCase().includes(state.filterText.toLowerCase())
      );
    }

    if (state.searchQuery) {
      outputs = outputs.filter((output) =>
        output.message.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
    }

    return outputs;
  }, [activeTab, state.filterText, state.searchQuery]);

  /**
   * Get output color based on type
   */
  const getOutputColor = (type: TerminalOutput['type']): string => {
    const colors = {
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400',
      system: 'text-purple-400',
      debug: 'text-gray-400',
    };
    return colors[type] || 'text-gray-300';
  };

  /**
   * Get output icon based on type
   */
  const getOutputIcon = (type: TerminalOutput['type']): string => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      system: '$',
      debug: '🐛',
    };
    return icons[type] || '•';
  };

  /**
   * Render panel component
   */
  const renderPanel = useCallback(
    (panel: any) => {
      const panelTab = tabs.find((t) => t.id === panel.tabId);
      if (!panelTab || !panelTab.isActive) return null;

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
              {state.isLoading && <Loader className="w-4 h-4 animate-spin text-blue-400" />}
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
            style={{ fontSize: `${state.fontSize}px`, lineHeight: 1.4 }}
          >
            {filteredOutputs.length === 0 ? (
              <div className="text-gray-500 italic">
                Terminal ready. Type 'help' for available commands...
              </div>
            ) : (
              <div className="space-y-1">
                {filteredOutputs.map((output) => (
                  <div key={output.id} className="flex items-start gap-2">
                    {state.showTimestamps && (
                      <span className="text-gray-500 text-xs mt-0.5 flex-shrink-0 min-w-[60px]">
                        {new Date(output.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                    <span className="flex-shrink-0 mt-0.5">
                      {getOutputIcon(output.type)}
                    </span>
                    <pre
                      className={`flex-1 whitespace-pre-wrap ${getOutputColor(output.type)} ${
                        state.wordWrap ? 'break-words' : 'overflow-x-auto'
                      }`}
                    >
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
                disabled={state.isLoading}
                className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors flex-shrink-0 disabled:opacity-50"
              >
                {state.isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <TerminalIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      );
    },
    [
      tabs,
      filteredOutputs,
      state.fontSize,
      state.showTimestamps,
      state.wordWrap,
      command,
      terminalState.currentDirectory,
      handleSubmit,
      handleKeyDown,
      closeTab,
      state.isLoading,
    ]
  );

  /**
   * Main component render
   */
  return (
    <div
      ref={containerRef}
      className={`relative bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${className} ${
        state.isFullscreen ? 'fixed inset-0 z-50' : ''
      } ${state.isExpanded ? 'fixed inset-4 z-40' : ''}`}
      style={{
        '--terminal-bg': state.currentTheme.colors?.background || '#1f2937',
        '--terminal-fg': state.currentTheme.colors?.foreground || '#f9fafb',
        '--terminal-font-size': `${state.fontSize}px`,
        '--terminal-line-height': 1.4,
      } as React.CSSProperties}
    >
      {/* Drag overlay */}
      {state.dragOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-dashed border-blue-500 flex items-center justify-center z-50">
          <div className="text-blue-400 text-xl font-semibold">
            Drop files to add to terminal
          </div>
        </div>
      )}

      {/* Error display */}
      {state.error && (
        <div className="absolute top-0 left-0 right-0 bg-red-600 text-white p-2 text-sm z-50">
          <div className="flex items-center justify-between">
            <span>Error: {state.error}</span>
            <button
              onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}
              className="text-white hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-200">Professional Terminal</h3>
          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
            v3.0.0
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
            onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'showFileTree' })}
            className={`p-2 rounded transition-colors ${
              state.showFileTree ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
            }`}
            title="File Tree (Ctrl+B)"
          >
            <FolderOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'showHistory' })}
            className={`p-2 rounded transition-colors ${
              state.showHistory ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
            }`}
            title="History (Ctrl+H)"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'showPerformance' })}
            className={`p-2 rounded transition-colors ${
              state.showPerformance ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
            }`}
            title="Performance Monitor (Ctrl+Shift+P)"
          >
            <Activity className="w-4 h-4" />
          </button>

          <button
            onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'showDebugger' })}
            className={`p-2 rounded transition-colors ${
              state.showDebugger ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
            }`}
            title="Debugger (Ctrl+Shift+D)"
          >
            <Bug className="w-4 h-4" />
          </button>

          <button
            onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'showBrowser' })}
            className={`p-2 rounded transition-colors ${
              state.showBrowser ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
            }`}
            title="Browser Integration (Ctrl+Shift+B)"
          >
            <Globe className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'showSettings' })}
            className={`p-2 rounded transition-colors ${
              state.showSettings ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
            }`}
            title="Settings (Ctrl+,)"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Window controls */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_EXPANDED' })}
            className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Maximize (Ctrl+Enter)"
          >
            {state.isExpanded ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-gray-800 border-b border-gray-700 flex items-center overflow-x-auto">
        {tabs.map((tab) => (
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
              {tab.type === 'git' && <GitBranch className="w-4 h-4" />}
              {tab.type === 'package' && <Package className="w-4 h-4" />}
              {tab.type === 'build' && <ZapIcon className="w-4 h-4" />}
              {tab.type === 'test' && <TestTube className="w-4 h-4" />}
              {tab.type === 'deploy' && <Cloud className="w-4 h-4" />}
              {tab.type === 'debug' && <Bug className="w-4 h-4" />}
              {tab.type === 'network' && <Network className="w-4 h-4" />}
            </div>
            <span className="text-sm">{tab.name}</span>
            {tab.isModified && <div className="w-2 h-2 bg-orange-400 rounded-full"></div>}
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
        {state.showFileTree && (
          <div className="w-80 bg-gray-850 border-r border-gray-700 p-4 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-300 mb-3">File System</h4>
            <div className="space-y-1">
              {Object.values(terminalState.fileSystem).map((file: any) => (
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

        {/* Performance Monitor Sidebar */}
        {state.showPerformance && (
          <div className="w-80 bg-gray-850 border-r border-gray-700 p-4 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Performance Monitor</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">CPU Usage</span>
                <span className="text-gray-200">45%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Memory</span>
                <span className="text-gray-200">256MB</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Processes</span>
                <span className="text-gray-200">{state.processes.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Background Jobs</span>
                <span className="text-gray-200">{state.backgroundJobs.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Terminal Panels */}
        <div className="flex flex-1 p-4 gap-4 overflow-auto">
          {splits.map((split) => {
            const splitTabs = tabs.filter((tab) => split.tabs.includes(tab.id));

            return (
              <div
                key={split.id}
                className={`flex ${split.direction === 'horizontal' ? 'flex-row' : 'flex-col'}`}
                style={{ width: `${split.size}%` }}
              >
                {splitTabs.map((tabId) => {
                  const panel = panels.find((p) => p.tabId === tabId);
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
          <span>Theme: {state.currentTheme.name || 'Dark'}</span>
          <span>Font: {state.fontSize}px</span>
          <span>Commands: {commandHistory.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{new Date().toLocaleTimeString()}</span>
          {state.isLoading && <Loader className="w-4 h-4 animate-spin" />}
        </div>
      </div>

      {/* Settings Panel */}
      {state.showSettings && (
        <div className="absolute top-16 right-4 w-96 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-30">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-4">Terminal Settings</h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Font Size</label>
                <div className="flex items-center gap-2">
                  <button onClick={decreaseFontSize} className="p-1 hover:bg-gray-700 rounded">
                    -
                  </button>
                  <span className="text-sm text-gray-300 min-w-[2rem] text-center">
                    {state.fontSize}
                  </span>
                  <button onClick={increaseFontSize} className="p-1 hover:bg-gray-700 rounded">
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Auto Scroll</label>
                <input
                  type="checkbox"
                  checked={state.autoScroll}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_PREFERENCE',
                      payload: { key: 'autoScroll', value: e.target.checked },
                    })
                  }
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Show Timestamps</label>
                <input
                  type="checkbox"
                  checked={state.showTimestamps}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_PREFERENCE',
                      payload: { key: 'showTimestamps', value: e.target.checked },
                    })
                  }
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Word Wrap</label>
                <input
                  type="checkbox"
                  checked={state.wordWrap}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_PREFERENCE',
                      payload: { key: 'wordWrap', value: e.target.checked },
                    })
                  }
                  className="rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Panel */}
      {state.showSearch && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-96 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-30">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search output..."
                value={state.searchQuery}
                onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-400"
                autoFocus
              />
              <button onClick={clearSearch} className="p-2 hover:bg-gray-700 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            {state.searchQuery && (
              <div className="mt-2 text-xs text-gray-400">
                Found {filteredOutputs.length} matches
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Panel */}
      {state.showHistory && (
        <div className="absolute top-16 left-4 w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-30 max-h-96 overflow-y-auto">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-4">Command History</h4>
            <div className="space-y-2">
              {commandHistory.slice(-20).map((cmd, index) => (
                <div
                  key={index}
                  className="text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-700 p-2 rounded cursor-pointer"
                  onClick={() => setCommand(cmd)}
                >
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help Panel */}
      {state.showHelp && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-96 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-30 max-h-96 overflow-y-auto">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-4">Keyboard Shortcuts</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">New Tab</span>
                <span className="text-gray-200">Ctrl+T</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Close Tab</span>
                <span className="text-gray-200">Ctrl+W</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Split Vertical</span>
                <span className="text-gray-200">Ctrl+Shift+T</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Split Horizontal</span>
                <span className="text-gray-200">Ctrl+Shift+S</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">File Tree</span>
                <span className="text-gray-200">Ctrl+B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Search</span>
                <span className="text-gray-200">Ctrl+F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Settings</span>
                <span className="text-gray-200">Ctrl+,</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Maximize</span>
                <span className="text-gray-200">Ctrl+Enter</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">History</span>
                <span className="text-gray-200">Ctrl+R</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Performance</span>
                <span className="text-gray-200">Ctrl+Shift+P</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Debugger</span>
                <span className="text-gray-200">Ctrl+Shift+D</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Browser</span>
                <span className="text-gray-200">Ctrl+Shift+B</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalTerminal;