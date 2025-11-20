// Keyboard Shortcuts and Accessibility Service
import { KeyboardShortcut } from '../types/console.types';

export interface ShortcutAction {
  id: string;
  name: string;
  description: string;
  category: 'navigation' | 'editing' | 'terminal' | 'window' | 'debug' | 'accessibility';
  key: string;
  modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  handler: (event: KeyboardEvent) => void | boolean;
  enabled: boolean;
  preventDefault: boolean;
}

export interface AccessibilitySettings {
  screenReaderEnabled: boolean;
  highContrast: boolean;
  largeText: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  reducedMotion: boolean;
  colorBlindSupport: boolean;
  voiceCommands: boolean;
}

export class KeyboardShortcutManager {
  private shortcuts: Map<string, ShortcutAction> = new Map();
  private accessibilitySettings: AccessibilitySettings;
  private isEnabled = true;
  private focusedElement: HTMLElement | null = null;

  constructor() {
    this.accessibilitySettings = this.loadAccessibilitySettings();
    this.initializeDefaultShortcuts();
    this.setupEventListeners();
  }

  /**
   * Initialize default keyboard shortcuts
   */
  private initializeDefaultShortcuts(): void {
    const defaultShortcuts: ShortcutAction[] = [
      // Navigation shortcuts
      {
        id: 'new-tab',
        name: 'New Terminal Tab',
        description: 'Create a new terminal tab',
        category: 'terminal',
        key: 't',
        modifiers: ['ctrl'],
        handler: () => this.triggerAction('new-tab'),
        enabled: true,
        preventDefault: true,
      },
      {
        id: 'close-tab',
        name: 'Close Current Tab',
        description: 'Close the current terminal tab',
        category: 'terminal',
        key: 'w',
        modifiers: ['ctrl'],
        handler: () => this.triggerAction('close-tab'),
        enabled: true,
        preventDefault: true,
      },
      {
        id: 'next-tab',
        name: 'Next Tab',
        description: 'Switch to next terminal tab',
        category: 'navigation',
        key: 'Tab',
        modifiers: ['ctrl'],
        handler: () => this.triggerAction('next-tab'),
        enabled: true,
        preventDefault: true,
      },
      {
        id: 'prev-tab',
        name: 'Previous Tab',
        description: 'Switch to previous terminal tab',
        category: 'navigation',
        key: 'Tab',
        modifiers: ['ctrl', 'shift'],
        handler: () => this.triggerAction('prev-tab'),
        enabled: true,
        preventDefault: true,
      },

      // Terminal shortcuts
      {
        id: 'clear-terminal',
        name: 'Clear Terminal',
        description: 'Clear the terminal output',
        category: 'terminal',
        key: 'l',
        modifiers: ['ctrl'],
        handler: () => this.triggerAction('clear-terminal'),
        enabled: true,
        preventDefault: true,
      },
      {
        id: 'interrupt',
        name: 'Interrupt Process',
        description: 'Interrupt the currently running process',
        category: 'terminal',
        key: 'c',
        modifiers: ['ctrl'],
        handler: () => this.triggerAction('interrupt'),
        enabled: true,
        preventDefault: true,
      },
      {
        id: 'history-up',
        name: 'Previous Command',
        description: 'Navigate to previous command in history',
        category: 'editing',
        key: 'ArrowUp',
        modifiers: [],
        handler: (e) => this.triggerAction('history-up'),
        enabled: true,
        preventDefault: false,
      },
      {
        id: 'history-down',
        name: 'Next Command',
        description: 'Navigate to next command in history',
        category: 'editing',
        key: 'ArrowDown',
        modifiers: [],
        handler: (e) => this.triggerAction('history-down'),
        enabled: true,
        preventDefault: false,
      },
      {
        id: 'autocomplete',
        name: 'Autocomplete',
        description: 'Trigger autocomplete for current input',
        category: 'editing',
        key: 'Tab',
        modifiers: [],
        handler: () => this.triggerAction('autocomplete'),
        enabled: true,
        preventDefault: true,
      },
      {
        id: 'explain-code',
        name: 'Explain Code',
        description: 'Explain selected code with AI',
        category: 'editing',
        key: 'e',
        modifiers: ['ctrl'],
        handler: () => this.triggerAction('explain-code'),
        enabled: true,
        preventDefault: true,
      },

      // Window shortcuts
      {
        id: 'maximize-terminal',
        name: 'Maximize Terminal',
        description: 'Maximize the terminal window',
        category: 'window',
        key: 'Enter',
        modifiers: ['ctrl', 'shift'],
        handler: () => this.triggerAction('maximize-terminal'),
        enabled: true,
        preventDefault: true,
      },
      {
        id: 'split-vertical',
        name: 'Split Vertically',
        description: 'Split terminal vertically',
        category: 'terminal',
        key: '|',
        modifiers: ['ctrl', 'shift'],
        handler: () => this.triggerAction('split-vertical'),
        enabled: true,
        preventDefault: true,
      },
      {
        id: 'split-horizontal',
        name: 'Split Horizontally',
        description: 'Split terminal horizontally',
        category: 'terminal',
        key: '_',
        modifiers: ['ctrl', 'shift'],
        handler: () => this.triggerAction('split-horizontal'),
        enabled: true,
        preventDefault: true,
      },

      // Debug shortcuts
      {
        id: 'toggle-debug',
        name: 'Toggle Debug Mode',
        description: 'Toggle debug mode for current session',
        category: 'debug',
        key: 'd',
        modifiers: ['ctrl', 'shift'],
        handler: () => this.triggerAction('toggle-debug'),
        enabled: true,
        preventDefault: true,
      },
      {
        id: 'step-over',
        name: 'Step Over',
        description: 'Step over in debug mode',
        category: 'debug',
        key: 'F10',
        modifiers: [],
        handler: () => this.triggerAction('step-over'),
        enabled: true,
        preventDefault: true,
      },
      {
        id: 'step-into',
        name: 'Step Into',
        description: 'Step into in debug mode',
        category: 'debug',
        key: 'F11',
        modifiers: [],
        handler: () => this.triggerAction('step-into'),
        enabled: true,
        preventDefault: true,
      },
      {
        id: 'step-out',
        name: 'Step Out',
        description: 'Step out in debug mode',
        category: 'debug',
        key: 'F11',
        modifiers: ['shift'],
        handler: () => this.triggerAction('step-out'),
        enabled: true,
        preventDefault: true,
      },
      {
        id: 'continue',
        name: 'Continue Execution',
        description: 'Continue execution in debug mode',
        category: 'debug',
        key: 'F5',
        modifiers: [],
        handler: () => this.triggerAction('continue'),
        enabled: true,
        preventDefault: true,
      },

      // Accessibility shortcuts
      {
        id: 'announce-status',
        name: 'Announce Status',
        description: 'Screen reader announcement of current status',
        category: 'accessibility',
        key: 'a',
        modifiers: ['alt'],
        handler: () => this.announceStatus(),
        enabled: true,
        preventDefault: true,
      },
      {
        id: 'toggle-high-contrast',
        name: 'Toggle High Contrast',
        description: 'Toggle high contrast mode',
        category: 'accessibility',
        key: 'h',
        modifiers: ['alt'],
        handler: () => this.toggleHighContrast(),
        enabled: true,
        preventDefault: true,
      },
      {
        id: 'increase-text-size',
        name: 'Increase Text Size',
        description: 'Increase text size for better readability',
        category: 'accessibility',
        key: '+',
        modifiers: ['ctrl', 'shift'],
        handler: () => this.adjustTextSize(1),
        enabled: true,
        preventDefault: true,
      },
      {
        id: 'decrease-text-size',
        name: 'Decrease Text Size',
        description: 'Decrease text size',
        category: 'accessibility',
        key: '-',
        modifiers: ['ctrl', 'shift'],
        handler: () => this.adjustTextSize(-1),
        enabled: true,
        preventDefault: true,
      },
      {
        id: 'reset-text-size',
        name: 'Reset Text Size',
        description: 'Reset text size to default',
        category: 'accessibility',
        key: '0',
        modifiers: ['ctrl', 'shift'],
        handler: () => this.resetTextSize(),
        enabled: true,
        preventDefault: true,
      },

      // Search and find
      {
        id: 'search-history',
        name: 'Search Command History',
        description: 'Search through command history',
        category: 'navigation',
        key: 'r',
        modifiers: ['ctrl'],
        handler: () => this.triggerAction('search-history'),
        enabled: true,
        preventDefault: true,
      },
      {
        id: 'find-in-output',
        name: 'Find in Output',
        description: 'Find text in terminal output',
        category: 'navigation',
        key: 'f',
        modifiers: ['ctrl'],
        handler: () => this.triggerAction('find-in-output'),
        enabled: true,
        preventDefault: true,
      },
    ];

    defaultShortcuts.forEach(shortcut => {
      this.registerShortcut(shortcut);
    });
  }

  /**
   * Setup global event listeners
   */
  private setupEventListeners(): void {
    document.addEventListener('keydown', (e) => {
      this.handleKeyDown(e);
    });

    document.addEventListener('keyup', (e) => {
      this.handleKeyUp(e);
    });

    // Track focus for accessibility
    document.addEventListener('focusin', (e) => {
      this.focusedElement = e.target as HTMLElement;
      this.updateFocusIndicators();
    });

    document.addEventListener('focusout', (e) => {
      if (this.focusedElement === e.target) {
        this.focusedElement = null;
      }
    });

    // Handle window resize for responsive shortcuts
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Apply accessibility settings on load
    this.applyAccessibilitySettings();
  }

  /**
   * Handle keyboard events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) return;

    // Check for screen reader shortcuts first
    if (this.accessibilitySettings.screenReaderEnabled && event.altKey) {
      if (this.handleScreenReaderShortcuts(event)) {
        return;
      }
    }

    // Find matching shortcuts
    const matchingShortcuts = this.findMatchingShortcuts(event);

    if (matchingShortcuts.length > 0) {
      event.preventDefault();
      event.stopPropagation();

      // Execute the most specific shortcut (with most modifiers)
      const mostSpecific = matchingShortcuts.reduce((prev, current) => {
        return this.getShortcutSpecificity(current) > this.getShortcutSpecificity(prev) ? current : prev;
      });

      const result = mostSpecific.handler(event);

      // Allow handler to prevent default if it returns false
      if (result === false) {
        event.preventDefault();
      }

      // Announce action for screen readers
      if (this.accessibilitySettings.screenReaderEnabled) {
        this.announceAction(mostSpecific.name);
      }
    }
  }

  /**
   * Handle key up events
   */
  private handleKeyUp(event: KeyboardEvent): void {
    // Handle any key-up specific logic here
  }

  /**
   * Find matching shortcuts for an event
   */
  private findMatchingShortcuts(event: KeyboardEvent): ShortcutAction[] {
    const matches: ShortcutAction[] = [];

    this.shortcuts.forEach(shortcut => {
      if (!shortcut.enabled) return;

      // Check if the key matches
      if (this.keysMatch(event.key, shortcut.key)) {
        // Check if modifiers match
        if (this.modifiersMatch(event, shortcut.modifiers)) {
          matches.push(shortcut);
        }
      }
    });

    return matches;
  }

  /**
   * Check if keys match
   */
  private keysMatch(eventKey: string, shortcutKey: string): boolean {
    // Normalize keys for comparison
    const normalizeKey = (key: string) => {
      const keyMap: { [key: string]: string } = {
        ' ': 'Space',
        'Escape': 'Esc',
        'ArrowUp': 'ArrowUp',
        'ArrowDown': 'ArrowDown',
        'ArrowLeft': 'ArrowLeft',
        'ArrowRight': 'ArrowRight',
        'Enter': 'Enter',
        'Tab': 'Tab',
        'Backspace': 'Backspace',
        'Delete': 'Delete',
        'Insert': 'Insert',
        'Home': 'Home',
        'End': 'End',
        'PageUp': 'PageUp',
        'PageDown': 'PageDown',
        'F1': 'F1',
        'F2': 'F2',
        'F3': 'F3',
        'F4': 'F4',
        'F5': 'F5',
        'F6': 'F6',
        'F7': 'F7',
        'F8': 'F8',
        'F9': 'F9',
        'F10': 'F10',
        'F11': 'F11',
        'F12': 'F12',
      };

      return keyMap[key.toLowerCase()] || key.toLowerCase();
    };

    return normalizeKey(eventKey) === normalizeKey(shortcutKey);
  }

  /**
   * Check if modifiers match
   */
  private modifiersMatch(event: KeyboardEvent, requiredModifiers: string[]): boolean {
    const eventModifiers = {
      ctrl: event.ctrlKey,
      alt: event.altKey,
      shift: event.shiftKey,
      meta: event.metaKey,
    };

    // Check that all required modifiers are pressed
    for (const modifier of requiredModifiers) {
      if (!eventModifiers[modifier as keyof typeof eventModifiers]) {
        return false;
      }
    }

    // Check that no extra modifiers are pressed (unless they're expected)
    const pressedModifiers = Object.entries(eventModifiers)
      .filter(([_, pressed]) => pressed)
      .map(([modifier]) => modifier);

    // Allow extra modifiers if they're part of the required set
    for (const pressed of pressedModifiers) {
      if (!requiredModifiers.includes(pressed)) {
        // Check if this is a common modifier that might be acceptable
        // For example, allowing Shift when it's used for case-sensitive actions
        const acceptableExtras = ['shift']; // Add more as needed
        if (!acceptableExtras.includes(pressed)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get shortcut specificity score
   */
  private getShortcutSpecificity(shortcut: ShortcutAction): number {
    return shortcut.modifiers.length;
  }

  /**
   * Handle screen reader specific shortcuts
   */
  private handleScreenReaderShortcuts(event: KeyboardEvent): boolean {
    const shortcuts = this.getShortcutsByCategory('accessibility');
    const matching = shortcuts.find(shortcut =>
      this.keysMatch(event.key, shortcut.key) &&
      this.modifiersMatch(event, shortcut.modifiers)
    );

    if (matching) {
      matching.handler(event);
      return true;
    }

    return false;
  }

  /**
   * Register a new shortcut
   */
  registerShortcut(shortcut: ShortcutAction): void {
    const key = this.generateShortcutKey(shortcut.key, shortcut.modifiers);
    this.shortcuts.set(key, shortcut);
  }

  /**
   * Unregister a shortcut
   */
  unregisterShortcut(shortcutId: string): boolean {
    const shortcut = Array.from(this.shortcuts.values()).find(s => s.id === shortcutId);
    if (shortcut) {
      const key = this.generateShortcutKey(shortcut.key, shortcut.modifiers);
      this.shortcuts.delete(key);
      return true;
    }
    return false;
  }

  /**
   * Enable/disable a shortcut
   */
  setShortcutEnabled(shortcutId: string, enabled: boolean): boolean {
    const shortcut = Array.from(this.shortcuts.values()).find(s => s.id === shortcutId);
    if (shortcut) {
      shortcut.enabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * Get all shortcuts
   */
  getShortcuts(): ShortcutAction[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get shortcuts by category
   */
  getShortcutsByCategory(category: string): ShortcutAction[] {
    return Array.from(this.shortcuts.values()).filter(s => s.category === category);
  }

  /**
   * Generate shortcut key for storage
   */
  private generateShortcutKey(key: string, modifiers: string[]): string {
    const parts = [...modifiers, key].sort();
    return parts.join('+');
  }

  /**
   * Trigger an action
   */
  private triggerAction(actionId: string): void {
    // Emit custom event for components to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('terminal-shortcut-action', {
        detail: { actionId, timestamp: Date.now() }
      }));
    }
  }

  /**
   * Announce action to screen readers
   */
  private announceAction(actionName: string): void {
    if (!this.accessibilitySettings.screenReaderEnabled) return;

    const announcement = `Action executed: ${actionName}`;
    this.makeScreenReaderAnnouncement(announcement);
  }

  /**
   * Announce status information
   */
  private announceStatus(): void {
    if (!this.accessibilitySettings.screenReaderEnabled) return;

    // Get current status information
    const status = this.getCurrentStatus();
    const announcement = `Current status: ${status}`;
    this.makeScreenReaderAnnouncement(announcement);
  }

  /**
   * Get current status for announcements
   */
  private getCurrentStatus(): string {
    // This would integrate with the terminal to get current status
    return 'Terminal ready, no active processes';
  }

  /**
   * Make screen reader announcement
   */
  private makeScreenReaderAnnouncement(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Toggle high contrast mode
   */
  private toggleHighContrast(): void {
    this.accessibilitySettings.highContrast = !this.accessibilitySettings.highContrast;
    this.saveAccessibilitySettings();
    this.applyAccessibilitySettings();

    const message = this.accessibilitySettings.highContrast
      ? 'High contrast mode enabled'
      : 'High contrast mode disabled';
    this.makeScreenReaderAnnouncement(message);
  }

  /**
   * Adjust text size
   */
  private adjustTextSize(delta: number): void {
    const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const newSize = Math.max(12, Math.min(24, currentSize + delta));
    document.documentElement.style.fontSize = `${newSize}px`;

    const message = `Text size ${delta > 0 ? 'increased' : 'decreased'} to ${newSize}px`;
    this.makeScreenReaderAnnouncement(message);
  }

  /**
   * Reset text size to default
   */
  private resetTextSize(): void {
    document.documentElement.style.fontSize = '14px';
    this.makeScreenReaderAnnouncement('Text size reset to default');
  }

  /**
   * Apply accessibility settings
   */
  private applyAccessibilitySettings(): void {
    const root = document.documentElement;

    // High contrast
    if (this.accessibilitySettings.highContrast) {
      root.setAttribute('data-accessibility-high-contrast', 'true');
    } else {
      root.removeAttribute('data-accessibility-high-contrast');
    }

    // Large text
    if (this.accessibilitySettings.largeText) {
      root.setAttribute('data-accessibility-large-text', 'true');
    } else {
      root.removeAttribute('data-accessibility-large-text');
    }

    // Reduced motion
    if (this.accessibilitySettings.reducedMotion) {
      root.setAttribute('data-accessibility-reduced-motion', 'true');
    } else {
      root.removeAttribute('data-accessibility-reduced-motion');
    }

    // Focus indicators
    if (this.accessibilitySettings.focusIndicators) {
      root.setAttribute('data-accessibility-focus-indicators', 'true');
    } else {
      root.removeAttribute('data-accessibility-focus-indicators');
    }
  }

  /**
   * Update focus indicators for keyboard navigation
   */
  private updateFocusIndicators(): void {
    if (!this.accessibilitySettings.keyboardNavigation) return;

    // Add focus indicators for keyboard navigation
    document.body.classList.add('keyboard-navigation');

    // Remove when mouse is used
    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
      document.removeEventListener('mousedown', handleMouseDown);
    };

    document.addEventListener('mousedown', handleMouseDown);
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    // Announce layout changes for screen readers
    if (this.accessibilitySettings.screenReaderEnabled) {
      this.makeScreenReaderAnnouncement(`Window resized to ${window.innerWidth} by ${window.innerHeight} pixels`);
    }
  }

  /**
   * Load accessibility settings from storage
   */
  private loadAccessibilitySettings(): AccessibilitySettings {
    try {
      const saved = localStorage.getItem('terminal-accessibility-settings');
      if (saved) {
        return { ...this.getDefaultAccessibilitySettings(), ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load accessibility settings:', error);
    }

    return this.getDefaultAccessibilitySettings();
  }

  /**
   * Save accessibility settings to storage
   */
  private saveAccessibilitySettings(): void {
    try {
      localStorage.setItem('terminal-accessibility-settings', JSON.stringify(this.accessibilitySettings));
    } catch (error) {
      console.error('Failed to save accessibility settings:', error);
    }
  }

  /**
   * Get default accessibility settings
   */
  private getDefaultAccessibilitySettings(): AccessibilitySettings {
    return {
      screenReaderEnabled: false,
      highContrast: false,
      largeText: false,
      keyboardNavigation: true,
      focusIndicators: true,
      reducedMotion: false,
      colorBlindSupport: false,
      voiceCommands: false,
    };
  }

  /**
   * Update accessibility settings
   */
  updateAccessibilitySettings(settings: Partial<AccessibilitySettings>): void {
    this.accessibilitySettings = { ...this.accessibilitySettings, ...settings };
    this.saveAccessibilitySettings();
    this.applyAccessibilitySettings();
  }

  /**
   * Get current accessibility settings
   */
  getAccessibilitySettings(): AccessibilitySettings {
    return { ...this.accessibilitySettings };
  }

  /**
   * Enable/disable all shortcuts
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if shortcuts are enabled
   */
  areShortcutsEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Get focused element
   */
  getFocusedElement(): HTMLElement | null {
    return this.focusedElement;
  }

  /**
   * Set focused element
   */
  setFocusedElement(element: HTMLElement | null): void {
    this.focusedElement = element;
    if (element) {
      element.focus();
    }
  }

  /**
   * Export shortcut configuration
   */
  exportConfiguration(): any {
    return {
      shortcuts: this.getShortcuts().map(s => ({
        id: s.id,
        name: s.name,
        key: s.key,
        modifiers: s.modifiers,
        enabled: s.enabled,
        category: s.category,
      })),
      accessibility: this.accessibilitySettings,
      exportedAt: Date.now(),
    };
  }

  /**
   * Import shortcut configuration
   */
  importConfiguration(config: any): boolean {
    try {
      // Import shortcuts
      if (config.shortcuts) {
        config.shortcuts.forEach((shortcutData: any) => {
          const existing = Array.from(this.shortcuts.values()).find(s => s.id === shortcutData.id);
          if (existing) {
            existing.enabled = shortcutData.enabled;
          }
        });
      }

      // Import accessibility settings
      if (config.accessibility) {
        this.updateAccessibilitySettings(config.accessibility);
      }

      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }
}

// Export singleton instance
export const keyboardShortcutManager = new KeyboardShortcutManager();
