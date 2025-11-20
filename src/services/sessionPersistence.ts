// Session Persistence Service for Terminal
import { SessionData, TerminalState, TerminalSession } from '../types/terminal.types';

export class SessionPersistenceService {
  private storageKey = 'terminal-session-data';
  private autoSaveEnabled = false;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private maxSessions = 10;
  private observers: Set<(session: SessionData, event: string) => void> = new Set();

  /**
   * Enable auto-save functionality
   */
  enableAutoSave(intervalMs = 30000): void {
    if (this.autoSaveEnabled) return;

    this.autoSaveEnabled = true;
    this.autoSaveInterval = setInterval(() => {
      this.saveCurrentSession();
    }, intervalMs);
  }

  /**
   * Disable auto-save functionality
   */
  disableAutoSave(): void {
    this.autoSaveEnabled = false;
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Save current session
   */
  saveCurrentSession(terminalState: TerminalState, sessionName?: string): boolean {
    try {
      const sessionData: SessionData = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        version: '1.0.0',
        state: terminalState,
        metadata: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          locale: navigator.language || 'en-US',
        },
      };

      if (sessionName) {
        sessionData.id = sessionName;
      }

      // Save to storage
      this.saveSession(sessionData);
      
      // Keep only recent sessions
      this.cleanupOldSessions();
      
      this.notifyObservers(sessionData, 'saved');
      return true;
    } catch (error) {
      console.error('Failed to save session:', error);
      return false;
    }
  }

  /**
   * Save session to storage
   */
  private saveSession(sessionData: SessionData): void {
    const sessions = this.getAllSessions();
    
    // Check if session already exists
    const existingIndex = sessions.findIndex(s => s.id === sessionData.id);
    
    if (existingIndex >= 0) {
      // Update existing session
      sessions[existingIndex] = sessionData;
    } else {
      // Add new session
      sessions.push(sessionData);
    }

    // Sort by timestamp (newest first)
    sessions.sort((a, b) => b.timestamp - a.timestamp);

    localStorage.setItem(this.storageKey, JSON.stringify(sessions));
  }

  /**
   * Load session by ID
   */
  loadSession(sessionId: string): SessionData | null {
    try {
      const sessions = this.getAllSessions();
      const session = sessions.find(s => s.id === sessionId);
      
      if (session) {
        this.notifyObservers(session, 'loaded');
      }
      
      return session || null;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }

  /**
   * Get all saved sessions
   */
  getAllSessions(): SessionData[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to parse sessions:', error);
      return [];
    }
  }

  /**
   * Delete session
   */
  deleteSession(sessionId: string): boolean {
    try {
      const sessions = this.getAllSessions();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      
      localStorage.setItem(this.storageKey, JSON.stringify(filteredSessions));
      this.notifyObservers({ id: sessionId } as SessionData, 'deleted');
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }

  /**
   * Export session to file
   */
  exportSession(sessionId: string, format: 'json' | 'txt' = 'json'): string | null {
    const session = this.loadSession(sessionId);
    if (!session) return null;

    if (format === 'txt') {
      // Create a readable text format
      let text = `Terminal Session Export\n`;
      text += `===================\n\n`;
      text += `Session ID: ${session.id}\n`;
      text += `Created: ${new Date(session.timestamp).toLocaleString()}\n`;
      text += `Version: ${session.version}\n\n`;
      text += `Current Directory: ${session.state.currentDirectory}\n`;
      text += `Command History: ${session.state.commandHistory.length} commands\n`;
      text += `Files: ${Object.keys(session.state.fileSystem).length} files\n`;
      text += `Environment Variables: ${Object.keys(session.state.environment).length} variables\n\n`;
      text += `Command History:\n`;
      session.state.commandHistory.forEach((cmd, i) => {
        text += `${i + 1}. ${cmd}\n`;
      });
      text += `\nEnvironment:\n`;
      Object.entries(session.state.environment).forEach(([key, value]) => {
        text += `${key}=${value}\n`;
      });
      return text;
    } else {
      return JSON.stringify(session, null, 2);
    }
  }

  /**
   * Import session from data
   */
  importSession(sessionData: string, format: 'json' | 'txt' = 'json'): SessionData | null {
    try {
      let session: SessionData;
      
      if (format === 'txt') {
        // Parse text format
        const lines = sessionData.split('\n');
        const sessionId = lines.find(l => l.startsWith('Session ID:'))?.split(':')[1]?.trim() || 
                         `imported-${Date.now()}`;
        
        session = {
          id: sessionId,
          timestamp: Date.now(),
          version: '1.0.0',
          state: {
            currentDirectory: '/',
            commandHistory: [],
            fileSystem: {},
            processes: {},
            npmPackages: {},
            environment: {},
            aliases: {},
            history: [],
            backgroundJobs: [],
            sessions: [],
            shortcuts: [],
            preferences: {
              theme: 'dark',
              layout: 'single',
              fontSize: 14,
              fontFamily: 'monospace',
              lineHeight: 1.4,
              wordWrap: true,
              showLineNumbers: false,
              showTimestamps: true,
              showIcons: true,
              autoSave: false,
              autoScroll: true,
              scrollBack: 1000,
              bell: true,
              copyOnSelect: false,
              cursorBlink: true,
              cursorShape: 'block',
              historySize: 1000,
              maxOutputLines: 5000,
              plugins: [],
            },
          },
          metadata: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            locale: navigator.language || 'en-US',
          },
        };
      } else {
        session = JSON.parse(sessionData);
      }

      // Validate session structure
      if (!this.validateSessionData(session)) {
        throw new Error('Invalid session data format');
      }

      // Save the imported session
      this.saveSession(session);
      this.notifyObservers(session, 'imported');
      
      return session;
    } catch (error) {
      console.error('Failed to import session:', error);
      return null;
    }
  }

  /**
   * Validate session data structure
   */
  private validateSessionData(session: SessionData): boolean {
    return !!(
      session.id &&
      session.timestamp &&
      session.version &&
      session.state &&
      session.metadata
    );
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    totalSessions: number;
    oldestSession: Date | null;
    newestSession: Date | null;
    totalCommands: number;
    storageUsed: number;
  } {
    const sessions = this.getAllSessions();
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        oldestSession: null,
        newestSession: null,
        totalCommands: 0,
        storageUsed: 0,
      };
    }

    const oldestSession = new Date(Math.min(...sessions.map(s => s.timestamp)));
    const newestSession = new Date(Math.max(...sessions.map(s => s.timestamp)));
    const totalCommands = sessions.reduce((sum, s) => sum + s.state.commandHistory.length, 0);
    const storageUsed = new Blob([localStorage.getItem(this.storageKey) || '']).size;

    return {
      totalSessions: sessions.length,
      oldestSession,
      newestSession,
      totalCommands,
      storageUsed,
    };
  }

  /**
   * Cleanup old sessions
   */
  private cleanupOldSessions(): void {
    const sessions = this.getAllSessions();
    if (sessions.length > this.maxSessions) {
      // Keep only the most recent sessions
      const recentSessions = sessions.slice(0, this.maxSessions);
      localStorage.setItem(this.storageKey, JSON.stringify(recentSessions));
    }
  }

  /**
   * Create session from terminal state
   */
  createSessionFromState(terminalState: TerminalState, name?: string): SessionData {
    return {
      id: name || `session-${Date.now()}`,
      timestamp: Date.now(),
      version: '1.0.0',
      state: terminalState,
      metadata: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: navigator.language || 'en-US',
      },
    };
  }

  /**
   * Clone session
   */
  cloneSession(sessionId: string, newName?: string): SessionData | null {
    const originalSession = this.loadSession(sessionId);
    if (!originalSession) return null;

    const clonedSession: SessionData = {
      ...originalSession,
      id: newName || `${sessionId}-clone-${Date.now()}`,
      timestamp: Date.now(),
    };

    this.saveSession(clonedSession);
    this.notifyObservers(clonedSession, 'cloned');
    
    return clonedSession;
  }

  /**
   * Search sessions by criteria
   */
  searchSessions(criteria: {
    query?: string;
    dateFrom?: Date;
    dateTo?: Date;
    minCommands?: number;
  }): SessionData[] {
    let sessions = this.getAllSessions();

    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      sessions = sessions.filter(session => 
        session.id.toLowerCase().includes(query) ||
        session.state.commandHistory.some(cmd => cmd.toLowerCase().includes(query))
      );
    }

    if (criteria.dateFrom) {
      sessions = sessions.filter(session => session.timestamp >= criteria.dateFrom!.getTime());
    }

    if (criteria.dateTo) {
      sessions = sessions.filter(session => session.timestamp <= criteria.dateTo!.getTime());
    }

    if (criteria.minCommands) {
      sessions = sessions.filter(session => session.state.commandHistory.length >= criteria.minCommands!);
    }

    return sessions;
  }

  /**
   * Add observer
   */
  addObserver(observer: (session: SessionData, event: string) => void): void {
    this.observers.add(observer);
  }

  /**
   * Remove observer
   */
  removeObserver(observer: (session: SessionData, event: string) => void): void {
    this.observers.delete(observer);
  }

  /**
   * Notify observers
   */
  private notifyObservers(session: SessionData, event: string): void {
    this.observers.forEach(observer => {
      try {
        observer(session, event);
      } catch (error) {
        console.error('Error in session persistence observer:', error);
      }
    });
  }

  /**
   * Get storage usage
   */
  getStorageUsage(): {
    used: number;
    available: number;
    percentage: number;
  } {
    const used = new Blob([localStorage.getItem(this.storageKey) || '']).size;
    const available = 5 * 1024 * 1024; // Assume 5MB limit
    const percentage = (used / available) * 100;

    return { used, available, percentage };
  }

  /**
   * Clear all sessions
   */
  clearAllSessions(): void {
    localStorage.removeItem(this.storageKey);
    this.notifyObservers({ id: 'all-cleared' } as SessionData, 'cleared');
  }

  /**
   * Save current session (convenience method)
   */
  private saveCurrentSession(): void {
    try {
      // This would be called with the current terminal state
      // Implementation depends on how terminal state is managed
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.disableAutoSave();
    this.observers.clear();
  }
}

// Export singleton instance
export const sessionPersistenceService = new SessionPersistenceService();