// Plugin Manager Service for Terminal
import { Plugin, PluginCommand, PluginHook, TerminalOutput } from '../types/terminal.types';

export class PluginManagerService {
  private plugins: Map<string, Plugin> = new Map();
  private enabledPlugins: Set<string> = new Set();
  private commandHandlers: Map<string, PluginCommand> = new Map();
  private hooks: Map<string, PluginHook[]> = new Map();
  private observers: Set<(plugin: Plugin, event: string) => void> = new Set();

  /**
   * Load plugin
   */
  async loadPlugin(pluginConfig: Plugin): Promise<boolean> {
    try {
      // Validate plugin configuration
      if (!this.validatePluginConfig(pluginConfig)) {
        throw new Error('Invalid plugin configuration');
      }

      // Load plugin
      const plugin: Plugin = {
        ...pluginConfig,
        enabled: false,
      };

      // Check dependencies
      if (plugin.dependencies.length > 0) {
        const missingDeps = plugin.dependencies.filter(dep => !this.plugins.has(dep));
        if (missingDeps.length > 0) {
          throw new Error(`Missing dependencies: ${missingDeps.join(', ')}`);
        }
      }

      this.plugins.set(plugin.id, plugin);
      this.notifyObservers(plugin, 'loaded');
      
      return true;
    } catch (error) {
      console.error('Failed to load plugin:', error);
      return false;
    }
  }

  /**
   * Enable plugin
   */
  async enablePlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    try {
      // Check if already enabled
      if (this.enabledPlugins.has(pluginId)) return true;

      // Load plugin commands
      for (const command of plugin.commands) {
        this.commandHandlers.set(command.name, command);
      }

      // Register plugin hooks
      for (const hook of plugin.hooks) {
        if (!this.hooks.has(hook.name)) {
          this.hooks.set(hook.name, []);
        }
        this.hooks.get(hook.name)!.push(hook);
      }

      plugin.enabled = true;
      this.enabledPlugins.add(pluginId);
      
      this.notifyObservers(plugin, 'enabled');
      return true;
    } catch (error) {
      console.error('Failed to enable plugin:', error);
      return false;
    }
  }

  /**
   * Disable plugin
   */
  async disablePlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || !this.enabledPlugins.has(pluginId)) return false;

    try {
      // Remove plugin commands
      for (const command of plugin.commands) {
        this.commandHandlers.delete(command.name);
      }

      // Remove plugin hooks
      for (const hook of plugin.hooks) {
        const hookList = this.hooks.get(hook.name);
        if (hookList) {
          const index = hookList.indexOf(hook);
          if (index > -1) {
            hookList.splice(index, 1);
          }
        }
      }

      plugin.enabled = false;
      this.enabledPlugins.delete(pluginId);
      
      this.notifyObservers(plugin, 'disabled');
      return true;
    } catch (error) {
      console.error('Failed to disable plugin:', error);
      return false;
    }
  }

  /**
   * Unload plugin
   */
  async unloadPlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    // Disable if enabled
    if (this.enabledPlugins.has(pluginId)) {
      await this.disablePlugin(pluginId);
    }

    this.plugins.delete(pluginId);
    this.notifyObservers(plugin, 'unloaded');
    
    return true;
  }

  /**
   * Validate plugin configuration
   */
  private validatePluginConfig(config: Plugin): boolean {
    return !!(
      config.id &&
      config.name &&
      config.version &&
      config.description &&
      config.author &&
      Array.isArray(config.commands) &&
      Array.isArray(config.hooks)
    );
  }

  /**
   * Execute command
   */
  async executeCommand(name: string, args: string[], context: any): Promise<any> {
    const command = this.commandHandlers.get(name);
    if (!command) {
      throw new Error(`Command not found: ${name}`);
    }

    try {
      const result = await command.handler(args, context);
      this.executeHooks('command-executed', { command: name, args, result });
      return result;
    } catch (error) {
      this.executeHooks('command-error', { command: name, args, error });
      throw error;
    }
  }

  /**
   * Execute hook
   */
  executeHooks(hookName: string, data: any): any {
    const hooks = this.hooks.get(hookName) || [];
    let result = data;

    for (const hook of hooks) {
      try {
        result = hook.handler(result);
      } catch (error) {
        console.error(`Error in hook ${hookName}:`, error);
      }
    }

    return result;
  }

  /**
   * Get plugin
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all plugins
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get enabled plugins
   */
  getEnabledPlugins(): Plugin[] {
    return Array.from(this.enabledPlugins)
      .map(id => this.plugins.get(id))
      .filter((plugin): plugin is Plugin => plugin !== undefined);
  }

  /**
   * Get available commands
   */
  getAvailableCommands(): PluginCommand[] {
    return Array.from(this.commandHandlers.values());
  }

  /**
   * Get hooks
   */
  getHooks(hookName?: string): Map<string, PluginHook[]> | PluginHook[] {
    if (hookName) {
      return this.hooks.get(hookName) || [];
    }
    return this.hooks;
  }

  /**
   * Create built-in plugins
   */
  createBuiltInPlugins(): Plugin[] {
    return [
      {
        id: 'web-dev-tools',
        name: 'Web Dev Tools',
        version: '1.0.0',
        description: 'Collection of web development utilities',
        author: 'Terminal Team',
        enabled: true,
        dependencies: [],
        commands: [
          {
            name: 'minify-js',
            description: 'Minify JavaScript files',
            usage: 'minify-js <file>',
            handler: async (args: string[], context: any): Promise<TerminalOutput[]> => {
              // Simulate JS minification
              return [{
                id: `minify-js-${Date.now()}`,
                type: 'success',
                message: 'JavaScript minified successfully',
                timestamp: Date.now()
              }];
            },
          },
          {
            name: 'optimize-images',
            description: 'Optimize image files',
            usage: 'optimize-images <directory>',
            handler: async (args: string[], context: any): Promise<TerminalOutput[]> => {
              // Simulate image optimization
              return [{
                id: `optimize-images-${Date.now()}`,
                type: 'success',
                message: 'Images optimized successfully',
                timestamp: Date.now()
              }];
            },
          },
        ],
        hooks: [
          {
            name: 'before-command',
            handler: (data: any) => {
              console.log('Before command:', data);
              return data;
            },
          },
        ],
        config: {},
      },
      {
        id: 'git-helpers',
        name: 'Git Helpers',
        version: '1.0.0',
        description: 'Git workflow helpers',
        author: 'Terminal Team',
        enabled: true,
        dependencies: [],
        commands: [
          {
            name: 'git-quick-commit',
            description: 'Quick git commit with auto-generated message',
            usage: 'git-quick-commit',
            handler: async (args: string[], context: any): Promise<TerminalOutput[]> => {
              // Simulate quick commit
              return [{
                id: `git-quick-commit-${Date.now()}`,
                type: 'success',
                message: 'Quick commit completed',
                timestamp: Date.now()
              }];
            },
          },
        ],
        hooks: [],
        config: {},
      },
      {
        id: 'server-manager',
        name: 'Server Manager',
        version: '1.0.0',
        description: 'Development server management',
        author: 'Terminal Team',
        enabled: true,
        dependencies: [],
        commands: [
          {
            name: 'start-server',
            description: 'Start development server',
            usage: 'start-server <port>',
            handler: async (args: string[], context: any): Promise<TerminalOutput[]> => {
              // Simulate server start
              return [{
                id: `start-server-${Date.now()}`,
                type: 'success',
                message: `Server started on port ${args[0] || 3000}`,
                timestamp: Date.now()
              }];
            },
          },
          {
            name: 'stop-server',
            description: 'Stop development server',
            usage: 'stop-server',
            handler: async (args: string[], context: any): Promise<TerminalOutput[]> => {
              // Simulate server stop
              return [{
                id: `stop-server-${Date.now()}`,
                type: 'success',
                message: 'Server stopped',
                timestamp: Date.now()
              }];
            },
          },
        ],
        hooks: [
          {
            name: 'server-starting',
            handler: (data: any) => {
              console.log('Server starting:', data);
              return data;
            },
          },
        ],
        config: {},
      },
    ];
  }

  /**
   * Install built-in plugins
   */
  async installBuiltInPlugins(): Promise<void> {
    const builtInPlugins = this.createBuiltInPlugins();
    
    for (const plugin of builtInPlugins) {
      await this.loadPlugin(plugin);
      await this.enablePlugin(plugin.id);
    }
  }

  /**
   * Add observer
   */
  addObserver(observer: (plugin: Plugin, event: string) => void): void {
    this.observers.add(observer);
  }

  /**
   * Remove observer
   */
  removeObserver(observer: (plugin: Plugin, event: string) => void): void {
    this.observers.delete(observer);
  }

  /**
   * Notify observers
   */
  private notifyObservers(plugin: Plugin, event: string): void {
    this.observers.forEach(observer => {
      try {
        observer(plugin, event);
      } catch (error) {
        console.error('Error in plugin observer:', error);
      }
    });
  }

  /**
   * Export plugin configuration
   */
  exportPlugins(): string {
    const pluginData = {
      plugins: this.getAllPlugins(),
      enabled: Array.from(this.enabledPlugins),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    return JSON.stringify(pluginData, null, 2);
  }

  /**
   * Import plugin configuration
   */
  async importPlugins(configData: string): Promise<boolean> {
    try {
      const data = JSON.parse(configData);
      
      if (!data.plugins || !Array.isArray(data.plugins)) {
        throw new Error('Invalid plugin configuration');
      }

      // Load plugins
      for (const pluginConfig of data.plugins) {
        await this.loadPlugin(pluginConfig);
        
        // Enable if it was enabled
        if (data.enabled && data.enabled.includes(pluginConfig.id)) {
          await this.enablePlugin(pluginConfig.id);
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to import plugins:', error);
      return false;
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.plugins.clear();
    this.enabledPlugins.clear();
    this.commandHandlers.clear();
    this.hooks.clear();
    this.observers.clear();
  }
}

// Export singleton instance
export const pluginManagerService = new PluginManagerService();