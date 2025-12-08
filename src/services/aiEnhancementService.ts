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

**HTML5 Enhancement Focus Areas:**

**Semantic Structure & Accessibility (WCAG 2.1 AA Compliance)**
- Use semantic HTML5 elements (header, nav, main, article, section, aside, footer) for better document structure
- Implement proper heading hierarchy (h1-h6) without skipping levels
- Add comprehensive ARIA labels, roles, and attributes where native semantics fall short
- Include alt attributes for ALL images (descriptive text for meaningful images, empty alt="" for decorative)
- Ensure form inputs have associated labels (using for/id or wrapping label elements)
- Add aria-describedby for form validation messages and contextual help
- Implement keyboard navigation support (tabindex, focus management)
- Ensure sufficient color contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Add skip-to-content links for keyboard users
- Use landmark roles appropriately (role="banner", "main", "contentinfo", etc.)

**SEO & Meta Optimization**
- Add proper meta tags (viewport, description, keywords, og:tags for social sharing)
- Implement structured data using Schema.org markup (JSON-LD preferred)
- Use descriptive, keyword-rich title tags (50-60 characters)
- Add canonical URLs to prevent duplicate content issues
- Include meta robots tags where appropriate
- Implement Open Graph protocol for social media previews

**Performance Optimization**
- Implement lazy loading for images and iframes (loading="lazy")
- Use resource hints (preconnect, prefetch, preload) for critical resources
- Optimize image formats (use WebP with fallbacks, srcset for responsive images)
- Minimize DOM depth and complexity for faster rendering
- Add async/defer attributes to script tags appropriately
- Use picture element with multiple sources for art direction and format support

**Modern HTML5 Best Practices**
- Use native HTML5 validation attributes (required, pattern, min, max, type)
- Implement proper form structure with fieldset and legend for grouped inputs
- Use dialog element for modals and overlays
- Add autocomplete attributes for better UX
- Use rel="noopener noreferrer" for external links
- Implement proper DOCTYPE and language attributes
- Use data-* attributes for custom data storage

**Code Organization & Maintainability**
- Consistent indentation (2 or 4 spaces)
- Logical grouping of related elements
- Descriptive class/id naming conventions (BEM, SMACSS, or consistent custom approach)
- Add HTML comments for major sections
- Keep inline styles to absolute minimum (prefer external CSS)`;

            case 'css':
                return `${basePrompt}

**CSS3 Enhancement Focus Areas:**

**Modern Layout Techniques**
- Use CSS Grid for two-dimensional layouts (grid-template-areas for complex layouts)
- Implement Flexbox for one-dimensional layouts (proper use of flex-grow, flex-shrink, flex-basis)
- Use Container Queries (@container) for component-based responsive design
- Implement CSS Subgrid for nested grid layouts
- Use gap property instead of margins for spacing in Grid/Flexbox
- Leverage aspect-ratio property for maintaining proportions
- Use logical properties (inline-start, block-end) for internationalization support

**CSS Custom Properties & Theming**
- Define comprehensive CSS variables in :root for colors, spacing, typography
- Create color schemes using CSS custom properties for easy theming
- Implement dark mode using @media (prefers-color-scheme: dark)
- Use calc() and clamp() for fluid, responsive values
- Organize variables by category (colors, spacing, typography, shadows, etc.)
- Consider CSS cascade layers (@layer) for better specificity management

**Performance Optimization**
- Use efficient CSS selectors (avoid deep nesting, universal selectors, complex combinators)
- Implement will-change property for animated elements (remove after animation completes)
- Use transform and opacity for animations (GPU-accelerated)
- Implement contain property for layout, style, and paint containment
- Minimize repaints and reflows (batch DOM changes, use CSS transforms)
- Use content-visibility for off-screen content optimization
- Avoid expensive CSS properties (box-shadow on many elements, filters on large areas)

**Responsive Design (Mobile-First Approach)**
- Start with mobile styles, progressively enhance for larger screens
- Use relative units (rem, em, %, vw, vh) instead of fixed pixels where appropriate
- Implement fluid typography using clamp(min, preferred, max)
- Use responsive images with object-fit and object-position
- Create responsive spacing systems using CSS custom properties
- Test across common breakpoints (320px, 768px, 1024px, 1440px+)
- Use min(), max(), clamp() for fluid sizing without media queries

**Accessibility & User Experience**
- Ensure visible focus states for all interactive elements (:focus-visible)
- Maintain WCAG AA color contrast ratios (4.5:1 normal text, 3:1 large text)
- Implement reduced motion for users with motion sensitivity (@media (prefers-reduced-motion))
- Use outline instead of border for focus indicators (maintains layout)
- Ensure sufficient touch target sizes (minimum 44x44px)
- Implement proper focus management (focus-within, :focus-visible)
- Avoid removing default focus outlines without replacement

**Animations & Transitions**
- Use CSS animations and transitions instead of JavaScript where possible
- Keep animation durations reasonable (200-400ms for most UI transitions)
- Use cubic-bezier or steps() for custom easing functions
- Implement smooth scrolling (scroll-behavior: smooth)
- Use @keyframes for complex animations
- Add will-change for elements that will animate (remove after)
- Respect prefers-reduced-motion preference

**Code Architecture & Maintainability**
- Organize CSS logically (base → layout → components → utilities)
- Use consistent naming conventions (BEM, SMACSS, or custom methodology)
- Group related properties (positioning, box model, typography, visual, misc)
- Use CSS custom properties for repeated values
- Add comments for complex calculations or non-obvious decisions
- Minimize use of !important (restructure specificity instead)
- Keep selectors flat when possible (avoid deep nesting > 3 levels)

**Browser Compatibility & Fallbacks**
- Provide fallbacks for newer CSS features using @supports
- Test with vendor prefixes where necessary (autoprefixer recommended)
- Use feature detection for progressive enhancement
- Ensure graceful degradation for older browsers`;

            case 'javascript':
                return `${basePrompt}

**JavaScript (ES6+) Enhancement Focus Areas:**

**Modern JavaScript Syntax & Features**
- Use const/let instead of var (const by default, let when reassignment needed)
- Implement arrow functions for cleaner syntax (mind the 'this' binding)
- Use template literals for string interpolation and multiline strings
- Leverage destructuring for objects and arrays ({ name, age } = user)
- Use spread operator and rest parameters (...args)
- Implement default parameters and object shorthand syntax
- Use optional chaining (?.) and nullish coalescing (??)
- Leverage ES modules (import/export) for code organization
- Use array methods (map, filter, reduce, find, some, every)
- Implement classes and modern OOP patterns where appropriate

**Async Programming & Promises**
- Prefer async/await over raw promises for better readability
- Implement proper error handling with try/catch in async functions
- Use Promise.all() for parallel operations, Promise.allSettled() when you need all results
- Avoid callback hell with promise chaining or async/await
- Handle promise rejections properly (catch blocks, .catch() handlers)
- Use AbortController for cancellable async operations
- Implement proper loading states and error feedback in UI

**DOM Manipulation & Browser APIs**
- Use querySelector/querySelectorAll instead of getElementById/getElementsByClassName
- Check for element existence before manipulation (if (element) { ... })
- Wait for DOM ready (DOMContentLoaded event or defer script attribute)
- Use event delegation for dynamically added elements
- Implement proper event listener cleanup (removeEventListener)
- Use data-* attributes for storing custom data
- Leverage IntersectionObserver for scroll-based features
- Use MutationObserver for monitoring DOM changes
- Implement Web Storage API (localStorage, sessionStorage) properly

**Performance Optimization**
- Debounce expensive operations (search inputs, window resize)
- Throttle high-frequency events (scroll, mousemove)
- Use DocumentFragment for batch DOM insertions
- Minimize DOM queries (cache element references)
- Avoid layout thrashing (read then write DOM operations)
- Use requestAnimationFrame for smooth animations
- Implement lazy loading for images and heavy content
- Use Web Workers for CPU-intensive tasks
- Minimize global variable usage
- Use event delegation instead of multiple listeners

**Error Handling & Edge Cases**
- Wrap risky operations in try/catch blocks
- Validate and sanitize all user inputs
- Check for null/undefined before accessing properties
- Handle network errors gracefully (fetch error handling)
- Provide meaningful error messages to users
- Log errors for debugging (console.error with context)
- Use Error objects with descriptive messages
- Implement input validation before processing
- Handle empty arrays/objects appropriately
- Check array bounds before accessing indices

**Security Best Practices**
- Sanitize user input to prevent XSS attacks (never use innerHTML with user data)
- Use textContent instead of innerHTML when possible
- Validate and escape data before inserting into DOM
- Implement Content Security Policy (CSP) headers
- Use HTTPS for all API calls
- Avoid eval() and Function constructor with user input
- Implement proper authentication/authorization checks
- Use secure random values (crypto.getRandomValues())
- Validate file uploads (type, size, content)
- Implement rate limiting for API calls

**Memory Management & Leak Prevention**
- Remove event listeners when elements are destroyed
- Clear intervals and timeouts properly
- Avoid creating accidental global variables
- Clean up references to large objects when done
- Use WeakMap/WeakSet for cache that can be garbage collected
- Avoid circular references
- Properly dispose of timers, observers, and subscriptions

**Code Quality & Maintainability**
- Use meaningful, descriptive variable and function names (camelCase)
- Keep functions small and focused (single responsibility)
- Add JSDoc comments for complex functions
- Use consistent code formatting (Prettier/ESLint style)
- Avoid deep nesting (early returns, guard clauses)
- Use pure functions where possible (no side effects)
- Implement proper separation of concerns
- Extract magic numbers into named constants
- Group related code into modules/classes
- Write self-documenting code (clear intent)

**Browser Compatibility**
- Check for feature support before using modern APIs
- Provide polyfills for older browsers if needed
- Use feature detection instead of browser detection
- Test across major browsers (Chrome, Firefox, Safari, Edge)
- Consider transpilation for wider compatibility (Babel)`;

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
    private parseAnalysisResponse(response: string, _language: EditorLanguage): AICodeSuggestion[] {
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
    applyPartialSuggestions(originalCode: string, _suggestions: AICodeSuggestion[]): string {
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
