import { openRouterService } from './openRouterService';
import { EditorLanguage, AIEnhancement, CodeComparison, AICodeSuggestion } from '../types';

export class AIEnhancementService {
    /**
     * Enhance code using OpenRouter AI with comprehensive analysis
     */
    async enhanceCode(code: string, language: EditorLanguage): Promise<AIEnhancement> {
        if (!openRouterService.isConfigured()) {
            throw new Error('OpenRouter API key not configured. Please check your environment variables.');
        }

        try {
            const prompt = this.buildEnhancementPrompt(code, language);
            const response = await openRouterService.sendPrompt(prompt, undefined, true);

            return this.parseEnhancementResponse(response, code, language);
        } catch (error) {
            console.error('AI Enhancement Error:', error);
            throw new Error(`Failed to enhance ${language} code: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Generate real-time code analysis and suggestions
     */
    async analyzeCode(code: string, language: EditorLanguage): Promise<AICodeSuggestion[]> {
        if (!openRouterService.isConfigured()) {
            return [];
        }

        try {
            const prompt = this.buildAnalysisPrompt(code, language);
            const response = await openRouterService.sendPrompt(prompt, undefined, false);

            return this.parseAnalysisResponse(response, language);
        } catch (error) {
            console.error('Code Analysis Error:', error);
            return [];
        }
    }

    /**
     * Build enhancement prompt for specific language
     */
    private buildEnhancementPrompt(code: string, language: EditorLanguage): string {
        const basePrompt = `You are an expert ${language.toUpperCase()} developer. Analyze and enhance the following code with best practices, performance optimizations, accessibility improvements, and modern standards.

Original ${language.toUpperCase()} code:
\`\`\`${language}
${code}
\`\`\`

Please provide your response in the following JSON format (ensure it's valid JSON):
{
  "enhancedCode": "the improved code here",
  "improvements": ["list of specific improvements made"],
  "explanation": "detailed explanation of changes and why they were made",
  "suggestions": [
    {
      "title": "suggestion title",
      "description": "detailed description",
      "code": "example code",
      "priority": "high|medium|low",
      "category": "performance|security|accessibility|best-practice"
    }
  ]
}

Focus on:`;

        switch (language) {
            case 'html':
                return `${basePrompt}
- Semantic HTML elements
- Accessibility (ARIA labels, alt attributes, proper form labels)
- SEO optimization (meta tags, structured data)
- Performance (lazy loading, proper resource hints)
- Modern HTML5 features
- Proper document structure`;

            case 'css':
                return `${basePrompt}
- Modern CSS features (Grid, Flexbox, Custom Properties)
- Performance optimizations (efficient selectors, will-change)
- Responsive design principles
- Accessibility (focus states, color contrast)
- Code organization and maintainability
- Browser compatibility`;

            case 'javascript':
                return `${basePrompt}
- Modern ES6+ syntax and features
- Performance optimizations
- Error handling and edge cases
- Code readability and maintainability
- Security best practices
- Memory leak prevention
- Async/await patterns where appropriate`;

            default:
                return basePrompt;
        }
    }

    /**
     * Build analysis prompt for real-time suggestions
     */
    private buildAnalysisPrompt(code: string, language: EditorLanguage): string {
        return `Analyze this ${language} code and provide quick improvement suggestions in JSON format:

\`\`\`${language}
${code}
\`\`\`

Response format:
{
  "suggestions": [
    {
      "title": "brief title",
      "description": "what to improve",
      "priority": "high|medium|low",
      "category": "performance|security|accessibility|best-practice"
    }
  ]
}`;
    }

    /**
     * Parse enhancement response into structured format
     */
    private parseEnhancementResponse(response: string, originalCode: string, language: EditorLanguage): AIEnhancement {
        try {
            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in response');
            }

            const parsed = JSON.parse(jsonMatch[0]);

            if (!parsed.enhancedCode) {
                throw new Error('Enhanced code not found in response');
            }

            return {
                id: Date.now().toString(),
                language,
                originalCode,
                enhancedCode: parsed.enhancedCode || originalCode,
                improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ['Code enhancement applied'],
                explanation: parsed.explanation || 'Code has been enhanced with best practices and modern standards.',
                confidence: 85,
                suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Failed to parse enhancement response:', error);

            // Fallback: return original code with error message
            return {
                id: Date.now().toString(),
                language,
                originalCode,
                enhancedCode: originalCode,
                improvements: ['Failed to parse AI response - please try again'],
                explanation: 'There was an error processing the AI enhancement. Please try again.',
                confidence: 0,
                suggestions: [],
                timestamp: new Date().toISOString(),
            };
        }
    }

    /**
     * Parse analysis response for real-time suggestions
     */
    private parseAnalysisResponse(response: string, language: EditorLanguage): AICodeSuggestion[] {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) return [];

            const parsed = JSON.parse(jsonMatch[0]);
            return Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
        } catch (error) {
            console.error('Failed to parse analysis response:', error);
            return [];
        }
    }

    /**
     * Generate detailed code comparison
     */
    generateComparison(original: string, enhanced: string): CodeComparison {
        const originalLines = original.split('\n');
        const enhancedLines = enhanced.split('\n');
        const differences = [];

        const maxLines = Math.max(originalLines.length, enhancedLines.length);

        for (let i = 0; i < maxLines; i++) {
            const originalLine = originalLines[i] || '';
            const enhancedLine = enhancedLines[i] || '';

            if (originalLine !== enhancedLine) {
                if (!originalLine && enhancedLine) {
                    differences.push({
                        type: 'addition' as const,
                        lineNumber: i + 1,
                        content: enhancedLine,
                        description: 'Added line'
                    });
                } else if (originalLine && !enhancedLine) {
                    differences.push({
                        type: 'deletion' as const,
                        lineNumber: i + 1,
                        content: originalLine,
                        description: 'Removed line'
                    });
                } else {
                    differences.push({
                        type: 'modification' as const,
                        lineNumber: i + 1,
                        content: enhancedLine,
                        description: 'Modified line'
                    });
                }
            }
        }

        return {
            original,
            enhanced,
            differences,
            stats: {
                linesAdded: differences.filter(d => d.type === 'addition').length,
                linesRemoved: differences.filter(d => d.type === 'deletion').length,
                linesModified: differences.filter(d => d.type === 'modification').length
            }
        };
    }

    /**
     * Apply partial suggestions to code
     */
    applyPartialSuggestions(originalCode: string, suggestions: AICodeSuggestion[]): string {
        // This is a simplified implementation
        // In a real scenario, you'd need more sophisticated code transformation
        return originalCode;
    }

    /**
     * Check if API is configured
     */
    isConfigured(): boolean {
        return openRouterService.isConfigured();
    }

    /**
     * Test API connection
     */
    async testConnection(): Promise<boolean> {
        return openRouterService.testConnection();
    }
}

// Export singleton instance
export const aiEnhancementService = new AIEnhancementService();
