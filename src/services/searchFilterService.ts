// Advanced Search and Filtering Service
import { ConsoleLogEntry, ConsoleFilter, SearchResult } from '../types/console.types';

export class SearchFilterService {
  /**
   * Search logs with advanced filtering
   */
  searchLogs(logs: ConsoleLogEntry[], filter: ConsoleFilter): SearchResult[] {
    let filteredLogs = [...logs];

    // Filter by log levels
    if (filter.levels.length > 0) {
      filteredLogs = filteredLogs.filter(log => filter.levels.includes(log.level));
    }

    // Filter by date range
    if (filter.dateRange) {
      filteredLogs = filteredLogs.filter(log => 
        log.timestamp >= filter.dateRange!.start && 
        log.timestamp <= filter.dateRange!.end
      );
    }

    // Filter by sources
    if (filter.sources && filter.sources.length > 0) {
      filteredLogs = filteredLogs.filter(log => 
        log.source && filter.sources!.includes(log.source)
      );
    }

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      filteredLogs = filteredLogs.filter(log => 
        log.tags && log.tags.some(tag => filter.tags!.includes(tag))
      );
    }

    // Search by query
    if (filter.searchQuery) {
      const results = this.performSearch(filteredLogs, filter.searchQuery, filter);
      return results;
    }

    // Convert to search results
    return filteredLogs.map(log => ({
      logEntry: log,
      matches: [],
      score: 100,
    }));
  }

  /**
   * Perform text search
   */
  private performSearch(
    logs: ConsoleLogEntry[], 
    query: string, 
    filter: ConsoleFilter
  ): SearchResult[] {
    const results: SearchResult[] = [];

    // Use regex if provided
    if (filter.regex) {
      try {
        const regex = new RegExp(filter.regex, filter.caseSensitive ? 'g' : 'gi');
        for (const log of logs) {
          const matches = this.findRegexMatches(log, regex, filter);
          if (matches.length > 0) {
            results.push({
              logEntry: log,
              matches,
              score: this.calculateSearchScore(log, matches),
            });
          }
        }
      } catch (error) {
        console.error('Invalid regex pattern:', error);
      }
    } else {
      // Simple text search
      for (const log of logs) {
        const matches = this.findTextMatches(log, query, filter);
        if (matches.length > 0) {
          results.push({
            logEntry: log,
            matches,
            score: this.calculateSearchScore(log, matches),
          });
        }
      }
    }

    // Sort by score (descending)
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Find regex matches in log entry
   */
  private findRegexMatches(
    log: ConsoleLogEntry, 
    regex: RegExp, 
    filter: ConsoleFilter
  ): Array<{ start: number; end: number; text: string }> {
    const matches: Array<{ start: number; end: number; text: string }> = [];
    
    // Search in message
    const messageMatches = log.message.matchAll(regex);
    for (const match of messageMatches) {
      if (match.index !== undefined) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
        });
      }
    }

    // Search in stack trace if enabled
    if (filter.includeStackTrace && log.stackTrace) {
      const stackMatches = log.stackTrace.matchAll(regex);
      for (const match of stackMatches) {
        if (match.index !== undefined) {
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[0],
          });
        }
      }
    }

    return matches;
  }

  /**
   * Find text matches in log entry
   */
  private findTextMatches(
    log: ConsoleLogEntry, 
    query: string, 
    filter: ConsoleFilter
  ): Array<{ start: number; end: number; text: string }> {
    const matches: Array<{ start: number; end: number; text: string }> = [];
    const searchText = filter.caseSensitive ? log.message : log.message.toLowerCase();
    const searchQuery = filter.caseSensitive ? query : query.toLowerCase();

    let index = 0;
    while ((index = searchText.indexOf(searchQuery, index)) !== -1) {
      matches.push({
        start: index,
        end: index + query.length,
        text: log.message.substring(index, index + query.length),
      });
      index += query.length;
    }

    // Search in stack trace if enabled
    if (filter.includeStackTrace && log.stackTrace) {
      const stackText = filter.caseSensitive ? log.stackTrace : log.stackTrace.toLowerCase();
      let stackIndex = 0;
      while ((stackIndex = stackText.indexOf(searchQuery, stackIndex)) !== -1) {
        matches.push({
          start: stackIndex,
          end: stackIndex + query.length,
          text: log.stackTrace.substring(stackIndex, stackIndex + query.length),
        });
        stackIndex += query.length;
      }
    }

    return matches;
  }

  /**
   * Calculate search relevance score
   */
  private calculateSearchScore(
    log: ConsoleLogEntry, 
    matches: Array<{ start: number; end: number; text: string }>
  ): number {
    let score = 0;

    // Base score from number of matches
    score += matches.length * 10;

    // Boost score for error/warning logs
    if (log.level === 'error') score += 20;
    if (log.level === 'warn') score += 10;

    // Boost score for highlighted logs
    if (log.highlighted) score += 15;

    // Boost score for recent logs
    const age = Date.now() - log.timestamp;
    const ageHours = age / (1000 * 60 * 60);
    if (ageHours < 1) score += 30;
    else if (ageHours < 24) score += 15;

    // Boost score for matches at the beginning
    const firstMatch = matches[0];
    if (firstMatch && firstMatch.start < 10) score += 10;

    return score;
  }

  /**
   * Highlight search matches in text
   */
  highlightMatches(
    text: string, 
    matches: Array<{ start: number; end: number; text: string }>
  ): string {
    if (matches.length === 0) return text;

    let result = '';
    let lastIndex = 0;

    // Sort matches by start position
    const sortedMatches = [...matches].sort((a, b) => a.start - b.start);

    for (const match of sortedMatches) {
      // Add text before match
      result += text.substring(lastIndex, match.start);
      
      // Add highlighted match
      result += `<mark class="search-highlight">${text.substring(match.start, match.end)}</mark>`;
      
      lastIndex = match.end;
    }

    // Add remaining text
    result += text.substring(lastIndex);

    return result;
  }

  /**
   * Get filter statistics
   */
  getFilterStats(logs: ConsoleLogEntry[], filter: ConsoleFilter): {
    total: number;
    filtered: number;
    byLevel: Record<string, number>;
    bySources: Record<string, number>;
    byTags: Record<string, number>;
  } {
    const filtered = this.searchLogs(logs, filter);
    
    const byLevel: Record<string, number> = {};
    const bySources: Record<string, number> = {};
    const byTags: Record<string, number> = {};

    for (const result of filtered) {
      const log = result.logEntry;
      
      // Count by level
      byLevel[log.level] = (byLevel[log.level] || 0) + 1;
      
      // Count by source
      if (log.source) {
        bySources[log.source] = (bySources[log.source] || 0) + 1;
      }
      
      // Count by tags
      if (log.tags) {
        for (const tag of log.tags) {
          byTags[tag] = (byTags[tag] || 0) + 1;
        }
      }
    }

    return {
      total: logs.length,
      filtered: filtered.length,
      byLevel,
      bySources,
      byTags,
    };
  }

  /**
   * Create filter from query string
   */
  parseFilterQuery(query: string): Partial<ConsoleFilter> {
    const filter: Partial<ConsoleFilter> = {
      searchQuery: '',
      caseSensitive: false,
      includeStackTrace: false,
    };

    // Parse special syntax
    const parts = query.split(/\s+/);
    const searchParts: string[] = [];

    for (const part of parts) {
      if (part.startsWith('level:')) {
        const levels = part.substring(6).split(',');
        filter.levels = levels as any[];
      } else if (part.startsWith('source:')) {
        const sources = part.substring(7).split(',');
        filter.sources = sources;
      } else if (part.startsWith('tag:')) {
        const tags = part.substring(4).split(',');
        filter.tags = tags;
      } else if (part === 'case-sensitive') {
        filter.caseSensitive = true;
      } else if (part === 'include-stack') {
        filter.includeStackTrace = true;
      } else if (part.startsWith('regex:')) {
        filter.regex = part.substring(6);
      } else {
        searchParts.push(part);
      }
    }

    filter.searchQuery = searchParts.join(' ');

    return filter;
  }

  /**
   * Export search results
   */
  exportResults(results: SearchResult[], format: 'json' | 'csv' | 'txt'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(results, null, 2);
      
      case 'csv':
        return this.toCSV(results);
      
      case 'txt':
        return this.toText(results);
      
      default:
        return '';
    }
  }

  /**
   * Convert results to CSV
   */
  private toCSV(results: SearchResult[]): string {
    const headers = ['Timestamp', 'Level', 'Message', 'Source', 'Score'];
    const rows = results.map(result => {
      const log = result.logEntry;
      return [
        new Date(log.timestamp).toISOString(),
        log.level,
        `"${log.message.replace(/"/g, '""')}"`,
        log.source || '',
        result.score.toString(),
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Convert results to plain text
   */
  private toText(results: SearchResult[]): string {
    return results.map(result => {
      const log = result.logEntry;
      const timestamp = new Date(log.timestamp).toISOString();
      return `[${timestamp}] [${log.level.toUpperCase()}] ${log.message}`;
    }).join('\n');
  }
}

// Export singleton instance
export const searchFilterService = new SearchFilterService();
