// Comprehensive Terminal Commands for Web Development
import { TerminalOutput, TerminalState } from '../types/terminal.types';
import { commandHistoryService } from './commandHistoryService';
import { syntaxHighlighter } from './syntaxHighlighter';
import { GeminiEnhancementService } from './geminiEnhancementService';

export interface WebDevCommand {
  name: string;
  description: string;
  usage: string;
  category: 'file' | 'git' | 'package' | 'build' | 'server' | 'test' | 'lint' | 'deploy' | 'network' | 'process' | 'utility' | 'development';
  examples?: string[];
  aliases?: string[];
}

export class ComprehensiveTerminalCommands {
  private aiService: GeminiEnhancementService;
  private currentProject: any = null;
  private processes: Map<string, any> = new Map();

  constructor() {
    this.aiService = new GeminiEnhancementService();
  }

  /**
   * Process a command and return output
   */
  async processCommand(command: string, terminalState: TerminalState): Promise<TerminalOutput[]> {
    const startTime = Date.now();
    const [cmd, ...args] = this.parseCommand(command);
    
    try {
      const outputs: TerminalOutput[] = [];
      
      // Add command to history
      commandHistoryService.addCommand(command, {
        executionTime: startTime,
        output: 'Processing...'
      });

      // Handle the command
      let result: TerminalOutput[];
      switch (cmd.toLowerCase()) {
        // File Operations
        case 'ls':
        case 'list':
          result = this.handleList(args, terminalState);
          break;
        case 'cd':
        case 'changedir':
          result = this.handleChangeDirectory(args, terminalState);
          break;
        case 'pwd':
        case 'printdir':
          result = this.handlePrintDirectory(terminalState);
          break;
        case 'mkdir':
        case 'makedir':
          result = this.handleMakeDirectory(args, terminalState);
          break;
        case 'rm':
        case 'remove':
          result = this.handleRemove(args, terminalState);
          break;
        case 'cp':
        case 'copy':
          result = this.handleCopy(args, terminalState);
          break;
        case 'mv':
        case 'move':
          result = this.handleMove(args, terminalState);
          break;
        case 'find':
          result = this.handleFind(args, terminalState);
          break;
        case 'grep':
          result = this.handleGrep(args, terminalState);
          break;
        case 'cat':
          result = this.handleCat(args, terminalState);
          break;
        case 'head':
          result = this.handleHead(args, terminalState);
          break;
        case 'tail':
          result = this.handleTail(args, terminalState);
          break;
        case 'wc':
          result = this.handleWordCount(args, terminalState);
          break;

        // Git Operations
        case 'git':
          result = await this.handleGit(args, terminalState);
          break;
        case 'status':
          result = await this.handleStatus(terminalState);
          break;
        case 'commit':
          result = await this.handleCommit(args, terminalState);
          break;
        case 'push':
          result = await this.handlePush(terminalState);
          break;
        case 'pull':
          result = await this.handlePull(terminalState);
          break;
        case 'branch':
          result = await this.handleBranch(args, terminalState);
          break;
        case 'merge':
          result = await this.handleMerge(args, terminalState);
          break;

        // Package Management
        case 'npm':
          result = await this.handleNpm(args, terminalState);
          break;
        case 'yarn':
          result = await this.handleYarn(args, terminalState);
          break;
        case 'pnpm':
          result = await this.handlePnpm(args, terminalState);
          break;
        case 'pip':
          result = await this.handlePip(args, terminalState);
          break;
        case 'composer':
          result = await this.handleComposer(args, terminalState);
          break;

        // Build Tools
        case 'webpack':
          result = await this.handleWebpack(args, terminalState);
          break;
        case 'vite':
          result = await this.handleVite(args, terminalState);
          break;
        case 'parcel':
          result = await this.handleParcel(args, terminalState);
          break;
        case 'gulp':
          result = await this.handleGulp(args, terminalState);
          break;
        case 'grunt':
          result = await this.handleGrunt(args, terminalState);
          break;

        // Development Servers
        case 'dev':
        case 'serve':
          result = await this.handleDevServer(args, terminalState);
          break;
        case 'live-server':
          result = await this.handleLiveServer(args, terminalState);
          break;
        case 'http-server':
          result = await this.handleHttpServer(args, terminalState);
          break;

        // Testing
        case 'test':
          result = await this.handleTest(args, terminalState);
          break;
        case 'jest':
          result = await this.handleJest(args, terminalState);
          break;
        case 'mocha':
          result = await this.handleMocha(args, terminalState);
          break;
        case 'vitest':
          result = await this.handleVitest(args, terminalState);
          break;
        case 'cypress':
          result = await this.handleCypress(args, terminalState);
          break;

        // Linting
        case 'eslint':
          result = await this.handleEslint(args, terminalState);
          break;
        case 'prettier':
          result = await this.handlePrettier(args, terminalState);
          break;
        case 'stylelint':
          result = await this.handleStylelint(args, terminalState);
          break;

        // Process Management
        case 'ps':
          result = this.handleProcessList();
          break;
        case 'kill':
          result = this.handleKill(args);
          break;
        case 'bg':
          result = this.handleBackground(args);
          break;
        case 'fg':
          result = this.handleForeground(args);
          break;
        case 'jobs':
          result = this.handleJobs();
          break;

        // Network Utilities
        case 'curl':
          result = await this.handleCurl(args);
          break;
        case 'wget':
          result = await this.handleWget(args);
          break;
        case 'ping':
          result = await this.handlePing(args);
          break;
        case 'ssh':
          result = await this.handleSsh(args);
          break;

        // Development Tools
        case 'open':
          result = await this.handleOpen(args, terminalState);
          break;
        case 'browser':
          result = await this.handleBrowser(args);
          break;
        case 'analyze':
          result = await this.handleAnalyze(args, terminalState);
          break;

        // Utility Commands
        case 'clear':
          result = [{ id: Date.now().toString(), type: 'system', message: '', timestamp: Date.now() }];
          break;
        case 'help':
          result = this.handleHelp(args);
          break;
        case 'history':
          result = this.handleHistory();
          break;
        case 'alias':
          result = this.handleAlias(args);
          break;
        case 'env':
          result = this.handleEnvironment(terminalState);
          break;
        case 'export':
          result = this.handleExport(args, terminalState);
          break;
        case 'echo':
          result = this.handleEcho(args);
          break;

        // AI Enhancement
        case 'ai':
          result = await this.handleAI(args, terminalState);
          break;
        case 'enhance':
          result = await this.handleEnhance(args, terminalState);
          break;
        case 'suggest':
          result = await this.handleSuggest(args, terminalState);
          break;

        default:
          result = [{
            id: Date.now().toString(),
            type: 'error',
            message: `Command not found: ${cmd}. Type 'help' for available commands.`,
            timestamp: Date.now()
          }];
      }

      const executionTime = Date.now() - startTime;
      
      // Update history with actual execution time
      commandHistoryService.addCommand(command, {
        executionTime,
        exitCode: 0,
        output: result.map(r => r.message).join('\n')
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorOutput: TerminalOutput = {
        id: Date.now().toString(),
        type: 'error',
        message: `Error executing ${command}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };

      // Update history with error
      commandHistoryService.addCommand(command, {
        executionTime,
        exitCode: 1,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return [errorOutput];
    }
  }

  /**
   * Parse command string into parts
   */
  private parseCommand(command: string): string[] {
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    let escape = false;

    for (let i = 0; i < command.length; i++) {
      const char = command[i];

      if (escape) {
        current += char;
        escape = false;
        continue;
      }

      if (char === '\\') {
        escape = true;
        continue;
      }

      if (char === '"' || char === "'") {
        if (inQuotes && char === quoteChar) {
          inQuotes = false;
          quoteChar = '';
        } else if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else {
          current += char;
        }
        continue;
      }

      if (char === ' ' && !inQuotes) {
        if (current.trim()) {
          parts.push(current.trim());
          current = '';
        }
        continue;
      }

      current += char;
    }

    if (current.trim()) {
      parts.push(current.trim());
    }

    return parts;
  }

  // File Operations
  private handleList(args: string[], terminalState: TerminalState): TerminalOutput[] {
    const path = args[0] || terminalState.currentDirectory;
    const files = Object.keys(terminalState.fileSystem);
    
    const output = files.map(file => {
      const item = terminalState.fileSystem[file];
      const type = item.type === 'directory' ? 'd' : '-';
      const permissions = 'rw-r--r--';
      const size = item.size || 1024;
      const date = new Date(item.modified || item.created || Date.now()).toLocaleDateString();
      
      return `${type}${permissions} ${size.toString().padStart(8)} ${date} ${file}`;
    }).join('\n');

    return [{
      id: Date.now().toString(),
      type: 'info',
      message: output,
      timestamp: new Date().toISOString()
    }];
  }

  private handleChangeDirectory(args: string[], terminalState: TerminalState): TerminalOutput[] {
    const path = args[0];
    if (!path) {
      terminalState.currentDirectory = '/';
    } else {
      terminalState.currentDirectory = path;
    }
    
    return [{
      id: Date.now().toString(),
      type: 'system',
      message: `Changed directory to ${terminalState.currentDirectory}`,
      timestamp: new Date().toISOString()
    }];
  }

  private handlePrintDirectory(terminalState: TerminalState): TerminalOutput[] {
    return [{
      id: Date.now().toString(),
      type: 'info',
      message: terminalState.currentDirectory,
      timestamp: new Date().toISOString()
    }];
  }

  private handleMakeDirectory(args: string[], terminalState: TerminalState): TerminalOutput[] {
    const name = args[0];
    if (!name) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: mkdir <directory-name>',
        timestamp: new Date().toISOString()
      }];
    }

    terminalState.fileSystem[name] = {
      id: `dir-${Date.now()}`,
      name,
      type: 'directory',
      size: 4096,
      permissions: 'drwxr-xr-x',
      owner: 'developer',
      group: 'developers',
      created: Date.now(),
      modified: Date.now(),
      accessed: Date.now(),
      children: []
    };

    return [{
      id: Date.now().toString(),
      type: 'success',
      message: `Directory '${name}' created successfully`,
      timestamp: new Date().toISOString()
    }];
  }

  private handleRemove(args: string[], terminalState: TerminalState): TerminalOutput[] {
    const name = args[0];
    if (!name) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: rm <file-or-directory-name>',
        timestamp: new Date().toISOString()
      }];
    }

    if (terminalState.fileSystem[name]) {
      delete terminalState.fileSystem[name];
      return [{
        id: Date.now().toString(),
        type: 'success',
        message: `Removed '${name}' successfully`,
        timestamp: new Date().toISOString()
      }];
    } else {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: `File or directory '${name}' not found`,
        timestamp: new Date().toISOString()
      }];
    }
  }

  private handleCopy(args: string[], terminalState: TerminalState): TerminalOutput[] {
    const source = args[0];
    const destination = args[1];
    
    if (!source || !destination) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: cp <source> <destination>',
        timestamp: new Date().toISOString()
      }];
    }

    if (!terminalState.fileSystem[source]) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: `Source '${source}' not found`,
        timestamp: new Date().toISOString()
      }];
    }

    terminalState.fileSystem[destination] = { ...terminalState.fileSystem[source] };
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: `Copied '${source}' to '${destination}'`,
      timestamp: new Date().toISOString()
    }];
  }

  private handleMove(args: string[], terminalState: TerminalState): TerminalOutput[] {
    const source = args[0];
    const destination = args[1];
    
    if (!source || !destination) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: mv <source> <destination>',
        timestamp: new Date().toISOString()
      }];
    }

    if (!terminalState.fileSystem[source]) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: `Source '${source}' not found`,
        timestamp: new Date().toISOString()
      }];
    }

    terminalState.fileSystem[destination] = terminalState.fileSystem[source];
    delete terminalState.fileSystem[source];
    
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: `Moved '${source}' to '${destination}'`,
      timestamp: new Date().toISOString()
    }];
  }

  private handleFind(args: string[], terminalState: TerminalState): TerminalOutput[] {
    const pattern = args[0] || '';
    const files = Object.keys(terminalState.fileSystem)
      .filter(name => name.includes(pattern))
      .join('\n');

    return [{
      id: Date.now().toString(),
      type: 'info',
      message: files || 'No files found',
      timestamp: new Date().toISOString()
    }];
  }

  private handleGrep(args: string[], terminalState: TerminalState): TerminalOutput[] {
    const pattern = args[0];
    if (!pattern) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: grep <pattern>',
        timestamp: new Date().toISOString()
      }];
    }

    const results = Object.entries(terminalState.fileSystem)
      .filter(([name, file]) => file.type === 'file' && file.content && file.content.includes(pattern))
      .map(([name]) => name);

    return [{
      id: Date.now().toString(),
      type: 'info',
      message: results.join('\n') || 'No matches found',
      timestamp: new Date().toISOString()
    }];
  }

  private handleCat(args: string[], terminalState: TerminalState): TerminalOutput[] {
    const filename = args[0];
    if (!filename) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: cat <filename>',
        timestamp: new Date().toISOString()
      }];
    }

    const file = terminalState.fileSystem[filename];
    if (!file || file.type !== 'file') {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: `File '${filename}' not found`,
        timestamp: new Date().toISOString()
      }];
    }

    return [{
      id: Date.now().toString(),
      type: 'info',
      message: file.content || '',
      timestamp: new Date().toISOString()
    }];
  }

  private handleHead(args: string[], terminalState: TerminalState): TerminalOutput[] {
    const filename = args[0];
    const lines = parseInt(args[1]) || 10;
    
    if (!filename) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: head <filename> [lines]',
        timestamp: new Date().toISOString()
      }];
    }

    const file = terminalState.fileSystem[filename];
    if (!file || file.type !== 'file' || !file.content) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: `File '${filename}' not found or empty`,
        timestamp: new Date().toISOString()
      }];
    }

    const content = file.content.split('\n').slice(0, lines).join('\n');
    return [{
      id: Date.now().toString(),
      type: 'info',
      message: content,
      timestamp: new Date().toISOString()
    }];
  }

  private handleTail(args: string[], terminalState: TerminalState): TerminalOutput[] {
    const filename = args[0];
    const lines = parseInt(args[1]) || 10;
    
    if (!filename) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: tail <filename> [lines]',
        timestamp: new Date().toISOString()
      }];
    }

    const file = terminalState.fileSystem[filename];
    if (!file || file.type !== 'file' || !file.content) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: `File '${filename}' not found or empty`,
        timestamp: new Date().toISOString()
      }];
    }

    const content = file.content.split('\n').slice(-lines).join('\n');
    return [{
      id: Date.now().toString(),
      type: 'info',
      message: content,
      timestamp: new Date().toISOString()
    }];
  }

  private handleWordCount(args: string[], terminalState: TerminalState): TerminalOutput[] {
    const filename = args[0];
    if (!filename) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: wc <filename>',
        timestamp: new Date().toISOString()
      }];
    }

    const file = terminalState.fileSystem[filename];
    if (!file || file.type !== 'file' || !file.content) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: `File '${filename}' not found or empty`,
        timestamp: new Date().toISOString()
      }];
    }

    const lines = file.content.split('\n').length;
    const words = file.content.split(/\s+/).length;
    const chars = file.content.length;

    return [{
      id: Date.now().toString(),
      type: 'info',
      message: `${lines} ${words} ${chars} ${filename}`,
      timestamp: new Date().toISOString()
    }];
  }

  // Git Operations
  private async handleGit(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    const subcommand = args[0];
    if (!subcommand) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: git <subcommand>',
        timestamp: new Date().toISOString()
      }];
    }

    switch (subcommand) {
      case 'status':
        return await this.handleStatus(terminalState);
      case 'commit':
        return await this.handleCommit(args.slice(1), terminalState);
      case 'push':
        return await this.handlePush(terminalState);
      case 'pull':
        return await this.handlePull(terminalState);
      case 'branch':
        return await this.handleBranch(args.slice(1), terminalState);
      case 'add':
        return [{
          id: Date.now().toString(),
          type: 'success',
          message: 'Files staged for commit (simulated)',
          timestamp: new Date().toISOString()
        }];
      case 'log':
        return [{
          id: Date.now().toString(),
          type: 'info',
          message: 'commit abc1234 (HEAD -> main)\nAuthor: Developer <dev@example.com>\nDate: Mon Nov 19 18:25:00 2025 +0530\n\n    Initial commit',
          timestamp: new Date().toISOString()
        }];
      default:
        return [{
          id: Date.now().toString(),
          type: 'error',
          message: `Git subcommand '${subcommand}' not supported in simulation`,
          timestamp: new Date().toISOString()
        }];
    }
  }

  private async handleStatus(terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'info',
      message: `On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean`,
      timestamp: new Date().toISOString()
    }];
  }

  private async handleCommit(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    const message = args.join(' ');
    if (!message) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: commit "message"',
        timestamp: new Date().toISOString()
      }];
    }

    return [{
      id: Date.now().toString(),
      type: 'success',
      message: `[main abc1234] ${message}
 1 file changed, 1 insertion(+)`,
      timestamp: new Date().toISOString()
    }];
  }

  private async handlePush(terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: 'Everything up-to-date',
      timestamp: new Date().toISOString()
    }];
  }

  private async handlePull(terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: 'Already up to date.',
      timestamp: new Date().toISOString()
    }];
  }

  private async handleBranch(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    const action = args[0];
    if (!action) {
      return [{
        id: Date.now().toString(),
        type: 'info',
        message: '* main',
        timestamp: new Date().toISOString()
      }];
    }

    if (action === 'create' || action === '-b') {
      const name = args[1];
      return [{
        id: Date.now().toString(),
        type: 'success',
        message: `Switched to a new branch '${name}'`,
        timestamp: new Date().toISOString()
      }];
    }

    return [{
      id: Date.now().toString(),
      type: 'error',
      message: 'Branch operations not fully implemented',
      timestamp: new Date().toISOString()
    }];
  }

  private async handleMerge(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'info',
      message: 'Merge simulation - branch merged successfully',
      timestamp: new Date().toISOString()
    }];
  }

  // Package Management
  private async handleNpm(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    const subcommand = args[0];
    
    switch (subcommand) {
      case 'install':
      case 'i':
        const packageName = args[1];
        return [{
          id: Date.now().toString(),
          type: 'success',
          message: `Installing ${packageName || 'dependencies'}...`,
          timestamp: new Date().toISOString()
        }];
      case 'list':
      case 'ls':
        const packages = Object.keys(terminalState.npmPackages || {});
        return [{
          id: Date.now().toString(),
          type: 'info',
          message: packages.join('\n') || 'No packages installed',
          timestamp: new Date().toISOString()
        }];
      case 'start':
        return [{
          id: Date.now().toString(),
          type: 'success',
          message: 'Starting development server...',
          timestamp: new Date().toISOString()
        }];
      case 'run':
        const script = args[1];
        return [{
          id: Date.now().toString(),
          type: 'success',
          message: `Running ${script} script...`,
          timestamp: new Date().toISOString()
        }];
      default:
        return [{
          id: Date.now().toString(),
          type: 'error',
          message: 'npm command not recognized',
          timestamp: new Date().toISOString()
        }];
    }
  }

  private async handleYarn(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'info',
      message: 'Yarn command processed (simulation)',
      timestamp: new Date().toISOString()
    }];
  }

  private async handlePnpm(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'info',
      message: 'PNPM command processed (simulation)',
      timestamp: new Date().toISOString()
    }];
  }

  private async handlePip(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    const subcommand = args[0];
    
    switch (subcommand) {
      case 'install':
        const packageName = args[1];
        return [{
          id: Date.now().toString(),
          type: 'success',
          message: `Installing ${packageName}...`,
          timestamp: new Date().toISOString()
        }];
      case 'list':
        return [{
          id: Date.now().toString(),
          type: 'info',
          message: 'No packages installed (simulation)',
          timestamp: new Date().toISOString()
        }];
      default:
        return [{
          id: Date.now().toString(),
          type: 'error',
          message: 'pip command not recognized',
          timestamp: new Date().toISOString()
        }];
    }
  }

  private async handleComposer(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'info',
      message: 'Composer command processed (simulation)',
      timestamp: new Date().toISOString()
    }];
  }

  // Build Tools
  private async handleWebpack(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: 'Webpack build completed successfully',
      timestamp: new Date().toISOString()
    }];
  }

  private async handleVite(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    const subcommand = args[0];
    
    switch (subcommand) {
      case 'dev':
        return [{
          id: Date.now().toString(),
          type: 'success',
          message: 'Vite dev server starting on port 5173...\n✓ Server running',
          timestamp: new Date().toISOString()
        }];
      case 'build':
        return [{
          id: Date.now().toString(),
          type: 'success',
          message: 'Vite build completed successfully',
          timestamp: new Date().toISOString()
        }];
      default:
        return [{
          id: Date.now().toString(),
          type: 'info',
          message: 'Vite command processed',
          timestamp: new Date().toISOString()
        }];
    }
  }

  private async handleParcel(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: 'Parcel build completed successfully',
      timestamp: new Date().toISOString()
    }];
  }

  private async handleGulp(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    const task = args[0] || 'default';
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: `Gulp task '${task}' completed successfully`,
      timestamp: new Date().toISOString()
    }];
  }

  private async handleGrunt(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    const task = args[0] || 'default';
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: `Grunt task '${task}' completed successfully`,
      timestamp: new Date().toISOString()
    }];
  }

  // Development Servers
  private async handleDevServer(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    const port = args[0] || '3000';
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: `Development server starting on port ${port}...\n✓ Server running on http://localhost:${port}`,
      timestamp: new Date().toISOString()
    }];
  }

  private async handleLiveServer(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    const port = args[0] || '8080';
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: `Live server starting on port ${port}...\n✓ Server running on http://localhost:${port}`,
      timestamp: new Date().toISOString()
    }];
  }

  private async handleHttpServer(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    const port = args[0] || '8000';
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: `HTTP server starting on port ${port}...\n✓ Server running on http://localhost:${port}`,
      timestamp: new Date().toISOString()
    }];
  }

  // Testing
  private async handleTest(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: 'All tests passed ✓',
      timestamp: new Date().toISOString()
    }];
  }

  private async handleJest(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: 'Jest tests completed successfully',
      timestamp: new Date().toISOString()
    }];
  }

  private async handleMocha(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: 'Mocha tests completed successfully',
      timestamp: new Date().toISOString()
    }];
  }

  private async handleVitest(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: 'Vitest tests completed successfully',
      timestamp: new Date().toISOString()
    }];
  }

  private async handleCypress(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: 'Cypress tests completed successfully',
      timestamp: new Date().toISOString()
    }];
  }

  // Linting
  private async handleEslint(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: 'ESLint check completed - no errors found',
      timestamp: new Date().toISOString()
    }];
  }

  private async handlePrettier(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: 'Code formatted successfully',
      timestamp: new Date().toISOString()
    }];
  }

  private async handleStylelint(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: 'Stylelint check completed - no errors found',
      timestamp: new Date().toISOString()
    }];
  }

  // Process Management
  private handleProcessList(): TerminalOutput[] {
    const processes = Array.from(this.processes.entries()).map(([id, proc]) => 
      `${id} ${proc.name} ${proc.status}`
    );
    
    return [{
      id: Date.now().toString(),
      type: 'info',
      message: processes.join('\n') || 'No processes running',
      timestamp: new Date().toISOString()
    }];
  }

  private handleKill(args: string[]): TerminalOutput[] {
    const pid = args[0];
    if (!pid) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: kill <process-id>',
        timestamp: new Date().toISOString()
      }];
    }

    if (this.processes.has(pid)) {
      this.processes.delete(pid);
      return [{
        id: Date.now().toString(),
        type: 'success',
        message: `Process ${pid} terminated`,
        timestamp: new Date().toISOString()
      }];
    } else {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: `Process ${pid} not found`,
        timestamp: new Date().toISOString()
      }];
    }
  }

  private handleBackground(args: string[]): TerminalOutput[] {
    return [{
      id: Date.now().toString(),
      type: 'info',
      message: 'Background job management (simulation)',
      timestamp: new Date().toISOString()
    }];
  }

  private handleForeground(args: string[]): TerminalOutput[] {
    return [{
      id: Date.now().toString(),
      type: 'info',
      message: 'Foreground process management (simulation)',
      timestamp: new Date().toISOString()
    }];
  }

  private handleJobs(): TerminalOutput[] {
    return [{
      id: Date.now().toString(),
      type: 'info',
      message: 'No jobs running',
      timestamp: new Date().toISOString()
    }];
  }

  // Network Utilities
  private async handleCurl(args: string[]): Promise<TerminalOutput[]> {
    const url = args[0];
    if (!url) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: curl <url>',
        timestamp: new Date().toISOString()
      }];
    }

    return [{
      id: Date.now().toString(),
      type: 'info',
      message: `Request to ${url} successful (simulation)`,
      timestamp: new Date().toISOString()
    }];
  }

  private async handleWget(args: string[]): Promise<TerminalOutput[]> {
    const url = args[0];
    if (!url) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: wget <url>',
        timestamp: new Date().toISOString()
      }];
    }

    return [{
      id: Date.now().toString(),
      type: 'success',
      message: `Downloaded from ${url} (simulation)`,
      timestamp: new Date().toISOString()
    }];
  }

  private async handlePing(args: string[]): Promise<TerminalOutput[]> {
    const host = args[0];
    if (!host) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: ping <host>',
        timestamp: new Date().toISOString()
      }];
    }

    return [{
      id: Date.now().toString(),
      type: 'info',
      message: `PING ${host}: 64 bytes from ${host}: icmp_seq=1 ttl=64 time=1.23 ms`,
      timestamp: new Date().toISOString()
    }];
  }

  private async handleSsh(args: string[]): Promise<TerminalOutput[]> {
    const host = args[0];
    if (!host) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: ssh <host>',
        timestamp: new Date().toISOString()
      }];
    }

    return [{
      id: Date.now().toString(),
      type: 'info',
      message: `SSH connection to ${host} established (simulation)`,
      timestamp: new Date().toISOString()
    }];
  }

  // Development Tools
  private async handleOpen(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    const target = args[0];
    
    if (!target) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: open <file-or-url>',
        timestamp: new Date().toISOString()
      }];
    }

    if (target.startsWith('http')) {
      // Open URL in browser
      return [{
        id: Date.now().toString(),
        type: 'success',
        message: `Opening ${target} in browser...`,
        timestamp: new Date().toISOString()
      }];
    } else {
      // Open file
      return [{
        id: Date.now().toString(),
        type: 'success',
        message: `Opening ${target}...`,
        timestamp: new Date().toISOString()
      }];
    }
  }

  private async handleBrowser(args: string[]): Promise<TerminalOutput[]> {
    const url = args[0] || 'http://localhost:3000';
    
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: `Opening browser to ${url}...`,
      timestamp: new Date().toISOString()
    }];
  }

  private async handleAnalyze(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'info',
      message: 'Project analysis:\n- Files: ' + Object.keys(terminalState.fileSystem).length + '\n- Size: ~1.2MB\n- Dependencies: 12',
      timestamp: new Date().toISOString()
    }];
  }

  // Utility Commands
  private handleHelp(args: string[]): TerminalOutput[] {
    const category = args[0];
    
    const categories = {
      file: ['ls - List files', 'cd - Change directory', 'pwd - Print working directory', 'mkdir - Make directory', 'rm - Remove files', 'cp - Copy files', 'mv - Move files'],
      git: ['git status - Show git status', 'git commit - Commit changes', 'git push - Push to remote', 'git pull - Pull from remote', 'git branch - Manage branches'],
      package: ['npm install - Install packages', 'npm list - List packages', 'yarn - Yarn package manager', 'pip install - Python packages'],
      build: ['webpack - Webpack bundler', 'vite - Vite build tool', 'gulp - Gulp task runner', 'build - Generic build command'],
      server: ['dev - Start dev server', 'serve - Start server', 'live-server - Live reload server'],
      test: ['test - Run tests', 'jest - Jest test runner', 'mocha - Mocha tests', 'cypress - Cypress e2e tests'],
      lint: ['eslint - JavaScript linter', 'prettier - Code formatter', 'stylelint - CSS linter']
    };

    if (category && categories[category as keyof typeof categories]) {
      return [{
        id: Date.now().toString(),
        type: 'info',
        message: `${category.toUpperCase()} Commands:\n${categories[category as keyof typeof categories].join('\n')}`,
        timestamp: new Date().toISOString()
      }];
    }

    return [{
      id: Date.now().toString(),
      type: 'info',
      message: `Available Commands:

FILE OPERATIONS:
${categories.file.join('\n')}

GIT:
${categories.git.join('\n')}

PACKAGE MANAGERS:
${categories.package.join('\n')}

BUILD TOOLS:
${categories.build.join('\n')}

SERVERS:
${categories.server.join('\n')}

TESTING:
${categories.test.join('\n')}

LINTING:
${categories.lint.join('\n')}

UTILITY:
- clear - Clear terminal
- help [category] - Show help
- history - Show command history
- env - Show environment variables

AI ENHANCEMENT:
- ai <query> - AI assistant
- enhance <code> - Code enhancement
- suggest - Get suggestions

Use 'help <category>' for detailed help on specific categories.`,
      timestamp: new Date().toISOString()
    }];
  }

  private handleHistory(): TerminalOutput[] {
    const history = commandHistoryService.getRecent(20);
    return [{
      id: Date.now().toString(),
      type: 'info',
      message: history.join('\n') || 'No command history',
      timestamp: new Date().toISOString()
    }];
  }

  private handleAlias(args: string[]): TerminalOutput[] {
    if (args.length === 0) {
      return [{
        id: Date.now().toString(),
        type: 'info',
        message: 'alias ll="ls -la"\nalias la="ls -A"\nalias ..="cd .."\nalias ...="cd ../.."',
        timestamp: new Date().toISOString()
      }];
    }
    
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: `Alias '${args.join(' ')}' created`,
      timestamp: new Date().toISOString()
    }];
  }

  private handleEnvironment(terminalState: TerminalState): TerminalOutput[] {
    const envVars = Object.entries(terminalState.environment).map(([key, value]) => 
      `${key}=${value}`
    ).join('\n');

    return [{
      id: Date.now().toString(),
      type: 'info',
      message: envVars,
      timestamp: new Date().toISOString()
    }];
  }

  private handleExport(args: string[], terminalState: TerminalState): TerminalOutput[] {
    const assignment = args[0];
    if (!assignment || !assignment.includes('=')) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: export KEY=value',
        timestamp: new Date().toISOString()
      }];
    }

    const [key, ...valueParts] = assignment.split('=');
    const value = valueParts.join('=');
    
    terminalState.environment[key] = value;
    
    return [{
      id: Date.now().toString(),
      type: 'success',
      message: `Exported ${key}=${value}`,
      timestamp: new Date().toISOString()
    }];
  }

  private handleEcho(args: string[]): TerminalOutput[] {
    return [{
      id: Date.now().toString(),
      type: 'info',
      message: args.join(' '),
      timestamp: new Date().toISOString()
    }];
  }

  // AI Enhancement
  private async handleAI(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    const query = args.join(' ');
    if (!query) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: ai <query>',
        timestamp: new Date().toISOString()
      }];
    }

    try {
      const response = await this.aiService.enhanceCode(query, 'javascript');
      return [{
        id: Date.now().toString(),
        type: 'info',
        message: `AI Response: ${response}`,
        timestamp: new Date().toISOString()
      }];
    } catch (error) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'AI service unavailable',
        timestamp: new Date().toISOString()
      }];
    }
  }

  private async handleEnhance(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    const code = args.join(' ');
    if (!code) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'Usage: enhance <code>',
        timestamp: new Date().toISOString()
      }];
    }

    try {
      const enhanced = await this.aiService.enhanceCode(code, 'javascript');
      return [{
        id: Date.now().toString(),
        type: 'success',
        message: `Enhanced Code:\n${enhanced}`,
        timestamp: new Date().toISOString()
      }];
    } catch (error) {
      return [{
        id: Date.now().toString(),
        type: 'error',
        message: 'AI enhancement failed',
        timestamp: new Date().toISOString()
      }];
    }
  }

  private async handleSuggest(args: string[], terminalState: TerminalState): Promise<TerminalOutput[]> {
    return [{
      id: Date.now().toString(),
      type: 'info',
      message: 'AI Suggestions:\n• Consider using modern JavaScript features\n• Add error handling\n• Optimize performance\n• Add unit tests',
      timestamp: new Date().toISOString()
    }];
  }

  /**
   * Get available commands for autocomplete
   */
  getAvailableCommands(): WebDevCommand[] {
    return [
      // File Operations
      { name: 'ls', description: 'List files and directories', usage: 'ls [path]', category: 'file', aliases: ['list'] },
      { name: 'cd', description: 'Change directory', usage: 'cd <directory>', category: 'file', aliases: ['changedir'] },
      { name: 'pwd', description: 'Print working directory', usage: 'pwd', category: 'file', aliases: ['printdir'] },
      { name: 'mkdir', description: 'Make directory', usage: 'mkdir <name>', category: 'file', aliases: ['makedir'] },
      { name: 'rm', description: 'Remove files or directories', usage: 'rm <path>', category: 'file', aliases: ['remove'] },
      { name: 'cp', description: 'Copy files or directories', usage: 'cp <source> <destination>', category: 'file', aliases: ['copy'] },
      { name: 'mv', description: 'Move or rename files', usage: 'mv <source> <destination>', category: 'file', aliases: ['move'] },
      { name: 'find', description: 'Find files by name', usage: 'find <pattern>', category: 'file' },
      { name: 'grep', description: 'Search for patterns in files', usage: 'grep <pattern>', category: 'file' },
      { name: 'cat', description: 'Display file contents', usage: 'cat <filename>', category: 'file' },
      { name: 'head', description: 'Display first lines of file', usage: 'head <filename> [lines]', category: 'file' },
      { name: 'tail', description: 'Display last lines of file', usage: 'tail <filename> [lines]', category: 'file' },
      { name: 'wc', description: 'Word count', usage: 'wc <filename>', category: 'file' },

      // Git Operations
      { name: 'git', description: 'Git version control', usage: 'git <subcommand> [args]', category: 'git' },
      { name: 'status', description: 'Show git status', usage: 'status', category: 'git' },
      { name: 'commit', description: 'Commit changes', usage: 'commit "message"', category: 'git' },
      { name: 'push', description: 'Push changes to remote', usage: 'push', category: 'git' },
      { name: 'pull', description: 'Pull changes from remote', usage: 'pull', category: 'git' },
      { name: 'branch', description: 'Manage branches', usage: 'branch [create|list] [name]', category: 'git' },
      { name: 'merge', description: 'Merge branches', usage: 'merge <branch>', category: 'git' },

      // Package Management
      { name: 'npm', description: 'Node Package Manager', usage: 'npm <command> [args]', category: 'package' },
      { name: 'yarn', description: 'Yarn package manager', usage: 'yarn <command> [args]', category: 'package' },
      { name: 'pnpm', description: 'PNPM package manager', usage: 'pnpm <command> [args]', category: 'package' },
      { name: 'pip', description: 'Python package installer', usage: 'pip <command> [package]', category: 'package' },
      { name: 'composer', description: 'PHP dependency manager', usage: 'composer <command> [args]', category: 'package' },

      // Build Tools
      { name: 'webpack', description: 'Webpack bundler', usage: 'webpack [config]', category: 'build' },
      { name: 'vite', description: 'Vite build tool', usage: 'vite [dev|build]', category: 'build' },
      { name: 'parcel', description: 'Parcel bundler', usage: 'parcel [entry]', category: 'build' },
      { name: 'gulp', description: 'Gulp task runner', usage: 'gulp <task>', category: 'build' },
      { name: 'grunt', description: 'Grunt task runner', usage: 'grunt <task>', category: 'build' },

      // Development Servers
      { name: 'dev', description: 'Start development server', usage: 'dev [port]', category: 'server', aliases: ['serve'] },
      { name: 'live-server', description: 'Live reload server', usage: 'live-server [port]', category: 'server' },
      { name: 'http-server', description: 'Simple HTTP server', usage: 'http-server [port]', category: 'server' },

      // Testing
      { name: 'test', description: 'Run tests', usage: 'test [framework]', category: 'test' },
      { name: 'jest', description: 'Jest test runner', usage: 'jest [options]', category: 'test' },
      { name: 'mocha', description: 'Mocha test framework', usage: 'mocha [files]', category: 'test' },
      { name: 'vitest', description: 'Vitest test runner', usage: 'vitest [options]', category: 'test' },
      { name: 'cypress', description: 'Cypress e2e testing', usage: 'cypress [command]', category: 'test' },

      // Linting
      { name: 'eslint', description: 'JavaScript linter', usage: 'eslint [files]', category: 'lint' },
      { name: 'prettier', description: 'Code formatter', usage: 'prettier [files]', category: 'lint' },
      { name: 'stylelint', description: 'CSS linter', usage: 'stylelint [files]', category: 'lint' },

      // Process Management
      { name: 'ps', description: 'List processes', usage: 'ps', category: 'process' },
      { name: 'kill', description: 'Terminate process', usage: 'kill <pid>', category: 'process' },
      { name: 'bg', description: 'Background process', usage: 'bg <command>', category: 'process' },
      { name: 'fg', description: 'Foreground process', usage: 'fg <job>', category: 'process' },
      { name: 'jobs', description: 'List background jobs', usage: 'jobs', category: 'process' },

      // Network Utilities
      { name: 'curl', description: 'Transfer data from/to server', usage: 'curl <url>', category: 'network' },
      { name: 'wget', description: 'Download files', usage: 'wget <url>', category: 'network' },
      { name: 'ping', description: 'Test network connectivity', usage: 'ping <host>', category: 'network' },
      { name: 'ssh', description: 'Secure shell connection', usage: 'ssh <host>', category: 'network' },

      // Development Tools
      { name: 'open', description: 'Open file or URL', usage: 'open <file|url>', category: 'development' },
      { name: 'browser', description: 'Open browser', usage: 'browser [url]', category: 'development' },
      { name: 'analyze', description: 'Analyze project', usage: 'analyze', category: 'development' },

      // Utility Commands
      { name: 'clear', description: 'Clear terminal', usage: 'clear', category: 'utility' },
      { name: 'help', description: 'Show help information', usage: 'help [category]', category: 'utility' },
      { name: 'history', description: 'Show command history', usage: 'history', category: 'utility' },
      { name: 'alias', description: 'Create command aliases', usage: 'alias [name=value]', category: 'utility' },
      { name: 'env', description: 'Show environment variables', usage: 'env', category: 'utility' },
      { name: 'export', description: 'Set environment variable', usage: 'export KEY=value', category: 'utility' },
      { name: 'echo', description: 'Display text', usage: 'echo <text>', category: 'utility' },

      // AI Enhancement
      { name: 'ai', description: 'AI assistant query', usage: 'ai <query>', category: 'development' },
      { name: 'enhance', description: 'Enhance code with AI', usage: 'enhance <code>', category: 'development' },
      { name: 'suggest', description: 'Get AI suggestions', usage: 'suggest', category: 'development' },
    ];
  }
}

// Export singleton instance
export const comprehensiveTerminalCommands = new ComprehensiveTerminalCommands();