import { useEffect, useRef, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface UseAutoSaveProps {
  html: string;
  css: string;
  javascript: string;
  interval?: number;
  enabled?: boolean;
}

export const useAutoSave = ({ 
  html, 
  css, 
  javascript, 
  interval = 30000, // 30 seconds
  enabled = true 
}: UseAutoSaveProps) => {
  const [lastSaveTime, setLastSaveTime] = useLocalStorage<string | null>('gb-coder-last-save', null);
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastContentRef = useRef<string>('');

  // Create a hash of current content to detect changes
  const createContentHash = (h: string, c: string, j: string) => {
    return btoa(h + c + j).slice(0, 16);
  };

  const performAutoSave = async () => {
    if (!enabled) return;

    const currentHash = createContentHash(html, css, javascript);
    
    // Only save if content has changed
    if (currentHash === lastContentRef.current) return;

    setIsSaving(true);
    try {
      const timestamp = new Date().toISOString();
      
      // Save to local storage
      localStorage.setItem('gb-coder-autosave', JSON.stringify({
        html,
        css,
        javascript,
        timestamp
      }));

      lastContentRef.current = currentHash;
      setLastSaveTime(timestamp);
      
      // Dispatch custom event for UI feedback
      window.dispatchEvent(new CustomEvent('autosave', { 
        detail: { timestamp } 
      }));
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(performAutoSave, interval);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [html, css, javascript, interval, enabled]);

  // Manual save function
  const manualSave = async (title?: string) => {
    setIsSaving(true);
    try {
      const timestamp = new Date().toISOString();
      
      // Save to local storage
      localStorage.setItem('gb-coder-manual-save', JSON.stringify({
        html,
        css,
        javascript,
        timestamp,
        title: title || `Manual save ${new Date().toLocaleString()}`
      }));

      const currentHash = createContentHash(html, css, javascript);
      lastContentRef.current = currentHash;
      setLastSaveTime(timestamp);

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Save failed' };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    lastSaveTime,
    isSaving,
    manualSave,
    performAutoSave
  };
};