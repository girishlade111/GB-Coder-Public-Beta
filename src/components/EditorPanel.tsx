import React, { useState } from 'react';
import { ChevronDown, Copy, Lock, Unlock, Wand2 } from 'lucide-react';
import CodeEditor from './CodeEditor';
import AISuggestButton from './AISuggestButton';
import ExplainCodeButton from './ExplainCodeButton';
import CopyToast from './ui/CopyToast';
import { EditorLanguage } from '../types';
import { useEditorActions } from '../hooks/useEditorActions';

interface EditorPanelProps {
  title: string;
  language: EditorLanguage;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  onAISuggest?: () => void;
  isAILoading?: boolean;
  onFormat?: () => void;
  isFormatLoading?: boolean;
  onExplain?: () => void;
  isExplainLoading?: boolean;
  editorRef?: React.MutableRefObject<any>;
  onSelectionChange?: (editor: any) => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  title,
  language,
  value,
  onChange,
  icon,
  onAISuggest,
  isAILoading = false,
  onFormat,
  isFormatLoading = false,
  onExplain,
  isExplainLoading = false,
  editorRef,
  onSelectionChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    isLocked,
    toggleLock,
    handleCopy,
    showCopyToast,
    copyToastMessage,
    closeCopyToast,
    handleFormat,
    canFormat,
    fileName,
  } = useEditorActions({
    value,
    language,
    onFormat,
    isFormatLoading,
  });

  const hasContent = value.trim().length > 0;

  return (
    <div className="bg-dark-gray border border-gray-700 rounded-lg overflow-hidden w-full">
      <div
        className="bg-matte-black px-4 py-3 border-b border-gray-700 flex items-center justify-between cursor-pointer hover:bg-dark-gray transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {/* Left side: Icon, Title, File Label, Language Badge */}
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-medium text-bright-white">{title}</h3>
          <span className="text-xs text-gray-500 font-mono">{fileName}</span>
          <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded uppercase">
            {language}
          </span>
        </div>

        {/* Right side: Action Buttons + Collapse Icon */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Format Button */}
          {onFormat && (
            <button
              onClick={handleFormat}
              disabled={!canFormat}
              className="p-1.5 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-purple-400 hover:text-purple-300 rounded transition-all duration-200"
              title={`Format ${language.toUpperCase()} code (Prettier)`}
            >
              <Wand2 className={`w-4 h-4 ${isFormatLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!hasContent}
            className="p-1.5 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-400 hover:text-bright-white rounded transition-all duration-200"
            title="Copy code to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Lock/Unlock Button */}
          <button
            onClick={toggleLock}
            className={`p-1.5 hover:bg-gray-700 rounded transition-all duration-200 ${isLocked ? 'text-amber-400 hover:text-amber-300' : 'text-gray-400 hover:text-bright-white'
              }`}
            title={isLocked ? 'Unlock editor (make editable)' : 'Lock editor (read-only)'}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          {/* Collapse Icon */}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ml-1 ${isCollapsed ? 'rotate-180' : ''
              }`}
            onClick={() => setIsCollapsed(!isCollapsed)}
          />
        </div>
      </div>

      {!isCollapsed && (
        <div className="relative">
          <div className="p-4">
            <CodeEditor
              language={language}
              value={value}
              onChange={onChange}
              height="300px"
              readOnly={isLocked}
              editorRef={editorRef}
              onSelectionChange={onSelectionChange}
            />
          </div>

          {/* Floating Action Buttons (AI Suggest, Explain) */}
          {onAISuggest && (
            <AISuggestButton
              language={language}
              onSuggest={onAISuggest}
              isLoading={isAILoading}
              hasContent={hasContent}
            />
          )}
          {onExplain && (
            <ExplainCodeButton
              language={language}
              onExplain={onExplain}
              isLoading={isExplainLoading}
              hasContent={hasContent}
            />
          )}
        </div>
      )}

      {/* Copy Toast */}
      {showCopyToast && (
        <CopyToast
          message={copyToastMessage}
          type={copyToastMessage.includes('Failed') ? 'error' : 'success'}
          onClose={closeCopyToast}
        />
      )}
    </div>
  );
};

export default EditorPanel;