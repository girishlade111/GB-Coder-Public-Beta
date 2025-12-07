import React, { useState, useRef, useCallback } from 'react';
import {
  Menu,
  Sparkles,
  Lightbulb,
  FolderOpen,
  Undo2,
  Redo2,
  Save,
  Play,
  RotateCcw,
  Upload,
  Download,
  X,
  FileText,
  Code,
  Palette,
  Sun,
  Moon,
  Settings,
  History,
  Puzzle,
  Keyboard
} from 'lucide-react';
import { EditorLanguage } from '../types';
import ThemeToggle from './ui/ThemeToggle';
import { useTheme } from '../hooks/useTheme';

interface NavigationBarProps {
  onAutoSaveToggle: () => void;
  onSnippetsToggle: () => void;
  onRun: () => void;
  onReset: () => void;
  onImport: (files: FileList) => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAIAssistantToggle: () => void;
  onAISuggestionsToggle: () => void;
  onExternalLibraryManagerToggle: () => void;
  onHistoryToggle: () => void;
  onExtensionsToggle: () => void;
  onSettingsToggle: () => void;
  canUndo: boolean;
  canRedo: boolean;
  autoSaveEnabled: boolean;
  aiAssistantOpen: boolean;
  aiSuggestionsOpen: boolean;
  customActions?: React.ReactNode;
}

interface FileUpload {
  name: string;
  type: EditorLanguage;
  content: string;
  size: number;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  onAutoSaveToggle,
  onSnippetsToggle,
  onRun,
  onReset,
  onImport,
  onExport,
  onUndo,
  onRedo,
  onAIAssistantToggle,
  onAISuggestionsToggle,
  onExternalLibraryManagerToggle,
  onHistoryToggle,
  onExtensionsToggle,
  onSettingsToggle,
  canUndo,
  canRedo,
  autoSaveEnabled,
  aiAssistantOpen,
  aiSuggestionsOpen,
  customActions
}) => {
  const { isDark } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [showFileIndicator, setShowFileIndicator] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle file drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    const validFiles: FileUpload[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = file.name.split('.').pop()?.toLowerCase();

      let fileType: EditorLanguage | null = null;
      if (extension === 'html' || extension === 'htm') fileType = 'html';
      else if (extension === 'css') fileType = 'css';
      else if (extension === 'js' || extension === 'javascript') fileType = 'javascript';

      if (fileType && file.size < 1024 * 1024) { // 1MB limit
        try {
          const content = await file.text();
          validFiles.push({
            name: file.name,
            type: fileType,
            content,
            size: file.size
          });
        } catch (error) {
          console.error('Error reading file:', file.name, error);
        }
      }
    }

    if (validFiles.length > 0) {
      setUploadedFiles(validFiles);
      setShowFileIndicator(true);
      onImport(files);

      // Hide indicator after 3 seconds
      setTimeout(() => setShowFileIndicator(false), 3000);
    }
  }, [onImport]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  }, [handleFileUpload]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) onUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) onRedo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, onUndo, onRedo]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFileIcon = (type: EditorLanguage) => {
    switch (type) {
      case 'html': return <FileText className="w-3 h-3 text-orange-400" />;
      case 'css': return <Palette className="w-3 h-3 text-blue-400" />;
      case 'javascript': return <Code className="w-3 h-3 text-yellow-400" />;
      default: return <FileText className="w-3 h-3 text-gray-400" />;
    }
  };

  // Handle escape key for menu close
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isDropdownOpen]);

  return (
    <>
      {/* Main Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-sm border-b shadow-sm transition-all duration-200 ${isDark
          ? 'bg-matte-black/95 border-gray-700'
          : 'bg-white/95 border-gray-200'
          } ${isDragOver
            ? isDark
              ? 'bg-blue-900/95 border-blue-600'
              : 'bg-blue-50/95 border-blue-300'
            : ''
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left side - Logo */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4">
                <img
                  src="/tghjkl.jpeg"
                  alt="GB Coder Logo"
                  className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl object-contain"
                />
                <h1 className={`text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold truncate ${isDark ? 'text-bright-white' : 'text-gray-900'
                  }`}>
                  <span className="block sm:inline">GB Coder</span>
                </h1>
              </div>
            </div>

            {/* Right side - Menu Button & Custom Actions */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 min-w-0 flex-shrink-0">
              {/* Custom Actions (Login, Save Status, etc.) */}
              {customActions}

              {/* Settings Button */}
              <button
                onClick={onSettingsToggle}
                className={`p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 ${isDark
                  ? 'text-bright-white hover:bg-dark-gray'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
                title="Settings"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </button>

              {/* Hamburger Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 ${isDropdownOpen
                    ? (isDark ? 'bg-dark-gray text-white' : 'bg-gray-100 text-black')
                    : (isDark
                      ? 'text-bright-white hover:bg-dark-gray'
                      : 'text-gray-600 hover:bg-gray-100')
                    }`}
                  title="Menu"
                  aria-label="Toggle navigation menu"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </button>

                {/* Dropdown Content */}
                {isDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-lg border py-2 z-50 animate-in slide-in-from-top-2 duration-200 ${isDark
                    ? 'bg-dark-gray border-gray-700'
                    : 'bg-white border-gray-200'
                    }`}>
                    {/* Menu Content - All Features Consolidated */}
                    <div className="py-2">
                      {/* AI Features */}
                      <div className="px-4 pb-3">
                        <h4 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          AI Features
                        </h4>
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              onAIAssistantToggle();
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-colors rounded-lg ${aiAssistantOpen
                              ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                              : isDark
                                ? 'text-gray-300 hover:bg-gray-700'
                                : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <Sparkles className="w-4 h-4" />
                            Code Buddy
                            {aiAssistantOpen && (
                              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
                                Active
                              </span>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              onAISuggestionsToggle();
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-colors rounded-lg ${aiSuggestionsOpen
                              ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                              : isDark
                                ? 'text-gray-300 hover:bg-gray-700'
                                : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <Lightbulb className="w-4 h-4" />
                            AI Suggestions
                            {aiSuggestionsOpen && (
                              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
                                Active
                              </span>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />

                      {/* Code Operations */}
                      <div className="px-4 py-3">
                        <h4 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          Code Operations
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              onRun();
                              setIsDropdownOpen(false);
                            }}
                            className={`px-3 py-2.5 text-sm flex items-center gap-2 transition-colors rounded-lg ${isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <Play className="w-4 h-4" />
                            Run
                          </button>

                          <button
                            onClick={() => {
                              onAutoSaveToggle();
                              setIsDropdownOpen(false);
                            }}
                            className={`px-3 py-2.5 text-sm flex items-center gap-2 transition-colors rounded-lg ${autoSaveEnabled
                              ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                              : isDark
                                ? 'text-gray-300 hover:bg-gray-700'
                                : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <Save className="w-4 h-4" />
                            Save
                            <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${autoSaveEnabled
                              ? (isDark ? 'bg-black text-white' : 'bg-white text-black')
                              : isDark
                                ? 'bg-gray-600 text-gray-300'
                                : 'bg-gray-200 text-gray-600'
                              }`}>
                              {autoSaveEnabled ? 'ON' : 'OFF'}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />

                      {/* Edit Operations */}
                      <div className="px-4 py-3">
                        <h4 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          Edit
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              onUndo();
                              setIsDropdownOpen(false);
                            }}
                            disabled={!canUndo}
                            className={`px-3 py-2.5 text-sm flex items-center gap-2 transition-colors rounded-lg ${canUndo
                              ? isDark
                                ? 'text-gray-300 hover:bg-gray-700'
                                : 'text-gray-700 hover:bg-gray-50'
                              : 'text-gray-500 cursor-not-allowed'
                              }`}
                          >
                            <Undo2 className="w-4 h-4" />
                            Undo
                          </button>

                          <button
                            onClick={() => {
                              onRedo();
                              setIsDropdownOpen(false);
                            }}
                            disabled={!canRedo}
                            className={`px-3 py-2.5 text-sm flex items-center gap-2 transition-colors rounded-lg ${canRedo
                              ? isDark
                                ? 'text-gray-300 hover:bg-gray-700'
                                : 'text-gray-700 hover:bg-gray-50'
                              : 'text-gray-500 cursor-not-allowed'
                              }`}
                          >
                            <Redo2 className="w-4 h-4" />
                            Redo
                          </button>
                        </div>
                      </div>

                      <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />

                      {/* File Management */}
                      <div className="px-4 py-3">
                        <h4 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          Files
                        </h4>
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              fileInputRef.current?.click();
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-colors rounded-lg ${isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <Upload className="w-4 h-4" />
                            Import Files
                          </button>

                          <button
                            onClick={() => {
                              onExport();
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-colors rounded-lg ${isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <Download className="w-4 h-4" />
                            Export Project
                          </button>
                        </div>
                      </div>

                      <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />

                      {/* Settings & Tools */}
                      <div className="px-4 py-3">
                        <h4 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          Settings & Tools
                        </h4>
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              onHistoryToggle();
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-colors rounded-lg ${isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <History className="w-4 h-4" />
                            History
                          </button>

                          <button
                            onClick={() => {
                              onSnippetsToggle();
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-colors rounded-lg ${isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <FolderOpen className="w-4 h-4" />
                            Snippets
                          </button>

                          <button
                            onClick={() => {
                              onExtensionsToggle();
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-colors rounded-lg ${isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <Puzzle className="w-4 h-4" />
                            Extensions
                          </button>

                          <button
                            onClick={() => {
                              const newTheme = isDark ? 'light' : 'dark';
                              localStorage.setItem('gb-coder-theme', newTheme);
                              window.dispatchEvent(new CustomEvent('theme-change', { detail: newTheme }));
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-colors rounded-lg ${isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            {isDark ? 'Light Mode' : 'Dark Mode'}
                          </button>

                          <button
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('navigate-to-about'));
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-colors rounded-lg ${isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <FileText className="w-4 h-4" />
                            About Us
                          </button>

                          <button
                            onClick={() => {
                              onReset();
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-colors rounded-lg ${isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <RotateCcw className="w-4 h-4" />
                            Reset Project
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Drag & Drop Overlay */}
        {isDragOver && (
          <div className={`absolute inset-0 border-2 border-dashed flex items-center justify-center ${isDark
            ? 'bg-blue-900/90 border-blue-400'
            : 'bg-blue-50/90 border-blue-300'
            }`}>
            <div className="text-center">
              <Upload className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
              <p className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'
                }`}>
                Drop HTML, CSS, or JS files here
              </p>
              <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                Multiple files supported
              </p>
            </div>
          </div>
        )}

        {/* File Upload Indicator */}
        {showFileIndicator && uploadedFiles.length > 0 && (
          <div className={`absolute top-full left-4 mt-2 rounded-lg shadow-lg border p-3 z-50 animate-in slide-in-from-top-2 duration-200 ${isDark
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
            }`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Files Uploaded
              </span>
              <button
                onClick={() => setShowFileIndicator(false)}
                className={`ml-auto p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
              >
                <X className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
              </button>
            </div>
            <div className="space-y-1">
              {uploadedFiles.map((file, index) => (
                <div key={index} className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                  {getFileIcon(file.type)}
                  <span className="truncate max-w-32">{file.name}</span>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'} >
                    ({Math.round(file.size / 1024)}KB)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".html,.htm,.css,.js,.javascript"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Spacer for fixed navbar */}
      <div className="h-14 sm:h-16" />
    </>
  );
};

export default NavigationBar;