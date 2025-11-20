// Example Usage: Comprehensive Terminal Integration
import React, { useState, useEffect } from 'react';
import MultiTabTerminal from '../components/MultiTabTerminal';
import { themeLayoutManager } from '../services/themeLayoutManager';
import { keyboardShortcutManager } from '../services/keyboardShortcutManager';
import { performanceMonitoring } from '../services/performanceMonitoring';
import { browserIntegration } from '../services/browserIntegration';
import { sessionPersistence } from '../services/sessionPersistence';
import { commandHistoryService } from '../services/commandHistoryService';

const ComprehensiveTerminalExample: React.FC = () => {
  const [theme, setTheme] = useState('dark');
  const [isDebugging, setIsDebugging] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  // Initialize terminal system
  useEffect(() => {
    // Apply saved theme
    const activeTheme = themeLayoutManager.getActiveTheme();
    setTheme(activeTheme?.id || 'dark');

    // Set up event listeners
    const handleShortcutAction = (event: CustomEvent) => {
      const { actionId } = event.detail;
      
      switch (actionId) {
        case 'new-tab':
          console.log('Creating new terminal tab');
          break;
        case 'clear-terminal':
          console.log('Clearing terminal');
          break;
        case 'toggle-debug':
          setIsDebugging(!isDebugging);
          break;
        default:
          console.log('Unknown shortcut action:', actionId);
      }
    };

    const handlePerformanceWarning = (event: CustomEvent) => {
      console.warn('Performance warning:', event.detail);
    };

    const handleSessionChange = (event: CustomEvent) => {
      console.log('Session changed:', event.detail);
    };

    window.addEventListener('terminal-shortcut-action', handleShortcutAction as EventListener);
    window.addEventListener('terminal-performance-warning', handlePerformanceWarning as EventListener);
    window.addEventListener('session-changed', handleSessionChange as EventListener);

    // Start performance monitoring
    performanceMonitoring.startMonitoring();

    // Connect to browser
    browserIntegration.connect().then((connected: boolean) => {
      if (connected) {
        console.log('Browser integration connected');
      }
    });

    return () => {
      window.removeEventListener('terminal-shortcut-action', handleShortcutAction as EventListener);
      window.removeEventListener('terminal-performance-warning', handlePerformanceWarning as EventListener);
      window.removeEventListener('session-changed', handleSessionChange as EventListener);
      performanceMonitoring.stopMonitoring();
      browserIntegration.disconnect();
    };
  }, [isDebugging]);

  // Handle code changes
  const handleCodeChange = (code: string, language: string) => {
    console.log(`Code changed in ${language}:`, code.substring(0, 100) + '...');
    
    // Auto-save code changes using localStorage directly
    localStorage.setItem(`last-${language}-code`, code);
  };

  // Handle file operations
  const handleFileOpen = async (filename: string) => {
    console.log(`Opening file: ${filename}`);
    
    // Try to open in browser if it's a web file
    if (filename.endsWith('.html') || filename.endsWith('.js') || filename.endsWith('.css')) {
      const tabId = await browserIntegration.openUrl(`file://${filename}`);
      if (tabId) {
        console.log(`Opened ${filename} in browser tab: ${tabId}`);
      }
    }
  };

  // Handle theme changes
  const handleThemeChange = (newTheme: string) => {
    console.log(`Changing theme to: ${newTheme}`);
    setTheme(newTheme);
    
    // Apply theme to document
    document.body.setAttribute('data-theme', newTheme);
  };

  // Performance monitoring
  useEffect(() => {
    const updateMetrics = () => {
      const metrics = performanceMonitoring.getMetrics();
      setPerformanceMetrics(metrics);
    };

    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="comprehensive-terminal-example" data-theme={theme}>
      {/* Performance Dashboard */}
      {performanceMetrics && (
        <div className="performance-dashboard">
          <div className="metric-card">
            <h3>Commands Executed</h3>
            <span className="metric-value">{performanceMetrics.commandCount}</span>
          </div>
          <div className="metric-card">
            <h3>Avg Execution Time</h3>
            <span className="metric-value">{performanceMetrics.averageExecutionTime.toFixed(2)}ms</span>
          </div>
          <div className="metric-card">
            <h3>Memory Usage</h3>
            <span className="metric-value">{performanceMetrics.memoryUsage}%</span>
          </div>
          <div className="metric-card">
            <h3>CPU Usage</h3>
            <span className="metric-value">{performanceMetrics.cpuUsage}%</span>
          </div>
        </div>
      )}

      {/* Debug Status */}
      {isDebugging && (
        <div className="debug-status">
          <span className="debug-indicator">🐛 Debug Mode Active</span>
        </div>
      )}

      {/* Main Terminal Component */}
      <MultiTabTerminal
        onCodeChange={handleCodeChange}
        onFileOpen={handleFileOpen}
        onThemeChange={handleThemeChange}
        className="main-terminal"
      />

      {/* Quick Action Panel */}
      <div className="quick-actions">
        <button
          onClick={() => themeLayoutManager.setActiveTheme('dark')}
          className={`quick-action ${theme === 'dark' ? 'active' : ''}`}
        >
          🌙 Dark Theme
        </button>
        <button
          onClick={() => themeLayoutManager.setActiveTheme('light')}
          className={`quick-action ${theme === 'light' ? 'active' : ''}`}
        >
          ☀️ Light Theme
        </button>
        <button
          onClick={() => themeLayoutManager.setActiveTheme('monokai')}
          className={`quick-action ${theme === 'monokai' ? 'active' : ''}`}
        >
          🎨 Monokai
        </button>
        <button
          onClick={async () => {
            const tabId = await browserIntegration.openUrl('http://localhost:3000');
            if (tabId) {
              await browserIntegration.startDebugSession(tabId);
            }
          }}
          className="quick-action"
        >
          🌐 Browser + Debug
        </button>
        <button
          onClick={() => {
            const data = sessionPersistence.exportSessionData({
              includeHistory: true,
              includePerformance: true,
              includeSettings: true,
              format: 'json'
            });
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `terminal-session-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="quick-action"
        >
          💾 Export Session
        </button>
        <button
          onClick={() => {
            const history = commandHistoryService.getRecent(10);
            console.log('Recent commands:', history);
          }}
          className="quick-action"
        >
          📋 Show History
        </button>
      </div>

      {/* Layout Presets */}
      <div className="layout-presets">
        <h4>Layout Presets</h4>
        <button onClick={() => themeLayoutManager.setActiveLayout('single')}>
          Single Terminal
        </button>
        <button onClick={() => themeLayoutManager.setActiveLayout('split-horizontal')}>
          Horizontal Split
        </button>
        <button onClick={() => themeLayoutManager.setActiveLayout('split-vertical')}>
          Vertical Split
        </button>
        <button onClick={() => themeLayoutManager.setActiveLayout('grid')}>
          Terminal Grid
        </button>
        <button onClick={() => themeLayoutManager.setActiveLayout('minimal')}>
          Minimal
        </button>
      </div>
    </div>
  );
};

export default ComprehensiveTerminalExample;