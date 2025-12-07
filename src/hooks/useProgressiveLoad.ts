import { useState, useEffect } from 'react';

export interface ProgressiveLoadPhases {
    isPhase1Ready: boolean; // Critical: Editors, Navigation
    isPhase2Ready: boolean; // High Priority: Preview, Console, AI Suggestions
    isPhase3Ready: boolean; // Deferred: Everything else
}

/**
 * Hook to manage progressive loading of application components
 * 
 * Phase 1 (Immediate): Code editors and navigation - available immediately
 * Phase 2 (High Priority): Preview, Console, AI Suggestions - loads after 100ms
 * Phase 3 (Deferred): All other features - loads after 500ms
 * 
 * This strategy ensures the critical path (code editing) is available immediately
 * while deferring less critical features to improve initial load time.
 */
export function useProgressiveLoad(): ProgressiveLoadPhases {
    const [phase, setPhase] = useState(1);

    useEffect(() => {
        // Phase 1: Already ready (immediate)

        // Phase 2: High priority components after 100ms
        const timer1 = setTimeout(() => {
            setPhase(2);
        }, 100);

        // Phase 3: Deferred components after 500ms
        const timer2 = setTimeout(() => {
            setPhase(3);
        }, 500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return {
        isPhase1Ready: true,
        isPhase2Ready: phase >= 2,
        isPhase3Ready: phase >= 3,
    };
}
