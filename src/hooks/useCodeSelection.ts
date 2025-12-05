import { useState, useCallback } from 'react';
import { EditorLanguage } from '../types';
import * as monacoHelper from '../utils/monacoSelectionHelper';

interface SelectionState {
    code: string;
    language: EditorLanguage | null;
    position: { top: number; left: number } | null;
    range: any;
    fullFileCode: string;
    editorInstance: any;
}

export const useCodeSelection = () => {
    const [selection, setSelection] = useState<SelectionState>({
        code: '',
        language: null,
        position: null,
        range: null,
        fullFileCode: '',
        editorInstance: null,
    });

    const clearSelection = useCallback(() => {
        console.log('[Selection] Clearing selection');
        setSelection({
            code: '',
            language: null,
            position: null,
            range: null,
            fullFileCode: '',
            editorInstance: null,
        });
    }, []);

    const updateSelection = useCallback((editorInstance: any, language: EditorLanguage) => {
        console.log('[Selection] updateSelection called for', language, 'editor:', !!editorInstance);

        if (!editorInstance) {
            console.log('[Selection] No editor instance, clearing selection');
            clearSelection();
            return;
        }

        const selectionInfo = monacoHelper.getSelectedCode(editorInstance);
        console.log('[Selection] Selection info:', selectionInfo);

        if (!selectionInfo) {
            console.log('[Selection] No selection info, clearing selection');
            clearSelection();
            return;
        }

        const position = monacoHelper.getSelectionPosition(editorInstance, selectionInfo.range);
        const fullFileCode = monacoHelper.getFullFileContent(editorInstance);

        console.log('[Selection] Position:', position);
        console.log('[Selection] Selected code length:', selectionInfo.code.length);

        setSelection({
            code: selectionInfo.code,
            language,
            position,
            range: selectionInfo.range,
            fullFileCode,
            editorInstance,
        });
    }, [clearSelection]);

    const hasSelection = !!selection.code && !!selection.language;
    console.log('[Selection] Current state - hasSelection:', hasSelection, 'position:', !!selection.position, 'code:', selection.code.substring(0, 20));

    return {
        selection,
        updateSelection,
        clearSelection,
        hasSelection,
    };
};
