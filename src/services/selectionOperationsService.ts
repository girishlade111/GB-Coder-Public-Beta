import { openRouterService } from './openRouterService';
import { EditorLanguage } from '../types';

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

export class SelectionOperationsService {
    /**
     * Explain selected code with context
     */
    async explainSelection(
        code: string,
        language: EditorLanguage,
        fullFileContext?: string
    ): Promise<SelectionOperationResult> {
        if (!openRouterService.isConfigured()) {
            throw new Error('OpenRouter API key not configured.');
        }

        try {
            const prompt = this.buildExplainPrompt(code, language, fullFileContext);
            const response = await openRouterService.sendPrompt(prompt, undefined, false);

            return {
                operation: 'explain',
                hasCodeChanges: false,
                explanation: response,
            };
        } catch (error) {
            console.error('Explain selection error:', error);
            throw new Error(`Failed to explain ${language} code: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Debug selected code - find issues and suggest fixes
     */
    async debugSelection(
        code: string,
        language: EditorLanguage,
        fullFileContext?: string
    ): Promise<SelectionOperationResult> {
        if (!openRouterService.isConfigured()) {
            throw new Error('OpenRouter API key not configured.');
        }

        try {
            const prompt = this.buildDebugPrompt(code, language, fullFileContext);
            const response = await openRouterService.sendPrompt(prompt, undefined, true);

            return this.parseDebugResponse(response, code, language);
        } catch (error) {
            console.error('Debug selection error:', error);
            throw new Error(`Failed to debug ${language} code: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Optimize selected code for performance
     */
    async optimizeSelection(
        code: string,
        language: EditorLanguage,
        fullFileContext?: string
    ): Promise<SelectionOperationResult> {
        if (!openRouterService.isConfigured()) {
            throw new Error('OpenRouter API key not configured.');
        }

        try {
            const prompt = this.buildOptimizePrompt(code, language, fullFileContext);
            const response = await openRouterService.sendPrompt(prompt, undefined, true);

            return this.parseOptimizeResponse(response, code, language);
        } catch (error) {
            console.error('Optimize selection error:', error);
            throw new Error(`Failed to optimize ${language} code: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Improve UI/styling of selected HTML/CSS code
     */
    async improveUISelection(
        code: string,
        language: EditorLanguage,
        fullFileContext?: string
    ): Promise<SelectionOperationResult> {
        if (!openRouterService.isConfigured()) {
            throw new Error('OpenRouter API key not configured.');
        }

        if (language === 'javascript') {
            throw new Error('UI improvements are only available for HTML and CSS.');
        }

        try {
            const prompt = this.buildImproveUIPrompt(code, language, fullFileContext);
            const response = await openRouterService.sendPrompt(prompt, undefined, true);

            return this.parseImproveUIResponse(response, code, language);
        } catch (error) {
            console.error('Improve UI selection error:', error);
            throw new Error(`Failed to improve ${language} UI: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Build prompt for explaining code
     */
    private buildExplainPrompt(code: string, language: EditorLanguage, fullFileContext?: string): string {
        let prompt = `You are an expert ${language.toUpperCase()} developer. Explain the following code snippet in a clear and concise way.\n\n`;

        if (fullFileContext) {
            prompt += `Full file context (selected portion is marked):\n\`\`\`${language}\n${fullFileContext}\n\`\`\`\n\n`;
        }

        prompt += `Selected code to explain:\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
        prompt += `Provide a detailed explanation covering:\n`;
        prompt += `- What this code does\n`;
        prompt += `- How it works\n`;
        prompt += `- Key concepts used\n`;
        prompt += `- Any important notes or gotchas\n\n`;
        prompt += `Write the explanation in a friendly, educational tone.`;

        return prompt;
    }

    /**
     * Build prompt for debugging code
     */
    private buildDebugPrompt(code: string, language: EditorLanguage, fullFileContext?: string): string {
        let prompt = `You are an expert ${language.toUpperCase()} debugger. Analyze the following code for bugs, errors, and potential issues.\n\n`;

        if (fullFileContext) {
            prompt += `Full file context:\n\`\`\`${language}\n${fullFileContext}\n\`\`\`\n\n`;
        }

        prompt += `Selected code to debug:\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
        prompt += `Provide your analysis in the following JSON format:\n`;
        prompt += `{\n`;
        prompt += `  "explanation": "Overall analysis of the code",\n`;
        prompt += `  "issues": [\n`;
        prompt += `    {\n`;
        prompt += `      "type": "syntax|logic|performance|security",\n`;
        prompt += `      "description": "What the issue is",\n`;
        prompt += `      "severity": "low|medium|high"\n`;
        prompt += `    }\n`;
        prompt += `  ],\n`;
        prompt += `  "suggestedCode": "Fixed version of the code (if issues were found)",\n`;
        prompt += `  "confidence": 85\n`;
        prompt += `}\n\n`;
        prompt += `If no issues are found, return empty issues array and null suggestedCode.`;

        return prompt;
    }

    /**
     * Build prompt for optimizing code
     */
    private buildOptimizePrompt(code: string, language: EditorLanguage, fullFileContext?: string): string {
        let prompt = `You are an expert ${language.toUpperCase()} performance optimizer. Optimize the following code for better performance, readability, and modern best practices.\n\n`;

        if (fullFileContext) {
            prompt += `Full file context:\n\`\`\`${language}\n${fullFileContext}\n\`\`\`\n\n`;
        }

        prompt += `Selected code to optimize:\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
        prompt += `Provide your optimization in the following JSON format:\n`;
        prompt += `{\n`;
        prompt += `  "explanation": "Why these optimizations improve the code",\n`;
        prompt += `  "improvements": ["List of improvements made"],\n`;
        prompt += `  "suggestedCode": "Optimized version of the code",\n`;
        prompt += `  "confidence": 90\n`;
        prompt += `}\n\n`;
        prompt += `Focus on: performance, modern syntax, readability, and best practices.`;

        return prompt;
    }

    /**
     * Build prompt for improving UI
     */
    private buildImproveUIPrompt(code: string, language: EditorLanguage, fullFileContext?: string): string {
        let prompt = `You are an expert ${language.toUpperCase()} UI/UX designer. Improve the following code to be more visually appealing, accessible, and modern.\n\n`;

        if (fullFileContext) {
            prompt += `Full file context:\n\`\`\`${language}\n${fullFileContext}\n\`\`\`\n\n`;
        }

        prompt += `Selected code to improve:\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
        prompt += `Provide your improvements in the following JSON format:\n`;
        prompt += `{\n`;
        prompt += `  "explanation": "Why these UI improvements enhance the design",\n`;
        prompt += `  "improvements": ["List of UI/UX improvements made"],\n`;
        prompt += `  "suggestedCode": "Improved version of the code",\n`;
        prompt += `  "confidence": 85\n`;
        prompt += `}\n\n`;

        if (language === 'html') {
            prompt += `Focus on: semantic HTML, accessibility (ARIA labels, alt text), modern HTML5 elements, and proper structure.`;
        } else if (language === 'css') {
            prompt += `Focus on: modern CSS features (Grid, Flexbox, Custom Properties), responsive design, animations, and visual appeal.`;
        }

        return prompt;
    }

    /**
     * Parse debug response
     */
    private parseDebugResponse(response: string, originalCode: string, _language: EditorLanguage): SelectionOperationResult {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                // Fallback: return explanation as-is
                return {
                    operation: 'debug',
                    hasCodeChanges: false,
                    explanation: response,
                    issues: [],
                };
            }

            const parsed = JSON.parse(jsonMatch[0]);

            return {
                operation: 'debug',
                hasCodeChanges: !!parsed.suggestedCode && parsed.suggestedCode !== originalCode,
                explanation: parsed.explanation || 'Code analysis completed.',
                suggestedCode: parsed.suggestedCode || undefined,
                issues: Array.isArray(parsed.issues) ? parsed.issues : [],
                confidence: parsed.confidence || 75,
            };
        } catch (error) {
            console.error('Failed to parse debug response:', error);
            return {
                operation: 'debug',
                hasCodeChanges: false,
                explanation: response,
                issues: [],
            };
        }
    }

    /**
     * Parse optimize response
     */
    private parseOptimizeResponse(response: string, originalCode: string, _language: EditorLanguage): SelectionOperationResult {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                return {
                    operation: 'optimize',
                    hasCodeChanges: false,
                    explanation: response,
                    improvements: [],
                };
            }

            const parsed = JSON.parse(jsonMatch[0]);

            return {
                operation: 'optimize',
                hasCodeChanges: !!parsed.suggestedCode && parsed.suggestedCode !== originalCode,
                explanation: parsed.explanation || 'Code optimization completed.',
                suggestedCode: parsed.suggestedCode || undefined,
                improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
                confidence: parsed.confidence || 80,
            };
        } catch (error) {
            console.error('Failed to parse optimize response:', error);
            return {
                operation: 'optimize',
                hasCodeChanges: false,
                explanation: response,
                improvements: [],
            };
        }
    }

    /**
     * Parse improve UI response
     */
    private parseImproveUIResponse(response: string, originalCode: string, _language: EditorLanguage): SelectionOperationResult {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                return {
                    operation: 'improveUI',
                    hasCodeChanges: false,
                    explanation: response,
                    improvements: [],
                };
            }

            const parsed = JSON.parse(jsonMatch[0]);

            return {
                operation: 'improveUI',
                hasCodeChanges: !!parsed.suggestedCode && parsed.suggestedCode !== originalCode,
                explanation: parsed.explanation || 'UI improvements applied.',
                suggestedCode: parsed.suggestedCode || undefined,
                improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
                confidence: parsed.confidence || 80,
            };
        } catch (error) {
            console.error('Failed to parse improve UI response:', error);
            return {
                operation: 'improveUI',
                hasCodeChanges: false,
                explanation: response,
                improvements: [],
            };
        }
    }

    /**
     * Check if API is configured
     */
    isConfigured(): boolean {
        return openRouterService.isConfigured();
    }
}

// Export singleton instance
export const selectionOperationsService = new SelectionOperationsService();
