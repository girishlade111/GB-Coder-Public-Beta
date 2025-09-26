# GB Coder - AI-Powered Code Playground

![GB Coder Banner](tghjkl.jpeg)

**GB Coder** is a cutting-edge, browser-based code editor that enhances your development workflow with AI-powered assistance. Write, edit, and run HTML, CSS, and JavaScript code with real-time previews, all enhanced by intelligent AI suggestions.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/girishlade111/GB-Coder-Public-Beta/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/girishlade111/GB-Coder-Public-Beta)](https://github.com/girishlade111/GB-Coder-Public-Beta/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/girishlade111/GB-Coder-Public-Beta)](https://github.com/girishlade111/GB-Coder-Public-Beta/issues)

## 🔥 Key Features

- **AI-Powered Code Enhancement**: Get intelligent suggestions to improve your code quality
- **Lifetime Free Access**: No subscription fees, completely free to use
- **No Login Required**: Start coding immediately without any signup process
- **Live Preview**: See your changes in real-time as you code
- **Multi-Language Support**: Write HTML, CSS, and JavaScript with syntax highlighting
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Code History Tracking**: Never lose your work with automatic version history
- **Snippet Management**: Save and reuse code snippets for faster development
- **Integrated Terminal**: Run commands and see console output directly in the browser
- **Dark/Light Theme**: Switch between themes based on your preference
- **Auto-Save Functionality**: Never worry about losing your progress
- **File Import/Export**: Easily load existing files or download your projects
- **Ad-Free Experience**: Clean, distraction-free coding environment

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/girishlade111/GB-Coder-Public-Beta.git
   ```

2. Navigate to the project directory:
   ```bash
   cd GB-Coder-Public-Beta
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and visit `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

To preview the production build locally:

```bash
npm run preview
# or
yarn preview
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Code Editor**: Monaco Editor
- **Styling**: Tailwind CSS
- **AI Integration**: Google Generative AI (Gemini)
- **State Management**: React Hooks and Custom Hooks
- **UI Components**: Lucide React Icons
- **File Handling**: JSZip for export functionality

## 🤖 AI Features

GB Coder leverages Google's Generative AI to provide powerful coding assistance:

### AI Assistant
- Get explanations for complex code snippets
- Receive guidance on best practices
- Ask coding questions directly in the editor

### AI Suggestions
- Receive contextual suggestions as you type
- Get recommendations for code improvements
- Discover new patterns and techniques

### Code Enhancement
- Automatically refactor and optimize your code
- Apply AI-suggested improvements with one click
- Enhance existing code with modern practices

## 📁 Project Structure

```
src/
├── components/
│   ├── pages/           # Page components (About, History)
│   ├── ui/              # UI components (Footer, ThemeToggle)
│   ├── AISuggestionPanel.tsx
│   ├── CodeEditor.tsx
│   ├── CommandTerminal.tsx
│   ├── ConsolePanel.tsx
│   ├── EditorPanel.tsx
│   ├── EnhancedTerminal.tsx
│   ├── NavigationBar.tsx
│   ├── PreviewPanel.tsx
│   ├── SnippetManager.tsx
│   └── ...
├── hooks/
│   ├── useAutoSave.ts
│   ├── useCodeHistory.ts
│   ├── useFileUpload.ts
│   ├── useLocalStorage.ts
│   └── useTheme.ts
├── services/
│   ├── aiHelpService.ts
│   ├── geminiChatService.ts
│   ├── geminiCodeAssistant.ts
│   ├── geminiEnhancementService.ts
│   └── geminiService.ts
├── utils/
│   ├── aiSuggestions.ts
│   ├── downloadUtils.ts
│   ├── snippetUtils.ts
│   └── terminalCommands.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

## 🎯 Use Cases

- **Learning Web Development**: Perfect for beginners to experiment with HTML, CSS, and JavaScript
- **Prototyping**: Quickly build and test frontend ideas
- **Code Experimentation**: Try out new concepts without setting up a local environment
- **Teaching**: Demonstrate coding concepts in a browser-based environment
- **Collaboration**: Share code snippets easily with team members

## 🌐 Browser Support

GB Coder works on all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## 📱 Responsive Design

The editor is fully responsive and works on:
- Desktop computers
- Laptops
- Tablets
- Mobile devices

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory with your Google Generative AI API key:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

You can get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

## 🤝 Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

Girish Lade - [@girish_lade_](https://www.instagram.com/girish_lade_/) - girishlade111@gmail.com

Project Link: [https://github.com/girishlade111/GB-Coder-Public-Beta](https://github.com/girishlade111/GB-Coder-Public-Beta)

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Generative AI](https://ai.google/)
- [Lucide Icons](https://lucide.dev/)

---

<p align="center">
  Made with ❤️ by <a href="https://ladestack.in" target="_blank">Girish Lade</a>
</p>