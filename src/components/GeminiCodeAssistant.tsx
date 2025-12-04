import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Download,
  CheckCircle,
  AlertCircle,
  Code,
  X,
  Maximize2,
  Minimize2,
  Paperclip,
  FileText
} from 'lucide-react';
import { GeminiChatMessage, GeminiCodeBlock, EditorLanguage, Attachment } from '../types';
import { aiCodeAssistant } from '../services/aiCodeAssistant';

interface GeminiCodeAssistantProps {
  currentCode: {
    html: string;
    css: string;
    javascript: string;
  };
  onCodeUpdate: (language: EditorLanguage, code: string) => void;
  onClose?: () => void;
}

const GeminiCodeAssistant: React.FC<GeminiCodeAssistantProps> = ({
  currentCode,
  onCodeUpdate,
  onClose
}) => {
  const [messages, setMessages] = useState<GeminiChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  // Window position and size state - Bottom Right Corner
  const [position, setPosition] = useState({ x: window.innerWidth - 424, y: window.innerHeight - 520 });
  const [size, setSize] = useState({ width: 400, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Attachments state
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modification workflow state
  const [modificationState, setModificationState] = useState<{
    isActive: boolean;
    step: 'lineNumber' | 'action' | 'confirmation';
    language: EditorLanguage;
    lineNumber?: number;
    action?: 'insert' | 'replace';
    originalCode?: string;
    newCode?: string;
  }>({ isActive: false, step: 'lineNumber', language: 'html' });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setApiKeyConfigured(aiCodeAssistant.isConfigured());

    // Add welcome message
    if (aiCodeAssistant.isConfigured()) {
      setMessages([{
        id: 'welcome',
        type: 'assistant',
        content: `🤖 **Code Buddy Ready**

I'm your specialized code assistant for HTML, CSS, and JavaScript. I can help you with:

• **Code Generation**: "Create a responsive navbar" or "Generate CSS grid layout"
• **Code Modifications**: "Modify line 15" or "Insert code at line 8"  
• **Debugging**: "Fix my JavaScript errors" or "Why isn't my CSS working?"
• **Optimization**: "Optimize my code for performance"

**Quick Commands:**
- "Give me HTML code for [description]"
- "Generate CSS for [description]"  
- "Create JavaScript for [description]"
- "Modify line [number]" (starts modification workflow)

How can I help you today?`,
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        setSize({
          width: Math.max(320, resizeStart.width + deltaX),
          height: Math.max(400, resizeStart.height + deltaY)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeStart]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      const rect = windowRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  // File handling
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const processFiles = async (files: File[]) => {
    const newAttachments: Attachment[] = [];

    for (const file of files) {
      try {
        const isImage = file.type.startsWith('image/');
        const content = await readFile(file);

        newAttachments.push({
          id: Math.random().toString(36).substring(7),
          name: file.name,
          type: isImage ? 'image' : 'file',
          content,
          mimeType: file.type
        });
      } catch (error) {
        console.error('Error reading file:', file.name, error);
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }

      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };



  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: GeminiChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let response: GeminiChatMessage;

      // Handle modification workflow
      if (modificationState.isActive) {
        const result = await aiCodeAssistant.processModificationInput(
          inputMessage,
          modificationState.step,
          {
            originalCode: modificationState.originalCode || '',
            language: modificationState.language,
            lineNumber: modificationState.lineNumber,
            action: modificationState.action,
            newCode: modificationState.newCode
          }
        );

        if (result.error) {
          response = {
            id: Date.now().toString(),
            type: 'assistant',
            content: `❌ **Error**: ${result.error}`,
            timestamp: new Date().toISOString()
          };
        } else if (result.modification) {
          // Apply the modification
          const updatedCode = aiCodeAssistant.applyCodeModification(
            modificationState.originalCode!,
            result.modification
          );

          onCodeUpdate(modificationState.language, updatedCode);

          response = {
            id: Date.now().toString(),
            type: 'assistant',
            content: `✅ **Code Modified Successfully**\n\nApplied ${result.modification.action} at line ${result.modification.lineNumber} in ${modificationState.language.toUpperCase()}.`,
            timestamp: new Date().toISOString()
          };

          setModificationState({ isActive: false, step: 'lineNumber', language: 'html' });
        } else {
          response = {
            id: Date.now().toString(),
            type: 'assistant',
            content: result.prompt || 'Please continue...',
            timestamp: new Date().toISOString()
          };

          // Update modification state for next step
          if (result.awaitingInput) {
            setModificationState(prev => ({
              ...prev,
              step: result.awaitingInput!,
              ...(modificationState.step === 'lineNumber' && { lineNumber: parseInt(inputMessage) }),
              ...(modificationState.step === 'action' && {
                action: inputMessage === '1' || inputMessage.toLowerCase() === 'insert' ? 'insert' : 'replace'
              })
            }));
          }
        }
      } else {
        // Check if this is a modification request
        if (inputMessage.toLowerCase().includes('modify line') || inputMessage.toLowerCase().includes('change line')) {
          const lineMatch = inputMessage.match(/line\s+(\d+)/i);
          if (lineMatch) {
            const lineNumber = parseInt(lineMatch[1]);
            // Detect which language to modify based on context or ask user
            const language = detectLanguageFromContext(inputMessage) || 'html';
            const code = currentCode[language];

            const validation = aiCodeAssistant.validateLineNumber(code, lineNumber);
            if (validation.isValid) {
              setModificationState({
                isActive: true,
                step: 'action',
                language,
                lineNumber,
                originalCode: code
              });

              response = {
                id: Date.now().toString(),
                type: 'assistant',
                content: `🔧 **Code Modification Mode**\n\nModifying ${language.toUpperCase()} at line ${lineNumber}\n\nSelect action: [1] Insert [2] Replace`,
                timestamp: new Date().toISOString()
              };
            } else {
              response = {
                id: Date.now().toString(),
                type: 'assistant',
                content: `❌ **Error**: ${validation.error}`,
                timestamp: new Date().toISOString()
              };
            }
          } else {
            response = {
              id: Date.now().toString(),
              type: 'assistant',
              content: `🔧 **Code Modification**\n\nPlease specify the line number. Example: "modify line 15"`,
              timestamp: new Date().toISOString()
            };
          }
        } else if (isCodeGenerationRequest(inputMessage)) {
          // Handle code generation
          const detectedType = detectLanguageFromRequest(inputMessage);
          response = await aiCodeAssistant.generateCode(inputMessage, detectedType);
        } else {
          // Handle general chat
          response = await aiCodeAssistant.sendMessage({
            message: inputMessage,
            currentCode,
            conversationHistory: messages.slice(-5), // Last 5 messages for context
            attachments
          });
        }
      }

      setMessages(prev => [...prev, response]);
      setAttachments([]); // Clear attachments after sending
    } catch (error) {
      const errorMessage: GeminiChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `❌ **Error**: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInsertCode = (codeBlock: GeminiCodeBlock) => {
    onCodeUpdate(codeBlock.language, codeBlock.code);

    // Add confirmation message
    const confirmMessage: GeminiChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `✅ **Code Inserted**\n\n${codeBlock.language.toUpperCase()} code has been inserted into the editor.`,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, confirmMessage]);
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const detectLanguageFromContext = (message: string): EditorLanguage | null => {
    const lower = message.toLowerCase();
    if (lower.includes('html')) return 'html';
    if (lower.includes('css')) return 'css';
    if (lower.includes('javascript') || lower.includes('js')) return 'javascript';
    return null;
  };

  const detectLanguageFromRequest = (message: string): EditorLanguage => {
    const lower = message.toLowerCase();
    if (lower.includes('html') || lower.includes('markup') || lower.includes('element')) return 'html';
    if (lower.includes('css') || lower.includes('style') || lower.includes('design')) return 'css';
    if (lower.includes('javascript') || lower.includes('js') || lower.includes('function')) return 'javascript';
    return 'html'; // Default
  };

  const isCodeGenerationRequest = (message: string): boolean => {
    const lower = message.toLowerCase();
    return lower.includes('give me') || lower.includes('generate') || lower.includes('create') ||
      lower.includes('make') || lower.includes('build') || lower.includes('write');
  };

  const renderCodeBlock = (codeBlock: GeminiCodeBlock) => (
    <div key={codeBlock.id} className="mt-4 bg-gray-900 rounded-lg border border-gray-600 overflow-hidden">
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-600">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-300">
            {codeBlock.title || `${codeBlock.language.toUpperCase()} Code`}
          </span>
          {codeBlock.validated !== undefined && (
            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${codeBlock.validated
              ? 'bg-green-900 text-green-300'
              : 'bg-red-900 text-red-300'
              }`}>
              {codeBlock.validated ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Validated
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  Syntax Error
                </>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleCopyCode(codeBlock.code)}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Copy Code"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleInsertCode(codeBlock)}
            className="p-1.5 hover:bg-blue-600 rounded text-gray-400 hover:text-white transition-colors"
            title="Insert into Editor"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {codeBlock.syntaxError && (
          <div className="mb-3 p-2 bg-red-900 border border-red-700 rounded text-red-300 text-sm">
            <strong>Syntax Error:</strong> {codeBlock.syntaxError}
          </div>
        )}

        <pre className="text-sm text-gray-300 overflow-x-auto">
          <code className={`language-${codeBlock.language}`}>
            {codeBlock.code}
          </code>
        </pre>
      </div>
    </div>
  );

  if (!apiKeyConfigured) {
    return (
      <div
        ref={windowRef}
        className="fixed bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`
        }}
      >
        <div
          className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between cursor-move drag-handle"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-white" />
            <h3 className="text-base font-semibold text-white">Code Buddy</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="p-6 text-center">
          <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Gemini API Key Required</h3>
          <p className="text-gray-400 mb-4">
            To use Code Buddy, please add your API key to the environment variables.
          </p>
          <div className="bg-gray-800 rounded-lg p-4 text-left">
            <p className="text-sm text-gray-300 mb-2">Add to your .env file:</p>
            <code className="text-green-400 text-sm">VITE_GEMINI_API_KEY=your_api_key_here</code>
          </div>
        </div>
      </div>
    );
  }

  // Minimized view
  if (isMinimized) {
    return (
      <div
        ref={windowRef}
        className="fixed bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50 cursor-move"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '280px'
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between drag-handle">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-white" />
            <h3 className="text-base font-semibold text-white">Code Buddy</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all"
              title="Restore"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={windowRef}
      className={`fixed bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50 ${isExpanded ? 'inset-4' : ''
        }`}
      style={!isExpanded ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`
      } : {}}
    >
      {/* Header */}
      <div
        className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between cursor-move drag-handle"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-white" />
          <h3 className="text-base font-semibold text-white">Code Buddy</h3>
          {modificationState.isActive && (
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-lg">
              Modification Mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all"
            title="Minimize"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all"
            title={isExpanded ? "Restore" : "Maximize"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className={`overflow-y-auto p-4 space-y-4 ${isExpanded ? 'h-[calc(100vh-200px)]' : 'flex-1'
        }`}
        style={!isExpanded ? { height: `calc(${size.height}px - 140px)` } : {}}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${message.type === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-sm'
                : 'bg-gray-700/50 text-gray-100 rounded-tl-sm backdrop-blur-sm'
                }`}
            >
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.codeBlocks?.map(renderCodeBlock)}
              </div>

              <div className="text-xs opacity-70 mt-2">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700/50 rounded-2xl rounded-tl-sm p-4 flex items-center gap-3 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 animate-pulse text-blue-400" />
              <span className="text-gray-300 text-sm font-medium">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className={`bg-gray-800/95 backdrop-blur border-t border-gray-700/50 p-4 transition-colors ${isDragOver ? 'bg-blue-900/50 border-blue-500' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {attachments.map(att => (
              <div key={att.id} className="relative group flex-shrink-0">
                <div className="bg-gray-700/80 rounded-lg p-2 flex items-center gap-2 border border-gray-600">
                  {att.type === 'image' ? (
                    <div className="w-8 h-8 rounded overflow-hidden bg-gray-800">
                      <img src={att.content} alt={att.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <FileText className="w-8 h-8 text-blue-400 p-1" />
                  )}
                  <span className="text-xs text-gray-300 max-w-[100px] truncate">{att.name}</span>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="absolute -top-1.5 -right-1.5 bg-gray-600 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isDragOver && (
          <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-b-lg">
            <div className="text-center">
              <Paperclip className="w-8 h-8 text-blue-300 mx-auto mb-2 animate-bounce" />
              <p className="text-blue-200 font-medium">Drop files to attach</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Attach files"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              modificationState.isActive
                ? `${modificationState.step === 'lineNumber' ? 'Enter line number...' :
                  modificationState.step === 'action' ? 'Select action (1 or 2)...' :
                    'Confirm changes (Y/N)...'}`
                : "Ask me anything about your code..."
            }
            className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />

          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          💡 Try: "Create a responsive navbar", "Generate CSS grid", "Modify line 15", "Fix my JavaScript"
        </div>
      </div>

      {/* Resize Handle */}
      {!isExpanded && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-700 hover:bg-gray-600"
          onMouseDown={handleResizeMouseDown}
          style={{
            clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
          }}
        />
      )}
    </div>
  );
};

export default GeminiCodeAssistant;
