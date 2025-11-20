// Browser Integration Service for Terminal
import { BrowserIntegration } from '../types/terminal.types';

export class BrowserIntegrationService {
  private integration: BrowserIntegration | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private connections: Map<string, any> = new Map();

  /**
   * Initialize browser integration
   */
  async initialize(): Promise<boolean> {
    try {
      this.integration = {
        id: 'browser-integration',
        url: window.location.href,
        title: document.title,
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isAvailable: true,
        capabilities: ['dom', 'cookies', 'localStorage', 'sessionStorage'],
        session: {
          id: this.generateSessionId(),
          startedAt: Date.now(),
          lastActivity: Date.now(),
          commands: 0,
          errors: 0,
        },
        actions: [],
        onAction: (action: any) => {
          this.handleBrowserAction(action);
        },
      };

      // Setup browser event listeners
      this.setupEventListeners();
      
      // Generate session
      await this.generateSession();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize browser integration:', error);
      return false;
    }
  }

  /**
   * Setup event listeners for browser events
   */
  private setupEventListeners(): void {
    // Listen for DOM changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.notifyListeners('dom-change', mutation);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Listen for navigation
    window.addEventListener('popstate', () => {
      this.notifyListeners('navigation', {
        url: window.location.href,
        title: document.title,
      });
    });

    // Listen for errors
    window.addEventListener('error', (event) => {
      this.notifyListeners('error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    });
  }

  /**
   * Generate browser session
   */
  private async generateSession(): Promise<void> {
    const session = {
      id: this.generateSessionId(),
      url: window.location.href,
      title: document.title,
      startedAt: Date.now(),
      lastActivity: Date.now(),
      commands: 0,
      errors: 0,
    };

    this.integration = {
      ...this.integration!,
      session,
    };
  }

  /**
   * Handle browser actions from terminal
   */
  private handleBrowserAction(action: any): void {
    switch (action.type) {
      case 'open-url':
        this.openUrl(action.url);
        break;
      case 'refresh':
        window.location.reload();
        break;
      case 'back':
        window.history.back();
        break;
      case 'forward':
        window.history.forward();
        break;
      case 'execute-js':
        this.executeJavaScript(action.code);
        break;
      case 'get-page-info':
        this.getPageInfo();
        break;
      case 'screenshot':
        this.takeScreenshot();
        break;
      default:
        console.warn('Unknown browser action:', action);
    }
  }

  /**
   * Open URL in browser
   */
  private openUrl(url: string): void {
    try {
      window.open(url, '_blank');
      this.addAction({
        type: 'open-url',
        url,
        timestamp: Date.now(),
        success: true,
      });
    } catch (error) {
      this.addAction({
        type: 'open-url',
        url,
        timestamp: Date.now(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Execute JavaScript in browser
   */
  private executeJavaScript(code: string): void {
    try {
      const result = eval(code);
      this.addAction({
        type: 'execute-js',
        code,
        result: String(result),
        timestamp: Date.now(),
        success: true,
      });
    } catch (error) {
      this.addAction({
        type: 'execute-js',
        code,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
        success: false,
      });
    }
  }

  /**
   * Get page information
   */
  private getPageInfo(): void {
    const info = {
      url: window.location.href,
      title: document.title,
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      screen: {
        width: screen.width,
        height: screen.height,
      },
      timestamp: Date.now(),
    };

    this.addAction({
      type: 'get-page-info',
      info,
      success: true,
    });
  }

  /**
   * Take screenshot
   */
  private takeScreenshot(): void {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/png');
        this.addAction({
          type: 'screenshot',
          dataUrl,
          timestamp: Date.now(),
          success: true,
        });
      }
    } catch (error) {
      this.addAction({
        type: 'screenshot',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
        success: false,
      });
    }
  }

  /**
   * Add action to integration
   */
  private addAction(action: any): void {
    if (this.integration) {
      this.integration.actions.push(action);
      this.notifyListeners('action', action);
    }
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add event listener
   */
  addEventListener(type: string, listener: Function): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(type: string, listener: Function): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Notify listeners
   */
  private notifyListeners(type: string, data: any): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in browser integration listener:', error);
        }
      });
    }
  }

  /**
   * Get current integration
   */
  getIntegration(): BrowserIntegration | null {
    return this.integration;
  }

  /**
   * Update integration
   */
  updateIntegration(updates: Partial<BrowserIntegration>): void {
    if (this.integration) {
      this.integration = { ...this.integration, ...updates };
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.listeners.clear();
    this.connections.clear();
  }
}

// Export singleton instance
export const browserIntegrationService = new BrowserIntegrationService();