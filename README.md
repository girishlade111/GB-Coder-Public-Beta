# GB Coder - AI-Powered Code Playground

![GB Coder Banner](tghjkl.jpeg)

<div align="center">

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

<br />

**GB Coder** is a state-of-the-art, AI-powered code playground designed to revolutionize how developers write, test, and learn code. Built with a modern tech stack, it integrates Google's Gemini AI to provide real-time suggestions, code explanations, and automated enhancements, all within a sleek, dark-matte user interface.

---

## 🌟 Key Features

### 🤖 **AI Intelligence & Assistance**
*   **Smart Suggestions**: Context-aware code completions and recommendations powered by Google Gemini Pro.
*   **Code Explanation**: Instant, detailed explanations for selected code blocks to aid learning and debugging.
*   **Automated Refactoring**: One-click code enhancement to improve performance, readability, and best practices.
*   **Interactive Chat**: Built-in AI assistant to answer coding queries without leaving the editor.

### 💻 **Advanced Editor Environment**
*   **Monaco Editor Integration**: Professional-grade editing experience (VS Code engine) with syntax highlighting and IntelliSense.
*   **Multi-Language Support**: Seamlessly switch between HTML, CSS, and JavaScript panels.
*   **Live Preview**: Real-time rendering of your code with instant feedback.
*   **Console & Terminal**: Integrated web console and command terminal for debugging and script execution.

### 🛠️ **Developer Tools**
*   **External Library Manager**: Effortlessly add libraries like Bootstrap, Tailwind, React, Vue, and more via a searchable GUI.
*   **History & Persistence**: Robust undo/redo functionality and local storage persistence to save your work automatically.
*   **Responsive Design Tools**: Test your projects on various screen sizes (Mobile, Tablet, Desktop) directly within the playground.
*   **File Management**: Upload, download, and manage your project files with ease.

---

## 📊 Project Stats

| Metric | Count | Details |
| :--- | :---: | :--- |
| **Components** | ~50 | UI & Feature Components (`.tsx`) |
| **Logic Files** | ~48 | Hooks, Services, & Utils (`.ts`) |
| **Dependencies** | 14 | Key production libraries |
| **Dev Dependencies** | 17 | Build & tooling libraries |
| **Styles** | Tailwind | Utility-first CSS architecture |
| **State Management** | React Hooks | Custom hooks for complex state |

---

## 🛠️ Technology Stack

### **Frontend Core**
*   **Framework**: [React 18](https://react.dev/) - Component-based UI library.
*   **Language**: [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript for safety.
*   **Build Tool**: [Vite](https://vitejs.dev/) - Next-generation frontend tooling.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Rapid UI development.

### **Editor & UI**
*   **Code Editor**: `@monaco-editor/react` - The power of VS Code in the browser.
*   **Icons**: `lucide-react` - Beautiful, consistent icons.
*   **Animations**: CSS Transitions & Custom Animations.

### **AI & Services**
*   **AI Model**: Google Generative AI (`@google/generative-ai`) - Gemini Pro.
*   **Analytics**: `web-vitals`, `react-ga4` - Performance and usage tracking.

---

## ⚙️ Configuration & Setup

### **Prerequisites**
*   **Node.js**: v16.0.0 or higher
*   **npm** or **yarn**: Package manager

### **Installation**

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/girishlade111/GB-Coder-Public-Beta.git
    cd GB-Coder-Public-Beta
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

### **Environment Setup**

Create a `.env` file in the root directory. You can use `.env.example` as a template.

```bash
cp .env.example .env
```

**Required Variables:**

| Variable | Description |
| :--- | :--- |
| `VITE_GEMINI_API_KEY` | **Required**. Your Google Gemini API Key. Get it from [Google AI Studio](https://aistudio.google.com/app/apikey). |

**Optional Flags:**

| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_ENABLE_AI_SUGGESTIONS` | `true` | Toggle AI features. |
| `VITE_ENABLE_EXTERNAL_LIBRARIES` | `true` | Toggle library manager. |
| `VITE_DEV_PORT` | `5173` | Custom development port. |

### **Running the Project**

*   **Development Server** (with HMR):
    ```bash
    npm run dev
    ```
    Visit `http://localhost:5173` to see the app.

*   **Production Build**:
    ```bash
    npm run build
    ```

*   **Preview Production Build**:
    ```bash
    npm run preview
    ```

---

## 📂 Project Structure

```text
GB-Coder-Public-Beta/
├── src/
│   ├── components/        # React Components
│   │   ├── ui/            # Reusable UI elements (Buttons, Modals, etc.)
│   │   ├── pages/         # Route pages (About, Contact, etc.)
│   │   └── ...            # Feature-specific components
│   ├── hooks/             # Custom React Hooks (useAutoSave, useTheme, etc.)
│   ├── services/          # Business logic & API services (AI, File System)
│   ├── utils/             # Helper functions & constants
│   ├── App.tsx            # Main Application Component
│   └── main.tsx           # Entry Point
├── public/                # Static assets
├── .env.example           # Environment variables template
├── package.json           # Dependencies & Scripts
├── tailwind.config.js     # Tailwind CSS Configuration
├── tsconfig.json          # TypeScript Configuration
└── vite.config.ts         # Vite Configuration
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Credits

**Created by:** Girish Lade
*   **Instagram**: [@girish_lade_](https://www.instagram.com/girish_lade_/)
*   **Email**: girishlade111@gmail.com
*   **GitHub**: [girishlade111](https://github.com/girishlade111)

<p align="center">
  Made with ❤️ by <a href="https://ladestack.in" target="_blank">Girish Lade</a>
</p>