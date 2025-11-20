import { useState, useCallback } from 'react';
import { EditorLanguage } from '../types';

interface SelectionState {
    code: string;
    language: EditorLanguage | null;
    position: { top: number; left: number } | null;
}

export const useCodeSelection = () => {
    const [selection, setSelection] = useState<SelectionState>({
        code: '',
        language: null,
        position: null
    });

    const updateSelection = useCallback((editorInstance: any, language: EditorLanguage) => {
        if (!editorInstance) return;

        const model = editorInstance.getModel();
        const selection = editorInstance.getSelection();

        if (!selection || selection.isEmpty()) {
            setSelection({ code: '', language: null, position: null });
            return;
        }

        const selectedText = model.getValueInRange(selection);

        // Get coordinates for the popup
        const scrolledVisiblePosition = editorInstance.getScrolledVisiblePosition(selection.getStartPosition());
        const domNode = editorInstance.getDomNode();

        if (scrolledVisiblePosition && domNode) {
            const rect = domNode.getBoundingClientRect();
            const top = rect.top + scrolledVisiblePosition.top;
            const left = rect.left + scrolledVisiblePosition.left + 20; // Offset slightly

            setSelection({
                code: selectedText,
                language,
                position: { top, left }
            });
        }
    }, []);

    const clearSelection = useCallback(() => {
        setSelection({ code: '', language: null, position: null });
    }, []);

    return {
        selection,
        updateSelection,
        clearSelection
    };
};
