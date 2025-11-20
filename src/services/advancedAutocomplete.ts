// Advanced Autocomplete Service for Terminal
import { AutoCompleteOption, CommandCompletion } from '../types/terminal.types';

export class AdvancedAutocompleteService {
  private commands: CommandCompletion[] = [];
  private customCompletions: Map<string, AutoCompleteOption[]> = new Map();
  private contextHistory: any[] = [];
  private maxHistory = 100;

  constructor() {
    this.initializeDefaultCommands();
  }

  /**
   * Initialize default commands
   */
  private initializeDefaultCommands(): void {
    this.commands = [
      // File operations
      {
        name: 'ls',
        description: 'List directory contents',
        usage: 'ls [options] [directory]',
        category: 'file',
        priority: 100,
        aliases: ['list', 'dir'],
        args: [
          {
            name: 'path',
            description: 'Directory path to list',
            required: false,
            type: 'directory',
          },
        ],
      },
      {
        name: 'cd',
        description: 'Change directory',
        usage: 'cd [directory]',
        category: 'file',
        priority: 100,
        aliases: ['changedir'],
        args: [
          {
            name: 'directory',
            description: 'Directory to change to',
            required: false,
            type: 'directory',
          },
        ],
      },
      {
        name: 'mkdir',
        description: 'Create directory',
        usage: 'mkdir [options] directory',
        category: 'file',
        priority: 90,
        aliases: ['makedir'],
        args: [
          {
            name: 'directory',
            description: 'Directory name to create',
            required: true,
            type: 'directory',
          },
        ],
      },
      {
        name: 'rm',
        description: 'Remove files or directories',
        usage: 'rm [options] file',
        category: 'file',
        priority: 90,
        aliases: ['remove', 'delete', 'del'],
        args: [
          {
            name: 'target',
            description: 'File or directory to remove',
            required: true,
            type: 'file',
          },
        ],
      },
      {
        name: 'cp',
        description: 'Copy files or directories',
        usage: 'cp [options] source destination',
        category: 'file',
        priority: 90,
        aliases: ['copy'],
        args: [
          {
            name: 'source',
            description: 'Source file or directory',
            required: true,
            type: 'file',
          },
          {
            name: 'destination',
            description: 'Destination path',
            required: true,
            type: 'file',
          },
        ],
      },
      {
        name: 'mv',
        description: 'Move files or directories',
        usage: 'mv [options] source destination',
        category: 'file',
        priority: 90,
        aliases: ['move', 'rename'],
        args: [
          {
            name: 'source',
            description: 'Source file or directory',
            required: true,
            type: 'file',
          },
          {
            name: 'destination',
            description: 'Destination path',
            required: true,
            type: 'file',
          },
        ],
      },
      {
        name: 'find',
        description: 'Search for files and directories',
        usage: 'find [path] [expression]',
        category: 'file',
        priority: 85,
        aliases: ['search'],
        args: [
          {
            name: 'path',
            description: 'Starting directory',
            required: false,
            type: 'directory',
          },
          {
            name: 'pattern',
            description: 'Search pattern',
            required: false,
            type: 'string',
          },
        ],
      },
      {
        name: 'grep',
        description: 'Search text patterns in files',
        usage: 'grep [options] pattern [file]',
        category: 'file',
        priority: 85,
        aliases: ['search-text', 'find-pattern'],
        args: [
          {
            name: 'pattern',
            description: 'Text pattern to search for',
            required: true,
            type: 'string',
          },
          {
            name: 'file',
            description: 'File to search in',
            required: false,
            type: 'file',
          },
        ],
      },

      // Git operations
      {
        name: 'git',
        description: 'Git version control system',
        usage: 'git [options] command',
        category: 'git',
        priority: 100,
        aliases: ['g'],
        args: [
          {
            name: 'command',
            description: 'Git command',
            required: true,
            type: 'string',
            choices: ['status', 'commit', 'push', 'pull', 'branch', 'merge', 'add', 'log'],
          },
        ],
      },
      {
        name: 'git status',
        description: 'Show working tree status',
        usage: 'git status',
        category: 'git',
        priority: 95,
        aliases: ['status', 'git-st'],
        args: [],
      },
      {
        name: 'git commit',
        description: 'Record changes to repository',
        usage: 'git commit [options]',
        category: 'git',
        priority: 95,
        aliases: ['commit', 'git-ci'],
        args: [
          {
            name: 'message',
            description: 'Commit message',
            required: false,
            type: 'string',
          },
        ],
      },
      {
        name: 'git push',
        description: 'Update remote refs',
        usage: 'git push [options]',
        category: 'git',
        priority: 95,
        aliases: ['push', 'git-psh'],
        args: [],
      },
      {
        name: 'git pull',
        description: 'Fetch from and integrate with repository',
        usage: 'git pull [options]',
        category: 'git',
        priority: 95,
        aliases: ['pull', 'git-pl'],
        args: [],
      },

      // Package management
      {
        name: 'npm',
        description: 'Node package manager',
        usage: 'npm [options] command',
        category: 'package',
        priority: 100,
        aliases: [],
        args: [
          {
            name: 'command',
            description: 'NPM command',
            required: true,
            type: 'string',
            choices: ['install', 'list', 'update', 'run', 'start', 'build', 'test'],
          },
        ],
      },
      {
        name: 'npm install',
        description: 'Install packages',
        usage: 'npm install [package]',
        category: 'package',
        priority: 95,
        aliases: ['npm i', 'install'],
        args: [
          {
            name: 'package',
            description: 'Package name to install',
            required: false,
            type: 'string',
          },
        ],
      },
      {
        name: 'npm run',
        description: 'Run package scripts',
        usage: 'npm run [script]',
        category: 'package',
        priority: 95,
        aliases: ['npm-script'],
        args: [
          {
            name: 'script',
            description: 'Script name to run',
            required: true,
            type: 'string',
          },
        ],
      },
      {
        name: 'yarn',
        description: 'Yarn package manager',
        usage: 'yarn [options] command',
        category: 'package',
        priority: 90,
        aliases: ['y'],
        args: [
          {
            name: 'command',
            description: 'Yarn command',
            required: true,
            type: 'string',
            choices: ['install', 'add', 'remove', 'build', 'dev'],
          },
        ],
      },

      // Build tools
      {
        name: 'webpack',
        description: 'Bundle analyzer and bundler',
        usage: 'webpack [options]',
        category: 'build',
        priority: 90,
        aliases: ['wp'],
        args: [
          {
            name: 'command',
            description: 'Webpack command',
            required: true,
            type: 'string',
            choices: ['build', 'dev', 'analyze'],
          },
        ],
      },
      {
        name: 'vite',
        description: 'Next generation frontend tooling',
        usage: 'vite [options]',
        category: 'build',
        priority: 90,
        aliases: [],
        args: [
          {
            name: 'command',
            description: 'Vite command',
            required: true,
            type: 'string',
            choices: ['build', 'dev', 'preview'],
          },
        ],
      },
      {
        name: 'parcel',
        description: 'Blazing fast, zero configuration web application bundler',
        usage: 'parcel [options]',
        category: 'build',
        priority: 85,
        aliases: [],
        args: [],
      },

      // Testing
      {
        name: 'jest',
        description: 'JavaScript testing framework',
        usage: 'jest [options]',
        category: 'test',
        priority: 90,
        aliases: [],
        args: [
          {
            name: 'command',
            description: 'Jest command',
            required: true,
            type: 'string',
            choices: ['test', 'watch', 'coverage'],
          },
        ],
      },
      {
        name: 'mocha',
        description: 'Simple, flexible, fun JavaScript test framework',
        usage: 'mocha [options]',
        category: 'test',
        priority: 85,
        aliases: [],
        args: [],
      },
      {
        name: 'cypress',
        description: 'Fast, easy and reliable testing for anything that runs in a browser',
        usage: 'cypress [options]',
        category: 'test',
        priority: 85,
        aliases: [],
        args: [
          {
            name: 'command',
            description: 'Cypress command',
            required: true,
            type: 'string',
            choices: ['open', 'run', 'verify'],
          },
        ],
      },

      // Linting
      {
        name: 'eslint',
        description: 'JavaScript linter',
        usage: 'eslint [options]',
        category: 'lint',
        priority: 90,
        aliases: [],
        args: [
          {
            name: 'command',
            description: 'ESLint command',
            required: true,
            type: 'string',
            choices: ['.', 'fix', 'init'],
          },
        ],
      },
      {
        name: 'prettier',
        description: 'Opinionated code formatter',
        usage: 'prettier [options]',
        category: 'lint',
        priority: 90,
        aliases: [],
        args: [
          {
            name: 'file',
            description: 'File to format',
            required: false,
            type: 'file',
          },
        ],
      },

      // Development tools
      {
        name: 'dev',
        description: 'Start development server',
        usage: 'dev [port]',
        category: 'server',
        priority: 95,
        aliases: ['serve', 'start-dev'],
        args: [
          {
            name: 'port',
            description: 'Port to run server on',
            required: false,
            type: 'number',
          },
        ],
      },
      {
        name: 'open',
        description: 'Open file or URL',
        usage: 'open [path]',
        category: 'utility',
        priority: 80,
        aliases: ['o'],
        args: [
          {
            name: 'path',
            description: 'File or URL to open',
            required: false,
            type: 'url',
          },
        ],
      },

      // Terminal utilities
      {
        name: 'clear',
        description: 'Clear terminal screen',
        usage: 'clear',
        category: 'utility',
        priority: 90,
        aliases: ['cls'],
        args: [],
      },
      {
        name: 'help',
        description: 'Show help information',
        usage: 'help [command]',
        category: 'utility',
        priority: 95,
        aliases: ['?', 'h'],
        args: [
          {
            name: 'command',
            description: 'Command to get help for',
            required: false,
            type: 'string',
          },
        ],
      },
      {
        name: 'history',
        description: 'Show command history',
        usage: 'history',
        category: 'utility',
        priority: 80,
        aliases: ['hist'],
        args: [],
      },
      {
        name: 'alias',
        description: 'Create command aliases',
        usage: 'alias [name[=value]...]',
        category: 'utility',
        priority: 70,
        aliases: [],
        args: [],
      },
      {
        name: 'env',
        description: 'Show environment variables',
        usage: 'env',
        category: 'utility',
        priority: 75,
        aliases: ['environment'],
        args: [],
      },
    ];
  }

  /**
   * Get autocomplete suggestions
   */
  getSuggestions(
    input: string,
    context: {
      currentDirectory?: string;
      availableCommands?: any[];
      fileSystem?: Record<string, any>;
      environment?: Record<string, string>;
      aliases?: Record<string, string>;
    }
  ): AutoCompleteOption[] {
    if (!input || input.trim().length === 0) {
      return this.getBasicSuggestions();
    }

    const suggestions: AutoCompleteOption[] = [];
    const trimmedInput = input.trim();
    const lastSpaceIndex = trimmedInput.lastIndexOf(' ');
    const currentPart = lastSpaceIndex === -1 ? trimmedInput : trimmedInput.substring(lastSpaceIndex + 1);

    // Add context to history
    this.addToContextHistory(context);

    // Get command completions
    if (lastSpaceIndex === -1) {
      suggestions.push(...this.getCommandSuggestions(currentPart));
    } else {
      suggestions.push(...this.getArgumentSuggestions(trimmedInput, currentPart, context));
    }

    // Get file/directory suggestions
    suggestions.push(...this.getFileSuggestions(currentPart, context));

    // Get environment variable suggestions
    suggestions.push(...this.getEnvironmentSuggestions(currentPart, context));

    // Get alias suggestions
    suggestions.push(...this.getAliasSuggestions(currentPart, context));

    // Sort and deduplicate
    return this.sortAndDeduplicateSuggestions(suggestions, currentPart);
  }

  /**
   * Get basic suggestions when input is empty
   */
  private getBasicSuggestions(): AutoCompleteOption[] {
    return [
      {
        value: 'help',
        description: 'Show help information',
        type: 'command',
        score: 100,
      },
      {
        value: 'ls',
        description: 'List directory contents',
        type: 'command',
        score: 95,
      },
      {
        value: 'cd',
        description: 'Change directory',
        type: 'command',
        score: 95,
      },
      {
        value: 'git status',
        description: 'Show git status',
        type: 'command',
        score: 90,
      },
      {
        value: 'npm run',
        description: 'Run npm script',
        type: 'command',
        score: 90,
      },
    ];
  }

  /**
   * Get command suggestions
   */
  private getCommandSuggestions(input: string): AutoCompleteOption[] {
    return this.commands
      .filter(cmd => {
        const name = cmd.name.toLowerCase();
        const aliases = cmd.aliases?.map(a => a.toLowerCase()) || [];
        return name.startsWith(input.toLowerCase()) || aliases.some(alias => alias.startsWith(input.toLowerCase()));
      })
      .map(cmd => ({
        value: cmd.name,
        description: cmd.description,
        type: 'command',
        score: cmd.priority + (cmd.name.startsWith(input) ? 10 : 0),
      }));
  }

  /**
   * Get argument suggestions
   */
  private getArgumentSuggestions(fullInput: string, currentPart: string, context: any): AutoCompleteOption[] {
    const parts = fullInput.split(' ');
    if (parts.length < 2) return [];

    const command = parts[0].toLowerCase();
    const cmd = this.commands.find(c => c.name === command || c.aliases?.includes(command));
    
    if (!cmd || !cmd.args) return [];

    const currentArgIndex = parts.length - 2; // -1 for the command, -1 for current position
    const currentArg = cmd.args[currentArgIndex];
    
    if (!currentArg) return [];

    switch (currentArg.type) {
      case 'directory':
        return this.getFileSuggestions(currentPart, context, true);
      case 'file':
        return this.getFileSuggestions(currentPart, context, false);
      case 'string':
        return this.getStringSuggestions(currentPart, currentArg);
      case 'number':
        return this.getNumberSuggestions(currentPart, currentArg);
      case 'boolean':
        return this.getBooleanSuggestions(currentPart);
      case 'url':
        return this.getUrlSuggestions(currentPart);
      default:
        return [];
    }
  }

  /**
   * Get file/directory suggestions
   */
  private getFileSuggestions(input: string, context: any, directoriesOnly = false): AutoCompleteOption[] {
    if (!context.fileSystem) return [];

    const suggestions: AutoCompleteOption[] = [];
    const currentDir = context.currentDirectory || '/';

    Object.values(context.fileSystem).forEach((file: any) => {
      if (file.name.startsWith(input) || input === '') {
        const isDir = file.type === 'directory';
        if (!directoriesOnly || isDir) {
          suggestions.push({
            value: file.name,
            description: `${isDir ? 'Directory' : 'File'} - ${file.size || 0} bytes`,
            type: isDir ? 'directory' : 'file',
            score: isDir ? 80 : 70,
          });
        }
      }
    });

    return suggestions;
  }

  /**
   * Get environment variable suggestions
   */
  private getEnvironmentSuggestions(input: string, context: any): AutoCompleteOption[] {
    if (!context.environment || !input.startsWith('$')) return [];

    const suggestions: AutoCompleteOption[] = [];
    const varName = input.substring(1);

    Object.entries(context.environment).forEach(([key, value]) => {
      if (key.toLowerCase().startsWith(varName.toLowerCase())) {
        suggestions.push({
          value: `$${key}`,
          description: `Environment variable: ${value}`,
          type: 'variable',
          score: 60,
        });
      }
    });

    return suggestions;
  }

  /**
   * Get alias suggestions
   */
  private getAliasSuggestions(input: string, context: any): AutoCompleteOption[] {
    if (!context.aliases) return [];

    const suggestions: AutoCompleteOption[] = [];

    Object.entries(context.aliases).forEach(([key, value]) => {
      if (key.startsWith(input)) {
        suggestions.push({
          value: key,
          description: `Alias for: ${value}`,
          type: 'command',
          score: 50,
        });
      }
    });

    return suggestions;
  }

  /**
   * Get string suggestions based on choices
   */
  private getStringSuggestions(input: string, arg: any): AutoCompleteOption[] {
    if (!arg.choices) return [];

    return arg.choices
      .filter((choice: string) => choice.startsWith(input))
      .map((choice: string) => ({
        value: choice,
        description: `Valid choice for ${arg.name}`,
        type: 'keyword' as const,
        score: 75,
      }));
  }

  /**
   * Get number suggestions
   */
  private getNumberSuggestions(input: string, arg: any): AutoCompleteOption[] {
    // Return common port numbers
    const commonPorts = [3000, 3001, 4000, 5000, 8080, 8081, 9000];
    const numericInput = parseInt(input);

    if (isNaN(numericInput)) return [];

    return commonPorts
      .filter(port => port.toString().startsWith(input))
      .map(port => ({
        value: port.toString(),
        description: `Port ${port}`,
        type: 'number',
        score: 70,
      }));
  }

  /**
   * Get boolean suggestions
   */
  private getBooleanSuggestions(input: string): AutoCompleteOption[] {
    const options = ['true', 'false', 'yes', 'no', '1', '0'];
    
    return options
      .filter(option => option.startsWith(input.toLowerCase()))
      .map(option => ({
        value: option,
        description: 'Boolean value',
        type: 'keyword',
        score: 60,
      }));
  }

  /**
   * Get URL suggestions
   */
  private getUrlSuggestions(input: string): AutoCompleteOption[] {
    const commonUrls = [
      'http://localhost:3000',
      'http://localhost:8080',
      'https://github.com',
      'https://npmjs.com',
      'https://stackoverflow.com',
    ];

    return commonUrls
      .filter(url => url.startsWith(input))
      .map(url => ({
        value: url,
        description: 'Common URL',
        type: 'url',
        score: 50,
      }));
  }

  /**
   * Sort and deduplicate suggestions
   */
  private sortAndDeduplicateSuggestions(suggestions: AutoCompleteOption[], input: string): AutoCompleteOption[] {
    const seen = new Set<string>();
    const uniqueSuggestions = suggestions.filter(suggestion => {
      if (seen.has(suggestion.value)) {
        return false;
      }
      seen.add(suggestion.value);
      return true;
    });

    return uniqueSuggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Limit to top 10 suggestions
  }

  /**
   * Add context to history for learning
   */
  private addToContextHistory(context: any): void {
    this.contextHistory.push({
      timestamp: Date.now(),
      ...context,
    });

    // Keep only recent history
    if (this.contextHistory.length > this.maxHistory) {
      this.contextHistory = this.contextHistory.slice(-this.maxHistory);
    }
  }

  /**
   * Add custom completion
   */
  addCustomCompletion(context: string, options: AutoCompleteOption[]): void {
    this.customCompletions.set(context, options);
  }

  /**
   * Get custom completions
   */
  getCustomCompletions(context: string): AutoCompleteOption[] {
    return this.customCompletions.get(context) || [];
  }

  /**
   * Clear custom completions
   */
  clearCustomCompletions(context?: string): void {
    if (context) {
      this.customCompletions.delete(context);
    } else {
      this.customCompletions.clear();
    }
  }

  /**
   * Get all available commands
   */
  getAvailableCommands(): CommandCompletion[] {
    return [...this.commands];
  }

  /**
   * Add command
   */
  addCommand(command: CommandCompletion): void {
    this.commands.push(command);
  }

  /**
   * Remove command
   */
  removeCommand(name: string): boolean {
    const index = this.commands.findIndex(cmd => cmd.name === name);
    if (index === -1) return false;

    this.commands.splice(index, 1);
    return true;
  }

  /**
   * Update command
   */
  updateCommand(name: string, updates: Partial<CommandCompletion>): boolean {
    const command = this.commands.find(cmd => cmd.name === name);
    if (!command) return false;

    Object.assign(command, updates);
    return true;
  }

  /**
   * Get command suggestions by category
   */
  getCommandsByCategory(category: string): CommandCompletion[] {
    return this.commands.filter(cmd => cmd.category === category);
  }

  /**
   * Search commands
   */
  searchCommands(query: string): CommandCompletion[] {
    const lowerQuery = query.toLowerCase();
    return this.commands.filter(cmd => 
      cmd.name.toLowerCase().includes(lowerQuery) ||
      cmd.description.toLowerCase().includes(lowerQuery) ||
      cmd.category.toLowerCase().includes(lowerQuery) ||
      cmd.aliases?.some(alias => alias.toLowerCase().includes(lowerQuery))
    );
  }
}

// Export singleton instance
export const advancedAutocompleteService = new AdvancedAutocompleteService();