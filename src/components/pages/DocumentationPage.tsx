import React, { useState } from 'react';
import { Book, Code2, Brain, Zap, FileText, Settings, Package, History, Keyboard, Search, ChevronRight, Terminal, Eye, Wrench, Star, Lightbulb, Layout, Sparkles, Upload, Download } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const DocumentationPage: React.FC = () => {
    const { isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState('getting-started');

    const sections = [
        { id: 'getting-started', title: 'Getting Started', icon: <Zap className="w-5 h-5" /> },
        { id: 'editor', title: 'Editor Features', icon: <Code2 className="w-5 h-5" /> },
        { id: 'ai', title: 'AI Features', icon: <Brain className="w-5 h-5" /> },
        { id: 'preview', title: 'Preview & Console', icon: <Eye className="w-5 h-5" /> },
        { id: 'projects', title: 'Project Management', icon: <FileText className="w-5 h-5" /> },
        { id: 'files', title: 'File Management', icon: <Upload className="w-5 h-5" /> },
        { id: 'settings', title: 'Settings', icon: <Settings className="w-5 h-5" /> },
        { id: 'snippets', title: 'Snippets', icon: <Package className="w-5 h-5" /> },
        { id: 'shortcuts', title: 'Keyboard Shortcuts', icon: <Keyboard className="w-5 h-5" /> },
    ];

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className={`min-h-screen transition-colors ${isDark ? 'bg-matte-black text-bright-white' : 'bg-bright-white text-matte-black'}`}>
            {/* SEO Meta */}
            <div style={{ display: 'none' }}>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "TechArticle",
                        "headline": "GB Coder Documentation - Complete Feature Guide",
                        "description": "Comprehensive documentation for GB Coder AI-powered code editor covering all features, tools, and functionality",
                        "keywords": "code editor documentation, online IDE guide, AI code assistant, web development tools",
                        "author": { "@type": "Person", "name": "Girish Lade" }
                    })}
                </script>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        GB Coder Documentation
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Complete guide to all features, tools, and capabilities of the AI-powered code playground
                    </p>
                </div>

                {/* Search */}
                <div className={`max-w-2xl mx-auto mb-12 relative ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg`}>
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search documentation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                </div>

                <div className="flex gap-8">
                    {/* Sidebar TOC */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className={`sticky top-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Book className="w-5 h-5" />
                                Table of Contents
                            </h3>
                            <nav className="space-y-1">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${activeSection === section.id
                                                ? 'bg-blue-500 text-white'
                                                : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                                            }`}
                                    >
                                        {section.icon}
                                        <span className="text-sm">{section.title}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 space-y-12">
                        {/* Getting Started */}
                        <section id="getting-started" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <Zap className="w-8 h-8 text-yellow-500" />
                                Getting Started
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Quick Start</h3>
                                    <p className="text-gray-400 mb-4">GB Coder is a browser-based code playground that requires no installation. Simply open the app and start coding!</p>
                                    <ol className="list-decimal list-inside space-y-2 text-gray-400">
                                        <li>Choose a language panel (HTML, CSS, or JavaScript)</li>
                                        <li>Write your code in the Monaco editor</li>
                                        <li>See live preview update automatically</li>
                                        <li>Use AI features to enhance your code</li>
                                        <li>Save your work - it auto-saves to local storage</li>
                                    </ol>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Setup AI Features</h3>
                                    <p className="text-gray-400 mb-3">To use AI-powered features, you need a Google Gemini API key:</p>
                                    <ol className="list-decimal list-inside space-y-2 text-gray-400">
                                        <li>Get your free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a></li>
                                        <li>Open Settings (gear icon) in the navigation bar</li>
                                        <li>Enter your API key in the AI settings section</li>
                                        <li>Start using AI suggestions, chat, and enhancements</li>
                                    </ol>
                                </div>
                            </div>
                        </section>

                        {/* Editor Features */}
                        <section id="editor" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <Code2 className="w-8 h-8 text-blue-500" />
                                Editor Features
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-500" />
                                        Monaco Editor
                                    </h3>
                                    <p className="text-gray-400 mb-3">Powered by the same engine as VS Code, featuring:</p>
                                    <ul className="grid md:grid-cols-2 gap-2 text-gray-400">
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Syntax highlighting for HTML, CSS, JS</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />IntelliSense auto-completion</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Error detection and highlighting</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Code minimap for navigation</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Bracket matching and auto-closing</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Multi-cursor editing</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                        <Wrench className="w-5 h-5 text-orange-500" />
                                        Code Formatting
                                    </h3>
                                    <p className="text-gray-400 mb-3">Each editor panel has a Format button that beautifies your code:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Automatic indentation and spacing</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Consistent code style</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Line wrapping and organization</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Keyboard shortcut: Shift + Alt + F</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                        <History className="w-5 h-5 text-purple-500" />
                                        Undo/Redo & History
                                    </h3>
                                    <p className="text-gray-400 mb-3">Comprehensive history tracking:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" /><strong>Ctrl+Z</strong>: Undo last change</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" /><strong>Ctrl+Y</strong>: Redo change</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />History Panel: View all snapshots</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Jump to any previous state</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Create manual snapshots</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Editor Actions</h3>
                                    <p className="text-gray-400 mb-3">Each editor panel header includes:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li><strong className="text-white">Format:</strong> Auto-format code with proper indentation</li>
                                        <li><strong className="text-white">Copy:</strong> Copy code to clipboard</li>
                                        <li><strong className="text-white">Lock/Unlock:</strong> Make editor read-only</li>
                                        <li><strong className="text-white">AI Suggest:</strong> Get AI-powered improvements</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* AI Features */}
                        <section id="ai" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <Brain className="w-8 h-8 text-purple-500" />
                                AI Features
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-yellow-500" />
                                        AI Chat Assistant
                                    </h3>
                                    <p className="text-gray-400 mb-3">Interactive coding companion accessible from the sidebar:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Ask coding questions in natural language</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Request code snippets and examples</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Get debugging help</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Learn best practices and patterns</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Context-aware responses based on your code</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Chat history saved for reference</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5 text-blue-500" />
                                        Smart Suggestions
                                    </h3>
                                    <p className="text-gray-400 mb-3">Real-time AI suggestions panel shows:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Performance optimizations</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Accessibility improvements</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Best practice recommendations</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Security enhancements</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Modern syntax updates</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3">AI Code Enhancement</h3>
                                    <p className="text-gray-400 mb-3">Click "AI Suggest" on any editor to:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li><strong className="text-white">Analyze:</strong> AI reviews your entire code</li>
                                        <li><strong className="text-white">Improve:</strong> Suggests optimized version</li>
                                        <li><strong className="text-white">Compare:</strong> Side-by-side diff view</li>
                                        <li><strong className="text-white">Apply:</strong> One-click to accept changes</li>
                                        <li><strong className="text-white">Partial Apply:</strong> Select specific improvements</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Code Explanation</h3>
                                    <p className="text-gray-400 mb-3">Understand any code block:</p>
                                    <ol className="list-decimal list-inside space-y-2 text-gray-400">
                                        <li>Select code in any editor</li>
                                        <li>Click "Explain Code" button</li>
                                        <li>Get detailed step-by-step explanation</li>
                                        <li>View simplified version for beginners</li>
                                        <li>Add AI-generated comments to code</li>
                                    </ol>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Selection Operations</h3>
                                    <p className="text-gray-400 mb-3">Advanced AI operations on selected code:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li><strong className="text-white">Refactor:</strong> Improve code structure</li>
                                        <li><strong className="text-white">Optimize:</strong> Performance improvements</li>
                                        <li><strong className="text-white">Document:</strong> Generate comments</li>
                                        <li><strong className="text-white">Debug:</strong> Find and fix issues</li>
                                        <li><strong className="text-white">Convert:</strong> Transform syntax styles</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3">AI Error Fixing</h3>
                                    <p className="text-gray-400 mb-3">Automatic error resolution:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Detects runtime errors in console</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />"Fix with AI" button on each error</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />AI analyzes error context and code</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Provides fix with explanation</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Apply fix or insert as comment</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Preview & Console */}
                        <section id="preview" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <Eye className="w-8 h-8 text-green-500" />
                                Preview & Console
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                        <Layout className="w-5 h-5 text-blue-500" />
                                        Live Preview
                                    </h3>
                                    <p className="text-gray-400 mb-3">Real-time rendering with responsive controls:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li><strong className="text-white">Desktop Mode:</strong> Full-width view (default)</li>
                                        <li><strong className="text-white">Tablet Mode:</strong> 768px viewport simulation</li>
                                        <li><strong className="text-white">Mobile Mode:</strong> 375px viewport simulation</li>
                                        <li><strong className="text-white">Fullscreen:</strong> Expand to full window</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Auto-refresh on code changes</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Iframe sandboxing for security</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                        <Terminal className="w-5 h-5 text-purple-500" />
                                        Enhanced Console
                                    </h3>
                                    <p className="text-gray-400 mb-3">Professional-grade developer console:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li><strong className="text-white">Console Tab:</strong> Standard logging output</li>
                                        <li><strong className="text-white">Advanced Tab:</strong> Command terminal interface</li>
                                        <li><strong className="text-white">Validator Tab:</strong> HTML/CSS/JS validation</li>
                                        <li><strong className="text-white">Preview Tab:</strong> Iframe console output</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Filter by INFO, WARN, ERROR</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Clear, copy, export logs</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Command history with Up/Down arrows</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Console Commands</h3>
                                    <p className="text-gray-400 mb-3">Available terminal commands:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li><code className="bg-gray-700 px-2 py-1 rounded">clear</code> - Clear console output</li>
                                        <li><code className="bg-gray-700 px-2 py-1 rounded">run</code> - Refresh preview</li>
                                        <li><code className="bg-gray-700 px-2 py-1 rounded">download</code> - Export project as ZIP</li>
                                        <li><code className="bg-gray-700 px-2 py-1 rounded">theme [dark|light]</code> - Change theme</li>
                                        <li><code className="bg-gray-700 px-2 py-1 rounded">history</code> - View code history</li>
                                        <li><code className="bg-gray-700 px-2 py-1 rounded">ai assistant</code> - Open AI chat</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Code Validation</h3>
                                    <p className="text-gray-400 mb-3">Real-time validation in Validator tab:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />HTML validation (unclosed tags, attributes)</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />CSS syntax checking</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />JavaScript error detection</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Auto-validate toggle</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Click to jump to error location</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Project Management */}
                        <section id="projects" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <FileText className="w-8 h-8 text-orange-500" />
                                Project Management
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Project System</h3>
                                    <p className="text-gray-400 mb-3">Organize your work into projects:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li><strong className="text-white">Create Project:</strong> Start new project with custom name</li>
                                        <li><strong className="text-white">Switch Projects:</strong> Quick project selector</li>
                                        <li><strong className="text-white">Rename:</strong> Update project name anytime</li>
                                        <li><strong className="text-white">Duplicate:</strong> Clone existing project</li>
                                        <li><strong className="text-white">Delete:</strong> Remove unwanted projects</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Projects stored in local storage</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Includes code, libraries, settings</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Auto-Save</h3>
                                    <p className="text-gray-400 mb-3">Your work is automatically saved:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Saves every 30 seconds</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Manual save with Ctrl+S</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Toggle auto-save in settings</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Save indicator shows status</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Per-project auto-save</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Export Options</h3>
                                    <p className="text-gray-400 mb-3">Download your project:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li><strong className="text-white">Export as ZIP:</strong> Complete project bundle</li>
                                        <li><strong className="text-white">Download HTML:</strong> Single HTML file</li>
                                        <li><strong className="text-white">Download CSS:</strong> Stylesheet file</li>
                                        <li><strong className="text-white">Download JS:</strong> JavaScript file</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Includes external libraries</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Ready for deployment</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* File Management */}
                        <section id="files" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <Upload className="w-8 h-8 text-cyan-500" />
                                File Management
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold mb-3">File Upload</h3>
                                    <p className="text-gray-400 mb-3">Import existing code:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Drag and drop files onto editor</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Click "Upload" button to browse</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Supports .html, .css, .js files</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Upload multiple files at once</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Auto-detects file type</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-indigo-500" />
                                        External Libraries
                                    </h3>
                                    <p className="text-gray-400 mb-3">Add third-party libraries via CDN:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li><strong className="text-white">Popular Libraries:</strong> Bootstrap, Tailwind, jQuery, React, Vue, Alpine.js, HTMX, anime.js, Chart.js, Three.js</li>
                                        <li><strong className="text-white">Custom CDN:</strong> Add any library URL</li>
                                        <li><strong className="text-white">Auto-Inject:</strong> CSS in head, JS before your code</li>
                                        <li><strong className="text-white">Manage:</strong> Reorder, enable/disable, remove</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Search and filter library list</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Version selection support</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Settings */}
                        <section id="settings" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <Settings className="w-8 h-8 text-gray-500" />
                                Settings & Customization
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Theme Options</h3>
                                    <p className="text-gray-400 mb-3">Customize the appearance:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li><strong className="text-white">Dark Themes:</strong> Dark, Dark Blue, Dark Purple</li>
                                        <li><strong className="text-white">Light Themes:</strong> Light, Light Blue, Light Purple</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Matte black & white design</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Applies to entire UI</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Persists between sessions</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Editor Settings</h3>
                                    <p className="text-gray-400 mb-3">Configure Monaco editor:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li><strong className="text-white">Font Family:</strong> Multiple monospace fonts</li>
                                        <li><strong className="text-white">Font Size:</strong> 12px - 24px range</li>
                                        <li><strong className="text-white">Auto-run JS:</strong> Toggle automatic execution</li>
                                        <li><strong className="text-white">Preview Delay:</strong> 0-1500ms update delay</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Settings synced across all editors</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Other Settings</h3>
                                    <ul className="space-y-2 text-gray-400">
                                        <li><strong className="text-white">Auto-Save:</strong> Enable/disable automatic saving</li>
                                        <li><strong className="text-white">AI Suggestions:</strong> Toggle AI features globally</li>
                                        <li><strong className="text-white">Console Filters:</strong> Show/hide log types</li>
                                        <li><strong className="text-white">Layout:</strong> Resize panels to preference</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Snippets */}
                        <section id="snippets" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <Package className="w-8 h-8 text-pink-500" />
                                Code Snippets
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Snippet System</h3>
                                    <p className="text-gray-400 mb-3">Save and reuse code patterns:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li><strong className="text-white">Create:</strong> Save current code as snippet</li>
                                        <li><strong className="text-white">Load:</strong> Replace editors with snippet code</li>
                                        <li><strong className="text-white">Insert:</strong> Append snippet to existing code</li>
                                        <li><strong className="text-white">Edit:</strong> Update snippet details</li>
                                        <li><strong className="text-white">Delete:</strong> Remove unwanted snippets</li>
                                        <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-500" />Organize with categories and tags</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Snippet Types</h3>
                                    <ul className="space-y-2 text-gray-400">
                                        <li><strong className="text-white">Full:</strong> Complete HTML/CSS/JS project</li>
                                        <li><strong className="text-white">HTML Only:</strong> HTML snippets</li>
                                        <li><strong className="text-white">CSS Only:</strong> Stylesheet snippets</li>
                                        <li><strong className="text-white">JavaScript Only:</strong> Script snippets</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Snippet Metadata</h3>
                                    <p className="text-gray-400 mb-3">Each snippet includes:</p>
                                    <ul className="space-y-2 text-gray-400">
                                        <li>Name and description</li>
                                        <li>Category for organization</li>
                                        <li>Tags for searchability</li>
                                        <li>Creation and update timestamps</li>
                                        <li>Scope (private/public - future feature)</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Keyboard Shortcuts */}
                        <section id="shortcuts" className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                                <Keyboard className="w-8 h-8 text-yellow-500" />
                                Keyboard Shortcuts
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Global Shortcuts</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-mono text-sm">Ctrl + S</span>
                                                <span className="text-gray-400">Manual Save</span>
                                            </div>
                                        </div>
                                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-mono text-sm">Ctrl + Z</span>
                                                <span className="text-gray-400">Undo</span>
                                            </div>
                                        </div>
                                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-mono text-sm">Ctrl + Y</span>
                                                <span className="text-gray-400">Redo</span>
                                            </div>
                                        </div>
                                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-mono text-sm">Shift + Alt + F</span>
                                                <span className="text-gray-400">Format Code</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Editor Shortcuts</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-mono text-sm">Ctrl + F</span>
                                                <span className="text-gray-400">Find</span>
                                            </div>
                                        </div>
                                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-mono text-sm">Ctrl + H</span>
                                                <span className="text-gray-400">Replace</span>
                                            </div>
                                        </div>
                                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-mono text-sm">Ctrl + /</span>
                                                <span className="text-gray-400">Toggle Comment</span>
                                            </div>
                                        </div>
                                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-mono text-sm">Alt + Click</span>
                                                <span className="text-gray-400">Multi-Cursor</span>
                                            </div>
                                        </div>
                                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-mono text-sm">F1</span>
                                                <span className="text-gray-400">Command Palette</span>
                                            </div>
                                        </div>
                                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-mono text-sm">Tab</span>
                                                <span className="text-gray-400">Accept Suggestion</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Console Shortcuts</h3>
                                    <ul className="space-y-2 text-gray-400">
                                        <li className="flex items-center gap-2"><kbd className="bg-gray-700 px-2 py-1 rounded">↑</kbd> <span>Previous command</span></li>
                                        <li className="flex items-center gap-2"><kbd className="bg-gray-700 px-2 py-1 rounded">↓</kbd> <span>Next command</span></li>
                                        <li className="flex items-center gap-2"><kbd className="bg-gray-700 px-2 py-1 rounded">Enter</kbd> <span>Execute command</span></li>
                                        <li className="flex items-center gap-2"><kbd className="bg-gray-700 px-2 py-1 rounded">Esc</kbd> <span>Clear input</span></li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* FAQ */}
                        <section className={`${isDark ? 'bg-gradient-to-br from-purple-900 to-blue-900 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'} border rounded-lg p-8`}>
                            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                <details className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg`}>
                                    <summary className="font-semibold cursor-pointer">How do I save my work?</summary>
                                    <p className="text-gray-400 mt-2">Your work auto-saves every 30 seconds to browser local storage. You can also manually save with Ctrl+S. Projects persist between sessions.</p>
                                </details>
                                <details className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg`}>
                                    <summary className="font-semibold cursor-pointer">Do I need to create an account?</summary>
                                    <p className="text-gray-400 mt-2">No! GB Coder works completely in your browser without any login or sign-up required. All data is stored locally.</p>
                                </details>
                                <details className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg`}>
                                    <summary className="font-semibold cursor-pointer">How do I get AI features to work?</summary>
                                    <p className="text-gray-400 mt-2">Get a free Google Gemini API key from Google AI Studio, then enter it in Settings. AI features will activate immediately.</p>
                                </details>
                                <details className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg`}>
                                    <summary className="font-semibold cursor-pointer">Can I use external libraries?</summary>
                                    <p className="text-gray-400 mt-2">Yes! Open Settings → External Libraries to add popular libraries or custom CDN URLs. They'll automatically inject into your preview.</p>
                                </details>
                                <details className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg`}>
                                    <summary className="font-semibold cursor-pointer">How do I export my project?</summary>
                                    <p className="text-gray-400 mt-2">Use the Download button to export as ZIP containing all files, or use console command "download". You can also download individual files.</p>
                                </details>
                                <details className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg`}>
                                    <summary className="font-semibold cursor-pointer">Is my code private?</summary>
                                    <p className="text-gray-400 mt-2">Yes! Code is stored only in your browser's local storage. AI features send code to Google/OpenRouter only when you request suggestions.</p>
                                </details>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DocumentationPage;
