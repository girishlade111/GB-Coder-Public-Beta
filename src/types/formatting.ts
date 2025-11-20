import { EditorLanguage } from './index';

export interface FormatResult {
    success: boolean;
    formattedCode: string;
    changelog: string[];
    isUnsafe: boolean;
    diff: DiffResult[];
    error?: string;
    language: EditorLanguage;
}

export interface DiffResult {
    type: 'add' | 'remove' | 'modify' | 'unchanged';
    lineNumber: number;
    originalLine?: string;
    formattedLine?: string;
    content: string;
}

export interface FormatSettings {
    formatOnSave: boolean;
    formatOnPaste: boolean;
    indentSize: number;
    useSingleQuotes: boolean;
    addSemicolons: boolean;
    addTrailingCommas: boolean;
    printWidth: number;
    tabWidth: number;
}

export const DEFAULT_FORMAT_SETTINGS: FormatSettings = {
    formatOnSave: false,
    formatOnPaste: false,
    indentSize: 2,
    useSingleQuotes: true,
    addSemicolons: true,
    addTrailingCommas: true,
    printWidth: 80,
    tabWidth: 2,
};

export interface FormatTrigger {
    type: 'manual' | 'save' | 'paste' | 'shortcut';
    timestamp: string;
    language: EditorLanguage;
}

export interface FormatHistory {
    id: string;
    trigger: FormatTrigger;
    result: FormatResult;
    originalCode: string;
    timestamp: string;
}
