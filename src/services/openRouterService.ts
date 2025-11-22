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

        // List of models to try in order of preference
        const modelsToTry = [
            this.model, // User configured model (default: x-ai/grok-4.1-fast:free)
            'google/gemini-2.0-flash-exp:free',
            'google/gemini-2.0-pro-exp-02-05:free',
            'meta-llama/llama-3.3-70b-instruct:free',
            'microsoft/phi-3-medium-128k-instruct:free'
        ];

        // Helper to make the actual fetch request
        const makeRequest = async (model: string, useReasoning: boolean, useSystemRole: boolean) => {
            // Prepare messages based on flags
            let finalMessages = messages.map(({ role, content }) => ({ role, content }));

            // If system role is not supported, merge it into the first user message
            if (!useSystemRole) {
                const systemMsg = finalMessages.find(m => m.role === 'system');
                if (systemMsg) {
                    finalMessages = finalMessages.filter(m => m.role !== 'system');
                    if (finalMessages.length > 0 && finalMessages[0].role === 'user') {
                        finalMessages[0].content = `${systemMsg.content}\n\n${finalMessages[0].content}`;
                    } else {
                        finalMessages.unshift({ role: 'user', content: systemMsg.content });
                    }
                }
            }

            const body: any = {
                model: model,
                messages: finalMessages,
                temperature,
                max_tokens: maxTokens,
            };

            if (useReasoning) {
                body.reasoning = { enabled: true };
            }

            console.log(`[OpenRouter] Attempting request with model: ${model}, reasoning: ${useReasoning}, systemRole: ${useSystemRole}`);

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'GB Coder'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.warn(`[OpenRouter] Request failed for ${model}:`, response.status, errorData);

                // Throw specific error object to handle in retry loop
                throw {
                    status: response.status,
                    message: errorData.error?.message || response.statusText,
                    isRetryable: [408, 429, 500, 502, 503, 504].includes(response.status) || response.status === 422
                };
            }

            return await response.json();
        };

        let lastError: any = null;

        // Iterate through models
        for (const model of modelsToTry) {
            try {
                // Strategy 1: Try with reasoning (if enabled) and system role
                try {
                    return await makeRequest(model, enableReasoning, true);
                } catch (err: any) {
                    if (err.status === 422 && enableReasoning) {
                        // Strategy 2: Retry without reasoning
                        console.warn(`[OpenRouter] 422 with reasoning for ${model}. Retrying without...`);
                        try {
                            return await makeRequest(model, false, true);
                        } catch (retryErr: any) {
                            if (retryErr.status === 422) {
                                // Strategy 3: Retry without system role
                                console.warn(`[OpenRouter] 422 with system role for ${model}. Retrying without...`);
                                return await makeRequest(model, false, false);
                            }
                            throw retryErr;
                        }
                    } else if (err.status === 429) {
                        // Rate limit - immediately try next model
                        console.warn(`[OpenRouter] Rate limit (429) for ${model}. Switching to next model...`);
                        lastError = err;
                        continue;
                    } else {
                        throw err;
                    }
                }
            } catch (error: any) {
                console.warn(`[OpenRouter] Failed with model ${model}:`, error);
                lastError = error;
                // Continue to next model
            }
        }

        // If we get here, all models failed
        console.error('OpenRouter API Fatal Error: All models failed', lastError);

        if (lastError) {
            if (lastError.message?.includes('API key')) {
                throw new Error('Invalid API key. Please check your VITE_OPENROUTER_API_KEY environment variable.');
            } else if (lastError.message?.includes('quota') || lastError.message?.includes('limit') || lastError.status === 429) {
                throw new Error('API quota exceeded or rate limited. Please try again later.');
            }
            throw new Error(`Failed to connect to OpenRouter: ${lastError.message || 'Unknown error'}`);
        }

        throw new Error('Failed to connect to OpenRouter: All available models failed.');
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
