// Comprehensive Terminal Types
export interface TerminalCommand {
  id: string;
  command: string;
  args: string[];
  timestamp: number;
  executionTime?: number;
  exitCode?: number;
  output?: TerminalOutput[];
  error?: string;
}

export interface TerminalOutput {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'system' | 'debug';
  message: string;
  timestamp: number;
  metadata?: {
    syntax?: string;
    language?: string;
    lineNumber?: number;
    column?: number;
    source?: string;
    raw?: boolean;
  };
}

export interface VirtualFile {
  id: string;
  name: string;
  type: 'file' | 'directory' | 'symlink';
  content?: string;
  size: number;
  permissions: string;
  owner: string;
  group: string;
  created: number;
  modified: number;
  accessed: number;
  parent?: string;
  children?: string[];
  encoding?: string;
  mimeType?: string;
}

export interface ProcessInfo {
  pid: string;
  name: string;
  command: string;
  status: 'running' | 'stopped' | 'zombie';
  cpu: number;
  memory: number;
  startTime: number;
  parent?: string;
  user: string;
  nice: number;
  priority: number;
  threads: number;
}

export interface EnvironmentVariable {
  name: string;
  value: string;
  readonly: boolean;
  description?: string;
}

export interface TerminalState {
  currentDirectory: string;
  commandHistory: string[];
  fileSystem: Record<string, VirtualFile>;
  processes: Record<string, ProcessInfo>;
  npmPackages: Record<string, NPMPackage>;
  environment: Record<string, string>;
  aliases: Record<string, string>;
  history: TerminalCommand[];
  backgroundJobs: BackgroundJob[];
  sessions: TerminalSession[];
  shortcuts: KeyboardShortcut[];
  preferences: TerminalPreferences;
}

export interface BackgroundJob {
  id: string;
  command: string;
  pid: string;
  status: 'running' | 'stopped' | 'completed' | 'failed';
  startTime: number;
  output?: string[];
  error?: string;
  stdin?: string;
  stdout?: string;
  stderr?: string;
}

export interface TerminalSession {
  id: string;
  name: string;
  tabs: TerminalTab[];
  splits: SplitLayout[];
  activeTabId: string;
  activeSplitId: string;
  theme: string;
  layout: string;
  created: number;
  lastActivity: number;
  isMain: boolean;
}

export interface TerminalTab {
  id: string;
  name: string;
  type: 'console' | 'file' | 'git' | 'package' | 'build' | 'test' | 'deploy' | 'debug' | 'network';
  outputs: TerminalOutput[];
  commandHistory: string[];
  historyIndex: number;
  isActive: boolean;
  isPinned: boolean;
  isModified: boolean;
  lastActivity: number;
  directory: string;
  theme: string;
  customTitle?: string;
  icon?: string;
  badge?: string;
  process?: ProcessInfo;
  connection?: NetworkConnection;
}

export interface SplitLayout {
  id: string;
  direction: 'horizontal' | 'vertical' | 'grid';
  tabs: string[];
  size: number; // percentage 0-100
  minSize?: number;
  resizable: boolean;
  nested?: SplitLayout[];
}

export interface KeyboardShortcut {
  id: string;
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  description: string;
  category: string;
  action: string;
  context?: string;
}

export interface TerminalPreferences {
  theme: string;
  layout: string;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
  showTimestamps: boolean;
  showIcons: boolean;
  autoSave: boolean;
  autoScroll: boolean;
  scrollBack: number;
  bell: boolean;
  copyOnSelect: boolean;
  cursorBlink: boolean;
  cursorShape: 'block' | 'underline' | 'bar';
  historySize: number;
  maxOutputLines: number;
  plugins: string[];
}

export interface NPMPackage {
  name: string;
  version: string;
  description?: string;
  installed: string;
  size?: number;
  license?: string;
  homepage?: string;
  repository?: string;
  dependencies?: string[];
  devDependencies?: string[];
  peerDependencies?: string[];
  scripts?: Record<string, string>;
  keywords?: string[];
}

export interface GitRepository {
  name: string;
  url: string;
  branch: string;
  commits: GitCommit[];
  branches: GitBranch[];
  tags: GitTag[];
  remotes: GitRemote[];
  status: GitStatus;
  conflicts: GitConflict[];
}

export interface GitCommit {
  hash: string;
  author: string;
  email: string;
  date: number;
  message: string;
  files: string[];
  additions: number;
  deletions: number;
}

export interface GitBranch {
  name: string;
  remote?: string;
  upstream?: string;
  ahead: number;
  behind: number;
  current: boolean;
}

export interface GitTag {
  name: string;
  hash: string;
  message: string;
  date: number;
}

export interface GitRemote {
  name: string;
  url: string;
  fetch: string;
  push: string;
}

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: string[];
  unstaged: string[];
  untracked: string[];
  conflicts: string[];
}

export interface GitConflict {
  file: string;
  status: 'both_modified' | 'both_deleted' | 'both_added' | 'deleted_by_us' | 'deleted_by_them' | 'added_by_us' | 'added_by_them' | 'both_modified_conflict';
}

export interface NetworkConnection {
  id: string;
  type: 'ssh' | 'telnet' | 'serial' | 'websocket';
  host: string;
  port: number;
  username?: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  protocols: string[];
  proxy?: ProxyConfig;
  certificates?: SSLCertificate[];
}

export interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  protocol: 'http' | 'https' | 'socks4' | 'socks5';
}

export interface SSLCertificate {
  subject: string;
  issuer: string;
  expires: number;
  fingerprint: string;
}

export interface BuildTool {
  name: string;
  version: string;
  config: string;
  commands: Record<string, string>;
  plugins: string[];
  output: string;
  sourceMaps: boolean;
  minify: boolean;
  optimize: boolean;
  watch: boolean;
}

export interface TestFramework {
  name: string;
  version: string;
  framework: 'jest' | 'mocha' | 'vitest' | 'cypress' | 'playwright' | 'puppeteer';
  config: string;
  reporters: string[];
  coverage: boolean;
  watch: boolean;
  parallel: boolean;
  browser?: string;
  headless: boolean;
}

export interface LinterConfig {
  name: string;
  version: string;
  config: string;
  rules: Record<string, string | number | boolean>;
  extensions: string[];
  fix: boolean;
  format: boolean;
}

export interface DatabaseConnection {
  id: string;
  type: 'mysql' | 'postgresql' | 'sqlite' | 'mongodb' | 'redis';
  host: string;
  port: number;
  database?: string;
  username: string;
  password: string;
  ssl: boolean;
  pool: number;
  timeout: number;
  status: 'connected' | 'disconnected' | 'error';
  lastQuery?: string;
  lastError?: string;
}

export interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  query: Record<string, string>;
  body?: any;
  response?: APIResponse;
  status: number;
  time: number;
  size: number;
}

export interface APIResponse {
  status: number;
  headers: Record<string, string>;
  body: any;
  time: number;
  size: number;
  cookies: Record<string, string>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category: 'cpu' | 'memory' | 'network' | 'disk' | 'custom';
  tags?: Record<string, string>;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  dependencies: string[];
  commands: PluginCommand[];
  hooks: PluginHook[];
  config?: Record<string, any>;
}

export interface PluginCommand {
  name: string;
  description: string;
  usage: string;
  handler: (args: string[], context: any) => Promise<TerminalOutput[]>;
}

export interface PluginHook {
  name: string;
  handler: (data: any) => any;
}

export interface SearchResult {
  id: string;
  file: string;
  line: number;
  column: number;
  match: string;
  context: string;
  type: 'file' | 'grep' | 'find' | 'search';
}

export interface SyntaxHighlightRule {
  pattern: RegExp;
  className: string;
  group?: number;
  priority?: number;
}

export interface ColorScheme {
  name: string;
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
    command: string;
    output: string;
    prompt: string;
    comment: string;
    keyword: string;
    string: string;
    number: string;
    operator: string;
    function: string;
    variable: string;
    constant: string;
    type: string;
    class: string;
    property: string;
    method: string;
    attribute: string;
    tag: string;
    value: string;
  };
  fonts: {
    family: string;
    size: number;
    lineHeight: number;
    weight: string;
  };
  spacing: {
    padding: number;
    margin: number;
    lineSpacing: number;
  };
  effects: {
    shadow: boolean;
    glow: boolean;
    animation: boolean;
    transitions: boolean;
  };
}

export interface TerminalEvent {
  type: string;
  data: any;
  timestamp: number;
  source: string;
  target?: string;
}

export interface DragDropFile {
  file: File;
  path?: string;
  overwrite?: boolean;
}

export interface CommandCompletion {
  name: string;
  description: string;
  usage: string;
  category: string;
  priority: number;
  aliases?: string[];
  args?: CommandArg[];
}

export interface CommandArg {
  name: string;
  description: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'file' | 'directory' | 'url';
  default?: any;
  choices?: any[];
  pattern?: RegExp;
}

export interface AutoCompleteOption {
  value: string;
  description?: string;
  icon?: string;
  type: 'command' | 'file' | 'directory' | 'variable' | 'function' | 'keyword' | 'number' | 'url' | 'text';
  score: number;
}

export interface SessionData {
  id: string;
  timestamp: number;
  version: string;
  state: TerminalState;
  metadata: {
    userAgent: string;
    language: string;
    timezone: string;
    locale: string;
  };
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'txt' | 'html' | 'pdf';
  includeHistory: boolean;
  includeSettings: boolean;
  includeEnvironment: boolean;
  includeProcesses: boolean;
  dateRange?: {
    start: number;
    end: number;
  };
  compression: boolean;
  encryption: boolean;
}

export interface ImportOptions {
  format: 'json' | 'csv' | 'txt';
  merge: boolean;
  overwrite: boolean;
  validate: boolean;
  backup: boolean;
}

export interface DebugSession {
  id: string;
  type: 'node' | 'browser' | 'python' | 'java' | 'go' | 'rust';
  status: 'starting' | 'running' | 'paused' | 'stopped' | 'error';
  breakpoints: Breakpoint[];
  variables: DebugVariable[];
  stack: StackFrame[];
  currentLine?: number;
  currentFile?: string;
  watchExpressions: WatchExpression[];
  console: DebugConsoleEntry[];
}

export interface Breakpoint {
  id: string;
  file: string;
  line: number;
  condition?: string;
  enabled: boolean;
  hitCount?: number;
  logMessage?: string;
}

export interface DebugVariable {
  id: string;
  name: string;
  value: string;
  type: string;
  scope: 'local' | 'global' | 'closure' | 'builtin';
  expandable: boolean;
  children?: DebugVariable[];
}

export interface StackFrame {
  id: string;
  file: string;
  line: number;
  function: string;
  arguments: DebugVariable[];
  locals: DebugVariable[];
}

export interface WatchExpression {
  id: string;
  expression: string;
  value: string;
  type: string;
  error?: string;
}

export interface DebugConsoleEntry {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  timestamp: number;
  level: number;
}

// Browser Integration Interface
export interface BrowserIntegration {
  id: string;
  url: string;
  title: string;
  userAgent: string;
  language: string;
  timezone: string;
  isAvailable: boolean;
  capabilities: string[];
  session: BrowserSession;
  actions: BrowserAction[];
  onAction: (action: BrowserAction) => void;
}

export interface BrowserSession {
  id: string;
  url: string;
  title: string;
  startedAt: number;
  lastActivity: number;
  commands: number;
  errors: number;
}

export interface BrowserAction {
  type: 'open-url' | 'refresh' | 'back' | 'forward' | 'execute-js' | 'get-page-info' | 'screenshot' | string;
  url?: string;
  code?: string;
  result?: string;
  error?: string;
  info?: any;
  dataUrl?: string;
  timestamp: number;
  success: boolean;
}

// Console types compatibility
export type ConsoleThemeConfig = ColorScheme;
export type LayoutConfig = TerminalPreferences;