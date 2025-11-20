// Debugging Interface Service for Terminal
import { DebugSession, Breakpoint, DebugVariable, StackFrame, WatchExpression } from '../types/terminal.types';

export class DebuggingInterfaceService {
  private sessions: Map<string, DebugSession> = new Map();
  private currentSession: DebugSession | null = null;
  private observers: Set<(session: DebugSession) => void> = new Set();
  private breakpoints: Map<string, Breakpoint[]> = new Map();

  /**
   * Create a new debug session
   */
  createSession(type: DebugSession['type'], id?: string): DebugSession {
    const sessionId = id || `debug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const session: DebugSession = {
      id: sessionId,
      type,
      status: 'starting',
      breakpoints: [],
      variables: [],
      stack: [],
      watchExpressions: [],
      console: [],
    };

    this.sessions.set(sessionId, session);
    this.currentSession = session;
    this.notifyObservers(session);

    return session;
  }

  /**
   * Start debugging session
   */
  async startSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    try {
      session.status = 'running';
      
      // Initialize debugging environment based on type
      await this.initializeDebugging(session);
      
      this.notifyObservers(session);
      return true;
    } catch (error) {
      session.status = 'error';
      this.addConsoleEntry(session, 'error', `Failed to start debug session: ${error instanceof Error ? error.message : 'Unknown error'}`, Date.now());
      this.notifyObservers(session);
      return false;
    }
  }

  /**
   * Initialize debugging environment
   */
  private async initializeDebugging(session: DebugSession): Promise<void> {
    switch (session.type) {
      case 'node':
        await this.initializeNodeDebugging(session);
        break;
      case 'browser':
        await this.initializeBrowserDebugging(session);
        break;
      case 'python':
        await this.initializePythonDebugging(session);
        break;
      default:
        throw new Error(`Unsupported debug type: ${session.type}`);
    }
  }

  /**
   * Initialize Node.js debugging
   */
  private async initializeNodeDebugging(session: DebugSession): Promise<void> {
    // Simulate Node.js debugging setup
    session.breakpoints = [
      {
        id: 'bp-1',
        file: 'app.js',
        line: 10,
        enabled: true,
        hitCount: 0,
      },
    ];

    session.variables = [
      {
        id: 'var-1',
        name: 'process',
        value: '[Object]',
        type: 'object',
        scope: 'global',
        expandable: true,
      },
    ];

    session.stack = [
      {
        id: 'stack-1',
        file: 'app.js',
        line: 10,
        function: 'main',
        arguments: [],
        locals: [],
      },
    ];

    this.addConsoleEntry(session, 'info', 'Node.js debugging session initialized', Date.now());
  }

  /**
   * Initialize browser debugging
   */
  private async initializeBrowserDebugging(session: DebugSession): Promise<void> {
    // Simulate browser debugging setup
    session.breakpoints = [
      {
        id: 'bp-1',
        file: 'script.js',
        line: 5,
        enabled: true,
        hitCount: 0,
      },
    ];

    session.variables = [
      {
        id: 'var-1',
        name: 'window',
        value: '[Window]',
        type: 'object',
        scope: 'global',
        expandable: true,
      },
    ];

    this.addConsoleEntry(session, 'info', 'Browser debugging session initialized', Date.now());
  }

  /**
   * Initialize Python debugging
   */
  private async initializePythonDebugging(session: DebugSession): Promise<void> {
    // Simulate Python debugging setup
    session.breakpoints = [
      {
        id: 'bp-1',
        file: 'main.py',
        line: 8,
        enabled: true,
        hitCount: 0,
      },
    ];

    session.variables = [
      {
        id: 'var-1',
        name: '__name__',
        value: '__main__',
        type: 'str',
        scope: 'global',
        expandable: false,
      },
    ];

    this.addConsoleEntry(session, 'info', 'Python debugging session initialized', Date.now());
  }

  /**
   * Stop debugging session
   */
  stopSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = 'stopped';
    this.notifyObservers(session);
    
    if (this.currentSession?.id === sessionId) {
      this.currentSession = null;
    }

    return true;
  }

  /**
   * Pause execution
   */
  pause(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'running') return false;

    session.status = 'paused';
    this.addConsoleEntry(session, 'info', 'Execution paused', Date.now());
    this.notifyObservers(session);
    return true;
  }

  /**
   * Resume execution
   */
  resume(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'paused') return false;

    session.status = 'running';
    this.addConsoleEntry(session, 'info', 'Execution resumed', Date.now());
    this.notifyObservers(session);
    return true;
  }

  /**
   * Step over
   */
  stepOver(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'paused') return false;

    // Simulate step over
    session.currentLine = (session.currentLine || 0) + 1;
    this.addConsoleEntry(session, 'info', 'Stepped over', Date.now());
    this.updateStack(session);
    this.notifyObservers(session);
    return true;
  }

  /**
   * Step into
   */
  stepInto(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'paused') return false;

    // Simulate step into
    this.addConsoleEntry(session, 'info', 'Stepped into', Date.now());
    this.updateStack(session);
    this.notifyObservers(session);
    return true;
  }

  /**
   * Step out
   */
  stepOut(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'paused') return false;

    // Simulate step out
    this.addConsoleEntry(session, 'info', 'Stepped out', Date.now());
    this.updateStack(session);
    this.notifyObservers(session);
    return true;
  }

  /**
   * Add breakpoint
   */
  addBreakpoint(sessionId: string, file: string, line: number, condition?: string): Breakpoint | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const breakpoint: Breakpoint = {
      id: `bp-${Date.now()}`,
      file,
      line,
      condition,
      enabled: true,
      hitCount: 0,
    };

    session.breakpoints.push(breakpoint);
    this.addConsoleEntry(session, 'info', `Breakpoint added at ${file}:${line}`, Date.now());
    this.notifyObservers(session);
    return breakpoint;
  }

  /**
   * Remove breakpoint
   */
  removeBreakpoint(sessionId: string, breakpointId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const index = session.breakpoints.findIndex(bp => bp.id === breakpointId);
    if (index === -1) return false;

    session.breakpoints.splice(index, 1);
    this.addConsoleEntry(session, 'info', `Breakpoint ${breakpointId} removed`, Date.now());
    this.notifyObservers(session);
    return true;
  }

  /**
   * Toggle breakpoint
   */
  toggleBreakpoint(sessionId: string, breakpointId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const breakpoint = session.breakpoints.find(bp => bp.id === breakpointId);
    if (!breakpoint) return false;

    breakpoint.enabled = !breakpoint.enabled;
    this.addConsoleEntry(session, 'info', `Breakpoint ${breakpointId} ${breakpoint.enabled ? 'enabled' : 'disabled'}`, Date.now());
    this.notifyObservers(session);
    return true;
  }

  /**
   * Add watch expression
   */
  addWatchExpression(sessionId: string, expression: string): WatchExpression | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const watch: WatchExpression = {
      id: `watch-${Date.now()}`,
      expression,
      value: '',
      type: 'unknown',
    };

    session.watchExpressions.push(watch);
    this.addConsoleEntry(session, 'info', `Watch expression added: ${expression}`, Date.now());
    this.notifyObservers(session);
    return watch;
  }

  /**
   * Remove watch expression
   */
  removeWatchExpression(sessionId: string, watchId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const index = session.watchExpressions.findIndex(w => w.id === watchId);
    if (index === -1) return false;

    session.watchExpressions.splice(index, 1);
    this.addConsoleEntry(session, 'info', `Watch expression ${watchId} removed`, Date.now());
    this.notifyObservers(session);
    return true;
  }

  /**
   * Evaluate expression
   */
  async evaluateExpression(sessionId: string, expression: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'paused') return 'Error: Session not paused';

    try {
      // Simulate expression evaluation
      const result = `Evaluated: ${expression} = "${expression.length} characters"`;
      this.addConsoleEntry(session, 'log', result, Date.now());
      this.notifyObservers(session);
      return result;
    } catch (error) {
      const errorMsg = `Error evaluating expression: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.addConsoleEntry(session, 'error', errorMsg, Date.now());
      return errorMsg;
    }
  }

  /**
   * Add console entry
   */
  private addConsoleEntry(session: DebugSession, type: string, message: string, timestamp: number): void {
    session.console.push({
      id: `console-${Date.now()}`,
      type: type as any,
      message,
      timestamp,
      level: 1,
    });

    // Keep only last 100 console entries
    if (session.console.length > 100) {
      session.console = session.console.slice(-100);
    }
  }

  /**
   * Update stack frame
   */
  private updateStack(session: DebugSession): void {
    // Simulate stack update
    if (session.stack.length > 0) {
      const current = session.stack[0];
      session.currentLine = current.line + 1;
      session.currentFile = current.file;
    }
  }

  /**
   * Get session
   */
  getSession(sessionId: string): DebugSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get current session
   */
  getCurrentSession(): DebugSession | null {
    return this.currentSession;
  }

  /**
   * Get all sessions
   */
  getAllSessions(): DebugSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Set current session
   */
  setCurrentSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    this.currentSession = session;
    this.notifyObservers(session);
    return true;
  }

  /**
   * Add observer
   */
  addObserver(observer: (session: DebugSession) => void): void {
    this.observers.add(observer);
  }

  /**
   * Remove observer
   */
  removeObserver(observer: (session: DebugSession) => void): void {
    this.observers.delete(observer);
  }

  /**
   * Notify observers
   */
  private notifyObservers(session: DebugSession): void {
    this.observers.forEach(observer => {
      try {
        observer(session);
      } catch (error) {
        console.error('Error in debugging interface observer:', error);
      }
    });
  }

  /**
   * Get breakpoints for file
   */
  getBreakpointsForFile(sessionId: string, file: string): Breakpoint[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return session.breakpoints.filter(bp => bp.file === file);
  }

  /**
   * Export debugging session
   */
  exportSession(sessionId: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) return '{}';

    return JSON.stringify({
      session,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    }, null, 2);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.sessions.clear();
    this.currentSession = null;
    this.observers.clear();
    this.breakpoints.clear();
  }
}

// Export singleton instance
export const debuggingInterfaceService = new DebuggingInterfaceService();