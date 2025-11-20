// Session Data Export/Import Service
import { ConsoleSession, ConsoleTab, CommandHistoryEntry } from '../types/console.types';

export class SessionDataService {
  private currentSession: ConsoleSession | null = null;

  constructor() {
    this.loadCurrentSession();
  }

  /**
   * Load current session from storage
   */
  private loadCurrentSession(): void {
    try {
      const saved = localStorage.getItem('console-current-session');
      if (saved) {
        this.currentSession = JSON.parse(saved);
      } else {
        this.currentSession = this.createNewSession('Default Session');
      }
    } catch (error) {
      console.error('Failed to load current session:', error);
      this.currentSession = this.createNewSession('Default Session');
    }
  }

  /**
   * Save current session to storage
   */
  private saveCurrentSession(): void {
    if (!this.currentSession) return;

    try {
      this.currentSession.updatedAt = Date.now();
      localStorage.setItem('console-current-session', JSON.stringify(this.currentSession));
    } catch (error) {
      console.error('Failed to save current session:', error);
    }
  }

  /**
   * Create new session
   */
  createNewSession(name: string): ConsoleSession {
    const session: ConsoleSession = {
      id: this.generateSessionId(),
      name,
      tabs: [],
      history: [],
      environment: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {},
    };

    this.currentSession = session;
    this.saveCurrentSession();

    return session;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current session
   */
  getCurrentSession(): ConsoleSession | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  /**
   * Update current session
   */
  updateSession(updates: Partial<ConsoleSession>): void {
    if (!this.currentSession) return;

    this.currentSession = {
      ...this.currentSession,
      ...updates,
      updatedAt: Date.now(),
    };

    this.saveCurrentSession();
  }

  /**
   * Add tab to session
   */
  addTab(tab: ConsoleTab): void {
    if (!this.currentSession) return;

    this.currentSession.tabs.push(tab);
    this.saveCurrentSession();
  }

  /**
   * Remove tab from session
   */
  removeTab(tabId: string): boolean {
    if (!this.currentSession) return false;

    const index = this.currentSession.tabs.findIndex(t => t.id === tabId);
    if (index !== -1) {
      this.currentSession.tabs.splice(index, 1);
      this.saveCurrentSession();
      return true;
    }

    return false;
  }

  /**
   * Update tab in session
   */
  updateTab(tabId: string, updates: Partial<ConsoleTab>): boolean {
    if (!this.currentSession) return false;

    const tab = this.currentSession.tabs.find(t => t.id === tabId);
    if (tab) {
      Object.assign(tab, updates);
      tab.updatedAt = Date.now();
      this.saveCurrentSession();
      return true;
    }

    return false;
  }

  /**
   * Add command to history
   */
  addToHistory(entry: CommandHistoryEntry): void {
    if (!this.currentSession) return;

    this.currentSession.history.push(entry);
    this.saveCurrentSession();
  }

  /**
   * Export session to JSON
   */
  exportToJSON(session?: ConsoleSession): string {
    const sessionToExport = session || this.currentSession;
    if (!sessionToExport) {
      throw new Error('No session to export');
    }

    return JSON.stringify(sessionToExport, null, 2);
  }

  /**
   * Export session to CSV
   */
  exportToCSV(session?: ConsoleSession): string {
    const sessionToExport = session || this.currentSession;
    if (!sessionToExport) {
      throw new Error('No session to export');
    }

    const lines: string[] = [];

    // Session metadata
    lines.push('Session Information');
    lines.push(`Name,${sessionToExport.name}`);
    lines.push(`ID,${sessionToExport.id}`);
    lines.push(`Created,${new Date(sessionToExport.createdAt).toISOString()}`);
    lines.push(`Updated,${new Date(sessionToExport.updatedAt).toISOString()}`);
    lines.push('');

    // Tabs
    lines.push('Tabs');
    lines.push('ID,Name,Created,Updated,Log Count');
    for (const tab of sessionToExport.tabs) {
      lines.push([
        tab.id,
        tab.name,
        new Date(tab.createdAt).toISOString(),
        new Date(tab.updatedAt).toISOString(),
        tab.logs.length.toString(),
      ].join(','));
    }
    lines.push('');

    // Command history
    lines.push('Command History');
    lines.push('Timestamp,Command,Execution Time,Exit Code');
    for (const entry of sessionToExport.history) {
      lines.push([
        new Date(entry.timestamp).toISOString(),
        `"${entry.command.replace(/"/g, '""')}"`,
        entry.executionTime?.toString() || '',
        entry.exitCode?.toString() || '',
      ].join(','));
    }

    return lines.join('\n');
  }

  /**
   * Export session to plain text
   */
  exportToText(session?: ConsoleSession): string {
    const sessionToExport = session || this.currentSession;
    if (!sessionToExport) {
      throw new Error('No session to export');
    }

    const lines: string[] = [];

    // Session header
    lines.push('='.repeat(80));
    lines.push(`Session: ${sessionToExport.name}`);
    lines.push(`ID: ${sessionToExport.id}`);
    lines.push(`Created: ${new Date(sessionToExport.createdAt).toISOString()}`);
    lines.push(`Updated: ${new Date(sessionToExport.updatedAt).toISOString()}`);
    lines.push('='.repeat(80));
    lines.push('');

    // Tabs
    lines.push('TABS:');
    lines.push('-'.repeat(80));
    for (const tab of sessionToExport.tabs) {
      lines.push(`[${tab.name}] (${tab.logs.length} logs)`);
      lines.push(`  Created: ${new Date(tab.createdAt).toISOString()}`);
      lines.push(`  Updated: ${new Date(tab.updatedAt).toISOString()}`);
      lines.push('');
    }

    // Command history
    lines.push('COMMAND HISTORY:');
    lines.push('-'.repeat(80));
    for (const entry of sessionToExport.history) {
      const timestamp = new Date(entry.timestamp).toISOString();
      lines.push(`[${timestamp}] ${entry.command}`);
      if (entry.executionTime) {
        lines.push(`  Execution time: ${entry.executionTime}ms`);
      }
      if (entry.exitCode !== undefined) {
        lines.push(`  Exit code: ${entry.exitCode}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Export session with specified format
   */
  exportSession(format: 'json' | 'csv' | 'txt', session?: ConsoleSession): string {
    switch (format) {
      case 'json':
        return this.exportToJSON(session);
      case 'csv':
        return this.exportToCSV(session);
      case 'txt':
        return this.exportToText(session);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Download session as file
   */
  downloadSession(format: 'json' | 'csv' | 'txt', session?: ConsoleSession): void {
    const sessionToExport = session || this.currentSession;
    if (!sessionToExport) {
      throw new Error('No session to download');
    }

    const content = this.exportSession(format, sessionToExport);
    const mimeTypes = {
      json: 'application/json',
      csv: 'text/csv',
      txt: 'text/plain',
    };

    const blob = new Blob([content], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${sessionToExport.name.replace(/\s+/g, '-')}-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * Import session from JSON
   */
  importFromJSON(data: string): ConsoleSession {
    try {
      const session = JSON.parse(data) as ConsoleSession;
      
      // Validate session structure
      if (!this.validateSession(session)) {
        throw new Error('Invalid session data');
      }

      // Generate new IDs to avoid conflicts
      session.id = this.generateSessionId();
      session.updatedAt = Date.now();

      return session;
    } catch (error) {
      throw new Error(`Failed to import session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate session structure
   */
  private validateSession(session: any): session is ConsoleSession {
    return (
      session &&
      typeof session.id === 'string' &&
      typeof session.name === 'string' &&
      Array.isArray(session.tabs) &&
      Array.isArray(session.history) &&
      typeof session.environment === 'object' &&
      typeof session.createdAt === 'number' &&
      typeof session.updatedAt === 'number'
    );
  }

  /**
   * Import and set as current session
   */
  importSession(data: string, format: 'json' = 'json'): boolean {
    try {
      let session: ConsoleSession;

      if (format === 'json') {
        session = this.importFromJSON(data);
      } else {
        throw new Error(`Unsupported import format: ${format}`);
      }

      this.currentSession = session;
      this.saveCurrentSession();

      return true;
    } catch (error) {
      console.error('Failed to import session:', error);
      return false;
    }
  }

  /**
   * Get all saved sessions
   */
  getAllSessions(): ConsoleSession[] {
    try {
      const saved = localStorage.getItem('console-saved-sessions');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load saved sessions:', error);
    }
    return [];
  }

  /**
   * Save session to library
   */
  saveToLibrary(session?: ConsoleSession): boolean {
    const sessionToSave = session || this.currentSession;
    if (!sessionToSave) return false;

    try {
      const sessions = this.getAllSessions();
      
      // Check if session already exists
      const existingIndex = sessions.findIndex(s => s.id === sessionToSave.id);
      if (existingIndex !== -1) {
        sessions[existingIndex] = sessionToSave;
      } else {
        sessions.push(sessionToSave);
      }

      localStorage.setItem('console-saved-sessions', JSON.stringify(sessions));
      return true;
    } catch (error) {
      console.error('Failed to save session to library:', error);
      return false;
    }
  }

  /**
   * Load session from library
   */
  loadFromLibrary(sessionId: string): boolean {
    const sessions = this.getAllSessions();
    const session = sessions.find(s => s.id === sessionId);

    if (session) {
      this.currentSession = session;
      this.saveCurrentSession();
      return true;
    }

    return false;
  }

  /**
   * Delete session from library
   */
  deleteFromLibrary(sessionId: string): boolean {
    try {
      const sessions = this.getAllSessions();
      const filtered = sessions.filter(s => s.id !== sessionId);

      if (filtered.length < sessions.length) {
        localStorage.setItem('console-saved-sessions', JSON.stringify(filtered));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to delete session from library:', error);
      return false;
    }
  }

  /**
   * Merge sessions
   */
  mergeSessions(sessions: ConsoleSession[]): ConsoleSession {
    const merged: ConsoleSession = {
      id: this.generateSessionId(),
      name: 'Merged Session',
      tabs: [],
      history: [],
      environment: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {},
    };

    for (const session of sessions) {
      merged.tabs.push(...session.tabs);
      merged.history.push(...session.history);
      Object.assign(merged.environment, session.environment);
    }

    // Sort history by timestamp
    merged.history.sort((a, b) => a.timestamp - b.timestamp);

    return merged;
  }

  /**
   * Clone session
   */
  cloneSession(session?: ConsoleSession): ConsoleSession {
    const sessionToClone = session || this.currentSession;
    if (!sessionToClone) {
      throw new Error('No session to clone');
    }

    const cloned = JSON.parse(JSON.stringify(sessionToClone)) as ConsoleSession;
    cloned.id = this.generateSessionId();
    cloned.name = `${cloned.name} (Copy)`;
    cloned.createdAt = Date.now();
    cloned.updatedAt = Date.now();

    return cloned;
  }

  /**
   * Get session statistics
   */
  getSessionStatistics(session?: ConsoleSession): {
    tabCount: number;
    totalLogs: number;
    commandCount: number;
    sessionAge: string;
    lastActivity: string;
  } {
    const sessionToAnalyze = session || this.currentSession;
    if (!sessionToAnalyze) {
      throw new Error('No session to analyze');
    }

    const totalLogs = sessionToAnalyze.tabs.reduce((sum, tab) => sum + tab.logs.length, 0);
    const sessionAge = Date.now() - sessionToAnalyze.createdAt;
    const lastActivity = Date.now() - sessionToAnalyze.updatedAt;

    return {
      tabCount: sessionToAnalyze.tabs.length,
      totalLogs,
      commandCount: sessionToAnalyze.history.length,
      sessionAge: this.formatDuration(sessionAge),
      lastActivity: this.formatDuration(lastActivity),
    };
  }

  /**
   * Format duration
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

// Export singleton instance
export const sessionDataService = new SessionDataService();
