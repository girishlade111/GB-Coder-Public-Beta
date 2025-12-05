# 💻 Editor Features Documentation

The GB Coder editor is built on **Monaco Editor**, the same powerful engine that powers VS Code, providing a professional-grade coding environment.

## 1. Core Editor Capabilities

- **Syntax Highlighting**: Rich coloring for HTML, CSS, and JavaScript.
- **IntelliSense**: Smart code completion for standard web APIs, CSS properties, and HTML tags.
- **Minimap**: A visual overview of your code on the right side of the editor for quick navigation.
- **Error Highlighting**: Real-time detection of syntax errors with red squiggly lines.
- **Bracket Matching**: Visual cues to help you match opening and closing brackets/tags.

## 2. Multi-Language Support

The playground is divided into three dedicated panels:

- **HTML**: For structure and content.
- **CSS**: For styling and layout.
- **JS**: For interactivity and logic.

You can resize these panels by dragging the dividers or toggle their visibility using the layout controls.

## 3. Formatting & Snippets

- **Format Code**:
    - Click the **"Format"** button (or use `Shift + Alt + F`) to automatically beautify your code using Prettier.
    - This ensures consistent indentation and spacing.
- **Snippets**:
    - Access a library of common code patterns (e.g., "Flexbox Center", "HTML5 Boilerplate").
    - Use the **Snippet Manager** to save your own reusable code blocks.

## 4. Keyboard Shortcuts

Boost your productivity with these essential shortcuts:

| Action | Shortcut | Description |
| :--- | :--- | :--- |
| **Format Code** | `Shift + Alt + F` | Prettify the current file. |
| **Save** | `Ctrl + S` | Manually trigger save (Auto-save is also active). |
| **Find** | `Ctrl + F` | Open the search widget. |
| **Replace** | `Ctrl + H` | Open the replace widget. |
| **Comment** | `Ctrl + /` | Toggle line comment. |
| **Multi-Cursor** | `Alt + Click` | Add multiple cursors for simultaneous editing. |
| **Command Palette** | `F1` | Open the Monaco command palette. |

## 5. History & Persistence

- **Auto-Save**: Your work is automatically saved to your browser's `localStorage` every few seconds. You won't lose progress if you accidentally close the tab.
- **Undo/Redo**:
    - Standard `Ctrl + Z` (Undo) and `Ctrl + Y` (Redo) support.
    - Works seamlessly across all three panels.
    - **AI Undo**: You can specifically undo changes made by the AI assistant.

## 6. Customization

- **Theme**: Toggle between **Dark** and **Light** modes to suit your preference.
- **Font Size**: Adjust the editor font size via the settings.
- **Word Wrap**: Toggle word wrap to prevent horizontal scrolling.
