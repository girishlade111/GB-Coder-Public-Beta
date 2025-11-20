// Real-time Output Streaming Handler
import { ConsoleLogEntry, LogLevel } from '../types/console.types';

export type StreamEventType = 'data' | 'error' | 'end' | 'start' | 'pause' | 'resume';

export interface StreamEvent {
  type: StreamEventType;
  data?: any;
  timestamp: number;
  streamId: string;
}

export interface StreamConfig {
  bufferSize?: number;
  flushInterval?: number;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface StreamConnection {
  id: string;
  url: string;
  type: 'websocket' | 'sse' | 'polling';
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  createdAt: number;
  lastActivity: number;
  messageCount: number;
}

export class OutputStreamingService {
  private streams: Map<string, StreamConnection> = new Map();
  private websockets: Map<string, WebSocket> = new Map();
  private eventSources: Map<string, EventSource> = new Map();
  private pollingIntervals: Map<string, number> = new Map();
  private buffers: Map<string, ConsoleLogEntry[]> = new Map();
  private listeners: Map<string, Set<(log: ConsoleLogEntry) => void>> = new Map();
  private config: StreamConfig;

  constructor(config: StreamConfig = {}) {
    this.config = {
      bufferSize: config.bufferSize || 100,
      flushInterval: config.flushInterval || 100,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      timeout: config.timeout || 30000,
    };
  }

  /**
   * Create WebSocket stream
   */
  createWebSocketStream(
    url: string,
    options?: {
      protocols?: string[];
      onOpen?: () => void;
      onClose?: () => void;
      onError?: (error: Event) => void;
    }
  ): string {
    const streamId = this.generateStreamId();
    
    const connection: StreamConnection = {
      id: streamId,
      url,
      type: 'websocket',
      status: 'connecting',
      createdAt: Date.now(),
      lastActivity: Date.now(),
      messageCount: 0,
    };

    this.streams.set(streamId, connection);
    this.buffers.set(streamId, []);
    this.listeners.set(streamId, new Set());

    try {
      const ws = new WebSocket(url, options?.protocols);

      ws.onopen = () => {
        connection.status = 'connected';
        connection.lastActivity = Date.now();
        options?.onOpen?.();
        this.emitLog(streamId, 'info', `WebSocket connected to ${url}`);
      };

      ws.onmessage = (event) => {
        connection.lastActivity = Date.now();
        connection.messageCount++;
        this.handleStreamData(streamId, event.data);
      };

      ws.onerror = (error) => {
        connection.status = 'error';
        options?.onError?.(error);
        this.emitLog(streamId, 'error', `WebSocket error: ${error}`);
      };

      ws.onclose = () => {
        connection.status = 'disconnected';
        options?.onClose?.();
        this.emitLog(streamId, 'info', 'WebSocket disconnected');
      };

      this.websockets.set(streamId, ws);
    } catch (error) {
      connection.status = 'error';
      this.emitLog(streamId, 'error', `Failed to create WebSocket: ${error}`);
    }

    return streamId;
  }

  /**
   * Create Server-Sent Events stream
   */
  createSSEStream(
    url: string,
    options?: {
      withCredentials?: boolean;
      onOpen?: () => void;
      onError?: (error: Event) => void;
    }
  ): string {
    const streamId = this.generateStreamId();

    const connection: StreamConnection = {
      id: streamId,
      url,
      type: 'sse',
      status: 'connecting',
      createdAt: Date.now(),
      lastActivity: Date.now(),
      messageCount: 0,
    };

    this.streams.set(streamId, connection);
    this.buffers.set(streamId, []);
    this.listeners.set(streamId, new Set());

    try {
      const eventSource = new EventSource(url, {
        withCredentials: options?.withCredentials,
      });

      eventSource.onopen = () => {
        connection.status = 'connected';
        connection.lastActivity = Date.now();
        options?.onOpen?.();
        this.emitLog(streamId, 'info', `SSE connected to ${url}`);
      };

      eventSource.onmessage = (event) => {
        connection.lastActivity = Date.now();
        connection.messageCount++;
        this.handleStreamData(streamId, event.data);
      };

      eventSource.onerror = (error) => {
        connection.status = 'error';
        options?.onError?.(error);
        this.emitLog(streamId, 'error', `SSE error: ${error}`);
      };

      this.eventSources.set(streamId, eventSource);
    } catch (error) {
      connection.status = 'error';
      this.emitLog(streamId, 'error', `Failed to create SSE: ${error}`);
    }

    return streamId;
  }

  /**
   * Create polling stream
   */
  createPollingStream(
    url: string,
    interval: number = 1000,
    options?: {
      method?: string;
      headers?: Record<string, string>;
      body?: any;
    }
  ): string {
    const streamId = this.generateStreamId();

    const connection: StreamConnection = {
      id: streamId,
      url,
      type: 'polling',
      status: 'connected',
      createdAt: Date.now(),
      lastActivity: Date.now(),
      messageCount: 0,
    };

    this.streams.set(streamId, connection);
    this.buffers.set(streamId, []);
    this.listeners.set(streamId, new Set());

    const poll = async () => {
      try {
        const response = await fetch(url, {
          method: options?.method || 'GET',
          headers: options?.headers,
          body: options?.body ? JSON.stringify(options.body) : undefined,
        });

        if (response.ok) {
          const data = await response.text();
          connection.lastActivity = Date.now();
          connection.messageCount++;
          this.handleStreamData(streamId, data);
        } else {
          this.emitLog(streamId, 'error', `Polling error: ${response.status}`);
        }
      } catch (error) {
        this.emitLog(streamId, 'error', `Polling failed: ${error}`);
      }
    };

    // Initial poll
    poll();

    // Set up interval
    const intervalId = window.setInterval(poll, interval);
    this.pollingIntervals.set(streamId, intervalId);

    this.emitLog(streamId, 'info', `Polling started for ${url}`);

    return streamId;
  }

  /**
   * Handle incoming stream data
   */
  private handleStreamData(streamId: string, data: any): void {
    const buffer = this.buffers.get(streamId);
    if (!buffer) return;

    // Parse data
    let parsedData: any;
    try {
      parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      parsedData = data;
    }

    // Create log entry
    const log: ConsoleLogEntry = {
      id: `${streamId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level: this.detectLogLevel(parsedData),
      message: typeof parsedData === 'string' ? parsedData : JSON.stringify(parsedData),
      source: streamId,
      metadata: { raw: parsedData },
    };

    // Add to buffer
    buffer.push(log);

    // Flush if buffer is full
    if (buffer.length >= this.config.bufferSize!) {
      this.flushBuffer(streamId);
    }

    // Notify listeners
    const listeners = this.listeners.get(streamId);
    if (listeners) {
      for (const listener of listeners) {
        listener(log);
      }
    }
  }

  /**
   * Detect log level from data
   */
  private detectLogLevel(data: any): LogLevel {
    if (typeof data === 'object' && data !== null) {
      if (data.level) return data.level as LogLevel;
      if (data.type === 'error' || data.error) return 'error';
      if (data.type === 'warning' || data.warning) return 'warn';
    }

    if (typeof data === 'string') {
      const lower = data.toLowerCase();
      if (lower.includes('error')) return 'error';
      if (lower.includes('warn')) return 'warn';
      if (lower.includes('debug')) return 'debug';
      if (lower.includes('info')) return 'info';
    }

    return 'log';
  }

  /**
   * Flush buffer
   */
  private flushBuffer(streamId: string): ConsoleLogEntry[] {
    const buffer = this.buffers.get(streamId);
    if (!buffer) return [];

    const logs = [...buffer];
    buffer.length = 0;
    return logs;
  }

  /**
   * Emit log entry
   */
  private emitLog(streamId: string, level: LogLevel, message: string): void {
    const log: ConsoleLogEntry = {
      id: `${streamId}-${Date.now()}`,
      timestamp: Date.now(),
      level,
      message,
      source: 'streaming-service',
    };

    const listeners = this.listeners.get(streamId);
    if (listeners) {
      for (const listener of listeners) {
        listener(log);
      }
    }
  }

  /**
   * Subscribe to stream
   */
  subscribe(streamId: string, callback: (log: ConsoleLogEntry) => void): () => void {
    const listeners = this.listeners.get(streamId);
    if (listeners) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    }
    return () => {};
  }

  /**
   * Send message to WebSocket stream
   */
  send(streamId: string, data: any): boolean {
    const ws = this.websockets.get(streamId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }

  /**
   * Close stream
   */
  closeStream(streamId: string): void {
    // Close WebSocket
    const ws = this.websockets.get(streamId);
    if (ws) {
      ws.close();
      this.websockets.delete(streamId);
    }

    // Close EventSource
    const es = this.eventSources.get(streamId);
    if (es) {
      es.close();
      this.eventSources.delete(streamId);
    }

    // Clear polling interval
    const interval = this.pollingIntervals.get(streamId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(streamId);
    }

    // Clean up
    this.streams.delete(streamId);
    this.buffers.delete(streamId);
    this.listeners.delete(streamId);
  }

  /**
   * Get stream status
   */
  getStreamStatus(streamId: string): StreamConnection | undefined {
    return this.streams.get(streamId);
  }

  /**
   * Get all streams
   */
  getAllStreams(): StreamConnection[] {
    return Array.from(this.streams.values());
  }

  /**
   * Get buffered logs
   */
  getBufferedLogs(streamId: string): ConsoleLogEntry[] {
    return this.buffers.get(streamId) || [];
  }

  /**
   * Generate stream ID
   */
  private generateStreamId(): string {
    return `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Reconnect stream
   */
  async reconnect(streamId: string): Promise<boolean> {
    const connection = this.streams.get(streamId);
    if (!connection) return false;

    this.closeStream(streamId);

    // Recreate based on type
    switch (connection.type) {
      case 'websocket':
        this.createWebSocketStream(connection.url);
        break;
      case 'sse':
        this.createSSEStream(connection.url);
        break;
      case 'polling':
        this.createPollingStream(connection.url);
        break;
    }

    return true;
  }

  /**
   * Close all streams
   */
  closeAllStreams(): void {
    for (const streamId of this.streams.keys()) {
      this.closeStream(streamId);
    }
  }
}

// Export singleton instance
export const outputStreamingService = new OutputStreamingService();
