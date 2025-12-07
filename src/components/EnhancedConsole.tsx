import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Terminal, X, Plus, Search, Settings, Download, Copy, Maximize2, Minimize2,
  Filter, Trash2, Pin, AlertCircle, Info,
  AlertTriangle, Bug, Zap, CheckCircle, Eye, EyeOff, Terminal as TerminalIcon,
  Cpu, HardDrive, XCircle, Play, Sparkles
} from 'lucide-react';
import {
  ConsoleLogEntry, ConsoleTab, ConsoleFilter, LogLevel, ConsoleTheme,
  AutoCompleteItem
} from '../types/console.types';
import { ConsoleLog, TerminalState } from '../types';
import { TerminalCommandProcessor } from '../utils/terminalCommands';
import { autoCompleteService } from '../services/autoCompleteService';
import { searchFilterService } from '../services/searchFilterService';
import { commandHistoryService } from '../services/commandHistoryService';
import { performanceAnalyticsService } from '../services/performanceAnalyticsService';
import { securityService } from '../services/securityService';
import { sessionDataService } from '../services/sessionDataService';
import { aiErrorFixService } from '../services/aiErrorFixService';
import AIErrorFixModal from './ui/AIErrorFixModal';
import { ErrorFixResponse } from '../types';

interface EnhancedConsoleProps {
  // Basic props (from current ConsolePanel)
  logs: ConsoleLog[];
  onClear: () => void;

  // HTML/CSS/JS code access for validation & preview
  html: string;
  css: string;
  javascript: string;

  // Optional advanced features
  onCommand?: (command: string) => Promise<void>;
  onApplyErrorFix?: (fixedHtml: string, fixedCss: string, fixedJavascript: string) => void;
  className?: string;
}

type ConsoleMode = 'console' | 'advanced' | 'validator' | 'preview';

interface ValidationResult {
  line?: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  source: 'html' | 'css' | 'js';
}


const EnhancedConsole: React.FC<EnhancedConsoleProps> = ({
  logs,
  onClear,
  html,
  css,
  javascript,
  onCommand,
  onApplyErrorFix,
  className = '',
}) => {
  // Core state
  const [activeMode, setActiveMode] = useState<ConsoleMode>('console');
  const [isExpanded, setIsExpanded] = useState(false);

  // Basic Console state
  const [basicFilter, setBasicFilter] = useState<LogLevel | 'all'>('all');

  // Advanced Console state
  const [tabs, setTabs] = useState<ConsoleTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [command, setCommand] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [autoCompleteItems, setAutoCompleteItems] = useState<AutoCompleteItem[]>([]);
  const [selectedAutoCompleteIndex, setSelectedAutoCompleteIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ConsoleTheme>('dark');

  // Validator state
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [autoValidate, setAutoValidate] = useState(true);

  // Preview Console state
  const [previewMessages, setPreviewMessages] = useState<Array<{
    id: string;
    type: 'log' | 'error' | 'warn' | 'info';
    message: string;
    timestamp: number;
    source?: 'html' | 'css' | 'js';
    line?: number;
  }>>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    memoryUsage: 0,
    domNodes: 0,
    executionTime: 0
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // AI Error Fix state
  const [fixModalOpen, setFixModalOpen] = useState(false);

  const [fixResponse, setFixResponse] = useState<ErrorFixResponse | null>(null);
  const [isFixLoading, setIsFixLoading] = useState(false);

  // Common refs
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Terminal State for Command Processor
  const terminalState = useRef<TerminalState>({
    currentDirectory: '/',
    fileSystem: {},
    environment: {},
    commandHistory: [],
    npmPackages: JSON.parse(localStorage.getItem('gb-coder-npm-packages') || '{}'),
  });

  // Initialize Command Processor
  const commandProcessor = useMemo(() => new TerminalCommandProcessor(
    terminalState.current,
    {
      onThemeChange: () => { }, // Handled by existing theme logic
      onSnippetSave: () => { }, // Handled by existing snippet logic
      onSnippetLoad: () => { }, // Handled by existing snippet logic
      getCurrentCode: () => ({ html, css, javascript }),
      getSnippets: () => [], // Not needed for console commands
    }
  ), [html, css, javascript]);

  // Initialize Advanced Console tabs
  useEffect(() => {
    if (tabs.length === 0) {
      const defaultTab = createTab('Console');
      setTabs([defaultTab]);
      setActiveTabId(defaultTab.id);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [logs, previewMessages, tabs, activeTabId]);

  // Create new tab for Advanced Console
  const createTab = (name: string): ConsoleTab => {
    return {
      id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      logs: [],
      filters: {
        levels: [],
        searchQuery: '',
        caseSensitive: false,
        includeStackTrace: false,
      },
      isPinned: false,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  };

  // Get active tab for Advanced Console
  const activeTab = useMemo(() => {
    return tabs.find(t => t.id === activeTabId);
  }, [tabs, activeTabId]);

  // Get filtered logs for Basic Console
  const filteredBasicLogs = useMemo(() => {
    if (basicFilter === 'all') return logs;
    return logs.filter(log => log.type === basicFilter);
  }, [logs, basicFilter]);

  // Get filtered logs for Advanced Console
  const filteredAdvancedLogs = useMemo(() => {
    if (!activeTab) return [];

    if (searchQuery) {
      const filter: ConsoleFilter = {
        ...activeTab.filters,
        searchQuery,
      };
      const results = searchFilterService.searchLogs(activeTab.logs, filter);
      return results.map(r => r.logEntry);
    }

    return activeTab.logs;
  }, [activeTab, searchQuery]);

  // HTML Validation
  const validateHTML = useCallback((htmlCode: string): ValidationResult[] => {
    const results: ValidationResult[] = [];

    try {
      // Check for unclosed tags
      const openTags = htmlCode.match(/<([a-z][a-z0-9]*)\b[^>]*>/gi) || [];
      const closeTags = htmlCode.match(/<\/([a-z][a-z0-9]*)>/gi) || [];

      const openTagNames = openTags.map(tag => tag.match(/<([a-z][a-z0-9]*)/i)?.[1]).filter(Boolean);
      const closeTagNames = closeTags.map(tag => tag.match(/<\/([a-z][a-z0-9]*)/i)?.[1]).filter(Boolean);

      // Self-closing tags
      const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];

      openTagNames.forEach((tag, index) => {
        if (tag && !selfClosing.includes(tag.toLowerCase())) {
          const openCount = openTagNames.filter(t => t === tag).length;
          const closeCount = closeTagNames.filter(t => t === tag).length;
          if (openCount !== closeCount) {
            const lineNumber = htmlCode.substring(0, index).split('\n').length;
            results.push({
              line: lineNumber,
              severity: 'error',
              message: `Unclosed tag: <${tag}>`,
              source: 'html'
            });
          }
        }
      });

      // Check for missing required attributes
      if (htmlCode.includes('<img') && !htmlCode.match(/<img[^>]+alt=/i)) {
        const lineNumber = htmlCode.split('\n').findIndex(line => line.includes('<img'));
        results.push({
          line: lineNumber + 1,
          severity: 'warning',
          message: 'Image tags should have alt attributes for accessibility',
          source: 'html'
        });
      }

      if (htmlCode.includes('<a') && !htmlCode.match(/<a[^>]+href=/i)) {
        const lineNumber = htmlCode.split('\n').findIndex(line => line.includes('<a'));
        results.push({
          line: lineNumber + 1,
          severity: 'warning',
          message: 'Anchor tags should have href attributes',
          source: 'html'
        });
      }

      // Check for deprecated tags
      const deprecatedTags = ['center', 'font', 'tt', 'strike', 'big'];
      deprecatedTags.forEach(deprecated => {
        const regex = new RegExp(`<${deprecated}[^>]*>`, 'gi');
        const matches = htmlCode.match(regex);
        if (matches) {
          matches.forEach(match => {
            const lineNumber = htmlCode.substring(0, htmlCode.indexOf(match)).split('\n').length;
            results.push({
              line: lineNumber,
              severity: 'warning',
              message: `Deprecated tag: ${match} - consider using modern alternatives`,
              source: 'html'
            });
          });
        }
      });

    } catch (error) {
      results.push({
        severity: 'error',
        message: `HTML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'html'
      });
    }

    return results;
  }, []);

  // CSS Validation
  const validateCSS = useCallback((cssCode: string): ValidationResult[] => {
    const results: ValidationResult[] = [];

    try {
      // Check for unclosed braces
      const openBraces = (cssCode.match(/{/g) || []).length;
      const closeBraces = (cssCode.match(/}/g) || []).length;

      if (openBraces !== closeBraces) {
        const lineNumber = cssCode.split('\n').length;
        results.push({
          line: lineNumber,
          severity: 'error',
          message: 'Unclosed CSS braces - missing closing }',
          source: 'css'
        });
      }

      // Check for missing semicolons
      const rules = cssCode.match(/[^{}]+{[^{}]+}/g) || [];
      rules.forEach((rule) => {
        const declarations = rule.match(/{([^}]+)}/)?.[1];
        if (declarations) {
          const lines = declarations.split('\n').filter(l => l.trim());
          lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.endsWith(';') && !trimmedLine.endsWith('{')) {
              const lineNumber = cssCode.substring(0, cssCode.indexOf(rule)).split('\n').length +
                declarations.substring(0, declarations.indexOf(line)).split('\n').length;
              results.push({
                line: lineNumber,
                severity: 'warning',
                message: `Missing semicolon: ${trimmedLine.substring(0, 30)}...`,
                source: 'css'
              });
            }
          });
        }
      });

      // Check for invalid properties (basic validation)
      const invalidProperties = ['invalid-prop', 'badattribute', 'wrongstyle'];
      invalidProperties.forEach(prop => {
        const regex = new RegExp(`${prop}\\s*:`, 'gi');
        if (regex.test(cssCode)) {
          const lineNumber = cssCode.split('\n').findIndex(line => line.includes(prop));
          results.push({
            line: lineNumber + 1,
            severity: 'warning',
            message: `Potentially invalid CSS property: ${prop}`,
            source: 'css'
          });
        }
      });

    } catch (error) {
      results.push({
        severity: 'error',
        message: `CSS parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'css'
      });
    }

    return results;
  }, []);

  // JavaScript Validation
  const validateJS = useCallback((jsCode: string): ValidationResult[] => {
    const results: ValidationResult[] = [];

    try {
      // Basic syntax check using Function constructor
      new Function(jsCode);
    } catch (error) {
      if (error instanceof Error) {
        // Try to extract line number from error message
        const lineMatch = error.message.match(/line (\d+)/);
        const line = lineMatch ? parseInt(lineMatch[1]) : undefined;

        results.push({
          line,
          severity: 'error',
          message: `Syntax error: ${error.message}`,
          source: 'js'
        });
      }
    }

    // Check for common issues
    if (jsCode.includes('var ')) {
      const varMatches = jsCode.matchAll(/var\s+\w+/g);
      Array.from(varMatches).forEach(match => {
        const lineNumber = jsCode.substring(0, match.index!).split('\n').length;
        results.push({
          line: lineNumber,
          severity: 'warning',
          message: 'Consider using let or const instead of var',
          source: 'js'
        });
      });
    }

    if (jsCode.match(/==(?!=)/g)) {
      const doubleEqualsMatches = jsCode.matchAll(/[^=]==[^=]/g);
      Array.from(doubleEqualsMatches).forEach(match => {
        const lineNumber = jsCode.substring(0, match.index!).split('\n').length;
        results.push({
          line: lineNumber,
          severity: 'warning',
          message: 'Consider using === instead of == for strict equality',
          source: 'js'
        });
      });
    }

    if (jsCode.includes('===') && jsCode.match(/[^=]===[^=]/g)) {
      const tripleEqualsMatches = jsCode.matchAll(/[^=]===[^=]/g);
      Array.from(tripleEqualsMatches).forEach(match => {
        const lineNumber = jsCode.substring(0, match.index!).split('\n').length;
        results.push({
          line: lineNumber,
          severity: 'info',
          message: 'Good use of strict equality (===)',
          source: 'js'
        });
      });
    }

    // Check for console.log in production (if minified)
    if (jsCode.includes('console.log') && jsCode.length > 1000) {
      results.push({
        severity: 'warning',
        message: 'Consider removing console.log statements for production',
        source: 'js'
      });
    }

    return results;
  }, []);

  // Run validation
  const runValidation = useCallback(() => {
    const htmlErrors = validateHTML(html);
    const cssErrors = validateCSS(css);
    const jsErrors = validateJS(javascript);

    const allResults = [...htmlErrors, ...cssErrors, ...jsErrors];
    setValidationResults(allResults);

    return allResults;
  }, [html, css, javascript, validateHTML, validateCSS, validateJS]);

  // Auto-validate when code changes
  useEffect(() => {
    if (autoValidate && activeMode === 'validator') {
      const timer = setTimeout(runValidation, 500);
      return () => clearTimeout(timer);
    }
  }, [html, css, javascript, autoValidate, activeMode, runValidation]);

  // Add message to Preview Console
  const addPreviewMessage = useCallback((msg: Omit<typeof previewMessages[0], 'id' | 'timestamp'>) => {
    setPreviewMessages(prev => [...prev, {
      ...msg,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    }]);
  }, []);

  // Clear Preview Console
  const clearPreviewMessages = () => {
    setPreviewMessages([]);
  };

  // Run code in iframe for Preview Console
  const runPreviewCode = useCallback(() => {
    if (!iframeRef.current) return;

    // Clear previous messages
    clearPreviewMessages();

    // Create complete HTML document
    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>
    // Capture console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    console.log = function(...args) {
      window.parent.postMessage({
        type: 'console',
        level: 'log',
        message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
      }, '*');
      originalLog.apply(console, args);
    };

    console.error = function(...args) {
      window.parent.postMessage({
        type: 'console',
        level: 'error',
        message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
      }, '*');
      originalError.apply(console, args);
    };

    console.warn = function(...args) {
      window.parent.postMessage({
        type: 'console',
        level: 'warn',
        message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
      }, '*');
      originalWarn.apply(console, args);
    };

    console.info = function(...args) {
      window.parent.postMessage({
        type: 'console',
        level: 'info',
        message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
      }, '*');
      originalInfo.apply(console, args);
    };

    // Capture errors
    window.onerror = function(message, source, lineno, colno, error) {
      window.parent.postMessage({
        type: 'console',
        level: 'error',
        message: message + ' (Line: ' + lineno + ')',
        source: 'js',
        line: lineno
      }, '*');
      return false;
    };

    // Performance monitoring
    window.addEventListener('load', function() {
      const loadTime = performance.now();
      window.parent.postMessage({
        type: 'performance',
        data: {
          loadTime: loadTime,
          memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0,
          domNodes: document.querySelectorAll('*').length
        }
      }, '*');
    });

    // Network request monitoring
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const startTime = Date.now();
      return originalFetch.apply(this, args).then(response => {
        const duration = Date.now() - startTime;
        window.parent.postMessage({
          type: 'network',
          data: {
            url: args[0],
            method: 'GET',
            status: response.status,
            duration: duration,
            timestamp: startTime
          }
        }, '*');
        return response;
      });
    };

    // Run user code
    try {
      ${javascript}
    } catch (error) {
      window.parent.postMessage({
        type: 'console',
        level: 'error',
        message: 'Runtime error: ' + error.message,
        source: 'js'
      }, '*');
    }
  </script>
</body>
</html>
    `;

    // Write to iframe
    const iframeDoc = iframeRef.current.contentDocument;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(fullHTML);
      iframeDoc.close();
    }

    addPreviewMessage({ type: 'info', message: '✓ Code executed successfully' });
  }, [html, css, javascript, addPreviewMessage]);

  // Listen for messages from preview iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        addPreviewMessage({
          type: event.data.level,
          message: event.data.message,
          source: event.data.source,
          line: event.data.line,
        });
      } else if (event.data.type === 'performance') {
        setPerformanceMetrics(prev => ({ ...prev, ...event.data.data }));
      } else if (event.data.type === 'network') {
        // setNetworkRequests(prev => [...prev, event.data.data]); // Removed unused state update
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addPreviewMessage]);

  // Advanced Console functions
  const addAdvancedLog = useCallback((log: ConsoleLogEntry) => {
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        return {
          ...tab,
          logs: [...tab.logs, log],
          updatedAt: Date.now(),
        };
      }
      return tab;
    }));

    // Track in analytics
    if (log.level === 'error') {
      performanceAnalyticsService.trackError(new Error(log.message));
    }
  }, [activeTabId]);

  const clearAdvancedLogs = useCallback(() => {
    setTabs(prev => prev.map(tab => {
      if (tab.id === activeTabId) {
        return {
          ...tab,
          logs: [],
          updatedAt: Date.now(),
        };
      }
      return tab;
    }));
  }, [activeTabId]);

  const addAdvancedTab = () => {
    const newTab = createTab(`Console ${tabs.length + 1}`);
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeAdvancedTab = (tabId: string) => {
    if (tabs.length <= 1) return;

    const tabIndex = tabs.findIndex(t => t.id === tabId);
    setTabs(prev => prev.filter(t => t.id !== tabId));

    if (activeTabId === tabId) {
      const newActiveIndex = Math.max(0, tabIndex - 1);
      setActiveTabId(tabs[newActiveIndex]?.id || '');
    }
  };

  // Command handling for Advanced Console
  const handleAdvancedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const trimmedCommand = command.trim();

    // Validate command
    const validation = securityService.validateCommand(trimmedCommand);
    if (!validation.valid) {
      addAdvancedLog({
        id: Date.now().toString(),
        timestamp: Date.now(),
        level: 'error',
        message: `Security: ${validation.reason}`,
      });
      return;
    }

    // Add command to output
    addAdvancedLog({
      id: Date.now().toString(),
      timestamp: Date.now(),
      level: 'system',
      message: `$ ${trimmedCommand}`,
    });

    // Add to history
    commandHistoryService.addCommand(trimmedCommand);
    autoCompleteService.addToHistory(trimmedCommand);

    // Track command
    const startTime = performance.now();

    try {
      // Check if it's an npm command, node command, or other terminal command
      const terminalCommands = ['npm', 'node', 'help', 'ls', 'dir', 'cd', 'mkdir', 'touch', 'cat', 'rm', 'pwd', 'echo', 'env', 'history', 'whoami', 'date', 'version', 'status', 'about', 'fetch', 'run', 'download', 'theme', 'toggle', 'save', 'load'];
      const cmdName = trimmedCommand.split(' ')[0].toLowerCase();

      if (terminalCommands.includes(cmdName)) {
        const results = commandProcessor.processCommand(trimmedCommand);

        results.forEach(result => {
          addAdvancedLog({
            id: result.id,
            timestamp: new Date(result.timestamp).getTime(),
            level: result.type === 'success' ? 'success' : result.type === 'error' ? 'error' : 'info',
            message: result.message,
          });
        });
      } else if (onCommand) {
        await onCommand(trimmedCommand);
      }

      const executionTime = performance.now() - startTime;
      performanceAnalyticsService.trackCommand(trimmedCommand, executionTime, true);
    } catch (error) {
      const executionTime = performance.now() - startTime;
      performanceAnalyticsService.trackCommand(trimmedCommand, executionTime, false);

      addAdvancedLog({
        id: Date.now().toString(),
        timestamp: Date.now(),
        level: 'error',
        message: error instanceof Error ? error.message : 'Command failed',
        stackTrace: error instanceof Error ? error.stack : undefined,
      });
    }

    setCommand('');
    setShowAutoComplete(false);
  };

  // Input handling for Advanced Console
  const handleAdvancedInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCommand(value);

    // Get auto-complete suggestions
    if (value.length >= 2) {
      const suggestions = autoCompleteService.getSuggestions({
        currentInput: value,
        cursorPosition: e.target.selectionStart || value.length,
        history: commandHistoryService.getRecent(20),
        environment: {},
      });
      setAutoCompleteItems(suggestions);
      setShowAutoComplete(suggestions.length > 0);
      setSelectedAutoCompleteIndex(0);
    } else {
      setShowAutoComplete(false);
    }
  };

  const handleAdvancedKeyDown = (e: React.KeyboardEvent) => {
    if (showAutoComplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedAutoCompleteIndex(prev =>
          Math.min(prev + 1, autoCompleteItems.length - 1)
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedAutoCompleteIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        if (autoCompleteItems[selectedAutoCompleteIndex]) {
          e.preventDefault();
          setCommand(autoCompleteItems[selectedAutoCompleteIndex].value);
          setShowAutoComplete(false);
        }
      } else if (e.key === 'Escape') {
        setShowAutoComplete(false);
      }
    } else {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = commandHistoryService.getPrevious();
        if (prev) setCommand(prev);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = commandHistoryService.getNext();
        if (next !== null) setCommand(next);
      }
    }
  };

  // UI Helper functions
  const getLogIcon = (type: ConsoleLog['type'] | LogLevel) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
      case 'debug': return <Bug className="w-4 h-4 text-purple-400" />;
      case 'success': return <Zap className="w-4 h-4 text-green-400" />;
      case 'system': return <TerminalIcon className="w-4 h-4 text-purple-400" />;
      default: return <Terminal className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLogColor = (type: ConsoleLog['type'] | LogLevel) => {
    switch (type) {
      case 'error': return 'text-red-300';
      case 'warn': return 'text-yellow-300';
      case 'info': return 'text-blue-300';
      case 'debug': return 'text-purple-300';
      case 'success': return 'text-green-300';
      case 'system': return 'text-purple-400';
      default: return 'text-gray-300';
    }
  };

  const getValidationIcon = (severity: ValidationResult['severity']) => {
    switch (severity) {
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getValidationColor = (severity: ValidationResult['severity']) => {
    switch (severity) {
      case 'error': return 'text-red-300';
      case 'warning': return 'text-yellow-300';
      case 'info': return 'text-blue-300';
    }
  };

  // Export session for Advanced Console
  const exportAdvancedSession = () => {
    sessionDataService.downloadSession('json');
  };

  // Copy output functions
  const copyBasicOutput = () => {
    const text = filteredBasicLogs.map(log =>
      `[${new Date(log.timestamp).toISOString()}] [${log.type.toUpperCase()}] ${log.message}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  const copyAdvancedOutput = () => {
    const text = filteredAdvancedLogs.map(log =>
      `[${new Date(log.timestamp).toISOString()}] [${log.level.toUpperCase()}] ${log.message}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  const copyValidationResults = () => {
    const text = validationResults.map(result =>
      `[${result.source.toUpperCase()}] ${result.severity.toUpperCase()}${result.line ? ` (Line ${result.line})` : ''}: ${result.message}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  const copyPreviewOutput = () => {
    const text = previewMessages.map(msg =>
      `[${new Date(msg.timestamp).toISOString()}] [${msg.type.toUpperCase()}] ${msg.message}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  // Handle AI error fix
  const handleFixError = async (log: ConsoleLog) => {
    try {
      setIsFixLoading(true);

      setFixModalOpen(true);

      const response = await aiErrorFixService.fixError(
        log.message,
        html,
        css,
        javascript
      );

      setFixResponse(response);
    } catch (error) {
      console.error('Failed to get AI fix suggestion:', error);
      setFixModalOpen(false);
      setIsFixLoading(false);
    } finally {
      setIsFixLoading(false);
    }
  };

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 flex flex-col h-full min-h-0 ${isExpanded ? 'fixed inset-4 z-50' : 'relative'
      } ${className}`}>
      {/* Header */}
      <div className="bg-dark-gray px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <h2 className="text-sm font-medium text-gray-300">GB Console</h2>
          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
            {activeMode === 'console' ? filteredBasicLogs.length :
              activeMode === 'advanced' ? filteredAdvancedLogs.length :
                activeMode === 'validator' ? validationResults.length :
                  previewMessages.length} items
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Search button (Advanced mode) */}
          {activeMode === 'advanced' && (
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
              title="Search (Ctrl+F)"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Settings button (Advanced mode) */}
          {activeMode === 'advanced' && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Auto-validate toggle (Validator mode) */}
          {activeMode === 'validator' && (
            <label className="flex items-center gap-1 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={autoValidate}
                onChange={(e) => setAutoValidate(e.target.checked)}
                className="rounded"
              />
              Auto-validate
            </label>
          )}

          {/* Preview toggle (Preview mode) */}
          {activeMode === 'preview' && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
              title="Toggle Preview"
            >
              {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          )}

          {/* Copy button */}
          <button
            onClick={() => {
              switch (activeMode) {
                case 'console': copyBasicOutput(); break;
                case 'advanced': copyAdvancedOutput(); break;
                case 'validator': copyValidationResults(); break;
                case 'preview': copyPreviewOutput(); break;
              }
            }}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Copy Output"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Clear button */}
          <button
            onClick={() => {
              switch (activeMode) {
                case 'console':
                  onClear();
                  break;
                case 'advanced':
                  clearAdvancedLogs();
                  commandHistoryService.clear();
                  break;
                case 'validator':
                  setValidationResults([]);
                  break;
                case 'preview':
                  clearPreviewMessages();
                  break;
              }
            }}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Clear All"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Run button (Preview mode) */}
          {activeMode === 'preview' && (
            <button
              onClick={runPreviewCode}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center gap-1"
              title="Run Code (Ctrl+Enter)"
            >
              <Play className="w-3 h-3" />
              Run
            </button>
          )}

          {/* Export button (Advanced mode) */}
          {activeMode === 'advanced' && (
            <button
              onClick={exportAdvancedSession}
              className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
              title="Export Session"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Validate button (Validator mode) */}
          {activeMode === 'validator' && (
            <button
              onClick={runValidation}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs flex items-center gap-1"
              title="Validate Now"
            >
              <CheckCircle className="w-3 h-3" />
              Validate
            </button>
          )}

          {/* Expand button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="bg-dark-gray border-b border-gray-700 flex items-center">
        {([
          { key: 'console', label: 'Console', icon: Terminal },
          { key: 'advanced', label: 'Advanced', icon: TerminalIcon },
          { key: 'validator', label: 'Validator', icon: CheckCircle },
          { key: 'preview', label: 'Preview', icon: Play }
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveMode(key)}
            className={`px-4 py-2 text-sm border-r border-gray-700 flex items-center gap-2 ${activeMode === key
              ? 'bg-matte-black text-white'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-750'
              }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Search Bar (Advanced mode) */}
      {activeMode === 'advanced' && showSearch && (
        <div className="bg-dark-gray border-b border-gray-700 p-2">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 outline-none text-sm"
              autoFocus
            />
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearch(false);
              }}
              className="text-gray-400 hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar (Basic Console mode) */}
      {activeMode === 'console' && (
        <div className="bg-dark-gray border-b border-gray-700 p-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400 mr-1">Filter:</span>
            {(['all', 'log', 'info', 'warn', 'error'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setBasicFilter(filter)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${basicFilter === filter
                  ? 'bg-blue-600 text-white shadow-md border border-blue-500'
                  : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                  }`}
              >
                {filter === 'all' ? 'All' : filter.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs (Advanced mode) */}
      {activeMode === 'advanced' && (
        <div className="bg-dark-gray border-b border-gray-700 flex items-center overflow-x-auto">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-3 py-2 border-r border-gray-700 cursor-pointer ${tab.id === activeTabId ? 'bg-matte-black text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              onClick={() => setActiveTabId(tab.id)}
            >
              {tab.isPinned && <Pin className="w-3 h-3" />}
              <span className="text-sm">{tab.name}</span>
              <span className="text-xs bg-gray-700 px-1 rounded">{tab.logs.length}</span>
              {!tab.isPinned && tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeAdvancedTab(tab.id);
                  }}
                  className="hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addAdvancedTab}
            className="p-2 text-gray-400 hover:text-gray-200"
            title="New Tab"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Main Content */}
        <div className={`flex-1 overflow-auto ${activeMode === 'preview' && showPreview ? 'w-1/2' : 'w-full'}`}>

          {/* BASIC CONSOLE MODE */}
          {activeMode === 'console' && (
            <div ref={outputRef} className="bg-matte-black p-4 h-full overflow-y-auto font-mono text-sm">
              {filteredBasicLogs.length === 0 ? (
                <div className="text-gray-500 italic text-center py-8">
                  Console output will appear here...
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredBasicLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 py-1">
                      <span className="text-gray-500 text-xs mt-0.5 flex-shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      {getLogIcon(log.type)}
                      <pre className={`flex-1 whitespace-pre-wrap ${getLogColor(log.type)}`}>
                        {log.message}
                      </pre>
                      {log.type === 'error' && (
                        <button
                          onClick={() => handleFixError(log)}
                          className="flex-shrink-0 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs flex items-center gap-1 transition-colors"
                          title="Fix with AI"
                        >
                          <Sparkles className="w-3 h-3" />
                          Fix with AI
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADVANCED CONSOLE MODE */}
          {activeMode === 'advanced' && (
            <div className="h-full flex flex-col min-h-0 overflow-hidden">
              {/* Settings Panel */}
              {showSettings && (
                <div className="bg-dark-gray border-b border-gray-700 p-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <label className="text-gray-400 block mb-1">Theme</label>
                      <select
                        value={currentTheme}
                        onChange={(e) => setCurrentTheme(e.target.value as ConsoleTheme)}
                        className="w-full bg-gray-700 text-gray-200 rounded px-2 py-1"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="monokai">Monokai</option>
                        <option value="solarized">Solarized</option>
                        <option value="dracula">Dracula</option>
                        <option value="nord">Nord</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Input Area - Fixed at Top */}
              <form onSubmit={handleAdvancedSubmit} className="bg-matte-black border-b border-gray-700 p-2 relative z-20">
                {/* Auto-complete dropdown */}
                {showAutoComplete && autoCompleteItems.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-dark-gray border border-gray-700 rounded-b-lg max-h-48 overflow-y-auto z-30 shadow-lg">
                    {autoCompleteItems.map((item, index) => (
                      <div
                        key={item.value}
                        className={`px-3 py-2 cursor-pointer flex items-center justify-between ${index === selectedAutoCompleteIndex ? 'bg-gray-700' : 'hover:bg-gray-700'
                          }`}
                        onClick={() => {
                          setCommand(item.value);
                          setShowAutoComplete(false);
                          inputRef.current?.focus();
                        }}
                      >
                        <div>
                          <span className="text-gray-200">{item.value}</span>
                          {item.description && (
                            <span className="text-gray-500 text-xs ml-2">{item.description}</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{item.type}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-green-400 font-mono text-sm flex-shrink-0">$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={command}
                    onChange={handleAdvancedInputChange}
                    onKeyDown={handleAdvancedKeyDown}
                    placeholder=""
                    className="flex-1 bg-transparent text-gray-200 outline-none font-mono text-sm border-none p-0 focus:ring-0"
                    autoFocus
                    autoComplete="off"
                  />
                </div>
              </form>

              {/* Output Area */}
              <div
                ref={outputRef}
                className={`bg-matte-black p-4 font-mono overflow-y-auto flex-1 min-h-0 text-sm cursor-text`}
                onClick={() => inputRef.current?.focus()}
              >
                {filteredAdvancedLogs.length === 0 ? (
                  <div className="text-gray-500 italic text-center py-8">
                    Console output will appear here...
                    <br />
                    <span className="text-xs">Type 'help' for available commands</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {[...filteredAdvancedLogs].reverse().map((log) => (
                      <div key={log.id} className="flex items-start gap-2 py-1">
                        <span className="text-gray-500 text-xs mt-0.5 flex-shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        {getLogIcon(log.level)}
                        <pre className={`flex-1 whitespace-pre-wrap ${getLogColor(log.level)}`}>
                          {log.message}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}


                {/* Input Area - Moved inside output stream */}

              </div>

            </div>
          )}

          {/* VALIDATOR MODE */}
          {activeMode === 'validator' && (
            <div className="bg-matte-black p-4 h-full overflow-y-auto">
              {validationResults.length === 0 ? (
                <div className="text-gray-500 italic text-center py-8">
                  No validation issues found.
                  <br />
                  <span className="text-xs">Code validation will appear here...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {validationResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded border-l-4 ${result.severity === 'error' ? 'bg-red-900/20 border-red-400' :
                        result.severity === 'warning' ? 'bg-yellow-900/20 border-yellow-400' :
                          'bg-blue-900/20 border-blue-400'
                        }`}
                    >
                      {getValidationIcon(result.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono bg-gray-700 px-2 py-0.5 rounded">
                            {result.source.toUpperCase()}
                          </span>
                          {result.line && (
                            <span className="text-xs text-gray-400">
                              Line {result.line}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded ${result.severity === 'error' ? 'bg-red-600 text-white' :
                            result.severity === 'warning' ? 'bg-yellow-600 text-white' :
                              'bg-blue-600 text-white'
                            }`}>
                            {result.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className={`font-mono text-sm ${getValidationColor(result.severity)}`}>
                          {result.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PREVIEW CONSOLE MODE */}
          {activeMode === 'preview' && (
            <div ref={outputRef} className="bg-matte-black p-4 h-full overflow-y-auto font-mono text-sm">
              {previewMessages.length === 0 ? (
                <div className="text-gray-500 italic text-center py-8">
                  Console output will appear here...
                  <br />
                  <span className="text-xs">Click Run or enable auto-run</span>
                </div>
              ) : (
                <div className="space-y-1">
                  {previewMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2 py-1">
                      <span className="text-gray-500 text-xs mt-0.5 flex-shrink-0">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                      {getLogIcon(msg.type)}
                      <pre className={`flex-1 whitespace-pre-wrap ${getLogColor(msg.type)}`}>
                        {msg.message}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preview Panel (Preview mode only) */}
        {activeMode === 'preview' && showPreview && (
          <div className="w-1/2 border-l border-gray-700 bg-white flex flex-col">
            <div className="bg-dark-gray px-4 py-2 border-b border-gray-700 text-sm text-gray-300 flex items-center justify-between">
              <span>Live Preview</span>
              <div className="flex items-center gap-2 text-xs">
                <Cpu className="w-3 h-3" />
                <span>{performanceMetrics.loadTime.toFixed(0)}ms</span>
                <HardDrive className="w-3 h-3 ml-2" />
                <span>{(performanceMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
              </div>
            </div>
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0 flex-1"
              title="Preview"
              sandbox="allow-scripts"
            />
          </div>
        )}
      </div>

      {/* AI Error Fix Modal */}
      <AIErrorFixModal
        isOpen={fixModalOpen}
        onClose={() => {
          setFixModalOpen(false);
          setIsFixLoading(false);
        }}
        fixResponse={fixResponse}
        originalCode={{ html, css, javascript }}
        onApplyFix={(fixedHtml, fixedCss, fixedJavascript) => {
          if (onApplyErrorFix) {
            onApplyErrorFix(fixedHtml, fixedCss, fixedJavascript);
          }
          setFixModalOpen(false);
        }}
        isLoading={isFixLoading}
      />
    </div>
  );
};

export default EnhancedConsole;
