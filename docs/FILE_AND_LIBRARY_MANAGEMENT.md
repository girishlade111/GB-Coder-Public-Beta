# 📁 File & Library Management Documentation

Manage your project's structure and external dependencies with ease.

## 1. File Management

GB Coder allows you to manage your project files directly within the browser.

- **Project Structure**:
    - The default project consists of `index.html`, `style.css`, and `script.js`.
    - You can create additional files and folders (feature in development).
- **Upload**:
    - Drag and drop files into the editor or use the **Upload** button.
    - Supported formats: HTML, CSS, JS, JSON, images.
- **Download**:
    - **Export Project**: Download your entire project as a `.zip` file.
    - **Single File**: Download the active file individually.

## 2. External Library Manager

Easily integrate third-party libraries without manually writing `<script>` tags.

### How to Access
Click the **Settings** (gear icon) in the navigation bar and select **"External Libraries"**.

### Features
- **Search**: Browse a curated list of popular libraries (e.g., Bootstrap, Tailwind, jQuery, React, Vue).
- **Add Custom**: Enter a CDN URL to add any library not in the list.
- **Manage**:
    - View all added libraries.
    - Remove libraries you no longer need.
    - Reorder libraries (loading order matters!).

### Automatic Injection
- **CSS Libraries**: Automatically injected as `<link>` tags in the `<head>`.
- **JS Libraries**: Automatically injected as `<script>` tags before your custom JavaScript.
- **Persistence**: Your selected libraries are saved with your project.

## 3. Session Management

- **Local Storage**:
    - Your code, settings, and added libraries are automatically saved to your browser's local storage.
    - Reloading the page will restore your previous session.
- **Reset**:
    - If you want to start fresh, you can clear the session from the settings menu.
