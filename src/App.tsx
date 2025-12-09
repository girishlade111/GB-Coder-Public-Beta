import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { Code2, Eye } from 'lucide-react';
// Phase 1: Critical components - loaded immediately (not lazy)
import NavigationBar from './components/NavigationBar';
import EditorPanel from './components/EditorPanel';
import TabbedRightPanel from './components/TabbedRightPanel';
import SaveStatusIndicator from './components/ui/SaveStatusIndicator';
import Footer from './components/ui/Footer';

// Phase 2: High priority - lazy loaded after initial render
const EnhancedConsole = lazy(() => import('./components/EnhancedConsole'));
const AISuggestionPanel = lazy(() => import('./components/AISuggestionPanel'));

// Phase 3: Deferred - lazy loaded after high priority components
const SnippetsSidebar = lazy(() => import('./components/SnippetsSidebar'));
const GeminiCodeAssistant = lazy(() => import('./components/GeminiCodeAssistant'));
const AIEnhancementPopup = lazy(() => import('./components/AIEnhancementPopup'));
const CodeExplanationPopup = lazy(() => import('./components/CodeExplanationPopup'));
const ExternalLibraryManager = lazy(() => import('./components/ExternalLibraryManager'));
const CodeHistoryPage = lazy(() => import('./components/history/CodeHistoryPage'));
const AboutPage = lazy(() => import('./components/pages/AboutPage'));
const DocumentationPage = lazy(() => import('./components/pages/DocumentationPage'));
const PrivacyPolicyPage = lazy(() => import('./components/pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./components/pages/TermsOfServicePage'));
const CookiePolicyPage = lazy(() => import('./components/pages/CookiePolicyPage'));
const DisclaimerPage = lazy(() => import('./components/pages/DisclaimerPage'));
const ContactPage = lazy(() => import('./components/pages/ContactPage'));
const AuthPage = lazy(() => import('./components/pages/AuthPage'));
const ProjectBar = lazy(() => import('./components/ProjectBar'));
const ExtensionsMarketplace = lazy(() => import('./components/ExtensionsMarketplace'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));
const HistoryPanel = lazy(() => import('./components/HistoryPanel'));
const KeyboardShortcutsHelp = lazy(() => import('./components/KeyboardShortcutsHelp'));

import { useLocalStorage } from './hooks/useLocalStorage';
import { useCodeHistory } from './hooks/useCodeHistory';
import { useAutoSave } from './hooks/useAutoSave';
import { useFileUpload } from './hooks/useFileUpload';
import { useTheme } from './hooks/useTheme';
import { useCodeExplanation } from './hooks/useCodeExplanation';
import { useCodeSelection } from './hooks/useCodeSelection';
import { useSelectionOperations } from './hooks/useSelectionOperations';
import { useProject } from './hooks/useProject';
import { useSettings } from './hooks/useSettings';
import { useFocusMode } from './hooks/useFocusMode';
import { useProgressiveLoad } from './hooks/useProgressiveLoad';
import SelectionToolbar from './components/SelectionToolbar';
import SelectionSidebar from './components/SelectionSidebar';
import { downloadAsZip } from './utils/downloadUtils';
import { generateAISuggestions } from './utils/aiSuggestions';
import * as monacoHelper from './utils/monacoSelectionHelper';
import { CodeSnippet, ConsoleLog, AISuggestion, EditorLanguage, AICodeSuggestion, HistoryItem, SnippetType, SnippetScope } from './types';
import { migrateSnippets } from './utils/snippetUtils';
import { aiEnhancementService } from './services/aiEnhancementService';
import { externalLibraryService, ExternalLibrary } from './services/externalLibraryService';
import { formattingService } from './services/formattingService';
import { SelectionOperationType } from './services/selectionOperationsService';


type AppView = 'editor' | 'history' | 'about' | 'documentation' | 'privacy' | 'terms' | 'cookies' | 'disclaimer' | 'contact' | 'auth';

const defaultHTML = `<div class="container">
</div>`;

const defaultCSS = `.container {
}`;

const defaultJS = ``;

function App() {
  // DEBUG: Log component mount
  console.log('[DEBUG] App component mounting');

  // Progressive loading phases
  const { isPhase1Ready, isPhase2Ready, isPhase3Ready } = useProgressiveLoad();

  const [html, setHtml] = useState(defaultHTML);
  const [css, setCss] = useState(defaultCSS);
  const [javascript, setJavascript] = useState(defaultJS);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const { theme, isDark, setTheme, toggleTheme } = useTheme();
  const [snippets, setSnippets] = useLocalStorage<CodeSnippet[]>('gb-coder-snippets', []);
  const [selectionHistory, setSelectionHistory] = useState<HistoryItem[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  // DEBUG: Fix missing type annotation
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 1024);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [showAISuggestions, setShowAISuggestions] = useState<boolean>(true);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  // DEBUG: Fix missing type annotation
  const [autoSaveEnabled, setAutoSaveEnabled] = useLocalStorage<boolean>('gb-coder-autosave-enabled', true);
  const [showGeminiAssistant, setShowGeminiAssistant] = useState<boolean>(false);
  const [showSnippets, setShowSnippets] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<AppView>('editor');
  const [showExternalLibraryManager, setShowExternalLibraryManager] = useState<boolean>(false);
  const [externalLibraries, setExternalLibraries] = useState<ExternalLibrary[]>([]);
  const [showExtensionsMarketplace, setShowExtensionsMarketplace] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(false);

  // Settings
  const { settings, updateSettings, getFontFamilyCSS } = useSettings();

  // Focus Mode
  const { focusMode, toggleFocusMode } = useFocusMode();

  // Project Management
  const project = useProject(html, css, javascript, externalLibraries);

  // AI Enhancement states
  const [aiPopupOpen, setAiPopupOpen] = useState<boolean>(false);
  const [aiPopupLanguage, setAiPopupLanguage] = useState<EditorLanguage>('html');
  const [aiPopupCode, setAiPopupCode] = useState<string>('');
  const [aiLoadingStates, setAiLoadingStates] = useState<Record<EditorLanguage, boolean>>({
    html: false,
    css: false,
    javascript: false
  });

  // Format loading states
  const [formatLoadingStates, setFormatLoadingStates] = useState<Record<EditorLanguage, boolean>>({
    html: false,
    css: false,
    javascript: false
  });


  // Code Explanation hooks - useCodeSelection hook removed as it was unused
  const {
    explanation,
    isLoading: isExplanationLoading,
    explainCode,
    getSimplifiedExplanation,
    getAnnotatedCode,
    clearExplanation
  } = useCodeExplanation();
  const [showExplanationPopup, setShowExplanationPopup] = useState<boolean>(false);

  // Selection operations
  const htmlEditorRef = React.useRef<any>(null);
  const cssEditorRef = React.useRef<any>(null);
  const jsEditorRef = React.useRef<any>(null);
  const { selection, updateSelection, clearSelection, hasSelection } = useCodeSelection();
  const selectionOps = useSelectionOperations();

  // Code history for undo/redo functionality
  const codeHistory = useCodeHistory({ html, css, javascript });

  // Auto-save functionality (project-aware)
  const autoSave = useAutoSave({
    html,
    css,
    javascript,
    interval: 30000, // 30 seconds
    enabled: autoSaveEnabled,
    projectId: project.currentProject?.id, // Make auto-save project-aware
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
    const handleResize = () => {
      console.log('[DEBUG] Resize event - width:', window.innerWidth);
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    console.log('[DEBUG] Resize event listener added');

    return () => {
      window.removeEventListener('resize', handleResize);
      console.log('[DEBUG] Resize event listener removed');
    };
  }, []);

  // Handle navigation events
  React.useEffect(() => {
    const handleNavigateToAbout = () => {
      console.log('[DEBUG] Navigation event: navigate-to-about');
      setCurrentView('about');
    };

    const handleNavigateToDocumentation = () => {
      console.log('[DEBUG] Navigation event: navigate-to-documentation');
      setCurrentView('documentation');
    };

    const handleOpenKeyboardShortcuts = () => {
      console.log('[DEBUG] Opening keyboard shortcuts modal');
      setShowKeyboardShortcuts(true);
    };

    const handleNavigateToPrivacy = () => {
      console.log('[DEBUG] Navigation event: navigate-to-privacy');
      setCurrentView('privacy');
    };

    const handleNavigateToTerms = () => {
      console.log('[DEBUG] Navigation event: navigate-to-terms');
      setCurrentView('terms');
    };

    const handleNavigateToCookies = () => {
      console.log('[DEBUG] Navigation event: navigate-to-cookies');
      setCurrentView('cookies');
    };

    const handleNavigateToDisclaimer = () => {
      console.log('[DEBUG] Navigation event: navigate-to-disclaimer');
      setCurrentView('disclaimer');
    };

    const handleNavigateToContact = () => {
      console.log('[DEBUG] Navigation event: navigate-to-contact');
      setCurrentView('contact');
    };

    const handleNavigateToAuth = () => {
      console.log('[DEBUG] Navigation event: navigate-to-auth');
      setCurrentView('auth');
    };

    window.addEventListener('navigate-to-about', handleNavigateToAbout);
    window.addEventListener('navigate-to-documentation', handleNavigateToDocumentation);
    window.addEventListener('open-keyboard-shortcuts', handleOpenKeyboardShortcuts);
    window.addEventListener('navigate-to-privacy', handleNavigateToPrivacy);
    window.addEventListener('navigate-to-terms', handleNavigateToTerms);
    window.addEventListener('navigate-to-cookies', handleNavigateToCookies);
    window.addEventListener('navigate-to-disclaimer', handleNavigateToDisclaimer);
    window.addEventListener('navigate-to-contact', handleNavigateToContact);
    window.addEventListener('navigate-to-auth', handleNavigateToAuth);
    console.log('[DEBUG] Navigation event listeners added');

    return () => {
      window.removeEventListener('navigate-to-about', handleNavigateToAbout);
      window.removeEventListener('navigate-to-documentation', handleNavigateToDocumentation);
      window.removeEventListener('open-keyboard-shortcuts', handleOpenKeyboardShortcuts);
      window.removeEventListener('navigate-to-privacy', handleNavigateToPrivacy);
      window.removeEventListener('navigate-to-terms', handleNavigateToTerms);
      window.removeEventListener('navigate-to-cookies', handleNavigateToCookies);
      window.removeEventListener('navigate-to-disclaimer', handleNavigateToDisclaimer);
      window.removeEventListener('navigate-to-contact', handleNavigateToContact);
      window.removeEventListener('navigate-to-auth', handleNavigateToAuth);
      console.log('[DEBUG] Navigation event listeners removed');
    };
  }, []);

  // Generate AI suggestions when code changes (deferred to Phase 2)
  useEffect(() => {
    // Don't generate suggestions until Phase 2 is ready
    if (!isPhase2Ready) return;

    const generateSuggestions = () => {
      try {
        console.log('[DEBUG] Generating AI suggestions...');
        console.log('[DEBUG] HTML length:', html.length, 'CSS length:', css.length, 'JS length:', javascript.length);
        console.log('[DEBUG] Dismissed suggestions count:', dismissedSuggestions.size);

        const htmlSuggestions = generateAISuggestions(html, 'html');
        const cssSuggestions = generateAISuggestions(css, 'css');
        const jsSuggestions = generateAISuggestions(javascript, 'javascript');

        console.log('[DEBUG] Generated suggestions - HTML:', htmlSuggestions.length, 'CSS:', cssSuggestions.length, 'JS:', jsSuggestions.length);

        const allSuggestions = [...htmlSuggestions, ...cssSuggestions, ...jsSuggestions]
          .filter(suggestion => !dismissedSuggestions.has(suggestion.id));

        console.log('[DEBUG] Total suggestions after filtering:', allSuggestions.length);
        setAiSuggestions(allSuggestions);
      } catch (error) {
        console.error('[DEBUG] Error generating AI suggestions:', error);
      }
    };

    // Debounce suggestion generation
    const timeoutId = setTimeout(generateSuggestions, 1000);
    return () => clearTimeout(timeoutId);
  }, [html, css, javascript, dismissedSuggestions, isPhase2Ready]);

  // Load external libraries on component mount (deferred to Phase 3)
  useEffect(() => {
    // Don't load libraries until Phase 3 is ready
    if (!isPhase3Ready) return;

    try {
      console.log('[DEBUG] Loading external libraries...');

      if (!externalLibraryService) {
        console.error('[DEBUG] externalLibraryService is undefined');
        return;
      }

      const libraries = externalLibraryService.getLibraries();
      console.log('[DEBUG] Loaded libraries:', libraries.length, libraries);
      setExternalLibraries(libraries);
    } catch (error) {
      console.error('[DEBUG] Error loading external libraries:', error);
      // Set empty array as fallback to prevent crashes
      setExternalLibraries([]);
    }
  }, [isPhase3Ready]);


  // Migrate snippets to new format with type and scope (deferred to Phase 3)
  useEffect(() => {
    // Don't migrate snippets until Phase 3 is ready
    if (!isPhase3Ready) return;

    const migratedSnippets = migrateSnippets(snippets);
    // Only update if migration changed anything
    if (JSON.stringify(migratedSnippets) !== JSON.stringify(snippets)) {
      setSnippets(migratedSnippets);
      console.log('Migrated snippets to new format');
    }
  }, [isPhase3Ready]); // Run when Phase 3 is ready

  // Sync project code when html/css/javascript changes
  useEffect(() => {
    if (project.currentProject) {
      project.updateProjectCode(html, css, javascript);
    }
  }, [html, css, javascript]);

  // Sync external libraries with project
  useEffect(() => {
    if (project.currentProject) {
      project.updateExternalLibraries(externalLibraries);
    }
  }, [externalLibraries]);

  // Load project code when project changes
  useEffect(() => {
    if (project.currentProject && !project.isLoading) {
      const proj = project.currentProject;
      if (proj.html !== html || proj.css !== css || proj.javascript !== javascript) {
        setHtml(proj.html);
        setCss(proj.css);
        setJavascript(proj.javascript);
        setExternalLibraries(proj.externalLibraries);
      }
    }
  }, [project.currentProject?.id]);

  // External Library Manager handlers
  const handleExternalLibraryManagerToggle = () => {
    setShowExternalLibraryManager(!showExternalLibraryManager);
  };

  const handleExtensionsToggle = () => {
    setShowExtensionsMarketplace(!showExtensionsMarketplace);
  };

  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
  };

  const handleKeyboardShortcutsToggle = () => {
    setShowKeyboardShortcuts(!showKeyboardShortcuts);
  };

  const handleExternalLibrariesChange = (libraries: ExternalLibrary[]) => {
    setExternalLibraries(libraries);

    // Notify other components about the change
    window.dispatchEvent(new CustomEvent('external-libraries-updated'));

    console.log(`External libraries updated: ${libraries.length} libraries loaded`);
  };

  // Project handlers
  const handleNewProject = () => {
    const name = prompt('Enter project name:', 'New Project');
    if (name) {
      project.createNewProject(name);
    }
  };

  const handleSwitchProject = (id: string) => {
    project.switchProject(id);
  };

  const handleConsoleLog = useCallback((log: ConsoleLog) => {
    setConsoleLogs(prev => [...prev, log]);
  }, []);

  const clearConsoleLogs = () => {
    setConsoleLogs([]);
  };

  const handleCommand = async (command: string) => {
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
      case 'theme': {
        const newTheme = args[0] === 'light' ? 'light' : 'dark';
        setTheme(newTheme);
        console.log(`Theme changed to ${newTheme}`);
        break;
      }
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
      case 'documentation':
      case 'docs':
        setCurrentView('documentation');
        console.log('Switched to documentation page');
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

  const saveSnippet = (name: string, htmlCode: string, cssCode: string, jsCode: string, description?: string, tags?: string[], category?: string, type?: SnippetType, scope?: SnippetScope) => {
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
      type: type || 'full',
      scope: scope || 'private',
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





  // NEW: Insert snippet (append to editors)
  const insertSnippet = (snippet: CodeSnippet) => {
    codeHistory.saveState({ html, css, javascript }, `Inserted snippet: ${snippet.name}`);

    // Insert based on snippet type
    const snippetType = snippet.type || 'full';
    switch (snippetType) {
      case 'html':
        setHtml(prev => prev + '\n' + snippet.html);
        break;
      case 'css':
        setCss(prev => prev + '\n' + snippet.css);
        break;
      case 'javascript':
        setJavascript(prev => prev + '\n' + snippet.javascript);
        break;
      case 'full':
        // For full snippets, append all non-empty sections
        if (snippet.html) setHtml(prev => prev + '\n' + snippet.html);
        if (snippet.css) setCss(prev => prev + '\n' + snippet.css);
        if (snippet.javascript) setJavascript(prev => prev + '\n' + snippet.javascript);
        break;
    }

    setConsoleLogs([]);
  };
  const deleteSnippet = (id: string) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
  };

  const resetCode = async () => {
    codeHistory.saveState({ html, css, javascript }, 'Reset to default');

    // Reset code to defaults
    setHtml(defaultHTML);
    setCss(defaultCSS);
    setJavascript(defaultJS);
    setConsoleLogs([]);
    setDismissedSuggestions(new Set());

    // Reset project name to default
    if (project.currentProject) {
      await project.updateProjectName('Untitled Project');
    }
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
    const enhancedCode = aiEnhancementService.applyPartialSuggestions(currentCode, suggestions);

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

  // History Panel Handlers
  const handleJumpToSnapshot = (snapshotId: string) => {
    const state = codeHistory.jumpToSnapshot(snapshotId);
    if (state) {
      setHtml(state.html);
      setCss(state.css);
      setJavascript(state.javascript);
      console.log('Jumped to snapshot');
    }
  };

  const handleCreateSnapshot = () => {
    codeHistory.createSnapshot();
    console.log('Created manual snapshot');
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

  // Format handlers
  const handleFormatHtml = async () => {
    setFormatLoadingStates(prev => ({ ...prev, html: true }));
    try {
      const result = await formattingService.formatCode(html, 'html');
      if (result.success && result.formattedCode !== html) {
        codeHistory.saveState({ html, css, javascript }, 'Formatted HTML');
        setHtml(result.formattedCode);
        console.log('HTML formatted successfully');
      } else if (result.error) {
        console.error('HTML formatting error:', result.error);
      }
    } catch (error) {
      console.error('Failed to format HTML:', error);
    } finally {
      setFormatLoadingStates(prev => ({ ...prev, html: false }));
    }
  };

  const handleFormatCss = async () => {
    setFormatLoadingStates(prev => ({ ...prev, css: true }));
    try {
      const result = await formattingService.formatCode(css, 'css');
      if (result.success && result.formattedCode !== css) {
        codeHistory.saveState({ html, css, javascript }, 'Formatted CSS');
        setCss(result.formattedCode);
        console.log('CSS formatted successfully');
      } else if (result.error) {
        console.error('CSS formatting error:', result.error);
      }
    } catch (error) {
      console.error('Failed to format CSS:', error);
    } finally {
      setFormatLoadingStates(prev => ({ ...prev, css: false }));
    }
  };

  const handleFormatJavascript = async () => {
    setFormatLoadingStates(prev => ({ ...prev, javascript: true }));
    try {
      const result = await formattingService.formatCode(javascript, 'javascript');
      if (result.success && result.formattedCode !== javascript) {
        codeHistory.saveState({ html, css, javascript }, 'Formatted JavaScript');
        setJavascript(result.formattedCode);
        console.log('JavaScript formatted successfully');
      } else if (result.error) {
        console.error('JavaScript formatting error:', result.error);
      }
    } catch (error) {
      console.error('Failed to format JavaScript:', error);
    } finally {
      setFormatLoadingStates(prev => ({ ...prev, javascript: false }));
    }
  };

  // AI Error Fix handler
  const handleApplyErrorFix = (fixedHtml: string, fixedCss: string, fixedJavascript: string) => {
    codeHistory.saveState({ html, css, javascript }, 'AI fixed runtime error');

    setHtml(fixedHtml);
    setCss(fixedCss);
    setJavascript(fixedJavascript);
    setConsoleLogs([]);

    console.log('Applied AI error fix successfully');
  };


  // Selection Operation Handlers
  const handleSelectionChange = useCallback((editor: any, language: EditorLanguage) => {
    console.log('[App] handleSelectionChange called for', language);
    updateSelection(editor, language);
  }, [updateSelection]);

  const handleSelectionOperation = useCallback(async (operation: SelectionOperationType) => {
    console.log('[App] handleSelectionOperation called with operation:', operation);
    console.log('[App] hasSelection:', hasSelection);
    console.log('[App] selection.code:', selection.code?.substring(0, 50));
    console.log('[App] selection.language:', selection.language);

    if (!hasSelection || !selection.code || !selection.language) {
      console.warn('[App] No code selected - aborting operation');
      return;
    }

    console.log('[App] Executing operation:', operation, 'for', selection.language);
    const context = selection.fullFileCode;
    console.log('[App] Context length:', context?.length || 0);

    try {
      const result = await selectionOps.executeOperation(operation, selection.code, selection.language, context);
      console.log('[App] Operation completed successfully');

      // Save to history if successful
      if (result) {
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          operation: operation,
          language: selection.language,
          codePreview: selection.code.substring(0, 100) + (selection.code.length > 100 ? '...' : ''),
          result: result
        };
        setSelectionHistory(prev => [newItem, ...prev]);
      }
    } catch (error) {
      console.error('[App] Operation failed:', error);
    }
  }, [hasSelection, selection, selectionOps]);

  const handleApplySelectionChanges = useCallback((newCode: string) => {
    if (!selection.editorInstance || !selection.range) {
      console.error('No editor instance or range available');
      return;
    }

    // Apply the changes using Monaco helper
    const success = monacoHelper.replaceSelectedCode(selection.editorInstance, newCode, selection.range);

    if (success) {
      // Save to history
      codeHistory.saveState({ html, css, javascript }, `Applied ${selectionOps.result?.operation}`);

      // Clear selection and result
      clearSelection();
      selectionOps.clearResult();

      console.log(`Applied ${selectionOps.result?.operation} changes successfully`);
    } else {
      console.error('Failed to apply selection changes');
    }
  }, [selection, selectionOps, codeHistory, html, css, javascript, clearSelection]);

  const handleCloseSelectionResult = useCallback(() => {
    selectionOps.clearResult();
  }, [selectionOps]);


  // Code Explanation Handlers
  // Note: handleExplainCode was removed as it was unused.
  // The actual code explanation is handled by onExplainRequest callback.

  // Note: onExplainRequest was removed as it was unused.
  // Event-based code explanation handling is not currently implemented.

  const [popupPosition] = useState<{ top: number; left: number } | null>(null);

  const handleAddComments = async () => {
    if (!explanation) return;
    const annotated = await getAnnotatedCode();
    if (annotated) {
      handleCodeUpdate(explanation.language, annotated);
      setShowExplanationPopup(false);
    }
  };

  const getCurrentCodeForLanguage = useCallback((language: EditorLanguage): string => {
    switch (language) {
      case 'html': return html;
      case 'css': return css;
      case 'javascript': return javascript;
      default: return '';
    }
  }, [html, css, javascript]);

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
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'
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
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onHistoryToggle={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
          onExtensionsToggle={handleExtensionsToggle}
          onSettingsToggle={handleSettingsToggle}
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
          <Suspense fallback={
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-400">Loading About Page...</p>
              </div>
            </div>
          }>
            <AboutPage />
          </Suspense>
        </div>
        <Footer focusMode={focusMode} onToggleFocusMode={toggleFocusMode} />

        {/* External Library Manager for About page - Phase 3 */}
        {isPhase3Ready && (
          <Suspense fallback={null}>
            <ExternalLibraryManager
              isOpen={showExternalLibraryManager}
              onClose={() => setShowExternalLibraryManager(false)}
              libraries={externalLibraries}
              onLibrariesChange={handleExternalLibrariesChange}
            />
          </Suspense>
        )}
      </div>
    );
  }

  // Render documentation page
  if (currentView === 'documentation') {
    return (
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'
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
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onHistoryToggle={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
          onExtensionsToggle={handleExtensionsToggle}
          onSettingsToggle={handleSettingsToggle}
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
                onClick={() => setCurrentView('about')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                About
              </button>
            </div>
          }
        />
        <div className="flex-1">
          <Suspense fallback={
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-400">Loading Documentation...
                </p>
              </div>
            </div>
          }>
            <DocumentationPage />
          </Suspense>
        </div>
        <Footer focusMode={focusMode} onToggleFocusMode={toggleFocusMode} />

        {/* External Library Manager for Documentation page - Phase 3 */}
        {isPhase3Ready && (
          <Suspense fallback={null}>
            <ExternalLibraryManager
              isOpen={showExternalLibraryManager}
              onClose={() => setShowExternalLibraryManager(false)}
              libraries={externalLibraries}
              onLibrariesChange={handleExternalLibrariesChange}
            />
          </Suspense>
        )}
      </div>
    );
  }

  // Render history view
  if (currentView === 'history') {
    return (
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'
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
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onHistoryToggle={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
          onExtensionsToggle={handleExtensionsToggle}
          onSettingsToggle={handleSettingsToggle}
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
          <Suspense fallback={
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-400">Loading History...</p>
              </div>
            </div>
          }>
            <CodeHistoryPage selectionHistory={selectionHistory} />
          </Suspense>
        </div>
        <Footer focusMode={focusMode} onToggleFocusMode={toggleFocusMode} />

        {/* External Library Manager for History page - Phase 3 */}
        {isPhase3Ready && (
          <Suspense fallback={null}>
            <ExternalLibraryManager
              isOpen={showExternalLibraryManager}
              onClose={() => setShowExternalLibraryManager(false)}
              libraries={externalLibraries}
              onLibrariesChange={handleExternalLibrariesChange}
            />
          </Suspense>
        )}
      </div>
    );
  }

  // Render Privacy Policy page
  if (currentView === 'privacy') {
    return (
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'}`}>
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
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onHistoryToggle={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
          onExtensionsToggle={handleExtensionsToggle}
          onSettingsToggle={handleSettingsToggle}
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
            </div>
          }
        />
        <div className="flex-1">
          <Suspense fallback={<div className="p-8 text-center">Loading Privacy Policy...</div>}>
            <PrivacyPolicyPage />
          </Suspense>
        </div>
        <Footer focusMode={focusMode} onToggleFocusMode={toggleFocusMode} />
      </div>
    );
  }

  // Render Terms of Service page
  if (currentView === 'terms') {
    return (
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'}`}>
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
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onHistoryToggle={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
          onExtensionsToggle={handleExtensionsToggle}
          onSettingsToggle={handleSettingsToggle}
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
            </div>
          }
        />
        <div className="flex-1">
          <Suspense fallback={<div className="p-8 text-center">Loading Terms of Service...</div>}>
            <TermsOfServicePage />
          </Suspense>
        </div>
        <Footer focusMode={focusMode} onToggleFocusMode={toggleFocusMode} />
      </div>
    );
  }

  // Render Cookie Policy page
  if (currentView === 'cookies') {
    return (
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'}`}>
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
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onHistoryToggle={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
          onExtensionsToggle={handleExtensionsToggle}
          onSettingsToggle={handleSettingsToggle}
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
            </div>
          }
        />
        <div className="flex-1">
          <Suspense fallback={<div className="p-8 text-center">Loading Cookie Policy...</div>}>
            <CookiePolicyPage />
          </Suspense>
        </div>
        <Footer focusMode={focusMode} onToggleFocusMode={toggleFocusMode} />
      </div>
    );
  }

  // Render Disclaimer page
  if (currentView === 'disclaimer') {
    return (
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'}`}>
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
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onHistoryToggle={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
          onExtensionsToggle={handleExtensionsToggle}
          onSettingsToggle={handleSettingsToggle}
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
            </div>
          }
        />
        <div className="flex-1">
          <Suspense fallback={<div className="p-8 text-center">Loading Disclaimer...</div>}>
            <DisclaimerPage />
          </Suspense>
        </div>
        <Footer focusMode={focusMode} onToggleFocusMode={toggleFocusMode} />
      </div>
    );
  }

  // Render Contact page
  if (currentView === 'contact') {
    return (
      <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'}`}>
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
          onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
          onHistoryToggle={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
          onExtensionsToggle={handleExtensionsToggle}
          onSettingsToggle={handleSettingsToggle}
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
            </div>
          }
        />
        <div className="flex-1">
          <Suspense fallback={<div className="p-8 text-center">Loading Contact...</div>}>
            <ContactPage />
          </Suspense>
        </div>
        <Footer focusMode={focusMode} onToggleFocusMode={toggleFocusMode} />
      </div>
    );
  }

  // Render Auth page (full screen, no navbar)
  if (currentView === 'auth') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
        <AuthPage onClose={() => setCurrentView('editor')} />
      </Suspense>
    );
  }

  // Render main editor view
  return (
    <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-matte-black' : 'bg-bright-white'
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
        onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
        onHistoryToggle={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
        onExtensionsToggle={handleExtensionsToggle}
        onSettingsToggle={handleSettingsToggle}
        canUndo={codeHistory.canUndo}
        canRedo={codeHistory.canRedo}
        autoSaveEnabled={autoSaveEnabled}
        aiAssistantOpen={showGeminiAssistant}
        aiSuggestionsOpen={showAISuggestions}
        customActions={
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('history')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              History
            </button>
          </div>
        }
      />

      {/* Project Bar - Only load in Phase 3 */}
      {isPhase3Ready && (
        <Suspense fallback={null}>
          <ProjectBar
            currentProject={project.currentProject}
            projectList={project.projectList}
            isSaving={project.isSaving}
            onSave={project.saveCurrentProject}
            onDuplicate={project.duplicateCurrentProject}
            onNewProject={handleNewProject}
            onSwitchProject={handleSwitchProject}
            onUpdateName={project.updateProjectName}
          />
        </Suspense>
      )}


      {/* Main Content */}
      <div className="flex-1 px-2 sm:px-4 lg:px-6 py-4">
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} h-full`}>
          {/* Left Panel - Editors */}
          <div className="flex flex-col space-y-3 w-full min-h-0">
            <EditorPanel
              title="HTML"
              language="html"
              value={html}
              onChange={setHtml}
              icon={<Code2 className="w-4 h-4 text-orange-400" />}
              onAISuggest={() => handleAISuggest('html')}
              isAILoading={aiLoadingStates.html}
              onFormat={handleFormatHtml}
              isFormatLoading={formatLoadingStates.html}
              editorRef={htmlEditorRef}
              onSelectionChange={(editor) => handleSelectionChange(editor, 'html')}
              fontFamily={getFontFamilyCSS(settings.editorFontFamily)}
              fontSize={settings.editorFontSize}
            />

            <EditorPanel
              title="CSS"
              language="css"
              value={css}
              onChange={setCss}
              icon={<Code2 className="w-4 h-4 text-blue-400" />}
              onAISuggest={() => handleAISuggest('css')}
              isAILoading={aiLoadingStates.css}
              onFormat={handleFormatCss}
              isFormatLoading={formatLoadingStates.css}
              editorRef={cssEditorRef}
              onSelectionChange={(editor) => handleSelectionChange(editor, 'css')}
              fontFamily={getFontFamilyCSS(settings.editorFontFamily)}
              fontSize={settings.editorFontSize}
            />

            <EditorPanel
              title="JavaScript"
              language="javascript"
              value={javascript}
              onChange={setJavascript}
              icon={<Code2 className="w-4 h-4 text-yellow-400" />}
              onAISuggest={() => handleAISuggest('javascript')}
              isAILoading={aiLoadingStates.javascript}
              onFormat={handleFormatJavascript}
              isFormatLoading={formatLoadingStates.javascript}
              editorRef={jsEditorRef}
              onSelectionChange={(editor) => handleSelectionChange(editor, 'javascript')}
              fontFamily={getFontFamilyCSS(settings.editorFontFamily)}
              fontSize={settings.editorFontSize}
            />
          </div>

          {/* Right Panel - Tabbed Interface for Preview, Console, and AI Suggestions */}
          <div className="flex flex-col w-full h-full min-h-0">
            <TabbedRightPanel
              errorCount={consoleLogs.filter(log => log.type === 'error').length}
              suggestionCount={aiSuggestions.length}
              showAISuggestions={showAISuggestions}
              // Preview props
              html={html}
              css={css}
              javascript={javascript}
              onConsoleLog={handleConsoleLog}
              autoRunJS={settings.autoRunJS}
              previewDelay={settings.previewDelay}
              // Console props
              consoleLogs={consoleLogs}
              onClearConsole={clearConsoleLogs}
              onApplyErrorFix={handleApplyErrorFix}
              // AI Suggestions props
              aiSuggestions={aiSuggestions}
              onApplySuggestion={handleApplySuggestion}
              onDismissSuggestion={handleDismissSuggestion}
            />

            {/* Snippets Sidebar - Phase 3 */}
            {isPhase3Ready && (
              <Suspense fallback={null}>
                <SnippetsSidebar
                  isOpen={showSnippets}
                  onClose={() => setShowSnippets(false)}
                  snippets={snippets}
                  onSave={saveSnippet}
                  onLoad={loadSnippet}
                  onInsert={insertSnippet}
                  onDelete={deleteSnippet}
                  onUpdate={updateSnippet}
                  currentCode={{ html, css, javascript }}
                />
              </Suspense>
            )}

            {/* Extensions Marketplace - Phase 3 */}
            {isPhase3Ready && (
              <Suspense fallback={null}>
                <ExtensionsMarketplace
                  isOpen={showExtensionsMarketplace}
                  onClose={() => setShowExtensionsMarketplace(false)}
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer focusMode={focusMode} onToggleFocusMode={toggleFocusMode} />

      {/* AI Enhancement Popup - Phase 3 */}
      {isPhase3Ready && (
        <Suspense fallback={null}>
          <AIEnhancementPopup
            isOpen={aiPopupOpen}
            onClose={handleAIPopupClose}
            code={aiPopupCode}
            language={aiPopupLanguage}
            onApplyChanges={handleAIEnhancementApply}
            onApplyPartial={handleAIPartialApply}
            onUndo={codeHistory.canUndo ? handleUndo : undefined}
          />
        </Suspense>
      )}

      {/* External Library Manager - Phase 3 */}
      {isPhase3Ready && (
        <Suspense fallback={null}>
          <ExternalLibraryManager
            isOpen={showExternalLibraryManager}
            onClose={() => setShowExternalLibraryManager(false)}
            libraries={externalLibraries}
            onLibrariesChange={handleExternalLibrariesChange}
          />
        </Suspense>
      )}

      {/* Settings Modal - Phase 3 */}
      {isPhase3Ready && (
        <Suspense fallback={null}>
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        </Suspense>
      )}

      {/* Keyboard Shortcuts Help Modal - Phase 3 */}
      {isPhase3Ready && (
        <Suspense fallback={null}>
          <KeyboardShortcutsHelp
            isOpen={showKeyboardShortcuts}
            onClose={() => setShowKeyboardShortcuts(false)}
          />
        </Suspense>
      )}

      {/* Code Explanation Popup - Phase 3 */}
      {isPhase3Ready && (
        <Suspense fallback={null}>
          <CodeExplanationPopup
            isOpen={showExplanationPopup}
            onClose={() => {
              setShowExplanationPopup(false);
              clearExplanation(); // Clear explanation state when popup is closed
            }}
            explanation={explanation}
            isLoading={isExplanationLoading}
            position={popupPosition}
            onUserLevelChange={(level) => explanation && explainCode(explanation.code, explanation.language, level)}
            onShowSimplified={getSimplifiedExplanation}
            onShowAnnotated={getAnnotatedCode}
            onAddComments={handleAddComments}
          />
        </Suspense>
      )}

      {/* Code Buddy - Sidebar AI Assistant - Phase 3 */}
      {showGeminiAssistant && isPhase3Ready && (
        <Suspense fallback={null}>
          <GeminiCodeAssistant
            currentCode={{ html, css, javascript }}
            onCodeUpdate={handleCodeUpdate}
            onCodeUpdateNoHistory={(language, code) => {
              // Update code WITHOUT saving to history
              // Used during typewriter animation to avoid hundreds of history entries
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
            }}
            onBatchCodeUpdate={(code) => {
              // Batch update all languages with ONE history save
              // This fixes redo by preventing multiple history entries
              codeHistory.saveState({ html, css, javascript }, 'AI code writing complete');

              if (code.html !== undefined) setHtml(code.html);
              if (code.css !== undefined) setCss(code.css);
              if (code.javascript !== undefined) setJavascript(code.javascript);
            }}
            onClearAllCode={() => {
              codeHistory.saveState({ html, css, javascript }, 'Cleared all code for AI writing');
              setHtml(defaultHTML);
              setCss(defaultCSS);
              setJavascript(defaultJS);
            }}
            onClose={() => setShowGeminiAssistant(false)}
          />
        </Suspense>
      )}



      {/* History Panel - Phase 3 */}
      {isPhase3Ready && (
        <Suspense fallback={null}>
          <HistoryPanel
            isOpen={isHistoryPanelOpen}
            onClose={() => setIsHistoryPanelOpen(false)}
            history={codeHistory.allHistory}
            currentIndex={codeHistory.currentIndex}
            onJumpToSnapshot={handleJumpToSnapshot}
            onCreateSnapshot={handleCreateSnapshot}
            getDiffPreview={codeHistory.getDiffPreview}
          />
        </Suspense>
      )}

      {/* Selection Toolbar - Appears when code is selected */}
      {hasSelection && selection.position && (
        <SelectionToolbar
          position={selection.position}
          language={selection.language!}
          onOperation={handleSelectionOperation}
          isLoading={selectionOps.isLoading}
          currentOperation={selectionOps.result?.operation}
        />
      )}

      {/* Selection Sidebar - Handles Loading, Results, and History */}
      <SelectionSidebar
        isOpen={selectionOps.isLoading || !!selectionOps.result || isHistoryPanelOpen}
        isLoading={selectionOps.isLoading}
        result={selectionOps.result}
        language={selection.language}
        error={selectionOps.error}
        onClose={() => {
          handleCloseSelectionResult();
          setIsHistoryPanelOpen(false);
        }}
        onApplyChanges={selectionOps.result?.hasCodeChanges ? handleApplySelectionChanges : undefined}
        history={selectionHistory}
        onClearHistory={() => setSelectionHistory([])}
        onSelectHistory={(item) => {
          selectionOps.setResult(item.result);
        }}
        onHistoryToggle={setIsHistoryPanelOpen}
        isHistoryOpen={isHistoryPanelOpen}
      />

      {/* Floating button to disable Focus Mode */}
      {focusMode && (
        <button
          onClick={toggleFocusMode}
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 animate-pulse hover:scale-110 ${isDark
            ? 'bg-blue-600 hover:bg-blue-500 text-white'
            : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          title="Click to Show Footer (Exit Focus Mode)"
          aria-label="Show Footer"
        >
          <Eye className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

export default App;




