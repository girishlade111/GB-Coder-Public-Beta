# 🛠️ Developer Guide

This guide is for developers who want to contribute to GB Coder or understand how it works under the hood.

## 1. Tech Stack

- **Frontend Framework**: [React 18](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) (`@monaco-editor/react`)
- **AI**: Google Generative AI SDK (`@google/generative-ai`)
- **Icons**: Lucide React

## 2. Project Structure

```text
src/
├── components/
│   ├── ui/            # Generic UI components (Buttons, Modals, Toasts)
│   ├── pages/         # Route components
│   └── ...            # Feature-specific components (Editor, Console, etc.)
├── hooks/             # Custom React hooks (useAutoSave, useTheme)
├── services/          # Business logic and API integration
│   ├── geminiService.ts       # Google AI integration
│   ├── fileSystem.ts          # File handling logic
│   └── ...
├── utils/             # Helper functions
├── App.tsx            # Main application entry
└── main.tsx           # React root
```

## 3. Key Concepts

### Service Pattern
We use a service-based architecture for complex logic to keep components clean.
- **Example**: `geminiService.ts` handles all AI API calls. Components call methods like `geminiService.generateCode()` rather than making API calls directly.

### State Management
- **Local State**: `useState` for component-specific data.
- **Global/Shared State**: Custom hooks and Context (where applicable) for shared data like Theme or Auth.
- **Persistence**: `localStorage` is used extensively to persist user code and settings.

## 4. Setup & Installation

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/girishlade111/GB-Coder-Public-Beta.git
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    - Copy `.env.example` to `.env`.
    - Add your `VITE_GEMINI_API_KEY`.
4.  **Run locally**:
    ```bash
    npm run dev
    ```

## 5. Contributing

1.  Pick an issue or feature.
2.  Create a branch: `git checkout -b feature/my-feature`.
3.  Commit changes.
4.  Push and open a Pull Request.

Please follow the existing code style (Prettier/ESLint) and ensure all types are properly defined.
