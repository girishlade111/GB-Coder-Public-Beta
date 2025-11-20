import React, { useState, useCallback, useEffect } from 'react';
import { Code2 } from 'lucide-react';
import NavigationBar from './components/NavigationBar';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import ConsolePanel from './components/ConsolePanel';
import ComprehensiveTerminal from './components/ComprehensiveTerminal';
import SnippetManager from './components/SnippetManager';
import AISuggestionPanel from './components/AISuggestionPanel';
import GeminiCodeAssistant from './components/GeminiCodeAssistant';
import AIEnhancementPopup from './components/AIEnhancementPopup';

import CodeHistoryPage from './components/history/CodeHistoryPage';
import AboutPage from './components/pages/AboutPage';
import SaveStatusIndicator from './components/ui/SaveStatusIndicator';
import Footer from './components/ui/Footer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useCodeHistory } from './hooks/useCodeHistory';
import { useAutoSave } from './hooks/useAutoSave';
import { useFileUpload } from './hooks/useFileUpload';
import { useTheme } from './hooks/useTheme';
import { downloadAsZip } from './utils/downloadUtils';
import { generateAISuggestions } from './utils/aiSuggestions';
import { CodeSnippet, ConsoleLog, AISuggestion, EditorLanguage, AICodeSuggestion } from './types';
import { geminiEnhancementService } from './services/geminiEnhancementService';

type AppView = 'editor' | 'history' | 'about';

const defaultHTML = `<div class="container">
</div>`;

const defaultCSS = `.container {
}`;

const defaultJS = ``;

function App() {
  const [html, setHtml] = useState(defaultHTML);
  const [css, setCss] = useState(defaultCSS);
  const [javascript, setJavascript] = useState(defaultJS);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const { theme, isDark, setTheme, toggleTheme } = useTheme();
  const [snippets, setSnippets] = useLocalStorage<CodeSnippet[]>('gb-coder-snippets', []);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [autoSaveEnabled, setAutoSaveEnabled] = useLocalStorage('gb-coder-autosave-enabled', true);
  const [showGeminiAssistant, setShowGeminiAssistant] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('editor');

  // AI Enhancement states
  const [aiPopupOpen, setAiPopupOpen] = useState(false);
  const [aiPopupLanguage, setAiPopupLanguage] = useState<EditorLanguage>('html');
  const [aiPopupCode, setAiPopupCode] = useState('');
  const [aiLoadingStates, setAiLoadingStates] = useState<Record<EditorLanguage, boolean>>({
    html: false,
    css: false,
    javascript: false
  });

  // Code history for undo/redo functionality
  const codeHistory = useCodeHistory({ html, css, javascript });

  // Auto-save functionality (local storage only)
  const autoSave = useAutoSave({
    html,
    css,
    javascript,
    interval: 30000, // 30 seconds
    enabled: autoSaveEnabled,
  });

  // File upload functionality
  const fileUpload = useFileUpload({
    onHtmlUpload: (content, filename) => {
      codeHistory.saveState({ html, css, javascript }, `Loaded ${filename}`);
      setHtml(content);
      console.log(`Loaded HTML from ${filename}`);
    },
    onCssUpload: (content, filename) => {
      codeHistory.saveState({ html, css, javascript }, `Loaded ${filename}`);
      setCss(content);
      console.log(`Loaded CSS from ${filename}`);
    },
    onJsUpload: (content, filename) => {
      codeHistory.saveState({ html, css, javascript }, `Loaded ${filename}`);
      setJavascript(content);
      console.log(`Loaded JavaScript from ${filename}`);
    },
    onMultipleUpload: (files) => {
      codeHistory.saveState({ html, css, javascript }, `Loaded ${files.length} files`);

      files.forEach(file => {
        switch (file.language) {
          case 'html':
            setHtml(file.content);
            break;
          case 'css':
            setCss(file.content);
            break;
          case 'javascript':
            setJavascript(file.content);
            break;
        }
      });

      console.log(`Loaded ${files.length} files:`, files.map(f => f.filename).join(', '));
    }
  });

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for navigation events - removed duplicate listener

  // Handle navigation events
  React.useEffect(() => {
    const handleNavigateToAbout = () => {
      setCurrentView('about');
    };

    window.addEventListener('navigate-to-about', handleNavigateToAbout);
    return () => window.removeEventListener('navigate-to-about', handleNavigateToAbout);
  }, []);

  // Generate AI suggestions when code changes
  useEffect(() => {
    const generateSuggestions = () => {
      const htmlSuggestions = generateAISuggestions(html, 'html');
      const cssSuggestions = generateAISuggestions(css, 'css');
      const jsSuggestions = generateAISuggestions(javascript, 'javascript');

      const allSuggestions = [...htmlSuggestions, ...cssSuggestions, ...jsSuggestions]
        .filter(suggestion => !dismissedSuggestions.has(suggestion.id));

      setAiSuggestions(allSuggestions);
    };

    // Debounce suggestion generation
    const timeoutId = setTimeout(generateSuggestions, 1000);
    return () => clearTimeout(timeoutId);
  }, [html, css, javascript, dismissedSuggestions]);

  const handleConsoleLog = useCallback((log: ConsoleLog) => {
    setConsoleLogs(prev => [...prev, log]);
  }, []);

  const clearConsoleLogs = () => {
    setConsoleLogs([]);
  };

  const handleCommand = (command: string) => {
    const [cmd, ...args] = command.toLowerCase().split(' ');

    switch (cmd) {
      case 'run':
        setConsoleLogs([]);
        console.log('Preview refreshed');
        break;
      case 'clear':
        clearConsoleLogs();
        console.log('Console cleared');
        break;
      case 'download':
        downloadAsZip(html, css, javascript);
        console.log('Code downloaded as ZIP');
        break;
      case 'theme':
        const newTheme = args[0] === 'light' ? 'light' : 'dark';
        setTheme(newTheme);
        console.log(`Theme changed to ${newTheme}`);
        break;
      case 'toggle':
        if (args[0] === 'theme') {
          toggleTheme();
          console.log(`Theme toggled to ${theme === 'dark' ? 'light' : 'dark'}`);
        }
        break;
      case 'history':
        setCurrentView('history');
        console.log('Switched to code history view');
        break;
      case 'editor':
        setCurrentView('editor');
        console.log('Switched to editor view');
        break;
      case 'about':
        setCurrentView('about');
        console.log('Switched to about page');
        break;
      case 'ai':
        if (args[0] === 'toggle') {
          setShowAISuggestions(!showAISuggestions);
          console.log(`AI suggestions ${!showAISuggestions ? 'enabled' : 'disabled'}`);
        } else if (args[0] === 'assistant') {
          setShowGeminiAssistant(!showGeminiAssistant);
          console.log(`Gemini assistant ${!showGeminiAssistant ? 'opened' : 'closed'}`);
        } else {
          console.log('AI commands: ai toggle, ai assistant');
        }
        break;
      case 'autosave':
        if (args[0] === 'toggle') {
          setAutoSaveEnabled(!autoSaveEnabled);
          console.log(`Auto-save ${!autoSaveEnabled ? 'enabled' : 'disabled'}`);
        } else {
          console.log('Auto-save commands: autosave toggle');
        }
        break;
      default:
        console.log(`Unknown command: ${cmd}`);
        console.log('Available commands: run, clear, download, theme [dark|light], toggle theme, history, editor, ai toggle/assistant, autosave toggle');
    }
  };

  const saveSnippet = (
    name: string,
    htmlCode: string,
    cssCode: string,
    jsCode: string,
    description?: string,
    tags?: string[],
    category?: string
  ) => {
    const snippet: CodeSnippet = {
      id: Date.now().toString(),
      name,
      description,
      html: htmlCode,
      css: cssCode,
      javascript: jsCode,
      createdAt: new Date().toISOString(),
      tags,
      category,
    };
    setSnippets(prev => [...prev, snippet]);
  };

  const updateSnippet = (id: string, updates: Partial<CodeSnippet>) => {
    setSnippets(prev => prev.map(snippet =>
      snippet.id === id
        ? { ...snippet, ...updates, updatedAt: new Date().toISOString() }
        : snippet
    ));
  };

  const loadSnippet = (snippet: CodeSnippet) => {
    codeHistory.saveState({ html, css, javascript }, `Loaded snippet: ${snippet.name}`);

    setHtml(snippet.html);
    setCss(snippet.css);
    setJavascript(snippet.javascript);
    setConsoleLogs([]);
  };



  const loadSnippetByName = (name: string) => {
    const snippet = snippets.find(s => s.name === name);
    if (snippet) {
      loadSnippet(snippet);
    }
  };

  const deleteSnippet = (id: string) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
  };

  const resetCode = () => {
    codeHistory.saveState({ html, css, javascript }, 'Reset to default');

    setHtml(defaultHTML);
    setCss(defaultCSS);
    setJavascript(defaultJS);
    setConsoleLogs([]);
    setDismissedSuggestions(new Set());
  };

  const handleApplySuggestion = (suggestion: AISuggestion) => {
    console.log(`Applied suggestion: ${suggestion.title}`);
    setDismissedSuggestions(prev => new Set([...prev, suggestion.id]));
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
  };

  // AI Enhancement handlers
  const handleAISuggest = (language: EditorLanguage) => {
    let code = '';
    switch (language) {
      case 'html':
        code = html;
        break;
      case 'css':
        code = css;
        break;
      case 'javascript':
        code = javascript;
        break;
    }

    if (!code.trim()) {
      console.log(`No ${language} code to enhance`);
      return;
    }

    setAiLoadingStates(prev => ({ ...prev, [language]: true }));
    setAiPopupLanguage(language);
    setAiPopupCode(code);
    setAiPopupOpen(true);
  };

  const handleAIEnhancementApply = (enhancedCode: string) => {
    codeHistory.saveState({ html, css, javascript }, `AI enhanced ${aiPopupLanguage}`);

    switch (aiPopupLanguage) {
      case 'html':
        setHtml(enhancedCode);
        break;
      case 'css':
        setCss(enhancedCode);
        break;
      case 'javascript':
        setJavascript(enhancedCode);
        break;
    }

    setAiLoadingStates(prev => ({ ...prev, [aiPopupLanguage]: false }));
  };

  const handleAIPartialApply = (suggestions: AICodeSuggestion[]) => {
    codeHistory.saveState({ html, css, javascript }, `AI applied ${suggestions.length} suggestions`);

    const currentCode = getCurrentCodeForLanguage(aiPopupLanguage);
    const enhancedCode = geminiEnhancementService.applyPartialSuggestions(currentCode, suggestions);

    switch (aiPopupLanguage) {
      case 'html':
        setHtml(enhancedCode);
        break;
      case 'css':
        setCss(enhancedCode);
        break;
      case 'javascript':
        setJavascript(enhancedCode);
        break;
    }

    setAiLoadingStates(prev => ({ ...prev, [aiPopupLanguage]: false }));
  };

  const handleAIPopupClose = () => {
    setAiPopupOpen(false);
    setAiLoadingStates(prev => ({ ...prev, [aiPopupLanguage]: false }));
  };

  const handleUndo = () => {
    const previousState = codeHistory.undo();
    if (previousState) {
      setHtml(previousState.html);
      setCss(previousState.css);
      setJavascript(previousState.javascript);
      console.log('Undid last change');
    }
  };

  const handleRedo = () => {
    const nextState = codeHistory.redo();
    if (nextState) {
      setHtml(nextState.html);
      setCss(nextState.css);
      setJavascript(nextState.javascript);
      console.log('Redid last change');
    }
  };

  const handleCodeChange = (html: string, css: string, js: string) => {
    setHtml(html);
    setCss(css);
    setJavascript(js);
  };

  const handleCodeUpdate = (language: EditorLanguage, code: string) => {
    codeHistory.saveState({ html, css, javascript }, `AI updated ${language}`);

    switch (language) {
      case 'html':
        setHtml(code);
        break;
      case 'css':
        setCss(code);
        break;
      case 'javascript':
        setJavascript(code);
        break;
    }
  };

  const getCurrentCode = () => ({ html, css, javascript });
  const getSnippets = () => snippets;

  const getCurrentCodeForLanguage = (language: EditorLanguage): string => {
    switch (language) {
      case 'html': return html;
      case 'css': return css;
      case 'javascript': return javascript;
      default: return '';
    }
  };

  const handleManualSave = async () => {
    const { error } = await autoSave.manualSave();
    if (error) {
      console.error('Save failed:', error);
    } else {
      console.log('Code saved successfully');
    }
  };

  // Render about page
  if (currentView === 'about') {
    return (
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
        <NavigationBar
          onAutoSaveToggle={() => setAutoSaveEnabled(!autoSaveEnabled)}
          onSnippetsToggle={() => setShowSnippets(!showSnippets)}
          onRun={() => handleCommand('run')}
          onReset={resetCode}
          onImport={fileUpload.uploadFiles}
          onExport={() => downloadAsZip(html, css, javascript)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onAIAssistantToggle={() => setShowGeminiAssistant(!showGeminiAssistant)}
          onAISuggestionsToggle={() => setShowAISuggestions(!showAISuggestions)}
          canUndo={codeHistory.canUndo}
          canRedo={codeHistory.canRedo}
          autoSaveEnabled={autoSaveEnabled}
          aiAssistantOpen={showGeminiAssistant}
          aiSuggestionsOpen={showAISuggestions}
          customActions={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('editor')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Back to Editor
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                History
              </button>
            </div>
          }
        />
        <div className="flex-1">
          <AboutPage />
        </div>
        <Footer />
      </div>
    );
  }

  // Render history view
  if (currentView === 'history') {
    return (
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
        <NavigationBar
          onAutoSaveToggle={() => setAutoSaveEnabled(!autoSaveEnabled)}
          onSnippetsToggle={() => setShowSnippets(!showSnippets)}
          onRun={() => handleCommand('run')}
          onReset={resetCode}
          onImport={fileUpload.uploadFiles}
          onExport={() => downloadAsZip(html, css, javascript)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onAIAssistantToggle={() => setShowGeminiAssistant(!showGeminiAssistant)}
          onAISuggestionsToggle={() => setShowAISuggestions(!showAISuggestions)}
          canUndo={codeHistory.canUndo}
          canRedo={codeHistory.canRedo}
          autoSaveEnabled={autoSaveEnabled}
          aiAssistantOpen={showGeminiAssistant}
          aiSuggestionsOpen={showAISuggestions}
          customActions={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('editor')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Back to Editor
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                History
              </button>
            </div>
          }
        />
        <div className="flex-1">
          <CodeHistoryPage />
        </div>
        <Footer />
      </div>
    );
  }

  // Render main editor view
  return (
    <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
      {/* Navigation Bar */}
      <NavigationBar
        onAutoSaveToggle={() => setAutoSaveEnabled(!autoSaveEnabled)}
        onSnippetsToggle={() => setShowSnippets(!showSnippets)}
        onRun={() => handleCommand('run')}
        onReset={resetCode}
        onImport={fileUpload.uploadFiles}
        onExport={() => downloadAsZip(html, css, javascript)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onAIAssistantToggle={() => setShowGeminiAssistant(!showGeminiAssistant)}
        onAISuggestionsToggle={() => setShowAISuggestions(!showAISuggestions)}
        canUndo={codeHistory.canUndo}
        canRedo={codeHistory.canRedo}
        autoSaveEnabled={autoSaveEnabled}
        aiAssistantOpen={showGeminiAssistant}
        aiSuggestionsOpen={showAISuggestions}
        customActions={
          <div className="flex items-center gap-4">
            <SaveStatusIndicator
              lastSaveTime={autoSave.lastSaveTime}
              isSaving={autoSave.isSaving}
              onManualSave={handleManualSave}
              autoSaveEnabled={autoSaveEnabled}
            />
            <button
              onClick={() => setCurrentView('history')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              History
            </button>
          </div>
        }
      />

      {/* Main Content */}
      <div className="flex-1 px-2 sm:px-4 lg:px-6 py-6">
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} h-full`}>
          {/* Left Panel - Editors */}
          <div className="flex flex-col space-y-4 w-full">
            <EditorPanel
              title="HTML"
              language="html"
              value={html}
              onChange={setHtml}
              icon={<Code2 className="w-4 h-4 text-orange-400" />}
              onAISuggest={() => handleAISuggest('html')}
              isAILoading={aiLoadingStates.html}
            />

            <EditorPanel
              title="CSS"
              language="css"
              value={css}
              onChange={setCss}
              icon={<Code2 className="w-4 h-4 text-blue-400" />}
              onAISuggest={() => handleAISuggest('css')}
              isAILoading={aiLoadingStates.css}
            />

            <EditorPanel
              title="JavaScript"
              language="javascript"
              value={javascript}
              onChange={setJavascript}
              icon={<Code2 className="w-4 h-4 text-yellow-400" />}
              onAISuggest={() => handleAISuggest('javascript')}
              isAILoading={aiLoadingStates.javascript}
            />
          </div>

          {/* Right Panel - Preview, Console, and Gemini Assistant */}
          <div className="flex flex-col space-y-4 w-full">
            <PreviewPanel
              html={html}
              css={css}
              javascript={javascript}
              onConsoleLog={handleConsoleLog}
            />

            <ConsolePanel
              logs={consoleLogs}
              onClear={clearConsoleLogs}
            />

            {/* Gemini Assistant */}
            {showGeminiAssistant && (
              <GeminiCodeAssistant
                currentCode={{ html, css, javascript }}
                onCodeUpdate={handleCodeUpdate}
                onClose={() => setShowGeminiAssistant(false)}
              />
            )}

            {/* AI Suggestions Panel */}
            {showAISuggestions && aiSuggestions.length > 0 && (
              <AISuggestionPanel
                suggestions={aiSuggestions}
                onApplySuggestion={handleApplySuggestion}
                onDismiss={handleDismissSuggestion}
              />
            )}

            {/* Snippets Panel */}
            {showSnippets && (
              <SnippetManager
                snippets={snippets}
                onSave={saveSnippet}
                onLoad={loadSnippet}
                onDelete={deleteSnippet}
                onUpdate={updateSnippet}
                currentCode={{ html, css, javascript }}
              />
            )}
          </div>
        </div>

        {/* Comprehensive Terminal */}
        <div className="mt-6">
          <ComprehensiveTerminal
            onCodeChange={(code, language) => {
              switch (language) {
                case 'html':
                  handleCodeChange(code, css, javascript);
                  break;
                case 'css':
                  handleCodeChange(html, code, javascript);
                  break;
                case 'javascript':
                  handleCodeChange(html, css, code);
                  break;
              }
            }}
            onFileOpen={(filename) => console.log(`Opening file: ${filename}`)}
            onThemeChange={(themeId) => setTheme(themeId as 'light' | 'dark')}
          />
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* AI Enhancement Popup */}
      <AIEnhancementPopup
        isOpen={aiPopupOpen}
        onClose={handleAIPopupClose}
        code={aiPopupCode}
        language={aiPopupLanguage}
        onApplyChanges={handleAIEnhancementApply}
        onApplyPartial={handleAIPartialApply}
        onUndo={codeHistory.canUndo ? handleUndo : undefined}
      />
    </div>
  );
}

export default App;