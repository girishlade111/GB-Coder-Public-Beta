import { useState, useCallback } from 'react';
import { codeExplanationService } from '../services/codeExplanationService';
import { CodeExplanation, EditorLanguage, UserLevel } from '../types';

export const useCodeExplanation = () => {
    const [explanation, setExplanation] = useState<CodeExplanation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const explainCode = useCallback(async (
        code: string,
        language: EditorLanguage,
        userLevel: UserLevel = 'intermediate'
    ) => {
        if (!code.trim()) return;

        setIsLoading(true);
        setError(null);
        setExplanation(null);

        try {
            const result = await codeExplanationService.explainCode(code, language, userLevel);
            setExplanation(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to explain code');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getSimplifiedExplanation = useCallback(async () => {
        if (!explanation) return;

        setIsLoading(true);
        try {
            const simplified = await codeExplanationService.generateSimplifiedExplanation(
                explanation.code,
                explanation.language
            );

            // Update the current explanation with the simplified version
            setExplanation(prev => prev ? {
                ...prev,
                summary: simplified // Or handle this differently in the UI
            } : null);

            return simplified;
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [explanation]);

    const getAnnotatedCode = useCallback(async () => {
        if (!explanation) return;

        setIsLoading(true);
        try {
            const annotated = await codeExplanationService.generateAnnotatedCode(
                explanation.code,
                explanation.language
            );
            return annotated;
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [explanation]);

    const clearExplanation = useCallback(() => {
        setExplanation(null);
        setError(null);
    }, []);

    return {
        explanation,
        isLoading,
        error,
        explainCode,
        getSimplifiedExplanation,
        getAnnotatedCode,
        clearExplanation
    };
};
