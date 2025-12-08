# 📁 File & Library Management - Complete Technical Documentation

> GB Coder provides a robust **Project Management System** and **External Library Manager** to handle your code structure and dependencies efficiently. This guide details how to manage projects, files, and third-party libraries.

---

## Table of Contents

1. [Project Management System](#project-management-system)
2. [External Library Manager](#external-library-manager)
3. [File Operations & Export](#file-operations--export)
4. [Session & Persistence](#session--persistence)
5. [Technical Implementation](#technical-implementation)

---

## Project Management System

### 1. Overview

GB Coder uses a **project-based architecture**, allowing you to work on multiple distinct web applications within the same browser session. Each project is isolated with its own HTML, CSS, JavaScript, and external libraries.

### 2. Project Operations

The **Project Bar** (sticky at the top) is your command center for project operations:

#### 🆕 Create New Project
- **Action**: Click the project dropdown → Select "New Project" (or `+` icon).
- **Behavior**: Creates a fresh workspace with empty templates.
- **Default Name**: "Untitled Project [Timestamp]".

#### 💾 Save Project
- **Action**: Click the **Save** button (floppy disk icon).
- **Behavior**: Persists current state to `localStorage`.
- **Auto-Save**: Projects are also auto-saved periodically to prevent data loss.
- **Visual Feedback**: Button turns green ("Saved") on success.

#### 📄 Duplicate Project
- **Action**: Click the **Duplicate** button (copy icon).
- **Behavior**: Creates an exact copy of the current project (code + libraries).
- **Naming**: Appends "Copy" to the original name (e.g., "My App Copy").
- **Use Case**: Great for versioning or experimenting without breaking the original.

#### 🔄 Switch Project
- **Action**: Click the project name dropdown.
- **Display**: Shows list of all projects with "Last updated" timestamps.
- **Behavior**: Instantly loads the selected project's code and libraries.

#### ✏️ Rename Project
- **Action**: Click the project name text in the bar.
- **Behavior**: Turns into an editable input field.
- **Save**: Press `Enter` or click outside to confirm.
- **Cancel**: Press `Escape` to revert.

#### 🗑️ Delete Project
- **Action**: (Currently available via console/storage management, UI coming soon).
- **Behavior**: Permanently removes project data from storage.

---

## External Library Manager

### 1. Overview

The **External Library Manager** allows you to integrate third-party CSS and JavaScript libraries (like Bootstrap, Tailwind, React, jQuery) without manually writing `<script>` or `<link>` tags.

**Access**: Click **Settings** (⚙️) → **External Libraries**.

### 2. Adding Libraries

#### 📚 Popular Libraries Catalog
GB Coder includes a curated list of 50+ popular libraries categorized by type:

- **CSS Frameworks**: Bootstrap 5, Tailwind CSS, Bulma, Materialize
- **JS Frameworks**: React 18, Vue 3, Angular, Svelte, Alpine.js
- **Utilities**: Lodash, Axios, Moment.js, UUID
- **Visualization**: Chart.js, D3.js, Three.js
- **UI Components**: SweetAlert2, Swiper, Font Awesome 6

**How to Add:**
1. Search for library name (e.g., "react").
2. Click the **Add** button.
3. Library is instantly injected into your project.

#### 🔗 Custom Libraries
Add any library from a CDN (Content Delivery Network) like jsDelivr, unpkg, or cdnjs.

**How to Add:**
1. Select type: **CSS** or **JS**.
2. Paste the **CDN URL** (e.g., `https://cdn.example.com/lib.js`).
3. Click **Add**.

### 3. Managing Active Libraries

The right panel shows all libraries currently active in your project.

- **Remove**: Click the trash icon to remove a library.
- **Copy URL**: Click the copy icon to get the CDN link.
- **Order Matters**: Libraries are loaded in the order listed. (Reordering coming soon).

### 4. Automatic Injection

GB Coder handles the technical injection automatically:

**CSS Libraries:**
- Injected as `<link rel="stylesheet">` tags in the `<head>`.
- Loaded *before* your custom CSS (so you can override styles).

**JavaScript Libraries:**
- Injected as `<script>` tags.
- Loaded *before* your custom JavaScript (so dependencies are available).
- `crossorigin="anonymous"` added for security.

---

## File Operations & Export

### 1. Project Structure

Each project consists of three core virtual files:

1.  **index.html**: Your HTML structure (body content).
2.  **style.css**: Your custom styles.
3.  **script.js**: Your custom logic.

*Note: The `<head>` and `<body>` wrappers are managed automatically by the preview engine.*

### 2. Exporting Projects

You can download your work to run locally or deploy.

#### 📦 Export as ZIP
- **Action**: Click **Export ZIP** button in Project Bar.
- **Content**: A complete `.zip` archive containing:
    - `index.html` (Complete file with head, body, and library links)
    - `style.css`
    - `script.js`
- **Ready to Run**: Extract and open `index.html` in any browser.

#### 📄 Download Single Files
- **Action**: (Via command palette or future UI).
- **Content**: Individual `.html`, `.css`, or `.js` files.

### 3. Exported HTML Structure

When you export, GB Coder generates a production-ready `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Project</title>
  <!-- External CSS Libraries -->
  <link rel="stylesheet" href="https://cdn.tailwindcss.com">
  <!-- Your Custom CSS -->
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- Your HTML Content -->
  <div id="app">...</div>

  <!-- External JS Libraries -->
  <script src="https://unpkg.com/react@18/..."></script>
  <!-- Your Custom JS -->
  <script src="script.js"></script>
</body>
</html>
```

---

## Session & Persistence

### 1. Local Storage Architecture

GB Coder runs entirely in your browser (client-side). No data is sent to a server unless you explicitly use AI features.

**Storage Keys:**
- `gb-coder-projects`: List of all project metadata.
- `gb-coder-project-[ID]`: Full data for each project.
- `gb-coder-current-project-id`: ID of the active project.
- `gb-coder-settings`: User preferences (theme, fonts).

### 2. Data Privacy

- **Private**: Your code lives in your browser's `localStorage`.
- **Offline Capable**: Works without internet (except for CDN libraries).
- **Clearing Data**: Clearing browser cache/cookies will remove your projects. **Export important work regularly!**

### 3. Auto-Save Mechanism

- **Trigger**: Changes are saved 1 second after you stop typing (debounced).
- **Indicator**: "Saved" status in Project Bar.
- **Safety**: Prevents saving if quota is exceeded (shows warning).

---

## Technical Implementation

### Project Data Structure

```typescript
interface Project {
  id: string;
  name: string;
  html: string;
  css: string;
  javascript: string;
  externalLibraries: ExternalLibrary[];
  createdAt: string;
  updatedAt: string;
}

interface ExternalLibrary {
  id: string;
  name: string;
  url: string;
  type: 'css' | 'js';
}
```

### Library Injection Logic

The `PreviewPanel` constructs the preview iframe dynamically:

```javascript
const htmlContent = `
  <html>
    <head>
      ${cssLibraries.map(lib => `<link href="${lib.url}" ...>`).join('')}
      <style>${userCSS}</style>
    </head>
    <body>
      ${userHTML}
      ${jsLibraries.map(lib => `<script src="${lib.url}" ...></script>`).join('')}
      <script>${userJS}</script>
    </body>
  </html>
`;
```

---

## Best Practices

### 1. Library Management
- **Use CDN Links**: Always use reliable CDNs (jsdelivr, unpkg, cdnjs).
- **Check Dependencies**: If using Bootstrap JS, make sure to add Popper.js if required (though Bootstrap 5 bundles it).
- **Order Matters**: Add dependencies *before* the libraries that use them (e.g., jQuery before Bootstrap 4).

### 2. Project Safety
- **Export Frequently**: Download ZIP backups of important projects.
- **Duplicate Before Refactor**: Use "Duplicate" to create a checkpoint before major changes.
- **Check Quota**: Browsers limit `localStorage` to ~5-10MB. If you have many large projects, export old ones and delete them.

---

**Document Version**: 2.0  
**Last Updated**: December 8, 2024  
**Related Docs**: [EDITOR_FEATURES.md](./EDITOR_FEATURES.md), [PREVIEW_AND_CONSOLE.md](./PREVIEW_AND_CONSOLE.md)
