/**
 * Helper utilities for safely working with Monaco editor selections
 */

export interface SelectionInfo {
    code: string;
    range: any;
    startLine: number;
    endLine: number;
}

/**
 * Get the currently selected code from a Monaco editor instance
 */
export function getSelectedCode(editor: any): SelectionInfo | null {
    if (!editor) {
        console.warn('Monaco editor instance is null or undefined');
        return null;
    }

    try {
        const selection = editor.getSelection();
        if (!selection || selection.isEmpty()) {
            return null;
        }

        const model = editor.getModel();
        if (!model) {
            console.warn('Monaco editor model is null');
            return null;
        }

        const code = model.getValueInRange(selection);

        return {
            code,
            range: selection,
            startLine: selection.startLineNumber,
            endLine: selection.endLineNumber,
        };
    } catch (error) {
        console.error('Error getting selected code:', error);
        return null;
    }
}

/**
 * Replace the selected code in a Monaco editor instance
 * Preserves undo/redo history
 */
export function replaceSelectedCode(editor: any, newCode: string, range?: any): boolean {
    if (!editor) {
        console.warn('Monaco editor instance is null or undefined');
        return false;
    }

    try {
        const model = editor.getModel();
        if (!model) {
            console.warn('Monaco editor model is null');
            return false;
        }

        // Use provided range or current selection
        const targetRange = range || editor.getSelection();

        if (!targetRange) {
            console.warn('No range or selection available');
            return false;
        }

        // Execute edit with undo/redo support
        editor.executeEdits('selection-operation', [
            {
                range: targetRange,
                text: newCode,
                forceMoveMarkers: true,
            }
        ]);

        // Focus the editor after replacement
        editor.focus();

        return true;
    } catch (error) {
        console.error('Error replacing selected code:', error);
        return false;
    }
}

/**
 * Check if the editor has an active selection
 */
export function hasSelection(editor: any): boolean {
    if (!editor) {
        return false;
    }

    try {
        const selection = editor.getSelection();
        return selection && !selection.isEmpty();
    } catch (error) {
        console.error('Error checking selection:', error);
        return false;
    }
}

/**
 * Get surrounding code context for AI analysis
 */
export function getSelectionContext(editor: any, range?: any, contextLines: number = 5): string {
    if (!editor) {
        return '';
    }

    try {
        const model = editor.getModel();
        if (!model) {
            return '';
        }

        const targetRange = range || editor.getSelection();
        if (!targetRange) {
            return '';
        }

        const startLine = Math.max(1, targetRange.startLineNumber - contextLines);
        const endLine = Math.min(model.getLineCount(), targetRange.endLineNumber + contextLines);

        return model.getValueInRange({
            startLineNumber: startLine,
            startColumn: 1,
            endLineNumber: endLine,
            endColumn: model.getLineMaxColumn(endLine),
        });
    } catch (error) {
        console.error('Error getting selection context:', error);
        return '';
    }
}

/**
 * Get the full file content from editor
 */
export function getFullFileContent(editor: any): string {
    if (!editor) {
        return '';
    }

    try {
        const model = editor.getModel();
        if (!model) {
            return '';
        }

        return model.getValue();
    } catch (error) {
        console.error('Error getting full file content:', error);
        return '';
    }
}

/**
 * Get the position of the selection for UI positioning
 */
export function getSelectionPosition(editor: any, range?: any): { top: number; left: number } | null {
    if (!editor) {
        return null;
    }

    try {
        const targetRange = range || editor.getSelection();
        if (!targetRange) {
            return null;
        }

        const scrolledVisiblePosition = editor.getScrolledVisiblePosition(targetRange.getStartPosition());
        const domNode = editor.getDomNode();

        if (scrolledVisiblePosition && domNode) {
            const rect = domNode.getBoundingClientRect();
            return {
                top: rect.top + scrolledVisiblePosition.top,
                left: rect.left + scrolledVisiblePosition.left,
            };
        }

        return null;
    } catch (error) {
        console.error('Error getting selection position:', error);
        return null;
    }
}
