import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Copy,
  Download,
  CheckCircle,
  AlertCircle,
  Code,
  X,
  Paperclip,
  FileText,
  Plus,
  History,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { GeminiChatMessage, GeminiCodeBlock, EditorLanguage, Attachment } from '../types';
import { aiCodeAssistant } from '../services/aiCodeAssistant';
import { CodeWriteConfirmationModal } from './CodeWriteConfirmationModal';
import { useCodeWriter } from '../hooks/useCodeWriter';

interface GeminiCodeAssistantProps {
  currentCode: {
    html: string;
    css: string;
    javascript: string;
  };
  onCodeUpdate: (language: EditorLanguage, code: string) => void;
  onCodeUpdateNoHistory?: (language: EditorLanguage, code: string) => void;
  onBatchCodeUpdate?: (code: { html?: string; css?: string; javascript?: string }) => void;
  onClearAllCode?: () => void;
  onClose?: () => void;
}

const GeminiCodeAssistant: React.FC<GeminiCodeAssistantProps> = ({
  currentCode,
  onCodeUpdate,
  onCodeUpdateNoHistory,
  onBatchCodeUpdate,
  onClearAllCode,
  onClose
}) => {
  const [messages, setMessages] = useState<GeminiChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatSessions, setChatSessions] = useState<Array<{
    id: string;
    timestamp: number;
    messages: GeminiChatMessage[];
    preview: string;
  }>>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Attachments state
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
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

  // Code writing workflow state
  const [showCodeConfirmation, setShowCodeConfirmation] = useState(false);
  const [pendingCode, setPendingCode] = useState<{
    html?: string;
    css?: string;
    javascript?: string;
    explanations: string[];
  } | null>(null);
  const [writingMode, setWritingMode] = useState<'section' | 'chatbot' | null>(null);
  const [writingProgress, setWritingProgress] = useState({
    current: '',
    html: 0,
    css: 0,
    js: 0
  });
  const { writeCode, isWriting } = useCodeWriter();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setApiKeyConfigured(aiCodeAssistant.isConfigured());

    // Load all chat sessions from localStorage
    const savedSessions = localStorage.getItem('codeBuddyChatSessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setChatSessions(parsed);
      } catch (e) {
        console.error('Failed to parse chat sessions', e);
      }
    }

    // Load current session
    const savedHistory = localStorage.getItem('codeBuddyHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }

    // Add welcome message if no history
    if (aiCodeAssistant.isConfigured()) {
      setMessages([getWelcomeMessage()]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('codeBuddyHistory', JSON.stringify(messages));

      // Auto-save current session to sessions list
      if (messages.length > 1) { // Only save if there are actual messages beyond welcome
        saveCurrentSession();
      }
    }
  }, [messages]);

  const saveCurrentSession = () => {
    if (messages.length <= 1) return; // Don't save if only welcome message

    const sessionId = currentSessionId || Date.now().toString();
    if (!currentSessionId) {
      setCurrentSessionId(sessionId);
    }

    const preview = messages[1]?.content.substring(0, 50) || 'New Chat';
    const session = {
      id: sessionId,
      timestamp: Date.now(),
      messages: messages,
      preview: preview + (messages[1]?.content.length > 50 ? '...' : '')
    };

    setChatSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      const updated = [session, ...filtered].slice(0, 20); // Keep max 20 sessions
      localStorage.setItem('codeBuddyChatSessions', JSON.stringify(updated));
      return updated;
    });
  };

  const loadChatSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setMessages(session.messages);
      setCurrentSessionId(sessionId);
      setShowHistory(false);
      localStorage.setItem('codeBuddyHistory', JSON.stringify(session.messages));
    }
  };

  const deleteChatSession = (sessionId: string) => {
    setChatSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      localStorage.setItem('codeBuddyChatSessions', JSON.stringify(updated));
      return updated;
    });
  };

  const getWelcomeMessage = (): GeminiChatMessage => ({
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
  });

  const handleNewChat = () => {
    // Save current session before starting new one
    if (messages.length > 1) {
      saveCurrentSession();
    }

    aiCodeAssistant.clearHistory();
    localStorage.removeItem('codeBuddyHistory');
    setMessages([getWelcomeMessage()]);
    setCurrentSessionId(null);
    setShowHistory(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);

    // Check for @ mention
    const lastWord = value.split(/\s/).pop();
    if (lastWord?.startsWith('@')) {
      setShowMentionPopup(true);
      setMentionFilter(lastWord.substring(1).toLowerCase());
    } else {
      setShowMentionPopup(false);
    }
  };

  const handleMentionSelect = (type: 'html' | 'css' | 'javascript') => {
    const words = inputMessage.split(/\s/);
    words.pop(); // Remove the partial @mention
    const newValue = [...words, `@${type}`].join(' ') + ' ';
    setInputMessage(newValue);
    setShowMentionPopup(false);
    inputRef.current?.focus();
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Check for mentions and create attachments
    const mentionedAttachments: Attachment[] = [];
    if (inputMessage.toLowerCase().includes('@html')) {
      mentionedAttachments.push({
        id: `mention-html-${Date.now()}`,
        name: 'index.html',
        type: 'file',
        content: currentCode.html,
        mimeType: 'text/html'
      });
    }
    if (inputMessage.toLowerCase().includes('@css')) {
      mentionedAttachments.push({
        id: `mention-css-${Date.now()}`,
        name: 'style.css',
        type: 'file',
        content: currentCode.css,
        mimeType: 'text/css'
      });
    }
    if (inputMessage.toLowerCase().includes('@javascript') || inputMessage.toLowerCase().includes('@js')) {
      mentionedAttachments.push({
        id: `mention-js-${Date.now()}`,
        name: 'script.js',
        type: 'file',
        content: currentCode.javascript,
        mimeType: 'text/javascript'
      });
    }

    const allAttachments = [...attachments, ...mentionedAttachments];

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
            attachments: allAttachments
          });
        }
      }

      // Detect code in response and show confirmation modal
      const parsedCode = aiCodeAssistant.detectCodeInResponse(response.content);

      if (parsedCode.hasCode) {
        // Show confirmation modal
        setPendingCode(parsedCode);
        setShowCodeConfirmation(true);

        // Add initial explanation message if present
        if (parsedCode.explanations.length > 0) {
          const explanationMessage: GeminiChatMessage = {
            id: `explanation-${Date.now()}`,
            type: 'assistant',
            content: parsedCode.explanations.join('\n\n'),
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, explanationMessage]);
        }
      } else {
        // No code detected, add response normally
        setMessages(prev => [...prev, response]);
      }

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

  // Code writing workflow handlers
  const handleAgreeToSectionMode = async () => {
    if (!pendingCode) return;

    setWritingMode('section');
    setShowCodeConfirmation(false);

    // Save current state to history BEFORE clearing
    // This creates one history entry for the "before" state
    // (onClearAllCode will also save, capturing the cleared state)

    // Clear all sections if onClearAllCode is provided
    if (onClearAllCode) {
      onClearAllCode();
    }

    // Start writing progress message
    const progressMessage: GeminiChatMessage = {
      id: `progress-${Date.now()}`,
      type: 'assistant',
      content: '✍️ **Writing code to sections...**\n\nPlease wait while I write the code to your editor...',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, progressMessage]);

    try {
      // Write HTML
      if (pendingCode.html) {
        await animateCodeWriting(pendingCode.html, 'html');
      }

      // Write CSS
      if (pendingCode.css) {
        await animateCodeWriting(pendingCode.css, 'css');
      }

      // Write JavaScript
      if (pendingCode.javascript) {
        await animateCodeWriting(pendingCode.javascript, 'javascript');
      }

      // Save final state to history AFTER all writing is complete
      // Use batch update to save ONE history entry instead of three
      // This ensures redo works correctly
      if (onBatchCodeUpdate) {
        onBatchCodeUpdate({
          html: pendingCode.html,
          css: pendingCode.css,
          javascript: pendingCode.javascript
        });
      } else {
        // Fallback: update individually (may create multiple history entries)
        if (pendingCode.html) onCodeUpdate('html', pendingCode.html);
        if (pendingCode.css) onCodeUpdate('css', pendingCode.css);
        if (pendingCode.javascript) onCodeUpdate('javascript', pendingCode.javascript);
      }

      // Success message
      const successMessage: GeminiChatMessage = {
        id: `success-${Date.now()}`,
        type: 'assistant',
        content: '✅ **Code Writing Complete!**\n\nAll code has been written to your sections.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, successMessage]);
    } catch (error) {
      const errorMessage: GeminiChatMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: '❌ **Error**: Failed to write code to sections.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setPendingCode(null);
      setWritingMode(null);
    }
  };

  const handleDeclineSectionMode = () => {
    if (!pendingCode) return;

    setWritingMode('chatbot');
    setShowCodeConfirmation(false);

    // Format and display code in chatbot
    const formattedResponse = aiCodeAssistant.formatResponseForChatbot(pendingCode);
    const chatbotMessage: GeminiChatMessage = {
      id: `chatbot-${Date.now()}`,
      type: 'assistant',
      content: formattedResponse,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, chatbotMessage]);
    setPendingCode(null);
    setWritingMode(null);
  };

  const animateCodeWriting = async (code: string, language: 'html' | 'css' | 'javascript'): Promise<void> => {
    return new Promise((resolve) => {
      writeCode(
        code,
        (partial, progress) => {
          // Use onCodeUpdateNoHistory during animation to avoid creating history entries
          // This prevents hundreds of history saves during typewriter effect
          if (onCodeUpdateNoHistory) {
            onCodeUpdateNoHistory(language, partial);
          } else {
            // Fallback to regular update if no-history version not provided
            onCodeUpdate(language, partial);
          }

          // Update progress
          setWritingProgress(prev => ({
            ...prev,
            [language === 'javascript' ? 'js' : language]: Math.round((progress.writtenChars / progress.totalChars) * 100)
          }));
        },
        15 // chars per frame
      ).then(resolve);
    });
  };

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(```(?:[\w-]+)?\n[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // Handle code blocks
      if (part.startsWith('```')) {
        const match = part.match(/```([\w-]+)?\n([\s\S]*?)```/);
        if (match) {
          const language = (match[1] || 'javascript').toLowerCase();
          const code = match[2];

          let editorLanguage: EditorLanguage = 'javascript';
          if (language.includes('html')) editorLanguage = 'html';
          else if (language.includes('css')) editorLanguage = 'css';

          return (
            <div key={index} className="my-4">
              {renderCodeBlock({
                id: `code-${index}`,
                language: editorLanguage,
                code: code.trim()
              })}
            </div>
          );
        }
      }

      if (!part.trim()) return null;

      // Parse markdown formatting
      const lines = part.split('\n');
      const elements: JSX.Element[] = [];
      let listItems: string[] = [];
      let listType: 'ul' | 'ol' | null = null;

      const flushList = () => {
        if (listItems.length > 0 && listType) {
          const ListTag = listType;
          elements.push(
            <ListTag key={`list-${elements.length}`} className={`my-2 space-y-1 ${listType === 'ul' ? 'list-disc' : 'list-decimal'} list-inside text-gray-200`}>
              {listItems.map((item, i) => (
                <li key={i} className="ml-2">{parseInlineMarkdown(item)}</li>
              ))}
            </ListTag>
          );
          listItems = [];
          listType = null;
        }
      };

      const parseInlineMarkdown = (text: string) => {
        // Handle inline code
        text = text.replace(/`([^`]+)`/g, (_, code) => {
          return `<code class="px-1.5 py-0.5 bg-gray-700 text-gray-100 rounded text-sm font-mono">${code}</code>`;
        });

        // Handle bold
        text = text.replace(/\*\*([^*]+)\*\*/g, (_, bold) => {
          return `<strong class="font-semibold text-white">${bold}</strong>`;
        });

        // Handle italic
        text = text.replace(/\*([^*]+)\*/g, (_, italic) => {
          return `<em class="italic text-gray-300">${italic}</em>`;
        });

        return <span dangerouslySetInnerHTML={{ __html: text }} />;
      };

      lines.forEach((line, lineIndex) => {
        // Handle headings
        if (line.startsWith('### ')) {
          flushList();
          elements.push(
            <h3 key={`h3-${elements.length}`} className="text-base font-semibold text-white mt-4 mb-2">
              {parseInlineMarkdown(line.substring(4))}
            </h3>
          );
        } else if (line.startsWith('## ')) {
          flushList();
          elements.push(
            <h2 key={`h2-${elements.length}`} className="text-lg font-semibold text-white mt-4 mb-2">
              {parseInlineMarkdown(line.substring(3))}
            </h2>
          );
        } else if (line.startsWith('# ')) {
          flushList();
          elements.push(
            <h1 key={`h1-${elements.length}`} className="text-xl font-bold text-white mt-4 mb-3">
              {parseInlineMarkdown(line.substring(2))}
            </h1>
          );
        }
        // Handle unordered lists
        else if (line.match(/^[\-\*\•]\s+(.+)/)) {
          const match = line.match(/^[\-\*\•]\s+(.+)/);
          if (match) {
            if (listType !== 'ul') {
              flushList();
              listType = 'ul';
            }
            listItems.push(match[1]);
          }
        }
        // Handle numbered lists
        else if (line.match(/^\d+\.\s+(.+)/)) {
          const match = line.match(/^\d+\.\s+(.+)/);
          if (match) {
            if (listType !== 'ol') {
              flushList();
              listType = 'ol';
            }
            listItems.push(match[1]);
          }
        }
        // Handle regular paragraphs
        else if (line.trim()) {
          flushList();
          elements.push(
            <p key={`p-${elements.length}`} className="text-gray-200 leading-relaxed my-2">
              {parseInlineMarkdown(line)}
            </p>
          );
        }
        // Handle empty lines
        else if (lineIndex < lines.length - 1) {
          flushList();
        }
      });

      flushList();

      return (
        <div key={index} className="space-y-1">
          {elements}
        </div>
      );
    });
  };

  const renderCodeBlock = (codeBlock: GeminiCodeBlock) => (
    <div key={codeBlock.id} className="bg-gray-900 rounded-lg border border-gray-600 overflow-hidden">
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
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />

        {/* Sidebar */}
        <div className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-matte-black border-l border-gray-800 shadow-2xl z-50 flex flex-col animate-slideIn">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-matte-black">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Code Buddy</h2>
                <p className="text-xs text-gray-400">AI Code Assistant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div>
              <Bot className="w-16 h-16 text-white mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Gemini API Key Required</h3>
              <p className="text-gray-400 mb-4">
                To use Code Buddy, please add your API key to the environment variables.
              </p>
              <div className="bg-gray-800 rounded-lg p-4 text-left max-w-md mx-auto">
                <p className="text-sm text-gray-300 mb-2">Add to your .env file:</p>
                <code className="text-green-400 text-sm">VITE_GEMINI_API_KEY=your_api_key_here</code>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .animate-slideIn {
            animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-matte-black border-l border-gray-800 shadow-2xl z-50 flex flex-col animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-matte-black">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Code Buddy</h2>
              <p className="text-xs text-gray-400">AI Code Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-lg transition-colors ${showHistory
                ? 'bg-gray-800 text-white'
                : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                }`}
              title="Chat History"
            >
              <History className="w-5 h-5" />
            </button>
            <button
              onClick={handleNewChat}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages or History View */}
        {showHistory ? (
          <div className="flex-1 overflow-y-auto p-4 bg-matte-black">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Chats</h3>
            </div>

            {chatSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-600 mb-3" />
                <p className="text-gray-400 text-sm">No chat history yet</p>
                <p className="text-gray-500 text-xs mt-1">Start a new conversation to see it here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className="group relative bg-gray-800 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition-colors cursor-pointer"
                    onClick={() => loadChatSession(session.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 truncate mb-1">{session.preview}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChatSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400 transition-all"
                        title="Delete chat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-matte-black">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-4 ${message.type === 'user'
                    ? 'bg-gray-900 text-gray-100 border border-blue-600'
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                    }`}
                >
                  <div className="prose prose-sm max-w-none">
                    {renderMessageContent(message.content)}
                  </div>

                  <div className="text-xs opacity-70 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center gap-3">
                  <Bot className="w-4 h-4 animate-pulse text-white" />
                  <span className="text-gray-300 text-sm font-medium">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <div
          className={`bg-gray-900 border-t border-gray-800 p-4 transition-colors ${isDragOver ? 'bg-blue-900/50 border-blue-500' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Mention Popup */}
          {showMentionPopup && (
            <div className="absolute bottom-full left-4 mb-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50 animate-in slide-in-from-bottom-2 duration-200">
              <div className="p-2 border-b border-gray-700 text-xs font-medium text-gray-400">
                Mention file
              </div>
              <div className="max-h-48 overflow-y-auto">
                {['html', 'css', 'javascript'].filter(t => t.includes(mentionFilter)).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleMentionSelect(type as any)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-blue-600 hover:text-white flex items-center gap-2 transition-colors"
                  >
                    <Code className="w-4 h-4" />
                    <span>Current {type.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

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
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
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
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={
                modificationState.isActive
                  ? `${modificationState.step === 'lineNumber' ? 'Enter line number...' :
                    modificationState.step === 'action' ? 'Select action (1 or 2)...' :
                      'Confirm changes (Y/N)...'}`
                  : "Ask me anything about your code..."
              }
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
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

        {/* Code Write Confirmation Modal */}
        <CodeWriteConfirmationModal
          isOpen={showCodeConfirmation}
          onAgree={handleAgreeToSectionMode}
          onDecline={handleDeclineSectionMode}
          onClose={() => {
            setShowCodeConfirmation(false);
            setPendingCode(null);
          }}
        />
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
};

export default GeminiCodeAssistant;
