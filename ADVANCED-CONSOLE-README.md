# Advanced Console Implementation

A comprehensive, feature-rich console component for React applications with advanced capabilities including multi-tab support, syntax highlighting, intelligent auto-completion, and extensive customization options.

## 🚀 Features

### Core Features
- ✅ **Multi-Tab Support** - Create, manage, and switch between multiple console tabs
- ✅ **Syntax Highlighting** - Support for 16+ programming languages with customizable themes
- ✅ **Intelligent Auto-Completion** - Smart command suggestions with fuzzy matching
- ✅ **Advanced Search & Filtering** - Powerful search with regex support and multiple filters
- ✅ **Keyboard Shortcuts** - 25+ customizable shortcuts for efficient navigation
- ✅ **Customizable Themes** - 6 built-in themes plus custom theme support
- ✅ **Persistent History** - Command history with localStorage persistence
- ✅ **Performance Monitoring** - Real-time performance metrics and analytics
- ✅ **Security Features** - Input sanitization, XSS/SQL injection detection, access controls
- ✅ **Session Management** - Export/import sessions in multiple formats

### Advanced Features
- 🎨 **Theme System** - Dark, Light, Monokai, Solarized, Dracula, Nord
- 📊 **Analytics** - Track commands, errors, and performance metrics
- 🔒 **Security** - Role-based access control and audit logging
- 💾 **Export/Import** - JSON, CSV, and TXT formats
- ⌨️ **Shortcuts** - Fully customizable keyboard shortcuts
- 🔍 **Search** - Text search with highlighting and regex support
- 📝 **History** - Persistent command history with statistics
- 🎯 **Auto-Complete** - Context-aware suggestions

## 📦 Installation

```bash
# Install dependencies
npm install lucide-react

# Copy the files to your project
cp -r src/types/console.types.ts your-project/src/types/
cp -r src/services/* your-project/src/services/
cp -r src/components/AdvancedConsole.tsx your-project/src/components/
```

## 🎯 Quick Start

### Basic Usage

```typescript
import React from 'react';
import AdvancedConsole from './components/AdvancedConsole';

function App() {
  const handleCommand = async (command: string) => {
    console.log('Executing command:', command);
    
    // Process your command here
    if (command === 'help') {
      // Show help
    } else if (command.startsWith('npm')) {
      // Handle npm commands
    }
  };

  return (
    <div className="h-screen p-4">
      <AdvancedConsole
        onCommand={handleCommand}
        className="h-full"
      />
    </div>
  );
}

export default App;
```

### Adding Logs Programmatically

```typescript
import { ConsoleLogEntry } from './types/console.types';

// Create a log entry
const log: ConsoleLogEntry = {
  id: Date.now().toString(),
  timestamp: Date.now(),
  level: 'info',
  message: 'Application started successfully',
  source: 'app',
  tags: ['startup', 'system'],
};

// Add to console (implementation depends on your state management)
```

## 🎨 Themes

The console comes with 6 built-in themes:

- **Dark** (default) - Classic dark theme
- **Light** - Clean light theme
- **Monokai** - Popular Monokai color scheme
- **Solarized** - Solarized dark theme
- **Dracula** - Dracula color scheme
- **Nord** - Nord color palette

### Changing Themes

```typescript
import { themeLayoutManager } from './services/themeLayoutManager';

// Change theme
themeLayoutManager.setTheme('dracula');

// Create custom theme
const customTheme = {
  name: 'custom',
  colors: { /* ... */ },
  fonts: { /* ... */ },
  spacing: { /* ... */ },
};
themeLayoutManager.addCustomTheme(customTheme);
```

## ⌨️ Keyboard Shortcuts

### Default Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Clear console |
| `Ctrl+L` | Focus input |
| `Ctrl+F` | Search logs |
| `Ctrl+T` | New tab |
| `Ctrl+W` | Close tab |
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab` | Previous tab |
| `Ctrl+Shift+C` | Copy output |
| `Ctrl+Shift+S` | Export session |
| `↑` / `↓` | Navigate history |
| `Tab` | Auto-complete |
| `F1` | Show help |
| `F11` | Toggle fullscreen |

## 🔍 Search & Filtering

### Basic Search

```typescript
// Search in console
// Type Ctrl+F and enter your search query

// Programmatic search
import { searchFilterService } from './services/searchFilterService';

const results = searchFilterService.searchLogs(logs, {
  levels: ['error', 'warn'],
  searchQuery: 'failed',
  caseSensitive: false,
  includeStackTrace: true,
});
```

### Advanced Filtering

```typescript
const filter = {
  levels: ['error', 'warn', 'info'],
  searchQuery: 'network',
  dateRange: {
    start: Date.now() - 3600000, // Last hour
    end: Date.now(),
  },
  sources: ['api', 'database'],
  tags: ['critical'],
  regex: '\\berror\\b',
  caseSensitive: false,
  includeStackTrace: true,
};

const results = searchFilterService.searchLogs(logs, filter);
```

## 💾 Session Management

### Export Session

```typescript
import { sessionDataService } from './services/sessionDataService';

// Export as JSON
sessionDataService.downloadSession('json');

// Export as CSV
sessionDataService.downloadSession('csv');

// Export as TXT
sessionDataService.downloadSession('txt');
```

### Import Session

```typescript
// Import from JSON
const jsonData = '{ "id": "...", "name": "...", ... }';
sessionDataService.importSession(jsonData);

// Or use the UI import button
```

## 📊 Performance Monitoring

```typescript
import { performanceAnalyticsService } from './services/performanceAnalyticsService';

// Get current metrics
const metrics = performanceAnalyticsService.getMetrics();
console.log('Command count:', metrics.commandCount);
console.log('Error count:', metrics.errorCount);
console.log('Average execution time:', metrics.averageExecutionTime);

// Get performance report
const report = performanceAnalyticsService.getPerformanceReport();
console.log(report);

// Track custom performance
await performanceAnalyticsService.measureAsync('fetchData', async () => {
  return await fetch('/api/data');
});
```

## 🔒 Security

### Input Sanitization

```typescript
import { securityService } from './services/securityService';

// Validate command
const validation = securityService.validateCommand(userInput);
if (!validation.valid) {
  console.error('Blocked:', validation.reason);
  return;
}

// Sanitize input
const sanitized = securityService.sanitizeInput(userInput);

// Detect threats
if (securityService.detectXSS(input)) {
  console.warn('XSS detected');
}

if (securityService.detectSQLInjection(input)) {
  console.warn('SQL injection detected');
}
```

### Access Control

```typescript
// Set user role
securityService.setRole('developer');

// Check permission
if (securityService.hasPermission('write')) {
  // Allow write operation
}

// Configure security
securityService.updateConfig({
  enableInputSanitization: true,
  allowedCommands: ['npm', 'git', 'ls'],
  blockedCommands: ['rm -rf /', 'format'],
  enableAccessControl: true,
});
```

## 🎯 Auto-Completion

The console provides intelligent auto-completion for:
- Commands (npm, git, etc.)
- JavaScript/TypeScript keywords
- Built-in functions
- Environment variables
- Recent commands
- Custom commands

### Register Custom Commands

```typescript
import { autoCompleteService } from './services/autoCompleteService';

autoCompleteService.registerCommand({
  value: 'deploy',
  label: 'deploy',
  description: 'Deploy application to production',
  type: 'command',
  score: 100,
  metadata: { args: ['staging', 'production'] },
});
```

## 📝 Command History

```typescript
import { commandHistoryService } from './services/commandHistoryService';

// Get recent commands
const recent = commandHistoryService.getRecent(10);

// Search history
const results = commandHistoryService.search('install', {
  caseSensitive: false,
  limit: 20,
});

// Get most used commands
const mostUsed = commandHistoryService.getMostUsed(5);

// Get statistics
const stats = commandHistoryService.getStatistics();
console.log('Total commands:', stats.total);
console.log('Unique commands:', stats.unique);
console.log('Success rate:', stats.successRate);
```

## 🎨 Customization

### Layout Configuration

```typescript
import { themeLayoutManager } from './services/themeLayoutManager';

themeLayoutManager.updateLayout({
  mode: 'tabs', // 'tabs' | 'split' | 'stacked' | 'floating'
  showLineNumbers: true,
  showTimestamps: true,
  wordWrap: true,
  fontSize: 14,
});
```

### Custom Theme

```typescript
const myTheme = {
  name: 'my-theme',
  colors: {
    background: '#1a1a1a',
    foreground: '#ffffff',
    selection: '#264f78',
    cursor: '#aeafad',
    border: '#3e3e42',
    log: '#d4d4d4',
    info: '#4fc1ff',
    warn: '#ffd700',
    error: '#f48771',
    debug: '#b267e6',
    success: '#89d185',
    system: '#c586c0',
    timestamp: '#858585',
    lineNumber: '#858585',
  },
  fonts: {
    family: "'Fira Code', monospace",
    size: 14,
    lineHeight: 1.5,
  },
  spacing: {
    padding: 16,
    lineSpacing: 4,
  },
};

themeLayoutManager.addCustomTheme(myTheme);
themeLayoutManager.setTheme('my-theme');
```

## 📚 API Reference

For detailed API documentation, see [ADVANCED-CONSOLE-DOCUMENTATION.md](./ADVANCED-CONSOLE-DOCUMENTATION.md)

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm test -- --coverage
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Inspired by modern developer tools and IDEs
- Built with React, TypeScript, and Tailwind CSS
- Icons by Lucide React

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check the documentation
- Contact the development team

---

**Built with ❤️ for developers**

