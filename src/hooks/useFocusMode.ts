import { useState, useEffect } from 'react';

const FOCUS_MODE_KEY = 'gb-coder-focus-mode';

export const useFocusMode = () => {
    const [focusMode, setFocusMode] = useState<boolean>(() => {
        const stored = localStorage.getItem(FOCUS_MODE_KEY);
        return stored === 'true';
    });

    useEffect(() => {
        localStorage.setItem(FOCUS_MODE_KEY, String(focusMode));
    }, [focusMode]);

    const toggleFocusMode = () => {
        setFocusMode(prev => !prev);
    };

    return { focusMode, toggleFocusMode };
};
