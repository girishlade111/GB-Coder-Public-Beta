/**
 * ROUTING PATCH FOR APP.TSX
 * 
 * This file contains the changes needed to add legal page routing to App.tsx.
 * Apply these changes manually to complete the legal page integration.
 */

// ============================================================================
// STEP 1: Add imports (after line 14, after "import AboutPage from './components/pages/AboutPage';")
// ============================================================================

import PrivacyPolicyPage from './components/pages/PrivacyPolicyPage';
import TermsOfServicePage from './components/pages/TermsOfServicePage';
import ContactPage from './components/pages/ContactPage';
import CookiePolicyPage from './components/pages/CookiePolicyPage';
import DisclaimerPage from './components/pages/DisclaimerPage';


// ============================================================================
// STEP 2: Update AppView type (line 28)
// ============================================================================

// REPLACE THIS:
// type AppView = 'editor' | 'history' | 'about';

// WITH THIS:
type AppView = 'editor' | 'history' | 'about' | 'privacy' | 'terms' | 'contact' | 'cookies' | 'disclaimer';


// ============================================================================
// STEP 3: Add navigation event listener (after line 132, after the existing navigate-to-about listener)
// ============================================================================

// ADD THIS new useEffect hook after the existing "navigate-to-about" listener:

// Handle navigation to legal pages from footer
React.useEffect(() => {
    const handlePageNavigation = (event: Event) => {
        const customEvent = event as CustomEvent;
        const { view } = customEvent.detail;
        if (['privacy', 'terms', 'contact', 'cookies', 'disclaimer', 'about'].includes(view)) {
            setCurrentView(view as AppView);
        }
    };

    window.addEventListener('navigate-to-page', handlePageNavigation);
    return () => window.removeEventListener('navigate-to-page', handlePageNavigation);
}, []);


// ============================================================================
// STEP 4: Add page rendering logic (BEFORE line 459, before "// Render about page")
// ============================================================================

// ADD THESE rendering sections BEFORE the "// Render about page" comment:

// Render legal pages
if (['privacy', 'terms', 'contact', 'cookies', 'disclaimer'].includes(currentView)) {
    let PageComponent: React.ComponentType = () => null;

    switch (currentView) {
        case 'privacy':
            PageComponent = PrivacyPolicyPage;
            break;
        case 'terms':
            PageComponent = TermsOfServicePage;
            break;
        case 'contact':
            PageComponent = ContactPage;
            break;
        case 'cookies':
            PageComponent = CookiePolicyPage;
            break;
        case 'disclaimer':
            PageComponent = DisclaimerPage;
            break;
    }

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
                onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
                canUndo={codeHistory.canUndo}
                canRedo={codeHistory.canRedo}
                autoSaveEnabled={autoSaveEnabled}
                aiAssistantOpen={showGeminiAssistant}
                aiSuggestionsOpen={showAISuggestions}
                customActions={
                    <button
                        onClick={() => setCurrentView('editor')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Back to Editor
                    </button>
                }
            />
            <div className="flex-1">
                <PageComponent />
            </div>
            <Footer />
            <ExternalLibraryManager
                isOpen={showExternalLibraryManager}
                onClose={() => setShowExternalLibraryManager(false)}
                libraries={externalLibraries}
                onLibrariesChange={handleExternalLibrariesChange}
            />
        </div>
    );
}

// ============================================================================
// THAT'S IT! Save the file and the legal pages should work.
// ============================================================================
