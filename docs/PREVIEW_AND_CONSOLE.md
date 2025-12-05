# 👁️ Preview & Console Documentation

Visualize your work and debug with professional tools.

## 1. Live Preview

The **Live Preview** panel renders your HTML, CSS, and JavaScript in real-time.

- **Instant Feedback**: As you type in the editor, the preview updates automatically (unless disabled).
- **Sandboxing**: The preview runs in a secure `iframe` to prevent infinite loops or crashes from affecting the main editor.
- **Responsive Controls**:
    - **Desktop**: Full-width view.
    - **Tablet**: Simulates a tablet viewport.
    - **Mobile**: Simulates a mobile phone viewport.
    - **Fullscreen**: Expands the preview to cover the entire screen.

## 2. Enhanced Console

The **Enhanced Console** is a powerful unified tool for debugging and validation, located below the preview area.

### Modes

1.  **Console**:
    - Basic logging view.
    - Displays `console.log`, `info`, `warn`, and `error` messages from your code.
    - Supports filtering by message type.

2.  **Advanced**:
    - A terminal-like experience with command execution.
    - **Commands**: Type `help` to see available commands (e.g., `clear`, `theme`, `history`).
    - **History**: Use Up/Down arrows to navigate previous commands.
    - **Multiple Tabs**: Open multiple console sessions for different tasks.

3.  **Validator**:
    - Real-time code validation for HTML, CSS, and JS.
    - **HTML**: Detects unclosed tags, missing attributes, and deprecated elements.
    - **CSS**: Finds syntax errors and invalid properties.
    - **JS**: Checks for syntax errors and potential runtime issues.
    - **Auto-Validate**: Can be toggled to run automatically on code changes.

4.  **Preview Console**:
    - Directly captures logs from the preview `iframe`.
    - Shows network requests and performance metrics (load time, memory usage).

### Key Features

- **Clear**: Remove all logs.
- **Copy**: Copy logs to clipboard.
- **Search**: Filter logs by text.
- **Export/Import**: Save your console session to a file and load it later.

## 3. Debugging Tips

- **Use `console.log()`**: The most effective way to debug. Output appears in both the **Console** and **Preview** tabs.
- **Check the Validator**: If your layout looks wrong, check the **Validator** tab for unclosed tags or CSS errors.
- **Performance**: Use the **Preview** tab to monitor page load times and ensure your code is performant.
