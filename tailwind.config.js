/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // VS Code Dark Theme Colors
        'vscode-editor': '#1e1e1e',        // Main editor background
        'vscode-sidebar': '#252526',       // Sidebar background
        'vscode-activitybar': '#333333',   // Activity bar (far left)
        'vscode-panel': '#1e1e1e',         // Panel background (console, terminal)
        'vscode-border': '#2d2d30',        // Borders between panels
        'vscode-selection': '#264f78',     // Selection background
        'vscode-statusbar': '#007acc',     // Status bar blue
        'vscode-text': '#d4d4d4',          // Primary text
        'vscode-text-dim': '#969696',      // Secondary/dimmed text
        'vscode-line-highlight': '#2a2d2e', // Current line highlight
        // Keep legacy colors for compatibility
        'matte-black': '#1e1e1e',
        'bright-white': '#FFFFFF',
        'dark-gray': '#252526',
        'light-gray': '#E5E5E5',
      },
    },
  },
  plugins: [],
};
