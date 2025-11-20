// Persistent Command History Storage Service
import { CommandHistoryEntry } from '../types/console.types';

export class CommandHistoryService {
  private history: CommandHistoryEntry[] = [];
  private maxHistorySize = 1000;
  private currentIndex = -1;
  private storageKey = 'console-command-history';
  private sessionStorageKey = 'console-session-history';

  constructor() {
    this.loadHistory();
  }

  /**
   * Load history from storage
   */
  private loadHistory(): void {
    try {
      // Load from localStorage (persistent)
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.history = JSON.parse(saved);
      }

      // Merge with session storage (current session)
      const sessionSaved = sessionStorage.getItem(this.sessionStorageKey);
      if (sessionSaved) {
        const sessionHistory = JSON.parse(sessionSaved);
        this.mergeHistory(sessionHistory);
      }
    } catch (error) {
      console.error('Failed to load command history:', error);
      this.history = [];
    }
  }

  /**
   * Save history to storage
   */
  private saveHistory(): void {
    try {
      // Save to localStorage (persistent)
      const toSave = this.history.slice(-this.maxHistorySize);
      localStorage.setItem(this.storageKey, JSON.stringify(toSave));

      // Save current session to sessionStorage
      sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save command history:', error);
    }
  }

  /**
   * Merge history from different sources
   */
  private mergeHistory(newHistory: CommandHistoryEntry[]): void {
    const existingIds = new Set(this.history.map(h => h.id));
    
    for (const entry of newHistory) {
      if (!existingIds.has(entry.id)) {
        this.history.push(entry);
      }
    }

    // Sort by timestamp
    this.history.sort((a, b) => a.timestamp - b.timestamp);

    // Trim to max size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  /**
   * Add command to history
   */
  addCommand(command: string, metadata?: {
    executionTime?: number;
    exitCode?: number;
    output?: string;
    error?: string;
  }): CommandHistoryEntry {
    const entry: CommandHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      command,
      timestamp: Date.now(),
      ...metadata,
    };

    this.history.push(entry);
    this.currentIndex = -1;

    // Trim if exceeds max size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    this.saveHistory();
    return entry;
  }

  /**
   * Get all history
   */
  getHistory(): CommandHistoryEntry[] {
    return [...this.history];
  }

  /**
   * Get history with pagination
   */
  getHistoryPage(page: number, pageSize: number): {
    entries: CommandHistoryEntry[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    const total = this.history.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = page * pageSize;
    const end = start + pageSize;
    const entries = this.history.slice(start, end);

    return {
      entries,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Get previous command (navigate up)
   */
  getPrevious(): string | null {
    if (this.history.length === 0) return null;

    if (this.currentIndex === -1) {
      this.currentIndex = this.history.length - 1;
    } else if (this.currentIndex > 0) {
      this.currentIndex--;
    }

    return this.history[this.currentIndex]?.command || null;
  }

  /**
   * Get next command (navigate down)
   */
  getNext(): string | null {
    if (this.currentIndex === -1) return null;

    this.currentIndex++;
    
    if (this.currentIndex >= this.history.length) {
      this.currentIndex = -1;
      return '';
    }

    return this.history[this.currentIndex]?.command || null;
  }

  /**
   * Reset navigation index
   */
  resetIndex(): void {
    this.currentIndex = -1;
  }

  /**
   * Search history
   */
  search(query: string, options?: {
    caseSensitive?: boolean;
    regex?: boolean;
    limit?: number;
  }): CommandHistoryEntry[] {
    const { caseSensitive = false, regex = false, limit = 50 } = options || {};

    let results: CommandHistoryEntry[];

    if (regex) {
      try {
        const pattern = new RegExp(query, caseSensitive ? 'g' : 'gi');
        results = this.history.filter(entry => pattern.test(entry.command));
      } catch (error) {
        console.error('Invalid regex pattern:', error);
        return [];
      }
    } else {
      const searchQuery = caseSensitive ? query : query.toLowerCase();
      results = this.history.filter(entry => {
        const command = caseSensitive ? entry.command : entry.command.toLowerCase();
        return command.includes(searchQuery);
      });
    }

    return results.slice(-limit).reverse();
  }

  /**
   * Get most used commands
   */
  getMostUsed(limit: number = 10): Array<{ command: string; count: number }> {
    const commandCounts = new Map<string, number>();

    for (const entry of this.history) {
      const count = commandCounts.get(entry.command) || 0;
      commandCounts.set(entry.command, count + 1);
    }

    const sorted = Array.from(commandCounts.entries())
      .map(([command, count]) => ({ command, count }))
      .sort((a, b) => b.count - a.count);

    return sorted.slice(0, limit);
  }

  /**
   * Get recent commands (unique)
   */
  getRecent(limit: number = 20): string[] {
    const seen = new Set<string>();
    const recent: string[] = [];

    for (let i = this.history.length - 1; i >= 0 && recent.length < limit; i--) {
      const command = this.history[i].command;
      if (!seen.has(command)) {
        seen.add(command);
        recent.push(command);
      }
    }

    return recent;
  }

  /**
   * Get commands by date range
   */
  getByDateRange(start: number, end: number): CommandHistoryEntry[] {
    return this.history.filter(entry => 
      entry.timestamp >= start && entry.timestamp <= end
    );
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    total: number;
    unique: number;
    averageExecutionTime: number;
    successRate: number;
    mostUsed: Array<{ command: string; count: number }>;
    recentActivity: Array<{ date: string; count: number }>;
  } {
    const total = this.history.length;
    const unique = new Set(this.history.map(h => h.command)).size;

    // Calculate average execution time
    const withExecutionTime = this.history.filter(h => h.executionTime !== undefined);
    const averageExecutionTime = withExecutionTime.length > 0
      ? withExecutionTime.reduce((sum, h) => sum + (h.executionTime || 0), 0) / withExecutionTime.length
      : 0;

    // Calculate success rate
    const withExitCode = this.history.filter(h => h.exitCode !== undefined);
    const successful = withExitCode.filter(h => h.exitCode === 0).length;
    const successRate = withExitCode.length > 0
      ? (successful / withExitCode.length) * 100
      : 0;

    // Get most used commands
    const mostUsed = this.getMostUsed(5);

    // Get recent activity (last 7 days)
    const recentActivity: Array<{ date: string; count: number }> = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let i = 6; i >= 0; i--) {
      const dayStart = now - (i * dayMs);
      const dayEnd = dayStart + dayMs;
      const count = this.history.filter(h => 
        h.timestamp >= dayStart && h.timestamp < dayEnd
      ).length;

      recentActivity.push({
        date: new Date(dayStart).toISOString().split('T')[0],
        count,
      });
    }

    return {
      total,
      unique,
      averageExecutionTime,
      successRate,
      mostUsed,
      recentActivity,
    };
  }

  /**
   * Clear history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
    this.saveHistory();
  }

  /**
   * Remove specific entry
   */
  remove(id: string): boolean {
    const index = this.history.findIndex(h => h.id === id);
    if (index !== -1) {
      this.history.splice(index, 1);
      this.saveHistory();
      return true;
    }
    return false;
  }

  /**
   * Remove duplicates
   */
  removeDuplicates(): number {
    const seen = new Map<string, CommandHistoryEntry>();
    
    // Keep the most recent occurrence of each command
    for (const entry of this.history) {
      const existing = seen.get(entry.command);
      if (!existing || entry.timestamp > existing.timestamp) {
        seen.set(entry.command, entry);
      }
    }

    const originalLength = this.history.length;
    this.history = Array.from(seen.values()).sort((a, b) => a.timestamp - b.timestamp);
    this.saveHistory();

    return originalLength - this.history.length;
  }

  /**
   * Export history
   */
  export(format: 'json' | 'csv' | 'txt'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.history, null, 2);
      
      case 'csv':
        return this.toCSV();
      
      case 'txt':
        return this.toText();
      
      default:
        return '';
    }
  }

  /**
   * Convert to CSV
   */
  private toCSV(): string {
    const headers = ['Timestamp', 'Command', 'Execution Time (ms)', 'Exit Code'];
    const rows = this.history.map(entry => [
      new Date(entry.timestamp).toISOString(),
      `"${entry.command.replace(/"/g, '""')}"`,
      entry.executionTime?.toString() || '',
      entry.exitCode?.toString() || '',
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Convert to plain text
   */
  private toText(): string {
    return this.history.map(entry => {
      const timestamp = new Date(entry.timestamp).toISOString();
      return `[${timestamp}] ${entry.command}`;
    }).join('\n');
  }

  /**
   * Import history
   */
  import(data: string, format: 'json' | 'csv' = 'json'): boolean {
    try {
      let entries: CommandHistoryEntry[];

      if (format === 'json') {
        entries = JSON.parse(data);
      } else {
        // Parse CSV
        const lines = data.split('\n').slice(1); // Skip header
        entries = lines.map(line => {
          const [timestamp, command] = line.split(',');
          return {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            command: command.replace(/^"|"$/g, '').replace(/""/g, '"'),
            timestamp: new Date(timestamp).getTime(),
          };
        });
      }

      // Validate entries
      for (const entry of entries) {
        if (!entry.command || !entry.timestamp) {
          console.error('Invalid history entry');
          return false;
        }
      }

      this.mergeHistory(entries);
      this.saveHistory();
      return true;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }

  /**
   * Set max history size
   */
  setMaxSize(size: number): void {
    this.maxHistorySize = Math.max(10, Math.min(10000, size));
    
    // Trim if necessary
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
      this.saveHistory();
    }
  }

  /**
   * Get max history size
   */
  getMaxSize(): number {
    return this.maxHistorySize;
  }
}

// Export singleton instance
export const commandHistoryService = new CommandHistoryService();
