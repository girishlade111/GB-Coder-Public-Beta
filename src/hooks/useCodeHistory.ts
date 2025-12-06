import { useState, useCallback } from 'react';

interface CodeState {
  html: string;
  css: string;
  javascript: string;
}

export interface HistoryEntry {
  id: string;
  state: CodeState;
  timestamp: string;
  description: string;
  label?: string; // Optional user-provided label
}

export interface DiffPreview {
  hasHtmlChanges: boolean;
  hasCssChanges: boolean;
  hasJavascriptChanges: boolean;
}

export const useCodeHistory = (initialState: CodeState) => {
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      id: 'initial',
      state: initialState,
      timestamp: new Date().toISOString(),
      description: 'Initial state'
    }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const saveState = useCallback((state: CodeState, description: string = 'Code change', label?: string) => {
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      state: { ...state },
      timestamp: new Date().toISOString(),
      description,
      label
    };

    setHistory(prev => {
      // Remove any entries after current index (when undoing then making new changes)
      const newHistory = prev.slice(0, currentIndex + 1);
      return [...newHistory, newEntry];
    });

    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1].state;
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1].state;
    }
    return null;
  }, [currentIndex, history]);

  // Create a manual snapshot with optional label
  const createSnapshot = useCallback((label?: string) => {
    const currentState = history[currentIndex]?.state;
    if (!currentState) return;

    const description = label ? `Snapshot: ${label}` : 'Manual snapshot';
    saveState(currentState, description, label);
  }, [currentIndex, history, saveState]);

  // Jump to a specific snapshot (non-destructive - creates new history entry)
  const jumpToSnapshot = useCallback((snapshotId: string) => {
    const snapshotIndex = history.findIndex(entry => entry.id === snapshotId);
    if (snapshotIndex === -1) return null;

    const snapshot = history[snapshotIndex];

    // Record the jump as a new history entry
    const jumpDescription = snapshot.label
      ? `Jumped to: ${snapshot.label}`
      : `Jumped to snapshot from ${new Date(snapshot.timestamp).toLocaleString()}`;

    saveState(snapshot.state, jumpDescription);

    return snapshot.state;
  }, [history, saveState]);

  // Compute diff preview between two snapshots
  const getDiffPreview = useCallback((fromEntry: HistoryEntry, toEntry: HistoryEntry): DiffPreview => {
    return {
      hasHtmlChanges: fromEntry.state.html !== toEntry.state.html,
      hasCssChanges: fromEntry.state.css !== toEntry.state.css,
      hasJavascriptChanges: fromEntry.state.javascript !== toEntry.state.javascript
    };
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  const currentState = history[currentIndex]?.state || initialState;

  // Get all history entries (not just up to current index) for the history panel
  const allHistory = history;

  return {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    currentState,
    currentIndex,
    history: history.slice(0, currentIndex + 1), // Only show history up to current point (for legacy compatibility)
    allHistory, // All history entries for the history panel
    createSnapshot,
    jumpToSnapshot,
    getDiffPreview
  };
};