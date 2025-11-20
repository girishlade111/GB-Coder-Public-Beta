// Comprehensive Console Types and Interfaces

export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug' | 'success' | 'system';
export type ConsoleTheme = 'dark' | 'light' | 'monokai' | 'solarized' | 'dracula' | 'nord';
export type LayoutMode = 'split' | 'tabs' | 'stacked' | 'floating';
export type SyntaxLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp' | 'csharp' | 'go' | 'rust' | 'php' | 'ruby' | 'html' | 'css' | 'json' | 'xml' | 'sql' | 'bash' | 'powershell';

// Console Log Entry
export interface ConsoleLogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  source?: string;
  stackTrace?: string;
  metadata?: Record<string, any>;
  language?: SyntaxLanguage;
  highlighted?: boolean;
  tags?: string[];
}

// Console Tab
export interface ConsoleTab {
  id: string;
  name: string;
  icon?: string;
  logs: ConsoleLogEntry[];
  filters: ConsoleFilter;
  isPinned: boolean;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Filter Configuration
export interface ConsoleFilter {
  levels: LogLevel[];
  searchQuery: string;
  dateRange?: {
    start: number;
    end: number;
  };
  sources?: string[];
  tags?: string[];
  regex?: string;
  caseSensitive: boolean;
  includeStackTrace: boolean;
}

// Auto-completion
export interface AutoCompleteItem {
  value: string;
  label: string;
  description?: string;
  type: 'command' | 'variable' | 'function' | 'keyword' | 'snippet';
  score: number;
  metadata?: Record<string, any>;
}

export interface AutoCompleteContext {
  currentInput: string;
  cursorPosition: number;
  history: string[];
  environment: Record<string, any>;
}

// Keyboard Shortcuts
export interface KeyboardShortcut {
  id: string;
  key: string;
  modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  action: string;
  description: string;
  enabled: boolean;
}

// Theme Configuration
export interface ConsoleThemeConfig {
  name: ConsoleTheme;
  colors: {
    background: string;
    foreground: string;
    selection: string;
    cursor: string;
    border: string;
    log: string;
    info: string;
    warn: string;
    error: string;
    debug: string;
    success: string;
    system: string;
    timestamp: string;
    lineNumber: string;
  };
  fonts: {
    family: string;
    size: number;
    lineHeight: number;
  };
  spacing: {
    padding: number;
    lineSpacing: number;
  };
}

// Layout Configuration
export interface LayoutConfig {
  mode: LayoutMode;
  splitRatio?: number;
  maxTabs?: number;
  tabPosition?: 'top' | 'bottom' | 'left' | 'right';
  showLineNumbers: boolean;
  showTimestamps: boolean;
  wordWrap: boolean;
  fontSize: number;
}

// Command History
export interface CommandHistoryEntry {
  id: string;
  command: string;
  timestamp: number;
  executionTime?: number;
  exitCode?: number;
  output?: string;
  error?: string;
}

// Session Data
export interface ConsoleSession {
  id: string;
  name: string;
  tabs: ConsoleTab[];
  history: CommandHistoryEntry[];
  environment: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

// Performance Metrics
export interface PerformanceMetrics {
  commandCount: number;
  errorCount: number;
  averageExecutionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  uptime: number;
  lastUpdated: number;
}

// Analytics Event
export interface AnalyticsEvent {
  id: string;
  type: 'command' | 'error' | 'warning' | 'performance' | 'user_action';
  timestamp: number;
  data: Record<string, any>;
  userId?: string;
  sessionId: string;
}

// Security Configuration
export interface SecurityConfig {
  enableInputSanitization: boolean;
  allowedCommands?: string[];
  blockedCommands?: string[];
  maxInputLength: number;
  enableAccessControl: boolean;
  roles?: string[];
  permissions?: Record<string, string[]>;
}

// User Preferences
export interface UserPreferences {
  theme: ConsoleTheme;
  layout: LayoutConfig;
  shortcuts: KeyboardShortcut[];
  autoComplete: {
    enabled: boolean;
    minChars: number;
    maxSuggestions: number;
    fuzzyMatch: boolean;
  };
  notifications: {
    enabled: boolean;
    showErrors: boolean;
    showWarnings: boolean;
    sound: boolean;
  };
  export: {
    format: 'json' | 'csv' | 'txt';
    includeTimestamps: boolean;
    includeMetadata: boolean;
  };
}

// External Tool Integration
export interface ExternalTool {
  id: string;
  name: string;
  type: 'api' | 'cli' | 'webhook' | 'plugin';
  endpoint?: string;
  apiKey?: string;
  enabled: boolean;
  config?: Record<string, any>;
}

// Search Result
export interface SearchResult {
  logEntry: ConsoleLogEntry;
  matches: {
    start: number;
    end: number;
    text: string;
  }[];
  score: number;
}

// Syntax Highlighting Token
export interface SyntaxToken {
  type: 'keyword' | 'string' | 'number' | 'comment' | 'operator' | 'function' | 'variable' | 'class';
  value: string;
  start: number;
  end: number;
  color?: string;
}

// Debug Information
export interface DebugInfo {
  breakpoints: number[];
  variables: Record<string, any>;
  callStack: string[];
  currentLine?: number;
  isDebugging: boolean;
}

// Console State
export interface ConsoleState {
  tabs: ConsoleTab[];
  activeTabId: string;
  theme: ConsoleThemeConfig;
  layout: LayoutConfig;
  preferences: UserPreferences;
  session: ConsoleSession;
  performance: PerformanceMetrics;
  security: SecurityConfig;
  externalTools: ExternalTool[];
  debugInfo?: DebugInfo;
}

// Action Types
export type ConsoleAction =
  | { type: 'ADD_LOG'; payload: { tabId: string; log: ConsoleLogEntry } }
  | { type: 'CLEAR_LOGS'; payload: { tabId: string } }
  | { type: 'ADD_TAB'; payload: ConsoleTab }
  | { type: 'REMOVE_TAB'; payload: { tabId: string } }
  | { type: 'SET_ACTIVE_TAB'; payload: { tabId: string } }
  | { type: 'UPDATE_FILTER'; payload: { tabId: string; filter: Partial<ConsoleFilter> } }
  | { type: 'SET_THEME'; payload: ConsoleThemeConfig }
  | { type: 'UPDATE_LAYOUT'; payload: Partial<LayoutConfig> }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'ADD_COMMAND_HISTORY'; payload: CommandHistoryEntry }
  | { type: 'UPDATE_PERFORMANCE'; payload: Partial<PerformanceMetrics> }
  | { type: 'EXPORT_SESSION'; payload: ConsoleSession }
  | { type: 'IMPORT_SESSION'; payload: ConsoleSession }
  | { type: 'TOGGLE_DEBUG'; payload: { enabled: boolean } };

// Event Handlers
export interface ConsoleEventHandlers {
  onLog: (log: ConsoleLogEntry) => void;
  onCommand: (command: string) => Promise<void>;
  onError: (error: Error) => void;
  onTabChange: (tabId: string) => void;
  onExport: (session: ConsoleSession) => void;
  onImport: (session: ConsoleSession) => void;
  onThemeChange: (theme: ConsoleTheme) => void;
  onLayoutChange: (layout: LayoutConfig) => void;
}
