import { GoogleGenerativeAI } from '@google/generative-ai';
import { EditorLanguage, CodeExplanation, UserLevel, ExplanationBlock, ExplanationNote } from '../types';

// Initialize Gemini AI
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

class CodeExplanationService {
    private model: any;
    private readonly apiKey: string;
    private explanationCache: Map<string, CodeExplanation> = new Map();

    constructor() {
        this.apiKey = API_KEY;
        this.validateAndInitialize();
    }

    private validateAndInitialize(): void {
        if (!this.apiKey || this.apiKey.length < 20) {
            console.warn('⚠️ Gemini API key not configured for code explanations');
            return;
        }

        try {
            const genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
            console.log('✓ Code Explanation Service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Code Explanation Service:', error);
        }
    }

    /**
     * Generate comprehensive code explanation
     */
    async explainCode(
        code: string,
        language: EditorLanguage,
        userLevel: UserLevel = 'intermediate'
    ): Promise<CodeExplanation> {
        if (!this.model) {
            throw new Error('Code Explanation Service is not configured. Please set VITE_GEMINI_API_KEY.');
        }

        // Check cache
        const cacheKey = this.getCacheKey(code, language, userLevel);
        if (this.explanationCache.has(cacheKey)) {
            console.log('Returning cached explanation');
            return this.explanationCache.get(cacheKey)!;
        }

        // Handle large code selections
        const lineCount = code.split('\n').length;
        if (lineCount > 300) {
            throw new Error(
                'Code selection is too large (>300 lines). Please narrow your selection or request a top-level summary.'
            );
        }

        try {
            const prompt = this.buildExplanationPrompt(code, language, userLevel);
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            const explanation = this.parseExplanationResponse(response, code, language, userLevel);

            // Cache the result
            this.explanationCache.set(cacheKey, explanation);

            // Limit cache size to 20 entries
            if (this.explanationCache.size > 20) {
                const firstKey = this.explanationCache.keys().next().value;
                this.explanationCache.delete(firstKey);
            }

            return explanation;
        } catch (error) {
            console.error('Error explaining code:', error);
            throw new Error(`Failed to generate explanation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Generate annotated code with inline comments
     */
    async generateAnnotatedCode(code: string, language: EditorLanguage): Promise<string> {
        if (!this.model) {
            throw new Error('Code Explanation Service is not configured.');
        }

        try {
            const prompt = this.buildAnnotationPrompt(code, language);
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            return this.extractCodeFromResponse(response);
        } catch (error) {
            console.error('Error generating annotated code:', error);
            throw new Error('Failed to generate annotated code');
        }
    }

    /**
     * Generate simplified explanation for beginners
     */
    async generateSimplifiedExplanation(code: string, language: EditorLanguage): Promise<string> {
        if (!this.model) {
            throw new Error('Code Explanation Service is not configured.');
        }

        try {
            const prompt = this.buildSimplifiedPrompt(code, language);
            const result = await this.model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error('Error generating simplified explanation:', error);
            throw new Error('Failed to generate simplified explanation');
        }
    }

    /**
     * Build comprehensive explanation prompt
     */
    private buildExplanationPrompt(code: string, language: EditorLanguage, userLevel: UserLevel): string {
        const levelGuidance = {
            beginner: 'Explain in simple, non-technical terms suitable for someone just learning to code. Avoid jargon.',
            intermediate: 'Provide a balanced explanation with some technical details, suitable for someone with basic coding knowledge.',
            advanced: 'Give a detailed technical explanation, including advanced concepts, patterns, and optimization opportunities.'
        };

        return `You are an expert ${language.toUpperCase()} code reviewer and educator. Analyze the following ${language} code and provide a comprehensive explanation.

USER LEVEL: ${userLevel.toUpperCase()}
${levelGuidance[userLevel]}

CODE TO EXPLAIN:
\`\`\`${language}
${code}
\`\`\`

Provide your response in the following JSON format:
{
  "summary": "High-level summary of what this code does (2-3 sentences)",
  "breakdown": [
    {
      "lineStart": 1,
      "lineEnd": 3,
      "codeSnippet": "relevant code snippet",
      "explanation": "Detailed explanation of this section"
    }
  ],
  "notes": [
    {
      "type": "pitfall|security|performance|best-practice",
      "severity": "low|medium|high",
      "title": "Note title",
      "description": "Detailed description"
    }
  ],
  "suggestions": [
    "Suggestion 1: Improvement or alternative approach",
    "Suggestion 2: Another improvement"
  ],
  "exampleInputOutput": {
    "input": "Example input (if applicable)",
    "output": "Expected output (if applicable)"
  }
}

REQUIREMENTS:
1. Provide a clear, concise summary
2. Break down the code into logical sections (max 10 blocks)
3. Include AT LEAST 2 notes about pitfalls, security, performance, or best practices
4. Provide AT LEAST 2 concrete suggestions for improvement or alternatives
5. If the code is a function, provide example input/output
6. Adjust terminology and depth based on user level

Return ONLY the JSON response, no additional text.`;
    }

    /**
     * Build annotation prompt for inline comments
     */
    private buildAnnotationPrompt(code: string, language: EditorLanguage): string {
        const commentStyle = {
            html: '<!-- comment -->',
            css: '/* comment */',
            javascript: '// comment'
        };

        return `Add inline comments to the following ${language} code to explain what each section does. Use ${commentStyle[language]} comment syntax.

Make comments concise but informative. Add comments for:
- Complex logic or algorithms
- Important variable declarations
- Function purposes and parameters
- Non-obvious code patterns

CODE:
\`\`\`${language}
${code}
\`\`\`

Return ONLY the annotated code wrapped in a code block, no additional explanation.`;
    }

    /**
     * Build simplified explanation prompt
     */
    private buildSimplifiedPrompt(code: string, language: EditorLanguage): string {
        return `Explain the following ${language} code in very simple terms, as if to a complete beginner who is just learning to code.

Use analogies, simple language, and avoid all technical jargon. Focus on WHAT the code does, not HOW it works technically.

CODE:
\`\`\`${language}
${code}
\`\`\`

Keep the explanation under 200 words. Use short sentences and simple vocabulary.`;
    }

    /**
     * Parse AI response into structured explanation
     */
    private parseExplanationResponse(
        response: string,
        code: string,
        language: EditorLanguage,
        userLevel: UserLevel
    ): CodeExplanation {
        try {
            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid response format');
            }

            const parsed = JSON.parse(jsonMatch[0]);

            // Generate unique IDs for breakdown blocks
            const breakdown: ExplanationBlock[] = (parsed.breakdown || []).map((block: any, index: number) => ({
                id: `block-${Date.now()}-${index}`,
                lineStart: block.lineStart || 1,
                lineEnd: block.lineEnd || 1,
                codeSnippet: block.codeSnippet || '',
                explanation: block.explanation || ''
            }));

            // Generate unique IDs for notes
            const notes: ExplanationNote[] = (parsed.notes || []).map((note: any, index: number) => ({
                id: `note-${Date.now()}-${index}`,
                type: note.type || 'best-practice',
                severity: note.severity || 'medium',
                title: note.title || '',
                description: note.description || ''
            }));

            return {
                id: `explanation-${Date.now()}`,
                code,
                language,
                userLevel,
                summary: parsed.summary || 'No summary available',
                breakdown,
                notes,
                suggestions: parsed.suggestions || [],
                exampleInputOutput: parsed.exampleInputOutput,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error parsing explanation response:', error);

            // Fallback: Create a basic explanation from the response text
            return {
                id: `explanation-${Date.now()}`,
                code,
                language,
                userLevel,
                summary: response.substring(0, 300),
                breakdown: [],
                notes: [],
                suggestions: ['Consider reviewing the code for optimization opportunities'],
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Extract code from markdown code block
     */
    private extractCodeFromResponse(response: string): string {
        const codeBlockMatch = response.match(/```(?:html|css|javascript|js)?\n([\s\S]*?)```/);
        if (codeBlockMatch) {
            return codeBlockMatch[1].trim();
        }
        return response.trim();
    }

    /**
     * Generate cache key
     */
    private getCacheKey(code: string, language: EditorLanguage, userLevel: UserLevel): string {
        const codeHash = btoa(code.substring(0, 100)); // Hash first 100 chars
        return `${language}-${userLevel}-${codeHash}`;
    }

    /**
     * Check if service is configured
     */
    isConfigured(): boolean {
        return !!this.model;
    }

    /**
     * Clear explanation cache
     */
    clearCache(): void {
        this.explanationCache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.explanationCache.size,
            keys: Array.from(this.explanationCache.keys())
        };
    }
}

// Export singleton instance
export const codeExplanationService = new CodeExplanationService();
