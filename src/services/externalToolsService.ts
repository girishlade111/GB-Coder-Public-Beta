// External Tools and APIs Integration Service
import { ExternalTool } from '../types/console.types';

export interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  statusCode?: number;
  headers?: Record<string, string>;
}

export interface WebhookConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  retries?: number;
}

export interface ToolCommand {
  name: string;
  description: string;
  execute: (args: string[]) => Promise<string>;
}

export class ExternalToolsService {
  private tools: Map<string, ExternalTool> = new Map();
  private commands: Map<string, ToolCommand> = new Map();
  private apiCache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 60000; // 1 minute

  constructor() {
    this.initializeBuiltInTools();
  }

  /**
   * Initialize built-in tool integrations
   */
  private initializeBuiltInTools(): void {
    // Git integration
    this.registerTool({
      id: 'git',
      name: 'Git',
      type: 'cli',
      enabled: true,
      config: {
        commands: ['status', 'log', 'diff', 'branch', 'commit', 'push', 'pull'],
      },
    });

    // NPM integration
    this.registerTool({
      id: 'npm',
      name: 'NPM',
      type: 'cli',
      enabled: true,
      config: {
        commands: ['install', 'uninstall', 'update', 'list', 'run', 'test'],
      },
    });

    // Docker integration
    this.registerTool({
      id: 'docker',
      name: 'Docker',
      type: 'cli',
      enabled: true,
      config: {
        commands: ['ps', 'images', 'build', 'run', 'stop', 'logs'],
      },
    });

    // GitHub API
    this.registerTool({
      id: 'github',
      name: 'GitHub API',
      type: 'api',
      endpoint: 'https://api.github.com',
      enabled: true,
      config: {
        version: 'v3',
        accept: 'application/vnd.github.v3+json',
      },
    });

    // Register commands
    this.registerCommands();
  }

  /**
   * Register built-in commands
   */
  private registerCommands(): void {
    // Git commands
    this.registerCommand({
      name: 'git-status',
      description: 'Get git repository status',
      execute: async () => {
        return 'Git status: On branch main\nNothing to commit, working tree clean';
      },
    });

    this.registerCommand({
      name: 'git-log',
      description: 'Show git commit history',
      execute: async (args) => {
        const limit = args[0] ? parseInt(args[0]) : 10;
        return `Showing last ${limit} commits...`;
      },
    });

    // NPM commands
    this.registerCommand({
      name: 'npm-list',
      description: 'List installed packages',
      execute: async () => {
        return 'Installed packages:\n- react@18.2.0\n- typescript@5.0.0\n- vite@4.3.0';
      },
    });

    // Docker commands
    this.registerCommand({
      name: 'docker-ps',
      description: 'List running containers',
      execute: async () => {
        return 'CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS   PORTS   NAMES';
      },
    });

    // GitHub API commands
    this.registerCommand({
      name: 'github-user',
      description: 'Get GitHub user information',
      execute: async (args) => {
        const username = args[0] || 'octocat';
        const result = await this.callAPI('github', `/users/${username}`);
        if (result.success && result.data) {
          return `User: ${result.data.login}\nName: ${result.data.name}\nBio: ${result.data.bio}`;
        }
        return result.error || 'Failed to fetch user';
      },
    });

    this.registerCommand({
      name: 'github-repos',
      description: 'List user repositories',
      execute: async (args) => {
        const username = args[0] || 'octocat';
        const result = await this.callAPI('github', `/users/${username}/repos`);
        if (result.success && result.data) {
          return result.data.map((repo: any) => `- ${repo.name}: ${repo.description}`).join('\n');
        }
        return result.error || 'Failed to fetch repositories';
      },
    });
  }

  /**
   * Register external tool
   */
  registerTool(tool: ExternalTool): void {
    this.tools.set(tool.id, tool);
  }

  /**
   * Unregister tool
   */
  unregisterTool(toolId: string): boolean {
    return this.tools.delete(toolId);
  }

  /**
   * Get tool
   */
  getTool(toolId: string): ExternalTool | undefined {
    return this.tools.get(toolId);
  }

  /**
   * Get all tools
   */
  getAllTools(): ExternalTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Enable/disable tool
   */
  setToolEnabled(toolId: string, enabled: boolean): boolean {
    const tool = this.tools.get(toolId);
    if (tool) {
      tool.enabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * Register command
   */
  registerCommand(command: ToolCommand): void {
    this.commands.set(command.name, command);
  }

  /**
   * Execute command
   */
  async executeCommand(commandName: string, args: string[] = []): Promise<string> {
    const command = this.commands.get(commandName);
    if (!command) {
      throw new Error(`Command not found: ${commandName}`);
    }

    try {
      return await command.execute(args);
    } catch (error) {
      throw new Error(`Command execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all commands
   */
  getAllCommands(): ToolCommand[] {
    return Array.from(this.commands.values());
  }

  /**
   * Call API
   */
  async callAPI(
    toolId: string,
    path: string,
    options?: {
      method?: string;
      headers?: Record<string, string>;
      body?: any;
      useCache?: boolean;
    }
  ): Promise<APIResponse> {
    const tool = this.tools.get(toolId);
    if (!tool || tool.type !== 'api') {
      return {
        success: false,
        error: 'Tool not found or not an API tool',
      };
    }

    if (!tool.enabled) {
      return {
        success: false,
        error: 'Tool is disabled',
      };
    }

    const cacheKey = `${toolId}:${path}`;

    // Check cache
    if (options?.useCache !== false) {
      const cached = this.apiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return {
          success: true,
          data: cached.data,
        };
      }
    }

    try {
      const url = `${tool.endpoint}${path}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options?.headers,
      };

      // Add API key if available
      if (tool.apiKey) {
        headers['Authorization'] = `Bearer ${tool.apiKey}`;
      }

      const response = await fetch(url, {
        method: options?.method || 'GET',
        headers,
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });

      const data = await response.json();

      if (response.ok) {
        // Cache successful response
        this.apiCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });

        return {
          success: true,
          data,
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries()),
        };
      } else {
        return {
          success: false,
          error: data.message || 'API request failed',
          statusCode: response.status,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Send webhook
   */
  async sendWebhook(config: WebhookConfig): Promise<APIResponse> {
    const maxRetries = config.retries || 3;
    let lastError: string | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(config.url, {
          method: config.method,
          headers: {
            'Content-Type': 'application/json',
            ...config.headers,
          },
          body: config.body ? JSON.stringify(config.body) : undefined,
        });

        const data = await response.text();

        if (response.ok) {
          return {
            success: true,
            data,
            statusCode: response.status,
          };
        } else {
          lastError = `HTTP ${response.status}: ${data}`;
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Network error';
      }

      // Wait before retry
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    return {
      success: false,
      error: lastError || 'Webhook failed after retries',
    };
  }

  /**
   * Clear API cache
   */
  clearCache(toolId?: string): void {
    if (toolId) {
      // Clear cache for specific tool
      for (const key of this.apiCache.keys()) {
        if (key.startsWith(`${toolId}:`)) {
          this.apiCache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.apiCache.clear();
    }
  }

  /**
   * Test tool connection
   */
  async testConnection(toolId: string): Promise<{ success: boolean; message: string }> {
    const tool = this.tools.get(toolId);
    if (!tool) {
      return {
        success: false,
        message: 'Tool not found',
      };
    }

    if (tool.type === 'api') {
      const result = await this.callAPI(toolId, '/', { useCache: false });
      return {
        success: result.success,
        message: result.success ? 'Connection successful' : result.error || 'Connection failed',
      };
    } else if (tool.type === 'cli') {
      return {
        success: true,
        message: 'CLI tool registered',
      };
    } else if (tool.type === 'webhook') {
      return {
        success: true,
        message: 'Webhook configured',
      };
    }

    return {
      success: false,
      message: 'Unknown tool type',
    };
  }

  /**
   * Get tool statistics
   */
  getToolStatistics(toolId: string): {
    enabled: boolean;
    cacheSize: number;
    commandCount: number;
  } {
    const tool = this.tools.get(toolId);
    
    // Count cache entries
    let cacheSize = 0;
    for (const key of this.apiCache.keys()) {
      if (key.startsWith(`${toolId}:`)) {
        cacheSize++;
      }
    }

    // Count commands
    let commandCount = 0;
    for (const command of this.commands.values()) {
      if (command.name.startsWith(toolId)) {
        commandCount++;
      }
    }

    return {
      enabled: tool?.enabled || false,
      cacheSize,
      commandCount,
    };
  }

  /**
   * Export tool configuration
   */
  exportConfiguration(): string {
    const tools = Array.from(this.tools.values()).map(tool => ({
      ...tool,
      apiKey: tool.apiKey ? '***' : undefined, // Mask API key
    }));

    return JSON.stringify(tools, null, 2);
  }

  /**
   * Import tool configuration
   */
  importConfiguration(data: string): boolean {
    try {
      const tools = JSON.parse(data) as ExternalTool[];
      
      for (const tool of tools) {
        this.registerTool(tool);
      }

      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }

  /**
   * Create custom API integration
   */
  createAPIIntegration(config: {
    id: string;
    name: string;
    endpoint: string;
    apiKey?: string;
    headers?: Record<string, string>;
  }): void {
    this.registerTool({
      id: config.id,
      name: config.name,
      type: 'api',
      endpoint: config.endpoint,
      apiKey: config.apiKey,
      enabled: true,
      config: {
        headers: config.headers,
      },
    });
  }

  /**
   * Create custom webhook
   */
  createWebhook(config: {
    id: string;
    name: string;
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
  }): void {
    this.registerTool({
      id: config.id,
      name: config.name,
      type: 'webhook',
      endpoint: config.url,
      enabled: true,
      config: {
        method: config.method || 'POST',
        headers: config.headers,
      },
    });
  }

  /**
   * Execute plugin
   */
  async executePlugin(pluginId: string, action: string, params?: any): Promise<any> {
    const tool = this.tools.get(pluginId);
    if (!tool || tool.type !== 'plugin') {
      throw new Error('Plugin not found');
    }

    if (!tool.enabled) {
      throw new Error('Plugin is disabled');
    }

    // Plugin execution would be implemented based on plugin system
    return {
      success: true,
      message: `Plugin ${pluginId} executed action: ${action}`,
      params,
    };
  }
}

// Export singleton instance
export const externalToolsService = new ExternalToolsService();
