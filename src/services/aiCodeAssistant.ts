import { openRouterService } from './openRouterService';
import { GeminiChatMessage, GeminiCodeBlock, CodeModificationRequest, GeminiChatRequest, EditorLanguage } from '../types';

export class AICodeAssistant {
    private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; reasoning_details?: any }> = [];

    /**
     * Generate code based on user request
     */
    async generateCode(request: string, detectedType?: EditorLanguage): Promise<GeminiChatMessage> {
        if (!openRouterService.isConfigured()) {
            throw new Error('OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to your environment variables.');
        }

        try {
            const language = detectedType || this.detectRequestType(request);
            const prompt = this.buildCodeGenerationPrompt(request, language);

            const response = await openRouterService.chat([
                { role: 'user', content: prompt }
            ], { enableReasoning: true });

            const assistantMessage = response.choices[0]?.message;

            // Store in conversation history with reasoning
            this.conversationHistory.push({
                role: 'user',
                content: request
            });
            this.conversationHistory.push({
                role: 'assistant',
                content: assistantMessage.content,
                reasoning_details: assistantMessage.reasoning_details
            });

            const codeBlock = this.parseCodeResponse(assistantMessage.content, language);

            return {
                id: Date.now().toString(),
                type: 'assistant',
                content: assistantMessage.content,
                timestamp: new Date().toISOString(),
                codeBlocks: [codeBlock]
            };
        } catch (error) {
            console.error('Code generation error:', error);
            throw error;
        }
    }

    /**
     * Send a general chat message
     */
    async sendMessage(request: GeminiChatRequest): Promise<GeminiChatMessage> {
        if (!openRouterService.isConfigured()) {
            throw new Error('OpenRouter API key not configured.');
        }

        try {
            const systemPrompt = `You are an expert AI coding assistant integrated into GB Coder, a modern web-based code editor with live preview capabilities. Your role is to help developers create high-quality, production-ready web applications using HTML5, CSS3, and modern JavaScript (ES6+).

## Your Expertise
- **HTML5**: Semantic markup, accessibility (WCAG 2.1 AA standards), SEO optimization, form validation, responsive images
- **CSS3**: Modern layout techniques (Grid, Flexbox, Container Queries), CSS Custom Properties, animations, responsive design (mobile-first), performance optimization
- **JavaScript**: ES6+ features (async/await, modules, destructuring, arrow functions), DOM manipulation, event handling, error handling, browser APIs, performance optimization, security best practices

## Context Awareness
- You have access to the user's current HTML, CSS, and JavaScript code
- GB Coder features a live preview panel that updates in real-time
- Users can attach images and files to their messages for context
- The editor supports syntax highlighting and error detection

## Response Guidelines

### Code Quality Standards
- Write clean, well-commented, production-ready code
- Follow modern best practices and current web standards
- Prioritize accessibility (proper ARIA labels, semantic HTML, keyboard navigation)
- Optimize for performance (minimize reflows, use efficient selectors, lazy loading)
- Implement responsive design patterns (mobile-first approach)
- Include security considerations (XSS prevention, input sanitization)
- Use meaningful variable/function names and consistent formatting

### Output Format
- Use markdown formatting for explanations
- Wrap code in appropriate language-specific code blocks (\`\`\`html, \`\`\`css, \`\`\`javascript)
- Provide clear explanations before and after code snippets
- Break down complex concepts into digestible steps
- Use headings, bullet points, and emphasis for better readability

### Educational Value
- Explain WHY solutions work, not just HOW
- Point out common pitfalls and how to avoid them
- Suggest best practices and modern alternatives
- Provide learning resources when relevant
- Encourage good coding habits

### Tone and Style
- Be helpful, encouraging, and patient
- Use clear, concise language
- Adapt explanations to the user's apparent skill level
- Celebrate good practices when you see them
- Offer constructive feedback on improvements

## Special Capabilities
- Generate complete, working code solutions from descriptions
- Debug and fix errors with detailed explanations
- Refactor code for better performance and maintainability
- Explain complex code logic step-by-step
- Suggest modern alternatives to outdated patterns
- Provide multiple approaches when appropriate

## Priority Considerations
1. **Correctness**: Code must work as intended
2. **Accessibility**: Ensure inclusive design (WCAG 2.1 AA)
3. **Performance**: Optimize for speed and efficiency
4. **Maintainability**: Write clear, well-structured code
5. **Security**: Follow security best practices
6. **Compatibility**: Consider modern browser support

Remember: Your goal is not just to provide code, but to help users become better developers by understanding the principles behind the solutions.`;

            const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string | any[]; reasoning_details?: any }> = [
                { role: 'system', content: systemPrompt }
            ];


            // Add conversation history if available
            if (request.conversationHistory) {
                messages.push(...request.conversationHistory.map(msg => ({
                    role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
                    content: msg.content
                })));
            } else {
                messages.push(...this.conversationHistory);
            }

            // Add current message
            let finalContent: string | any[] = request.message;

            if (request.attachments && request.attachments.length > 0) {
                const contentParts: any[] = [{ type: 'text', text: request.message }];

                for (const attachment of request.attachments) {
                    if (attachment.type === 'image') {
                        contentParts.push({
                            type: 'image_url',
                            image_url: {
                                url: attachment.content
                            }
                        });
                    } else if (attachment.type === 'file') {
                        // Append file content to text prompt
                        contentParts[0].text += `\n\nFile: ${attachment.name}\n\`\`\`${attachment.mimeType || ''}\n${attachment.content}\n\`\`\``;
                    }
                }

                // If we have images or modified text, use the appropriate format
                if (contentParts.length > 1) {
                    finalContent = contentParts;
                } else {
                    finalContent = contentParts[0].text;
                }
            }

            messages.push({
                role: 'user',
                content: finalContent
            });

            const response = await openRouterService.chat(messages, { enableReasoning: true });
            const assistantMessage = response.choices[0]?.message;

            // Update conversation history
            this.conversationHistory.push({
                role: 'user',
                content: request.message
            });
            this.conversationHistory.push({
                role: 'assistant',
                content: assistantMessage.content,
                reasoning_details: assistantMessage.reasoning_details
            });

            // Parse for code blocks
            const codeBlocks = this.extractCodeBlocks(assistantMessage.content);

            return {
                id: Date.now().toString(),
                type: 'assistant',
                content: assistantMessage.content,
                timestamp: new Date().toISOString(),
                codeBlocks: codeBlocks.length > 0 ? codeBlocks : undefined
            };
        } catch (error) {
            console.error('Chat error:', error);
            throw error;
        }
    }



    /**
     * Detect code type from request
     */
    private detectRequestType(request: string): EditorLanguage {
        const requestLower = request.toLowerCase();

        if (requestLower.includes('html') || requestLower.includes('webpage') || requestLower.includes('form')) {
            return 'html';
        }
        if (requestLower.includes('css') || requestLower.includes('style') || requestLower.includes('color')) {
            return 'css';
        }
        if (requestLower.includes('javascript') || requestLower.includes('js') || requestLower.includes('function')) {
            return 'javascript';
        }

        return 'javascript'; // default
    }

    /**
     * Build code generation prompt
     */
    private buildCodeGenerationPrompt(request: string, language: EditorLanguage): string {
        const languageDetails = {
            html: `**HTML5 Requirements:**
- Use semantic HTML5 elements (header, main, section, article, footer, nav)
- Add proper ARIA labels and accessibility attributes (WCAG 2.1 AA)
- Include alt text for images, labels for form inputs
- Implement proper heading hierarchy (h1-h6)
- Use data-* attributes for custom data storage
- Add responsive meta viewport tag`,
            css: `**CSS3 Requirements:**
- Use modern layout techniques (CSS Grid, Flexbox)
- Implement CSS custom properties for theming
- Create mobile-first responsive design with media queries
- Use efficient selectors and proper specificity
- Add smooth transitions and animations where appropriate
- Ensure proper focus states for accessibility
- Use relative units (rem, em) for scalability`,
            javascript: `**JavaScript (ES6+) Requirements:**
- Use const/let instead of var
- Implement modern async/await patterns
- Add proper error handling (try/catch blocks)
- Use querySelector for DOM manipulation
- Wait for DOMContentLoaded before running DOM operations
- Add event listeners properly (with cleanup potential)
- Include input validation and sanitization
- Use arrow functions and destructuring where appropriate
- Write clear, self-documenting code with descriptive names`
        };

        return `You are generating production-ready ${language.toUpperCase()} code for GB Coder, a web-based code editor with live preview.

**User Request:**
${request}

${languageDetails[language]}

**Code Quality Standards:**
- Write clean, well-commented, production-ready code
- Follow modern best practices and current web standards (2024)
- Add helpful inline comments explaining key functionality
- Use proper indentation (2 or 4 spaces consistently)
- Ensure code is immediately functional in a live preview
- Make code accessible, performant, and secure
- Use meaningful variable/function names (camelCase for JS, kebab-case for CSS classes)

**Output Format:**
- Respond with the code in a markdown code block
- Use proper syntax: \`\`\`${language}
- Add a brief comment at the top explaining what the code does
- Include inline comments for complex logic


Generate clean, well-commented ${language.toUpperCase()} code that fulfills the request and follows all requirements above.`;
    }

    /**
     * Parse code from response
     */
    private parseCodeResponse(text: string, language: EditorLanguage): GeminiCodeBlock {
        const codeBlockRegex = /```(?:html|css|javascript|js)?\n?([\s\S]*?)```/i;
        const match = text.match(codeBlockRegex);

        const code = match ? match[1].trim() : text.trim();

        return {
            id: `code-${Date.now()}`,
            language,
            code
        };
    }

    /**
     * Extract all code blocks from text
     */
    private extractCodeBlocks(text: string): GeminiCodeBlock[] {
        const blocks: GeminiCodeBlock[] = [];
        const codeBlockRegex = /```(html|css|javascript|js)?\n([\s\S]*?)```/gi;
        let match;

        while ((match = codeBlockRegex.exec(text)) !== null) {
            const language = (match[1] || 'javascript') as EditorLanguage;
            const code = match[2].trim();

            blocks.push({
                id: `code-${Date.now()}-${blocks.length}`,
                language,
                code
            });
        }

        return blocks;
    }

    /**
     * Clear conversation history
     */
    clearHistory(): void {
        this.conversationHistory = [];
    }

    /**
     * Get conversation history
     */
    getHistory(): Array<{ role: 'user' | 'assistant'; content: string; reasoning_details?: any }> {
        return this.conversationHistory;
    }

    /**
     * Test API connection
     */
    async testConnection(): Promise<boolean> {
        return openRouterService.testConnection();
    }

    /**
     * Validate line number (stub for compatibility)
     */
    validateLineNumber(code: string, lineNumber: number): { isValid: boolean; maxLines: number; error?: string } {
        const lines = code.split('\n');
        const isValid = lineNumber > 0 && lineNumber <= lines.length;
        return {
            isValid,
            maxLines: lines.length,
            error: isValid ? undefined : `Line number must be between 1 and ${lines.length}`
        };
    }

    /**
     * Apply code modification (stub for compatibility)
     */
    applyCodeModification(originalCode: string, modification: CodeModificationRequest): string {
        const lines = originalCode.split('\n');
        if (modification.action === 'insert') {
            lines.splice(modification.lineNumber - 1, 0, modification.code);
        } else {
            lines[modification.lineNumber - 1] = modification.code;
        }
        return lines.join('\n');
    }

    /**
     * Process modification input (stub - returns error for now)
     */
    async processModificationInput(
        _input: string,
        _step: string,
        _context: any
    ): Promise<any> {
        return {
            error: 'Code modification workflow is not yet implemented with OpenRouter. Please use direct code generation instead.'
        };
    }

    /**
     * Detect and parse code from AI response
     */
    detectCodeInResponse(message: string): {
        hasCode: boolean;
        html?: string;
        css?: string;
        javascript?: string;
        explanations: string[];
    } {
        const result = {
            hasCode: false,
            html: undefined as string | undefined,
            css: undefined as string | undefined,
            javascript: undefined as string | undefined,
            explanations: [] as string[]
        };

        // Extract all code blocks
        const codeBlockRegex = /```(html|css|javascript|js)?\n([\s\S]*?)```/gi;
        const matches = Array.from(message.matchAll(codeBlockRegex));

        if (matches.length === 0) {
            result.explanations = [message];
            return result;
        }

        result.hasCode = true;

        // Parse each code block
        matches.forEach(match => {
            const language = (match[1] || '').toLowerCase();
            const code = match[2].trim();

            if (language === 'html' || (!language && code.includes('<') && code.includes('>'))) {
                result.html = code;
            } else if (language === 'css' || (!language && (code.includes('{') && code.includes('}') && code.includes(':')))) {
                result.css = code;
            } else if (language === 'javascript' || language === 'js' || !language) {
                result.javascript = code;
            }
        });

        // Extract explanations (text between code blocks and before/after)
        const parts = message.split(/```(?:html|css|javascript|js)?\n[\s\S]*?```/);
        result.explanations = parts
            .map(part => part.trim())
            .filter(part => part.length > 0);

        return result;
    }

    /**
     * Format response for chatbot display
     */
    formatResponseForChatbot(parsedCode: {
        hasCode: boolean;
        html?: string;
        css?: string;
        javascript?: string;
        explanations: string[];
    }): string {
        let formattedResponse = '';

        // Add explanations
        if (parsedCode.explanations.length > 0) {
            formattedResponse += parsedCode.explanations.join('\n\n') + '\n\n';
        }

        // Add code blocks
        if (parsedCode.html) {
            formattedResponse += '```html\n' + parsedCode.html + '\n```\n\n';
        }
        if (parsedCode.css) {
            formattedResponse += '```css\n' + parsedCode.css + '\n```\n\n';
        }
        if (parsedCode.javascript) {
            formattedResponse += '```javascript\n' + parsedCode.javascript + '\n```\n\n';
        }

        return formattedResponse.trim();
    }

    /**
     * Check if configured
     */
    isConfigured(): boolean {
        return openRouterService.isConfigured();
    }
}

// Export singleton instance
export const aiCodeAssistant = new AICodeAssistant();
