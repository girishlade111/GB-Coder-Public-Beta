// Comprehensive Terminal State Management System
import { 
  TerminalState, 
  TerminalTab, 
  TerminalSession, 
  SplitLayout, 
  ProcessInfo, 
  BackgroundJob,
  KeyboardShortcut,
  TerminalPreferences,
  VirtualFile,
  EnvironmentVariable,
  TerminalOutput,
  ColorScheme,
  Plugin,
  SessionData
} from '../types/terminal.types';

export class TerminalStateManager {
  private state: TerminalState;
  private sessions: Map<string, TerminalSession> = new Map();
  private observers: Set<(state: TerminalState, event: string) => void> = new Set();
  private saveTimeout?: NodeJS.Timeout;
  private maxHistorySize = 10000;
  private maxOutputLines = 100000;

  constructor() {
    this.state = this.initializeState();
    this.loadState();
    this.startAutoSave();
  }

  /**
   * Initialize default terminal state
   */
  private initializeState(): TerminalState {
    const defaultFiles: Record<string, VirtualFile> = {
      'README.md': {
        id: 'readme',
        name: 'README.md',
        type: 'file',
        content: '# Comprehensive Terminal\n\nA feature-rich terminal interface for web development.\n\n## Features\n- Multi-tab support\n- Split-screen layouts\n- 200+ commands\n- Syntax highlighting\n- Drag & drop\n- Session persistence\n- Plugin architecture\n- Advanced autocomplete\n- Process management\n- Git integration\n- Package management\n- Build tools\n- Testing frameworks\n- Linting tools\n- Network utilities\n- Browser integration\n- Debugging tools\n- Performance monitoring\n- Theme engine',
        size: 1024,
        permissions: '-rw-r--r--',
        owner: 'developer',
        group: 'developers',
        created: Date.now(),
        modified: Date.now(),
        accessed: Date.now(),
        encoding: 'utf-8',
        mimeType: 'text/markdown'
      },
      'projects': {
        id: 'projects',
        name: 'projects',
        type: 'directory',
        size: 4096,
        permissions: 'drwxr-xr-x',
        owner: 'developer',
        group: 'developers',
        created: Date.now(),
        modified: Date.now(),
        accessed: Date.now(),
        children: []
      },
      'src': {
        id: 'src',
        name: 'src',
        type: 'directory',
        size: 4096,
        permissions: 'drwxr-xr-x',
        owner: 'developer',
        group: 'developers',
        created: Date.now(),
        modified: Date.now(),
        accessed: Date.now(),
        children: []
      },
      'node_modules': {
        id: 'node_modules',
        name: 'node_modules',
        type: 'directory',
        size: 4096,
        permissions: 'drwxr-xr-x',
        owner: 'developer',
        group: 'developers',
        created: Date.now(),
        modified: Date.now(),
        accessed: Date.now(),
        children: []
      },
      'package.json': {
        id: 'package_json',
        name: 'package.json',
        type: 'file',
        content: JSON.stringify({
          name: 'comprehensive-terminal',
          version: '1.0.0',
          description: 'A feature-rich terminal interface',
          scripts: {
            dev: 'vite',
            build: 'tsc && vite build',
            preview: 'vite preview',
            test: 'jest'
          },
          dependencies: {
            react: '^18.0.0',
            typescript: '^4.9.0'
          }
        }, null, 2),
        size: 1024,
        permissions: '-rw-r--r--',
        owner: 'developer',
        group: 'developers',
        created: Date.now(),
        modified: Date.now(),
        accessed: Date.now(),
        encoding: 'utf-8',
        mimeType: 'application/json'
      }
    };

    const defaultEnvironment: Record<string, string> = {
      USER: 'developer',
      HOME: '/home/developer',
      PWD: '/home/developer',
      PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
      SHELL: '/bin/bash',
      TERM: 'xterm-256color',
      NODE_ENV: 'development',
      EDITOR: 'vim',
      VISUAL: 'vim',
      LANG: 'en_US.UTF-8',
      LC_ALL: 'en_US.UTF-8',
      TZ: 'UTC',
      HOSTNAME: 'terminal',
      HOSTTYPE: 'x86_64',
      MACHTYPE: 'x86_64',
      OSTYPE: 'linux-gnu',
      PYTHONPATH: '',
      RUBYLIB: '',
      PERL5LIB: '',
      LD_LIBRARY_PATH: '',
      MANPATH: '',
      INFOPATH: '',
      PATH_SEPARATOR: ':'
    };

    const defaultAliases: Record<string, string> = {
      'll': 'ls -la',
      'la': 'ls -A',
      'l': 'ls -CF',
      '..': 'cd ..',
      '...': 'cd ../..',
      '....': 'cd ../../..',
      'cd..': 'cd ..',
      'grep': 'grep --color=auto',
      'fgrep': 'fgrep --color=auto',
      'egrep': 'egrep --color=auto',
      'ls': 'ls --color=auto',
      'dir': 'dir --color=auto',
      'vdir': 'vdir --color=auto',
      'diff': 'diff --color=auto'
    };

    const defaultShortcuts: KeyboardShortcut[] = [
      { id: 'clear', key: 'c', ctrl: true, alt: false, shift: false, meta: false, description: 'Clear terminal', category: 'General', action: 'clear' },
      { id: 'copy', key: 'c', ctrl: true, alt: false, shift: false, meta: true, description: 'Copy selected text', category: 'Edit', action: 'copy' },
      { id: 'paste', key: 'v', ctrl: true, alt: false, shift: false, meta: true, description: 'Paste from clipboard', category: 'Edit', action: 'paste' },
      { id: 'tab-next', key: 'Tab', ctrl: true, alt: false, shift: false, meta: false, description: 'Next tab', category: 'Navigation', action: 'next-tab' },
      { id: 'tab-prev', key: 'Tab', ctrl: true, alt: true, shift: false, meta: false, description: 'Previous tab', category: 'Navigation', action: 'prev-tab' },
      { id: 'new-tab', key: 't', ctrl: true, alt: false, shift: true, meta: false, description: 'New tab', category: 'Navigation', action: 'new-tab' },
      { id: 'close-tab', key: 'w', ctrl: true, alt: false, shift: false, meta: false, description: 'Close tab', category: 'Navigation', action: 'close-tab' },
      { id: 'split-h', key: 's', ctrl: true, alt: false, shift: true, meta: false, description: 'Split horizontally', category: 'Layout', action: 'split-horizontal' },
      { id: 'split-v', key: 'v', ctrl: true, alt: false, shift: true, meta: false, description: 'Split vertically', category: 'Layout', action: 'split-vertical' },
      { id: 'maximize', key: 'Enter', ctrl: true, alt: false, shift: false, meta: false, description: 'Maximize panel', category: 'Layout', action: 'maximize' },
      { id: 'history', key: 'r', ctrl: true, alt: false, shift: false, meta: false, description: 'Show command history', category: 'History', action: 'history' },
      { id: 'search', key: 'f', ctrl: true, alt: false, shift: false, meta: false, description: 'Search output', category: 'Search', action: 'search' },
      { id: 'help', key: '?', ctrl: true, alt: false, shift: false, meta: false, description: 'Show help', category: 'Help', action: 'help' },
      { id: 'settings', key: ',', ctrl: true, alt: false, shift: false, meta: false, description: 'Open settings', category: 'Settings', action: 'settings' },
      { id: 'theme-next', key: 't', ctrl: true, alt: false, shift: false, meta: false, description: 'Next theme', category: 'Appearance', action: 'next-theme' },
      { id: 'zoom-in', key: '=', ctrl: true, alt: false, shift: false, meta: false, description: 'Increase font size', category: 'Appearance', action: 'zoom-in' },
      { id: 'zoom-out', key: '-', ctrl: true, alt: false, shift: false, meta: false, description: 'Decrease font size', category: 'Appearance', action: 'zoom-out' },
      { id: 'reset-zoom', key: '0', ctrl: true, alt: false, shift: false, meta: false, description: 'Reset font size', category: 'Appearance', action: 'reset-zoom' }
    ];

    const defaultPreferences: TerminalPreferences = {
      theme: 'dark',
      layout: 'single',
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
      lineHeight: 1.4,
      wordWrap: true,
      showLineNumbers: false,
      showTimestamps: true,
      showIcons: true,
      autoSave: true,
      autoScroll: true,
      scrollBack: 1000,
      bell: true,
      copyOnSelect: false,
      cursorBlink: true,
      cursorShape: 'block',
      historySize: 10000,
      maxOutputLines: 100000,
      plugins: []
    };

    return {
      currentDirectory: '/home/developer',
      commandHistory: [],
      fileSystem: defaultFiles,
      processes: {},
      npmPackages: {},
      environment: defaultEnvironment,
      aliases: defaultAliases,
      history: [],
      backgroundJobs: [],
      sessions: [],
      shortcuts: defaultShortcuts,
      preferences: defaultPreferences
    };
  }

  /**
   * Load state from storage
   */
  private loadState(): void {
    try {
      const saved = localStorage.getItem('comprehensive-terminal-state');
      if (saved) {
        const savedState = JSON.parse(saved);
        this.state = { ...this.state, ...savedState };
        this.loadSessions();
      }
    } catch (error) {
      console.error('Failed to load terminal state:', error);
    }
  }

  /**
   * Save state to storage
   */
  private saveState(): void {
    try {
      // Clean state before saving
      const cleanState = {
        ...this.state,
        history: this.state.history.slice(-this.maxHistorySize),
        commandHistory: this.state.commandHistory.slice(-1000)
      };
      
      localStorage.setItem('comprehensive-terminal-state', JSON.stringify(cleanState));
      this.saveSessions();
    } catch (error) {
      console.error('Failed to save terminal state:', error);
    }
  }

  /**
   * Start auto-save timer
   */
  private startAutoSave(): void {
    this.saveTimeout = setInterval(() => {
      this.saveState();
    }, 5000); // Save every 5 seconds
  }

  /**
   * Stop auto-save timer
   */
  private stopAutoSave(): void {
    if (this.saveTimeout) {
      clearInterval(this.saveTimeout);
      this.saveTimeout = undefined;
    }
  }

  /**
   * Load sessions from storage
   */
  private loadSessions(): void {
    try {
      const saved = localStorage.getItem('comprehensive-terminal-sessions');
      if (saved) {
        const sessions = JSON.parse(saved);
        this.sessions = new Map(sessions.map((s: any) => [s.id, s]));
      }
    } catch (error) {
      console.error('Failed to load terminal sessions:', error);
    }
  }

  /**
   * Save sessions to storage
   */
  private saveSessions(): void {
    try {
      const sessions = Array.from(this.sessions.values());
      localStorage.setItem('comprehensive-terminal-sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save terminal sessions:', error);
    }
  }

  /**
   * Get current state
   */
  getState(): TerminalState {
    return { ...this.state };
  }

  /**
   * Set state
   */
  setState(updates: Partial<TerminalState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyStateChange('state-updated');
  }

  /**
   * Update current directory
   */
  setCurrentDirectory(path: string): void {
    this.state.currentDirectory = path;
    this.state.environment.PWD = path;
    this.notifyStateChange('directory-changed');
  }

  /**
   * Add command to history
   */
  addCommandHistory(command: string): void {
    if (command.trim()) {
      this.state.commandHistory.push(command);
      if (this.state.commandHistory.length > 1000) {
        this.state.commandHistory = this.state.commandHistory.slice(-1000);
      }
      this.notifyStateChange('history-updated');
    }
  }

  /**
   * Get command history
   */
  getCommandHistory(limit: number = 50): string[] {
    return this.state.commandHistory.slice(-limit);
  }

  /**
   * Search command history
   */
  searchHistory(query: string, caseSensitive: boolean = false): string[] {
    const searchQuery = caseSensitive ? query : query.toLowerCase();
    return this.state.commandHistory.filter(cmd => {
      const searchTarget = caseSensitive ? cmd : cmd.toLowerCase();
      return searchTarget.includes(searchQuery);
    });
  }

  /**
   * Clear command history
   */
  clearCommandHistory(): void {
    this.state.commandHistory = [];
    this.notifyStateChange('history-cleared');
  }

  /**
   * Update environment variable
   */
  setEnvironmentVariable(name: string, value: string, readonly: boolean = false): void {
    this.state.environment[name] = value;
    this.notifyStateChange('environment-updated');
  }

  /**
   * Get environment variable
   */
  getEnvironmentVariable(name: string): string | undefined {
    return this.state.environment[name];
  }

  /**
   * Get all environment variables
   */
  getEnvironment(): Record<string, string> {
    return { ...this.state.environment };
  }

  /**
   * Set alias
   */
  setAlias(alias: string, command: string): void {
    this.state.aliases[alias] = command;
    this.notifyStateChange('alias-updated');
  }

  /**
   * Get alias
   */
  getAlias(alias: string): string | undefined {
    return this.state.aliases[alias];
  }

  /**
   * Get all aliases
   */
  getAliases(): Record<string, string> {
    return { ...this.state.aliases };
  }

  /**
   * Remove alias
   */
  removeAlias(alias: string): boolean {
    if (this.state.aliases[alias]) {
      delete this.state.aliases[alias];
      this.notifyStateChange('alias-removed');
      return true;
    }
    return false;
  }

  /**
   * Create file
   */
  createFile(path: string, content: string = '', permissions: string = '-rw-r--r--'): VirtualFile {
    const fileName = path.split('/').pop() || path;
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const file: VirtualFile = {
      id: fileId,
      name: fileName,
      type: 'file',
      content,
      size: content.length,
      permissions,
      owner: 'developer',
      group: 'developers',
      created: Date.now(),
      modified: Date.now(),
      accessed: Date.now(),
      encoding: 'utf-8',
      mimeType: this.getMimeType(fileName)
    };

    this.state.fileSystem[path] = file;
    this.notifyStateChange('file-created');
    return file;
  }

  /**
   * Create directory
   */
  createDirectory(path: string, permissions: string = 'drwxr-xr-x'): VirtualFile {
    const dirName = path.split('/').pop() || path;
    const dirId = `dir-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const directory: VirtualFile = {
      id: dirId,
      name: dirName,
      type: 'directory',
      size: 4096,
      permissions,
      owner: 'developer',
      group: 'developers',
      created: Date.now(),
      modified: Date.now(),
      accessed: Date.now(),
      children: []
    };

    this.state.fileSystem[path] = directory;
    this.notifyStateChange('directory-created');
    return directory;
  }

  /**
   * Delete file or directory
   */
  deletePath(path: string): boolean {
    if (this.state.fileSystem[path]) {
      delete this.state.fileSystem[path];
      this.notifyStateChange('path-deleted');
      return true;
    }
    return false;
  }

  /**
   * Get file or directory
   */
  getPath(path: string): VirtualFile | undefined {
    return this.state.fileSystem[path];
  }

  /**
   * List directory contents
   */
  listDirectory(path?: string): VirtualFile[] {
    const dirPath = path || this.state.currentDirectory;
    return Object.values(this.state.fileSystem).filter(file => 
      file.type === 'directory' || file.parent === dirPath
    );
  }

  /**
   * Update file content
   */
  updateFile(path: string, content: string): boolean {
    const file = this.state.fileSystem[path];
    if (file && file.type === 'file') {
      file.content = content;
      file.size = content.length;
      file.modified = Date.now();
      this.notifyStateChange('file-updated');
      return true;
    }
    return false;
  }

  /**
   * Add process
   */
  addProcess(process: ProcessInfo): void {
    this.state.processes[process.pid] = process;
    this.notifyStateChange('process-added');
  }

  /**
   * Update process
   */
  updateProcess(pid: string, updates: Partial<ProcessInfo>): boolean {
    if (this.state.processes[pid]) {
      this.state.processes[pid] = { ...this.state.processes[pid], ...updates };
      this.notifyStateChange('process-updated');
      return true;
    }
    return false;
  }

  /**
   * Remove process
   */
  removeProcess(pid: string): boolean {
    if (this.state.processes[pid]) {
      delete this.state.processes[pid];
      this.notifyStateChange('process-removed');
      return true;
    }
    return false;
  }

  /**
   * Get all processes
   */
  getProcesses(): ProcessInfo[] {
    return Object.values(this.state.processes);
  }

  /**
   * Add background job
   */
  addBackgroundJob(job: BackgroundJob): void {
    this.state.backgroundJobs.push(job);
    this.notifyStateChange('background-job-added');
  }

  /**
   * Update background job
   */
  updateBackgroundJob(id: string, updates: Partial<BackgroundJob>): boolean {
    const jobIndex = this.state.backgroundJobs.findIndex(job => job.id === id);
    if (jobIndex !== -1) {
      this.state.backgroundJobs[jobIndex] = { ...this.state.backgroundJobs[jobIndex], ...updates };
      this.notifyStateChange('background-job-updated');
      return true;
    }
    return false;
  }

  /**
   * Remove background job
   */
  removeBackgroundJob(id: string): boolean {
    const jobIndex = this.state.backgroundJobs.findIndex(job => job.id === id);
    if (jobIndex !== -1) {
      this.state.backgroundJobs.splice(jobIndex, 1);
      this.notifyStateChange('background-job-removed');
      return true;
    }
    return false;
  }

  /**
   * Get background jobs
   */
  getBackgroundJobs(): BackgroundJob[] {
    return [...this.state.backgroundJobs];
  }

  /**
   * Create session
   */
  createSession(name: string, isMain: boolean = false): TerminalSession {
    const session: TerminalSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      tabs: [],
      splits: [],
      activeTabId: '',
      activeSplitId: '',
      theme: this.state.preferences.theme,
      layout: this.state.preferences.layout,
      created: Date.now(),
      lastActivity: Date.now(),
      isMain
    };

    this.sessions.set(session.id, session);
    this.notifyStateChange('session-created');
    return session;
  }

  /**
   * Load session
   */
  loadSession(id: string): TerminalSession | undefined {
    const session = this.sessions.get(id);
    if (session) {
      session.lastActivity = Date.now();
      this.notifyStateChange('session-loaded');
    }
    return session;
  }

  /**
   * Save session
   */
  saveSession(session: TerminalSession): void {
    session.lastActivity = Date.now();
    this.sessions.set(session.id, session);
    this.saveSessions();
    this.notifyStateChange('session-saved');
  }

  /**
   * Delete session
   */
  deleteSession(id: string): boolean {
    if (this.sessions.has(id)) {
      this.sessions.delete(id);
      this.saveSessions();
      this.notifyStateChange('session-deleted');
      return true;
    }
    return false;
  }

  /**
   * Get all sessions
   */
  getSessions(): TerminalSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Update preferences
   */
  updatePreferences(updates: Partial<TerminalPreferences>): void {
    this.state.preferences = { ...this.state.preferences, ...updates };
    this.notifyStateChange('preferences-updated');
  }

  /**
   * Get preferences
   */
  getPreferences(): TerminalPreferences {
    return { ...this.state.preferences };
  }

  /**
   * Add shortcut
   */
  addShortcut(shortcut: KeyboardShortcut): void {
    const existingIndex = this.state.shortcuts.findIndex(s => s.id === shortcut.id);
    if (existingIndex !== -1) {
      this.state.shortcuts[existingIndex] = shortcut;
    } else {
      this.state.shortcuts.push(shortcut);
    }
    this.notifyStateChange('shortcut-added');
  }

  /**
   * Remove shortcut
   */
  removeShortcut(id: string): boolean {
    const index = this.state.shortcuts.findIndex(s => s.id === id);
    if (index !== -1) {
      this.state.shortcuts.splice(index, 1);
      this.notifyStateChange('shortcut-removed');
      return true;
    }
    return false;
  }

  /**
   * Get shortcuts
   */
  getShortcuts(): KeyboardShortcut[] {
    return [...this.state.shortcuts];
  }

  /**
   * Find shortcut by key combination
   */
  findShortcut(key: string, ctrl: boolean, alt: boolean, shift: boolean, meta: boolean): KeyboardShortcut | undefined {
    return this.state.shortcuts.find(s => 
      s.key === key && s.ctrl === ctrl && s.alt === alt && s.shift === shift && s.meta === meta
    );
  }

  /**
   * Export state
   */
  exportState(options?: { 
    includeHistory?: boolean; 
    includeSessions?: boolean;
    includeProcesses?: boolean;
    dateRange?: { start: number; end: number };
  }): SessionData {
    const { includeHistory = true, includeSessions = true, includeProcesses = false, dateRange } = options || {};
    
    let state = { ...this.state };
    
    if (!includeHistory) {
      state = { ...state, history: [], commandHistory: [] };
    }
    
    if (!includeSessions) {
      state = { ...state, sessions: [] };
    }
    
    if (!includeProcesses) {
      state = { ...state, processes: {}, backgroundJobs: [] };
    }
    
    if (dateRange) {
      const { start, end } = dateRange;
      state.history = state.history.filter(h => h.timestamp >= start && h.timestamp <= end);
      state.commandHistory = state.commandHistory.filter((_, index) => {
        // Keep last commands if no specific range
        return true;
      });
    }

    return {
      id: `export-${Date.now()}`,
      timestamp: Date.now(),
      version: '2.0.0',
      state,
      metadata: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: Intl.DateTimeFormat().resolvedOptions().locale
      }
    };
  }

  /**
   * Import state
   */
  importState(sessionData: SessionData, options?: { merge?: boolean; overwrite?: boolean }): boolean {
    try {
      const { merge = false, overwrite = false } = options || {};
      
      if (overwrite) {
        this.state = sessionData.state;
      } else {
        this.state = merge ? { ...this.state, ...sessionData.state } : this.state;
      }
      
      this.notifyStateChange('state-imported');
      this.saveState();
      return true;
    } catch (error) {
      console.error('Failed to import state:', error);
      return false;
    }
  }

  /**
   * Add observer
   */
  addObserver(observer: (state: TerminalState, event: string) => void): void {
    this.observers.add(observer);
  }

  /**
   * Remove observer
   */
  removeObserver(observer: (state: TerminalState, event: string) => void): void {
    this.observers.delete(observer);
  }

  /**
   * Notify observers of state changes
   */
  private notifyStateChange(event: string): void {
    this.observers.forEach(observer => {
      try {
        observer(this.state, event);
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
    
    // Auto-save on significant changes
    if (['directory-changed', 'file-created', 'file-updated', 'preferences-updated'].includes(event)) {
      this.saveState();
    }
  }

  /**
   * Get MIME type for file
   */
  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      js: 'application/javascript',
      ts: 'application/typescript',
      jsx: 'text/jsx',
      tsx: 'text/tsx',
      html: 'text/html',
      css: 'text/css',
      scss: 'text/scss',
      sass: 'text/sass',
      less: 'text/less',
      json: 'application/json',
      xml: 'application/xml',
      yaml: 'application/yaml',
      yml: 'application/yaml',
      md: 'text/markdown',
      txt: 'text/plain',
      py: 'text/x-python',
      rb: 'application/x-ruby',
      php: 'text/x-php',
      java: 'text/x-java-source',
      cpp: 'text/x-c++src',
      c: 'text/x-csrc',
      h: 'text/x-chdr',
      cs: 'text/x-csharp',
      go: 'text/x-go',
      rs: 'text/x-rust',
      sql: 'application/sql',
      sh: 'text/x-shellscript',
      bash: 'text/x-shellscript',
      zsh: 'text/x-shellscript',
      fish: 'text/x-shellscript',
      ps1: 'application/x-powershell',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      webp: 'image/webp',
      pdf: 'application/pdf',
      zip: 'application/zip',
      tar: 'application/x-tar',
      gz: 'application/gzip',
      rar: 'application/x-rar',
      '7z': 'application/x-7z-compressed'
    };
    
    return mimeTypes[ext || ''] || 'text/plain';
  }

  /**
   * Cleanup and destroy
   */
  destroy(): void {
    this.stopAutoSave();
    this.saveState();
    this.observers.clear();
    this.sessions.clear();
  }
}

// Export singleton instance
export const terminalStateManager = new TerminalStateManager();