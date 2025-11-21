import { GoogleGenerativeAI } from '@google/generative-ai';
import { ErrorFixResponse } from '../types';

// Use the same API key as other Gemini services for consistency
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export class AIErrorFixService {
    private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    /**
     * Fix JavaScript error using Gemini AI
     * @param errorMessage - The error message from the console
     * @param html - Current HTML code
     * @param css - Current CSS code
     * @param javascript - Current JavaScript code
     * @returns Promise with fixed code and explanation
     */
    async fixError(
        errorMessage: string,
        html: string,
        css: string,
        javascript: string
    ): Promise<ErrorFixResponse> {
        try {
            const prompt = this.buildErrorFixPrompt(errorMessage, html, css, javascript);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return this.parseErrorFixResponse(text, errorMessage);
        } catch (error) {
            console.error('AI Error Fix Service Error:', error);

            // Specific error handling for better user experience
            if (error instanceof Error) {
                if (error.message.includes('API key')) {
                    throw new Error('Invalid API key. Please check your Gemini API configuration.');
                } else if (error.message.includes('quota') || error.message.includes('limit')) {
                    throw new Error('API quota exceeded. Please try again later.');
                } else if (error.message.includes('model')) {
                    throw new Error('Model not available. The service may be temporarily unavailable.');
                }
            }

            throw new Error(`Failed to fix error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Build comprehensive error fix prompt
     */
    private buildErrorFixPrompt(
        errorMessage: string,
        html: string,
        css: string,
        javascript: string
    ): string {
        return `You are an expert JavaScript debugger and web developer. A user has encountered the following error in their code:

ERROR MESSAGE:
${errorMessage}

CURRENT CODE:

HTML:
\`\`\`html
${html}
\`\`\`

CSS:
\`\`\`css
${css}
\`\`\`

JAVASCRIPT:
\`\`\`javascript
${javascript}
\`\`\`

Your task is to:
1. Analyze the error and identify the root cause
2. Provide fixed versions of the code that resolve the error
3. Explain what was wrong and how you fixed it
4. Only modify the code that needs to be fixed (if HTML/CSS don't need changes, return them as-is)

IMPORTANT: Please provide your response in the following JSON format ONLY. Do not include any markdown code blocks or extra formatting:

{
  "fixedHtml": "the corrected HTML code here (or original if no changes needed)",
  "fixedCss": "the corrected CSS code here (or original if no changes needed)",
  "fixedJavascript": "the corrected JavaScript code here",
  "explanation": "detailed explanation of what caused the error and how you fixed it",
  "confidence": 85,
  "changesApplied": {
    "html": false,
    "css": false,
    "javascript": true
  }
}

Focus on:
- Fixing the specific error mentioned
- Using modern JavaScript best practices
- Maintaining code readability
- Explaining the fix clearly for learning purposes
- Being conservative - only change what's necessary to fix the error`;
    }

    /**
     * Parse Gemini error fix response into structured format
     */
    private parseErrorFixResponse(response: string, originalError: string): ErrorFixResponse {
        try {
            // Clean up the response - remove markdown code blocks if present
            let cleanResponse = response.trim();

            // Extract JSON from response
            let jsonString = this.extractJsonFromResponse(cleanResponse);

            if (!jsonString) {
                throw new Error('No valid JSON found in response');
            }

            const parsed = JSON.parse(jsonString);

            // Validate required fields
            if (!parsed.fixedJavascript && !parsed.fixedHtml && !parsed.fixedCss) {
                throw new Error('No fixed code found in response');
            }

            return {
                id: Date.now().toString(),
                originalError,
                fixedHtml: parsed.fixedHtml || '',
                fixedCss: parsed.fixedCss || '',
                fixedJavascript: parsed.fixedJavascript || '',
                explanation: parsed.explanation || 'The error has been fixed.',
                confidence: parsed.confidence || 75,
                changesApplied: parsed.changesApplied || {
                    html: false,
                    css: false,
                    javascript: true,
                },
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Failed to parse AI error fix response:', error);
            console.log('Raw response:', response);

            // Fallback: return error message
            throw new Error(
                'Failed to parse AI response. The AI may have returned an unexpected format. Please try again.'
            );
        }
    }

    /**
     * Extract JSON from various response formats
     */
    private extractJsonFromResponse(response: string): string | null {
        // Method 1: Try to extract from ```json code blocks
        const jsonBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonBlockMatch) {
            return jsonBlockMatch[1].trim();
        }

        // Method 2: Try to extract from ``` code blocks (without language specifier)
        const codeBlockMatch = response.match(/```\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
            const content = codeBlockMatch[1].trim();
            // Check if it looks like JSON (starts with { and ends with })
            if (content.startsWith('{') && content.endsWith('}')) {
                return content;
            }
        }

        // Method 3: Find JSON object boundaries
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return this.cleanJsonString(jsonMatch[0]);
        }

        // Method 4: Try to find and extract JSON more aggressively
        const lines = response.split('\n');
        let jsonStart = -1;
        let jsonEnd = -1;
        let braceCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('{') && jsonStart === -1) {
                jsonStart = i;
                braceCount = 1;
            } else if (jsonStart !== -1) {
                // Count braces to find the end of JSON
                for (const char of line) {
                    if (char === '{') braceCount++;
                    if (char === '}') braceCount--;
                }

                if (braceCount === 0) {
                    jsonEnd = i;
                    break;
                }
            }
        }

        if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonLines = lines.slice(jsonStart, jsonEnd + 1);
            const jsonString = jsonLines.join('\n');
            return this.cleanJsonString(jsonString);
        }

        return null;
    }

    /**
     * Clean JSON string from common formatting issues
     */
    private cleanJsonString(jsonString: string): string {
        // Remove any leading/trailing whitespace
        let cleaned = jsonString.trim();

        // Remove any markdown backticks that might have slipped through
        cleaned = cleaned.replace(/^`+|`+$/g, '');

        // Fix trailing commas before closing braces/brackets
        cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

        return cleaned;
    }

    /**
     * Check if API key is configured
     */
    isConfigured(): boolean {
        return API_KEY !== 'your-gemini-api-key-here' && API_KEY.length > 0;
    }

    /**
     * Test API connection
     */
    async testConnection(): Promise<boolean> {
        try {
            const result = await this.model.generateContent('Hello, this is a test.');
            const response = await result.response;
            return !!response.text();
        } catch (error) {
            console.error('API connection test failed:', error);
            return false;
        }
    }
}

// Export singleton instance
export const aiErrorFixService = new AIErrorFixService();
