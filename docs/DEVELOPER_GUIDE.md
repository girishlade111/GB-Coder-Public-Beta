# 🛠️ GB Coder Developer Guide

> Welcome to the GB Coder developer documentation. This guide provides a deep dive into the architecture, tech stack, and development workflows for contributors and maintainers.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [System Architecture](#2-system-architecture)
3. [Project Structure](#3-project-structure)
4. [Key Components & Services](#4-key-components--services)
5. [State Management & Persistence](#5-state-management--persistence)
6. [Backend & Terminal](#6-backend--terminal)
7. [Setup & Installation](#7-setup--installation)
8. [Development Workflow](#8-development-workflow)
9. [Contribution Guidelines](#9-contribution-guidelines)

---

## 1. Tech Stack

GB Coder is built with a modern, performance-focused stack:

### Frontend Core
- **Framework**: [React 18](https://react.dev/) (Functional components, Hooks)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode enabled)
- **Build Tool**: [Vite](https://vitejs.dev/) (Fast HMR and bundling)
- **Routing**: React Router (implied by page structure)

### UI & Styling
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS)
- **Icons**: [Lucide React](https://lucide.dev/) (Consistent, lightweight icons)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) (via `@monaco-editor/react`)
- **Diffing**: `react-diff-viewer-continued` (For AI code comparisons)

### AI & Intelligence
- **Google Gemini**: `@google/generative-ai` (Error fixing, suggestions)
- **OpenRouter**: Custom service for accessing models like DeepSeek/Grok (Chatbot, Enhancements)

### Backend (Terminal Server)
- **Runtime**: Node.js
- **Framework**: Express
- **WebSockets**: `ws` (Real-time terminal communication)
- **PTY**: `node-pty` (Pseudo-terminal emulation)

### Utilities
- **Formatting**: Prettier (Code formatting)
- **Export**: JSZip (Project zipping)
- **Linting**: ESLint + TypeScript ESLint

---

## 2. System Architecture

GB Coder operates primarily as a **client-side SPA (Single Page Application)** with a lightweight backend for specific system capabilities.

### Client-Side (Browser)
- **Code Execution**: User code (HTML/CSS/JS) is executed within a sandboxed `iframe` (`PreviewPanel.tsx`) to ensure security and isolation.
- **Persistence**: All project data, settings, and history are stored in the browser's `localStorage`.
- **AI Processing**: API calls to Gemini/OpenRouter are made directly from the client (proxied if necessary for CORS).

### Server-Side (Node.js)
- **Terminal Emulation**: The `server/` directory contains a WebSocket server that spawns a PTY process.
- **Communication**: The frontend `CommandTerminal.tsx` connects via WebSocket to send keystrokes and receive shell output.
- **Local Execution**: Commands run on the user's local machine context (when running locally).

---

## 3. Project Structure

```text
GB-Coder-Public-Beta/
├── docs/                      # Documentation files
├── server/                    # Backend for Terminal
│   ├── index.js               # WebSocket & Express server
│   └── package.json           # Backend dependencies
├── src/                       # Frontend Source
│   ├── components/            # React Components
│   │   ├── Console/           # Console & Terminal panels
│   │   ├── pages/             # Route pages (Documentation, Settings)
│   │   ├── ui/                # Reusable UI atoms (Modals, Buttons)
│   │   ├── CodeEditor.tsx     # Monaco wrapper
│   │   ├── PreviewPanel.tsx   # Iframe sandbox
│   │   └── ...
│   ├── hooks/                 # Custom React Hooks
│   │   ├── useProject.ts      # Project CRUD operations
│   │   ├── useSettings.ts     # App configuration
│   │   └── ...
│   ├── services/              # Business Logic (Singleton classes)
│   │   ├── aiCodeAssistant.ts # Chatbot logic
│   │   ├── projectStore.ts    # Persistence logic
│   │   └── ...
│   ├── types/                 # TypeScript Definitions
│   ├── utils/                 # Helper Functions
│   ├── App.tsx                # Main Layout & State Provider
│   └── main.tsx               # Entry Point
├── .env                       # Environment Variables
├── package.json               # Frontend Dependencies
└── tailwind.config.js         # Tailwind Configuration
```

---

## 4. Key Components & Services

### Core Components
- **`App.tsx`**: Manages the global layout, including the resizable split-pane (Editor vs Preview) and global modals.
- **`CodeEditor.tsx`**: A wrapper around Monaco Editor that handles theme injection, font settings, and content changes.
- **`PreviewPanel.tsx`**: The "browser within a browser". It constructs a complete HTML document with injected libraries and user code, rendering it inside a sandboxed iframe. It also captures console logs from the iframe to send back to the main app.
- **`GeminiCodeAssistant.tsx`**: The AI sidebar component handling chat UI, history, and code application logic.

### Critical Services
- **`projectStore.ts`**: The "database" layer. It handles saving/loading projects to `localStorage`, managing the active project ID, and auto-save logic.
- **`aiCodeAssistant.ts`**: Manages the chat context, prompt engineering for the chatbot, and OpenRouter API integration.
- **`aiErrorFixService.ts`**: Specialized service that takes a console error + code context and queries Gemini for a fix.
- **`externalLibraryService.ts`**: Manages the list of CDN libraries (Bootstrap, React, etc.) and generates the HTML tags for injection.

---

## 5. State Management & Persistence

GB Coder avoids heavy state libraries like Redux in favor of **React Hooks** and **Context** for simplicity and performance.

### Local State
Components manage their own UI state (e.g., `isOpen`, `isLoading`) using `useState`.

### Shared State
Custom hooks act as stores:
- **`useProject`**: Exposes `currentProject`, `saveProject`, `createNewProject`.
- **`useSettings`**: Exposes `theme`, `fontSize`, `autoRunJS`.

### Persistence Strategy
Data is persisted synchronously to `localStorage` to ensure work is never lost on reload.
- **Key**: `gb-coder-projects` (Array of all projects)
- **Key**: `gb-coder-current-project-id` (ID of active project)

---

## 6. Backend & Terminal

The terminal feature requires a local Node.js server because browsers cannot directly spawn shell processes.

### Architecture
1.  **Frontend**: `xterm.js` renders the terminal UI.
2.  **Protocol**: WebSockets (`ws`) transport data.
3.  **Backend**: `node-pty` spawns a real shell (`powershell.exe` on Windows, `bash`/`zsh` on Unix).

### Security Note
The terminal runs with the permissions of the user running the `npm run dev:terminal` command. It is a powerful feature intended for local development.

---

## 7. Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Git

### Installation Steps

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/girishlade111/GB-Coder-Public-Beta.git
    cd GB-Coder-Public-Beta
    ```

2.  **Install Frontend Dependencies**:
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies** (for Terminal):
    ```bash
    cd server
    npm install
    cd ..
    ```

4.  **Environment Configuration**:
    Create a `.env` file in the root directory:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_key_here
    VITE_OPENROUTER_API_KEY=your_openrouter_key_here
    ```

5.  **Start Development Servers**:
    
    **Option A: Frontend Only** (No terminal support)
    ```bash
    npm run dev
    ```

    **Option B: Full Stack** (With terminal)
    Open two terminals:
    1.  `npm run dev` (Frontend)
    2.  `npm run dev:terminal` (Backend)

---

## 8. Development Workflow

### Adding a New Feature
1.  **Component**: Create new UI in `src/components`.
2.  **Service**: If logic is complex, add a service in `src/services`.
3.  **Integration**: Add to `App.tsx` or relevant parent.

### Styling
Use Tailwind CSS classes. For complex animations or custom overrides, edit `src/index.css`.

### Testing
- Currently, manual testing is primary.
- Use the **Console** to verify logic.
- Use **Preview** to verify rendering.

---

## 9. Contribution Guidelines

We welcome contributions! Please follow these steps:

1.  **Fork & Branch**: Create a feature branch (`feature/amazing-feature`).
2.  **Code Style**:
    - Use TypeScript types explicitly (avoid `any`).
    - Follow the existing folder structure.
    - Run `npm run lint` before committing.
3.  **Commit Messages**: Clear and descriptive (e.g., "Add export to JSON feature").
4.  **Pull Request**: Describe your changes and attach screenshots if UI-related.

### License
This project is open-source. Please see the [LICENSE](../LICENSE) file for details.
