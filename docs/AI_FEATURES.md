# 🤖 AI Features Documentation

GB Coder integrates advanced AI capabilities powered by **Google Gemini** (and optionally **OpenRouter**) to assist you throughout your coding journey.

## 1. Smart Suggestions

The editor provides intelligent code completions as you type.

- **How it works**: The AI analyzes your current code context and suggests the next logical lines or blocks of code.
- **Trigger**: Suggestions appear automatically when you pause typing.
- **Accepting**: Press `Tab` to accept a suggestion.
- **Dismissing**: Continue typing or press `Esc` to ignore.

## 2. Code Explanation

Understand complex logic instantly.

- **Usage**:
    1.  Select a block of code in the editor.
    2.  Right-click and choose **"Explain Code"** (or use the "Explain" button in the toolbar).
    3.  An AI-generated explanation will appear in a popup, breaking down the logic step-by-step.

## 3. Automated Refactoring & Fixing

Improve your code quality with one click.

- **Fix Errors**: If the editor detects a syntax error or bug, use the **"Fix"** option to have the AI propose a solution.
- **Improve Code**: Select code and choose **"Improve"** to get suggestions for:
    - Performance optimizations.
    - Readability enhancements.
    - Modern syntax updates (e.g., `var` to `const/let`).

## 4. AI Chat Assistant

A built-in coding companion to answer your questions.

- **Access**: Click the **"Ask AI"** button in the bottom toolbar or sidebar.
- **Capabilities**:
    - Ask general coding questions.
    - Request code snippets.
    - Debug issues in your current project.
    - Ask for design advice.
- **Context Awareness**: The chat assistant is aware of the code currently in your editor, allowing for specific and relevant answers.

## 5. Configuration

Customize your AI experience.

- **API Keys**:
    - The project uses `VITE_GEMINI_API_KEY` by default.
    - You can configure this in your `.env` file.
- **Model Selection**:
    - The system defaults to **Gemini Pro**.
    - **OpenRouter** integration allows for fallback to other models (like `x-ai/grok`, `llama-3`, etc.) if Gemini is unavailable or if configured to do so.
- **Toggle**: You can enable/disable AI features globally via the settings or `.env` (`VITE_ENABLE_AI_SUGGESTIONS`).

## 6. Privacy

- Your code is sent to the AI provider (Google or OpenRouter) **only** when you request suggestions, explanations, or chat responses.
- No code is stored permanently by the AI service for training purposes (subject to the provider's API terms).
