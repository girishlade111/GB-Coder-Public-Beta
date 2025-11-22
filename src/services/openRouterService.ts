/**
 * OpenRouter AI Service
 * Base service for interacting with OpenRouter.ai API using Grok model
 * Supports reasoning, streaming, and conversation history
 */

interface OpenRouterMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    reasoning_details?: any;
}

interface OpenRouterResponse {
    id: string;
    choices: Array<{
        message: {
            role: string;
            content: string;
            reasoning_details?: any;
        };
        finish_reason: string;
    }>;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export class OpenRouterService {
    private apiKey: string;
    private model: string;
    private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

    constructor() {
        this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
        this.model = import.meta.env.VITE_OPENROUTER_MODEL || 'x-ai/grok-4.1-fast:free';

        if (!this.apiKey || this.apiKey.length < 10) {
            console.warn('OpenRouter API key not configured or invalid');
        }
    }

    /**
     * Send a chat completion request to OpenRouter
     */
    async chat(
        messages: OpenRouterMessage[],
        options: {
            enableReasoning?: boolean;
            temperature?: number;
            maxTokens?: number;
        } = {}
    ): Promise<OpenRouterResponse> {
        const { enableReasoning = true, temperature = 0.7, maxTokens = 4096 } = options;

        if (!this.isConfigured()) {
            throw new Error('OpenRouter API key not configured. Please check your environment variables.');
        }

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'GB Coder'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages,
                    temperature,
                    max_tokens: maxTokens,
                    ...(enableReasoning && { reasoning: { enabled: true } })
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`
                );
            }

            const data: OpenRouterResponse = await response.json();
            return data;
        } catch (error) {
            console.error('OpenRouter API Error:', error);

            if (error instanceof Error) {
                if (error.message.includes('API key')) {
                    throw new Error('Invalid API key. Please check your VITE_OPENROUTER_API_KEY environment variable.');
                } else if (error.message.includes('quota') || error.message.includes('limit')) {
                    throw new Error('API quota exceeded. Please try again later or check your billing.');
                } else if (error.message.includes('model')) {
                    throw new Error('Model not available. The service may be temporarily unavailable.');
                }
            }

            throw new Error(`Failed to connect to OpenRouter: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Send a simple prompt and get a response
     */
    async sendPrompt(
        prompt: string,
        systemPrompt?: string,
        enableReasoning: boolean = true
    ): Promise<string> {
        const messages: OpenRouterMessage[] = [];

        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }

        messages.push({ role: 'user', content: prompt });

        const response = await this.chat(messages, { enableReasoning });
        return response.choices[0]?.message?.content || '';
    }

    /**
     * Continue a conversation with context and reasoning preservation
     */
    async continueConversation(
        previousMessages: OpenRouterMessage[],
        newMessage: string
    ): Promise<OpenRouterResponse> {
        const messages = [
            ...previousMessages,
            { role: 'user' as const, content: newMessage }
        ];

        return this.chat(messages, { enableReasoning: true });
    }

    /**
     * Check if API is properly configured
     */
    isConfigured(): boolean {
        return this.apiKey.length > 10 && !this.apiKey.includes('your-api-key');
    }

    /**
     * Get the current model name
     */
    getModel(): string {
        return this.model;
    }

    /**
     * Test API connection
     */
    async testConnection(): Promise<boolean> {
        try {
            const response = await this.sendPrompt('Hello, this is a test.', undefined, false);
            return response.length > 0;
        } catch (error) {
            console.error('API connection test failed:', error);
            return false;
        }
    }
}

// Export singleton instance
export const openRouterService = new OpenRouterService();
