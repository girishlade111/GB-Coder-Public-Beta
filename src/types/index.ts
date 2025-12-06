export interface CodeSnippet {
  id: string;
  name: string;
  description?: string;
  html: string;
  css: string;
  javascript: string;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  category?: string;
}

export interface ConsoleLog {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: string;
}

export interface AISuggestion {
  id: string;
  type: 'improvement' | 'accessibility' | 'performance' | 'best-practice';
  language: EditorLanguage;
  title: string;
  description: string;
  code: string;
  line?: number;
  severity: 'low' | 'medium' | 'high';
}

export interface AutoSaveState {
  html: string;
  css: string;
  javascript: string;
  timestamp: string;
}

// AI Enhancement Types
export interface AIEnhancement {
  id: string;
  language: EditorLanguage;
  originalCode: string;
  enhancedCode: string;
  improvements: string[];
  explanation: string;
  timestamp: string;
  confidence: number;
  suggestions: AICodeSuggestion[];
}

export interface AICodeSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'performance' | 'accessibility' | 'best-practice' | 'security' | 'maintainability';
  impact: 'low' | 'medium' | 'high';
  code: string;
  lineNumber?: number;
  selected?: boolean;
}

export interface CodeComparison {
  original: string;
  enhanced: string;
  differences: CodeDifference[];
  stats: {
    linesAdded: number;
    linesRemoved: number;
    linesModified: number;
  };
}

export interface CodeDifference {
  type: 'addition' | 'deletion' | 'modification';
  lineNumber: number;
  content: string;
  description: string;
  category?: 'improvement' | 'fix' | 'optimization';
}

// Gemini Chat Types
export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  content: string;
  mimeType?: string;
}

export interface GeminiChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  codeBlocks?: GeminiCodeBlock[];
  isLoading?: boolean;
  error?: string;
}

export interface GeminiCodeBlock {
  id: string;
  language: 'html' | 'css' | 'javascript';
  code: string;
  title?: string;
  description?: string;
  lineNumbers?: boolean;
  validated?: boolean;
  syntaxError?: string;
}

export interface CodeModificationRequest {
  action: 'replace' | 'insert';
  lineNumber: number;
  code: string;
  language: 'html' | 'css' | 'javascript';
  confirmed?: boolean;
}

export interface GeminiChatRequest {
  message: string;
  currentCode: {
    html: string;
    css: string;
    javascript: string;
  };
  conversationHistory?: GeminiChatMessage[];
  attachments?: Attachment[];
}

// Terminal-specific types
export interface TerminalCommand {
  command: string;
  args: string[];
  timestamp: string;
  output?: TerminalOutput[];
}

export interface TerminalOutput {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'system';
  message: string;
  timestamp: string;
}

export interface VirtualFile {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  size?: number;
  created: string;
  modified: string;
  parent?: string;
}

export interface NPMPackage {
  name: string;
  version: string;
  description?: string;
  installed: string;
  size?: number;
}

export interface TerminalState {
  currentDirectory: string;
  commandHistory: string[];
  fileSystem: Record<string, VirtualFile>;
  npmPackages: Record<string, NPMPackage>;
  environment: Record<string, string>;
}

export type Theme = 'dark' | 'light';

export type EditorLanguage = 'html' | 'css' | 'javascript';

// Code Explanation Types
export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export interface CodeExplanation {
  id: string;
  code: string;
  language: EditorLanguage;
  userLevel: UserLevel;
  summary: string;
  breakdown: ExplanationBlock[];
  notes: ExplanationNote[];
  suggestions: string[];
  exampleInputOutput?: { input: string; output: string };
  annotatedCode?: string;
  simplifiedExplanation?: string;
  timestamp: string;
}

export interface ExplanationBlock {
  id: string;
  lineStart: number;
  lineEnd: number;
  codeSnippet: string;
  explanation: string;
  explanation: string;
}

export interface ExplanationNote {
  id: string;
  type: 'pitfall' | 'security' | 'performance' | 'best-practice';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
}

// AI Error Fix Types
export interface ErrorFixResponse {
  id: string;
  originalError: string;
  fixedHtml: string;
  fixedCss: string;
  fixedJavascript: string;
  explanation: string;
  confidence: number;
  changesApplied: {
    html: boolean;
    css: boolean;
    javascript: boolean;
  };
  timestamp: string;
}

export interface EnhancedConsoleLog extends ConsoleLog {
  stackTrace?: string;
  lineNumber?: number;
  columnNumber?: number;
  sourceFile?: string;
  canFix?: boolean;
}

// Selection Operation Types
export type SelectionOperationType = 'explain' | 'debug' | 'optimize' | 'improveUI';

export interface SelectionOperationResult {
  operation: SelectionOperationType;
  hasCodeChanges: boolean;
  explanation: string;
  suggestedCode?: string;
  issues?: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  improvements?: string[];
  confidence?: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  operation: SelectionOperationType;
  language: EditorLanguage;
  codePreview: string;
  result: SelectionOperationResult;
}
// Project Management Types
export * from './project';
