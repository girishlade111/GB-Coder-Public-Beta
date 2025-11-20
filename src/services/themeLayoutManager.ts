// Theme Management System for Terminal
import { ConsoleThemeConfig, LayoutConfig } from '../types/console.types';

export interface CustomTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    foreground: string;
    selection: string;
    cursor: string;
    border: string;
    log: string;
    info: string;
    warn: string;
    error: string;
    debug: string;
    success: string;
    system: string;
    timestamp: string;
    lineNumber: string;
  };
  fonts: {
    family: string;
    size: number;
    lineHeight: number;
  };
  spacing: {
    padding: number;
    lineSpacing: number;
  };
  author?: string;
  tags: string[];
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TerminalLayout {
  id: string;
  name: string;
  description: string;
  config: {
    splitDirection: 'horizontal' | 'vertical' | 'grid';
    tabPosition: 'top' | 'bottom' | 'left' | 'right';
    showLineNumbers: boolean;
    showTimestamps: boolean;
    showIcons: boolean;
    autoSave: boolean;
    fontSize: number;
    lineHeight: number;
    padding: number;
  };
  theme: string;
  createdAt: number;
}

export class ThemeLayoutManager {
  private themeKey = 'terminal-themes';
  private layoutKey = 'terminal-layouts';
  private activeThemeKey = 'terminal-active-theme';
  private activeLayoutKey = 'terminal-active-layout';

  // Built-in themes
  private builtInThemes: CustomTheme[] = [
    {
      id: 'dark',
      name: 'Dark Default',
      description: 'Default dark theme with high contrast',
      colors: {
        background: '#1f2937',
        foreground: '#f9fafb',
        selection: '#374151',
        cursor: '#60a5fa',
        border: '#4b5563',
        log: '#d1d5db',
        info: '#60a5fa',
        warn: '#f59e0b',
        error: '#ef4444',
        debug: '#8b5cf6',
        success: '#10b981',
        system: '#a855f7',
        timestamp: '#9ca3af',
        lineNumber: '#6b7280',
      },
      fonts: {
        family: 'JetBrains Mono, Consolas, Monaco, monospace',
        size: 14,
        lineHeight: 1.4,
      },
      spacing: {
        padding: 12,
        lineSpacing: 4,
      },
      isDefault: true,
      tags: ['dark', 'default', 'high-contrast'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'light',
      name: 'Light Minimal',
      description: 'Clean light theme for daytime use',
      colors: {
        background: '#ffffff',
        foreground: '#1f2937',
        selection: '#e5e7eb',
        cursor: '#3b82f6',
        border: '#d1d5db',
        log: '#374151',
        info: '#1d4ed8',
        warn: '#d97706',
        error: '#dc2626',
        debug: '#7c3aed',
        success: '#059669',
        system: '#9333ea',
        timestamp: '#6b7280',
        lineNumber: '#9ca3af',
      },
      fonts: {
        family: 'JetBrains Mono, Consolas, Monaco, monospace',
        size: 14,
        lineHeight: 1.4,
      },
      spacing: {
        padding: 12,
        lineSpacing: 4,
      },
      isDefault: false,
      tags: ['light', 'clean', 'minimal'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'monokai',
      name: 'Monokai Pro',
      description: 'Popular dark theme inspired by Sublime Text',
      colors: {
        background: '#2d2a2e',
        foreground: '#f8f8f2',
        selection: '#403e41',
        cursor: '#ff9d00',
        border: '#5c5b5e',
        log: '#f8f8f2',
        info: '#78dce8',
        warn: '#fd971f',
        error: '#ff6188',
        debug: '#ab9df2',
        success: '#a9dc76',
        system: '#ffd866',
        timestamp: '#727072',
        lineNumber: '#5c5b5e',
      },
      fonts: {
        family: 'Fira Code, JetBrains Mono, monospace',
        size: 14,
        lineHeight: 1.5,
      },
      spacing: {
        padding: 16,
        lineSpacing: 6,
      },
      isDefault: false,
      tags: ['dark', 'developer', 'popular'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'solarized',
      name: 'Solarized Dark',
      description: 'Precision colors for machines and people',
      colors: {
        background: '#002b36',
        foreground: '#839496',
        selection: '#073642',
        cursor: '#268bd2',
        border: '#586e75',
        log: '#839496',
        info: '#268bd2',
        warn: '#b58900',
        error: '#dc322f',
        debug: '#6c71c4',
        success: '#859900',
        system: '#d33682',
        timestamp: '#657b83',
        lineNumber: '#586e75',
      },
      fonts: {
        family: 'Source Code Pro, JetBrains Mono, monospace',
        size: 14,
        lineHeight: 1.45,
      },
      spacing: {
        padding: 12,
        lineSpacing: 4,
      },
      isDefault: false,
      tags: ['dark', 'color-coded', 'scientific'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'dracula',
      name: 'Dracula',
      description: 'Dark theme for those who like dark terminal',
      colors: {
        background: '#282a36',
        foreground: '#f8f8f2',
        selection: '#44475a',
        cursor: '#bd93f9',
        border: '#6272a4',
        log: '#f8f8f2',
        info: '#8be9fd',
        warn: '#ffb86c',
        error: '#ff5555',
        debug: '#bd93f9',
        success: '#50fa7b',
        system: '#ff79c6',
        timestamp: '#6272a4',
        lineNumber: '#6272a4',
      },
      fonts: {
        family: 'Fira Code, JetBrains Mono, monospace',
        size: 14,
        lineHeight: 1.5,
      },
      spacing: {
        padding: 14,
        lineSpacing: 5,
      },
      isDefault: false,
      tags: ['dark', 'purple', 'vampire'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'nord',
      name: 'Nord',
      description: 'An arctic, north-bluish color palette',
      colors: {
        background: '#2e3440',
        foreground: '#eceff4',
        selection: '#3b4252',
        cursor: '#88c0d0',
        border: '#4c566a',
        log: '#eceff4',
        info: '#81a1c1',
        warn: '#ebcb8b',
        error: '#bf616a',
        debug: '#b48ead',
        success: '#a3be8c',
        system: '#d08770',
        timestamp: '#4c566a',
        lineNumber: '#616e88',
      },
      fonts: {
        family: 'JetBrains Mono, Fira Code, monospace',
        size: 14,
        lineHeight: 1.45,
      },
      spacing: {
        padding: 12,
        lineSpacing: 4,
      },
      isDefault: false,
      tags: ['dark', 'cold', 'minimal'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  // Built-in layouts
  private builtInLayouts: TerminalLayout[] = [
    {
      id: 'single',
      name: 'Single Terminal',
      description: 'Classic single terminal layout',
      config: {
        splitDirection: 'horizontal',
        tabPosition: 'top',
        showLineNumbers: false,
        showTimestamps: true,
        showIcons: true,
        autoSave: true,
        fontSize: 14,
        lineHeight: 1.4,
        padding: 12,
      },
      theme: 'dark',
      createdAt: Date.now(),
    },
    {
      id: 'split-horizontal',
      name: 'Horizontal Split',
      description: 'Side-by-side terminal views',
      config: {
        splitDirection: 'horizontal',
        tabPosition: 'top',
        showLineNumbers: false,
        showTimestamps: true,
        showIcons: true,
        autoSave: true,
        fontSize: 14,
        lineHeight: 1.4,
        padding: 12,
      },
      theme: 'dark',
      createdAt: Date.now(),
    },
    {
      id: 'split-vertical',
      name: 'Vertical Split',
      description: 'Top and bottom terminal views',
      config: {
        splitDirection: 'vertical',
        tabPosition: 'top',
        showLineNumbers: false,
        showTimestamps: true,
        showIcons: true,
        autoSave: true,
        fontSize: 14,
        lineHeight: 1.4,
        padding: 12,
      },
      theme: 'dark',
      createdAt: Date.now(),
    },
    {
      id: 'grid',
      name: 'Terminal Grid',
      description: 'Multiple terminal instances in a grid',
      config: {
        splitDirection: 'grid',
        tabPosition: 'top',
        showLineNumbers: false,
        showTimestamps: true,
        showIcons: true,
        autoSave: true,
        fontSize: 12,
        lineHeight: 1.3,
        padding: 8,
      },
      theme: 'dark',
      createdAt: Date.now(),
    },
    {
      id: 'minimal',
      name: 'Minimal Terminal',
      description: 'Clean and distraction-free terminal',
      config: {
        splitDirection: 'horizontal',
        tabPosition: 'top',
        showLineNumbers: false,
        showTimestamps: false,
        showIcons: false,
        autoSave: true,
        fontSize: 16,
        lineHeight: 1.5,
        padding: 16,
      },
      theme: 'light',
      createdAt: Date.now(),
    },
    {
      id: 'developer',
      name: 'Developer Workspace',
      description: 'Terminal optimized for software development',
      config: {
        splitDirection: 'horizontal',
        tabPosition: 'left',
        showLineNumbers: true,
        showTimestamps: true,
        showIcons: true,
        autoSave: true,
        fontSize: 14,
        lineHeight: 1.4,
        padding: 12,
      },
      theme: 'monokai',
      createdAt: Date.now(),
    },
  ];

  constructor() {
    this.initializeThemes();
    this.initializeLayouts();
  }

  /**
   * Initialize built-in themes
   */
  private initializeThemes(): void {
    const saved = localStorage.getItem(this.themeKey);
    if (saved) {
      try {
        const userThemes = JSON.parse(saved);
        // Merge built-in themes with user themes
        this.builtInThemes = [...this.builtInThemes, ...userThemes];
      } catch (error) {
        console.error('Failed to load user themes:', error);
      }
    }
  }

  /**
   * Initialize built-in layouts
   */
  private initializeLayouts(): void {
    const saved = localStorage.getItem(this.layoutKey);
    if (saved) {
      try {
        const userLayouts = JSON.parse(saved);
        // Merge built-in layouts with user layouts
        this.builtInLayouts = [...this.builtInLayouts, ...userLayouts];
      } catch (error) {
        console.error('Failed to load user layouts:', error);
      }
    }
  }

  /**
   * Get all available themes
   */
  getThemes(): CustomTheme[] {
    return [...this.builtInThemes];
  }

  /**
   * Get all available layouts
   */
  getLayouts(): TerminalLayout[] {
    return [...this.builtInLayouts];
  }

  /**
   * Get theme by ID
   */
  getTheme(id: string): CustomTheme | undefined {
    return this.builtInThemes.find(theme => theme.id === id);
  }

  /**
   * Get layout by ID
   */
  getLayout(id: string): TerminalLayout | undefined {
    return this.builtInLayouts.find(layout => layout.id === id);
  }

  /**
   * Get active theme
   */
  getActiveTheme(): CustomTheme {
    const activeId = localStorage.getItem(this.activeThemeKey) || 'dark';
    return this.getTheme(activeId) || this.builtInThemes[0];
  }

  /**
   * Get active layout
   */
  getActiveLayout(): TerminalLayout {
    const activeId = localStorage.getItem(this.activeLayoutKey) || 'single';
    return this.getLayout(activeId) || this.builtInLayouts[0];
  }

  /**
   * Get current layout (alias for getActiveLayout)
   */
  getCurrentLayout(): TerminalLayout {
    return this.getActiveLayout();
  }

  /**
   * Get current theme (alias for getActiveTheme)
   */
  getCurrentTheme(): CustomTheme {
    return this.getActiveTheme();
  }

  /**
   * Get available themes (alias for getThemes)
   */
  getAvailableThemes(): CustomTheme[] {
    return this.getThemes();
  }

  /**
   * Set theme (alias for setActiveTheme)
   */
  setTheme(themeId: string): boolean {
    return this.setActiveTheme(themeId);
  }

  /**
   * Set active theme
   */
  setActiveTheme(themeId: string): boolean {
    const theme = this.getTheme(themeId);
    if (theme) {
      localStorage.setItem(this.activeThemeKey, themeId);
      this.applyTheme(theme);
      return true;
    }
    return false;
  }

  /**
   * Set active layout
   */
  setActiveLayout(layoutId: string): boolean {
    const layout = this.getLayout(layoutId);
    if (layout) {
      localStorage.setItem(this.activeLayoutKey, layoutId);
      this.applyLayout(layout);
      return true;
    }
    return false;
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: CustomTheme): void {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--terminal-${key}`, value);
    });

    // Apply fonts
    root.style.setProperty('--terminal-font-family', theme.fonts.family);
    root.style.setProperty('--terminal-font-size', `${theme.fonts.size}px`);
    root.style.setProperty('--terminal-line-height', theme.fonts.lineHeight.toString());

    // Apply spacing
    root.style.setProperty('--terminal-padding', `${theme.spacing.padding}px`);
    root.style.setProperty('--terminal-line-spacing', `${theme.spacing.lineSpacing}px`);

    // Apply theme to body
    document.body.setAttribute('data-terminal-theme', theme.id);
  }

  /**
   * Apply layout configuration
   */
  private applyLayout(layout: TerminalLayout): void {
    document.body.setAttribute('data-terminal-layout', layout.id);
    document.body.setAttribute('data-tab-position', layout.config.tabPosition);
    document.body.setAttribute('data-split-direction', layout.config.splitDirection);
  }

  /**
   * Create custom theme
   */
  createTheme(name: string, description: string, theme: Partial<CustomTheme>): CustomTheme {
    const newTheme: CustomTheme = {
      id: `custom-${Date.now()}`,
      name,
      description,
      colors: this.builtInThemes[0].colors, // Default colors
      fonts: this.builtInThemes[0].fonts,   // Default fonts
      spacing: this.builtInThemes[0].spacing, // Default spacing
      isDefault: false,
      tags: ['custom'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...theme,
    };

    // Save to localStorage
    const saved = localStorage.getItem(this.themeKey);
    let userThemes = [];
    if (saved) {
      try {
        userThemes = JSON.parse(saved);
      } catch (error) {
        console.error('Failed to parse existing themes:', error);
      }
    }

    userThemes.push(newTheme);
    localStorage.setItem(this.themeKey, JSON.stringify(userThemes));
    
    // Add to built-in themes
    this.builtInThemes.push(newTheme);

    return newTheme;
  }

  /**
   * Update custom theme
   */
  updateTheme(id: string, updates: Partial<CustomTheme>): boolean {
    const themeIndex = this.builtInThemes.findIndex(theme => theme.id === id);
    if (themeIndex === -1) return false;

    this.builtInThemes[themeIndex] = {
      ...this.builtInThemes[themeIndex],
      ...updates,
      updatedAt: Date.now(),
    };

    // Save user themes
    const saved = localStorage.getItem(this.themeKey);
    if (saved) {
      try {
        let userThemes = JSON.parse(saved);
        userThemes = userThemes.map((theme: CustomTheme) => 
          theme.id === id ? this.builtInThemes[themeIndex] : theme
        );
        localStorage.setItem(this.themeKey, JSON.stringify(userThemes));
      } catch (error) {
        console.error('Failed to save updated theme:', error);
      }
    }

    return true;
  }

  /**
   * Delete custom theme
   */
  deleteTheme(id: string): boolean {
    const themeIndex = this.builtInThemes.findIndex(theme => theme.id === id);
    if (themeIndex === -1 || this.builtInThemes[themeIndex].isDefault) return false;

    this.builtInThemes.splice(themeIndex, 1);

    // Remove from localStorage
    const saved = localStorage.getItem(this.themeKey);
    if (saved) {
      try {
        let userThemes = JSON.parse(saved);
        userThemes = userThemes.filter((theme: CustomTheme) => theme.id !== id);
        localStorage.setItem(this.themeKey, JSON.stringify(userThemes));
      } catch (error) {
        console.error('Failed to remove theme from storage:', error);
      }
    }

    return true;
  }

  /**
   * Create custom layout
   */
  createLayout(name: string, description: string, layout: Partial<TerminalLayout>): TerminalLayout {
    const newLayout: TerminalLayout = {
      id: `custom-layout-${Date.now()}`,
      name,
      description,
      config: {
        splitDirection: 'horizontal',
        tabPosition: 'top',
        showLineNumbers: false,
        showTimestamps: true,
        showIcons: true,
        autoSave: true,
        fontSize: 14,
        lineHeight: 1.4,
        padding: 12,
        ...layout.config,
      },
      theme: 'dark',
      createdAt: Date.now(),
    };

    // Save to localStorage
    const saved = localStorage.getItem(this.layoutKey);
    let userLayouts = [];
    if (saved) {
      try {
        userLayouts = JSON.parse(saved);
      } catch (error) {
        console.error('Failed to parse existing layouts:', error);
      }
    }

    userLayouts.push(newLayout);
    localStorage.setItem(this.layoutKey, JSON.stringify(userLayouts));
    
    // Add to built-in layouts
    this.builtInLayouts.push(newLayout);

    return newLayout;
  }

  /**
   * Update custom layout
   */
  updateLayout(id: string, updates: Partial<TerminalLayout>): boolean;
  updateLayout(layout: Partial<TerminalLayout>): boolean;
  updateLayout(idOrLayout: string | Partial<TerminalLayout>, updates?: Partial<TerminalLayout>): boolean {
    if (typeof idOrLayout === 'string') {
      // Two-parameter version: updateLayout(id, updates)
      const id = idOrLayout;
      const layoutIndex = this.builtInLayouts.findIndex(layout => layout.id === id);
      if (layoutIndex === -1) return false;

      this.builtInLayouts[layoutIndex] = {
        ...this.builtInLayouts[layoutIndex],
        ...updates,
      };

      // Save user layouts
      const saved = localStorage.getItem(this.layoutKey);
      if (saved) {
        try {
          let userLayouts = JSON.parse(saved);
          userLayouts = userLayouts.map((layout: TerminalLayout) => 
            layout.id === id ? this.builtInLayouts[layoutIndex] : layout
          );
          localStorage.setItem(this.layoutKey, JSON.stringify(userLayouts));
        } catch (error) {
          console.error('Failed to save updated layout:', error);
        }
      }

      return true;
    } else {
      // Single-parameter version: updateLayout(updates) - create or update a layout
      const newLayout = idOrLayout as Partial<TerminalLayout>;
      if (newLayout.id) {
        return this.updateLayout(newLayout.id, newLayout);
      }
      return false;
    }
  }

  /**
   * Delete custom layout
   */
  deleteLayout(id: string): boolean {
    const layoutIndex = this.builtInLayouts.findIndex(layout => layout.id === id);
    if (layoutIndex === -1) return false;

    this.builtInLayouts.splice(layoutIndex, 1);

    // Remove from localStorage
    const saved = localStorage.getItem(this.layoutKey);
    if (saved) {
      try {
        let userLayouts = JSON.parse(saved);
        userLayouts = userLayouts.filter((layout: TerminalLayout) => layout.id !== id);
        localStorage.setItem(this.layoutKey, JSON.stringify(userLayouts));
      } catch (error) {
        console.error('Failed to remove layout from storage:', error);
      }
    }

    return true;
  }

  /**
   * Export all themes and layouts
   */
  exportSettings(): any {
    const userThemes = localStorage.getItem(this.themeKey);
    const userLayouts = localStorage.getItem(this.layoutKey);
    const activeTheme = localStorage.getItem(this.activeThemeKey);
    const activeLayout = localStorage.getItem(this.activeLayoutKey);

    return {
      themes: userThemes ? JSON.parse(userThemes) : [],
      layouts: userLayouts ? JSON.parse(userLayouts) : [],
      activeTheme,
      activeLayout,
      exportedAt: Date.now(),
      version: '2.0.0',
    };
  }

  /**
   * Import themes and layouts
   */
  importSettings(data: any): boolean {
    try {
      if (data.themes) {
        localStorage.setItem(this.themeKey, JSON.stringify(data.themes));
      }
      if (data.layouts) {
        localStorage.setItem(this.layoutKey, JSON.stringify(data.layouts));
      }
      if (data.activeTheme) {
        localStorage.setItem(this.activeThemeKey, data.activeTheme);
      }
      if (data.activeLayout) {
        localStorage.setItem(this.activeLayoutKey, data.activeLayout);
      }

      // Reinitialize
      this.initializeThemes();
      this.initializeLayouts();

      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }

  /**
   * Get theme preview data
   */
  getThemePreview(themeId: string): string {
    const theme = this.getTheme(themeId);
    if (!theme) return '';

    return `
      <div class="theme-preview">
        <div class="preview-header">${theme.name}</div>
        <div class="preview-body">
          <div class="preview-line" style="color: ${theme.colors.log}">console.log('Hello World');</div>
          <div class="preview-line" style="color: ${theme.colors.info}">info: Application started</div>
          <div class="preview-line" style="color: ${theme.colors.success}">✓ Success: Build completed</div>
          <div class="preview-line" style="color: ${theme.colors.warn}">warning: Deprecated function</div>
          <div class="preview-line" style="color: ${theme.colors.error}">error: Connection failed</div>
        </div>
      </div>
    `;
  }

  /**
   * Reset to default settings
   */
  resetToDefaults(): void {
    localStorage.removeItem(this.themeKey);
    localStorage.removeItem(this.layoutKey);
    localStorage.removeItem(this.activeThemeKey);
    localStorage.removeItem(this.activeLayoutKey);
    
    this.builtInThemes = this.builtInThemes.filter(theme => theme.isDefault);
    this.builtInLayouts = this.builtInLayouts.filter(layout => layout.id === 'single');
    
    this.setActiveTheme('dark');
    this.setActiveLayout('single');
  }
}

// Export singleton instance
export const themeLayoutManager = new ThemeLayoutManager();
