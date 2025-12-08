# 💻 Editor Features - Complete Technical Documentation

> GB Coder is built on **Monaco Editor**, the same powerful engine that powers Visual Studio Code, providing a professional-grade coding environment with advanced features for HTML, CSS, and JavaScript development.

---

## Table of Contents

1. [Monaco Editor Foundation](#monaco-editor-foundation)
2. [Multi-Language Support](#multi-language-support)
3. [IntelliSense & Auto-Completion](#intellisense--auto-completion)
4. [Code Editing Features](#code-editing-features)
5. [Selection & Multi-Cursor](#selection--multi-cursor)
6. [Search & Replace](#search--replace)
7. [Editor Customization](#editor-customization)
8. [Code Formatting](#code-formatting)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [History & Persistence](#history--persistence)
11. [Advanced Features](#advanced-features)

---

## Monaco Editor Foundation

### 1. Overview

**Monaco Editor** is Microsoft's open-source code editor that powers Visual Studio Code. GB Coder integrates this industry-leading editor to provide:

- ✅ Syntax highlighting for 100+ languages (HTML/CSS/JS focused)
- ✅ IntelliSense with intelligent code completion
- ✅ Real-time error detection and diagnostics
- ✅ Advanced find/replace with regex support
- ✅ Multi-cursor editing
- ✅ Minimap navigation
- ✅ Bracket matching and auto-closing
- ✅ Code folding
- ✅ Command palette (F1)

### 2. Integration Architecture

```typescript
// Editor wrapper component
<CodeEditor
  language="javascript"
  value={code}
  onChange={handleChange}
  onMount={handleEditorMount}
  fontFamily="JetBrains Mono"
  fontSize={14}
/>
```

#### Component Features

| Feature | Description | Value |
|---------|-------------|-------|
| **Theme** | VS Code dark theme | `vs-dark` |
| **Minimap** | Code overview panel | Disabled by default |
| **Line Numbers** | Gutter line numbering | Always on |
| **Tab Size** | Indentation width | 2 spaces |
| **Auto Layout** | Responsive resizing | Enabled |
| **Scroll Beyond Last Line** | Extra scroll space | Disabled |

---

## Multi-Language Support

### 1. Language Panels

GB Coder provides **three dedicated editor panels**, one for each core web technology:

```
┌─────────────────────────────────────┐
│          HTML  │  CSS  │  JS        │  ← Tab Headers
├─────────────────────────────────────┤
│                                     │
│         Monaco Editor Panel         │
│      (Active Language Display)      │
│                                     │
└─────────────────────────────────────┘
```

#### Panel Configuration

| Language | Monaco Mode | File Extension | Icon Color |
|----------|-------------|----------------|------------|
| **HTML** | `html` | `.html` | 🟠 Orange |
| **CSS** | `css` | `.css` | 🔵 Blue |
| **JavaScript** | `javascript` | `.js` | 🟡 Yellow |

### 2. Language-Specific Features

#### HTML Mode

**Syntax Highlighting:**
- Tags: <span style="color: #569cd6">`<div>`</span>
- Attributes: <span style="color: #9cdcfe">`class="..."`</span>
- Text content: <span style="color: #ce9178">`Hello World`</span>

**IntelliSense:**
- HTML5 element suggestions (`<header>`, `<article>`, etc.)
- Attribute auto-completion (e.g., `class`, `id`, `href`)
- ARIA attribute suggestions
- Emmet abbreviations (e.g., `div.container>ul>li*3` → expanded HTML)

**Validation:**
- Unclosed tags highlighted
- Invalid attribute warnings
- Deprecated element notifications

#### CSS Mode

**Syntax Highlighting:**
- Selectors: <span style="color: #d7ba7d">`.container`</span>
- Properties: <span style="color: #9cdcfe">`display`</span>
- Values: <span style="color: #ce9178">`flex`</span>
- Units: <span style="color: #b5cea8">`16px`</span>

**IntelliSense:**
- CSS property suggestions (700+ properties)
- Value auto-completion (`display: flex|grid|block...`)
- Color picker for color values
- Unit suggestions (`px`, `rem`, `em`, `%`, `vh`, `vw`)
- Vendor prefix suggestions (`-webkit-`, `-moz-`, `-ms-`)

**Validation:**
- Invalid property names
- Missing semicolons
- Unclosed braces
- Unknown property values

#### JavaScript Mode

**Syntax Highlighting:**
- Keywords: <span style="color: #569cd6">`const`</span>, <span style="color: #569cd6">`let`</span>, <span style="color: #569cd6">`async`</span>
- Functions: <span style="color: #dcdcaa">`function`</span>
- Strings: <span style="color: #ce9178">`"Hello"`</span>
- Numbers: <span style="color: #b5cea8">`42`</span>
- Comments: <span style="color: #6a9955">`// comment`</span>

**IntelliSense:**
- JavaScript API suggestions (DOM, Web APIs, ES6+)
- Method auto-completion (`Array.prototype.*`, `String.prototype.*`)
- Parameter hints for functions
- JSDoc comment suggestions
- Import statement assistance

**Validation:**
- Syntax errors (real-time)
- Undefined variables
- Unreachable code warnings
- Unused variable hints

---

## IntelliSense & Auto-Completion

### 1. Trigger Mechanisms

#### Automatic Triggers

IntelliSense appears automatically when:

- **Typing a dot**: `document.` → Shows DOM properties/methods
- **Opening a tag**: `<` → Shows HTML element suggestions
- **Typing in CSS**: `di` → Suggests `display`, `direction`, etc.
- **After keywords**: `import ` → Module suggestions

#### Manual Trigger

**Keyboard Shortcut**: `Ctrl+Space`

Forces IntelliSense to appear even when already typing.

### 2. IntelliSense Features

#### Context-Aware Suggestions

```javascript
// Example: Typing in JavaScript
const button = document.querySelector('#btn');
button.   // IntelliSense shows: addEventListener, click, style, etc.
```

**Suggestion Categories:**
- 📄 **Properties**: Object properties
- 🔧 **Methods**: Functions and methods
- 📦 **Modules**: Import/export suggestions
- 🏷️ **Keywords**: Language keywords
- 📝 **Snippets**: Code templates

#### Intelligent Ranking

Suggestions are ranked by:
1. **Relevance**: Most commonly used first
2. **Recency**: Recently used items prioritized
3. **Context**: Matches current code pattern
4. **Type Compatibility**: Type-safe suggestions (TypeScript definitions)

#### Rich Documentation

**Hover over any suggestion** to see:
- Function signature
- Parameter types
- Return type
- Description
- Code examples
- MDN documentation link (for web APIs)

**Example:**
```
addEventListener(type: string, listener: (event: Event) => void, options?: boolean | AddEventListenerOptions): void

Attaches an event listener to the element.

Parameters:
  • type: The event type (e.g., 'click', 'mouseover')
  • listener: The callback function to execute
  • options: Optional configuration object

Example:
  element.addEventListener('click', (e) => {
    console.log('Clicked!', e);
  });
```

### 3. Parameter Hints

When typing function calls, Monaco shows **parameter hints**:

```javascript
addEventListener(■type: string, listener: function, options?: object)
               ▲
        Currently typing here
```

**Navigate Parameters**: Use `Ctrl+Shift+Space` or arrow keys

---

## Code Editing Features

### 1. Smart Bracket Matching

#### Visual Indicators

When cursor is near a bracket, Monaco highlights:
- **Opening bracket**: `{` `(` `[` `<`
- **Closing bracket**: `}` `)` `]` `>`

**Colors:**
- 🟢 Green when matched
- 🔴 Red when unmatched

#### Auto-Closing

**Automatic pairs:**
```javascript
{  →  {|}     (cursor between)
(  →  (|)
[  →  [|]
"  →  "|"
'  →  '|'
`  →  `|`
```

**Auto-wrapping selection:**
```javascript
// Select: hello
// Press: "
// Result: "hello"
```

### 2. Auto-Indentation

Monaco automatically indents based on language rules:

**JavaScript Example:**
```javascript
function example() {
  if (condition) {
    // Cursor auto-indented here
  }
}
```

**HTML Example:**
```html
<div>
  <p>
    Text
  </p>
</div>
```

**Smart Enter**:
- Press `Enter` inside `{}` → Cursor positioned with proper indent
- Press `Enter` after `>` in HTML → New line with indent

### 3. Code Folding

#### Fold Regions

Click the **arrow icon** in the gutter to collapse/expand:

- **Functions**: Collapse entire function bodies
- **Blocks**: `{...}` regions
- **Comments**: Multi-line comments
- **HTML Elements**: Entire element trees

**Keyboard Shortcuts:**
- `Ctrl+Shift+[` : Fold region
- `Ctrl+Shift+]` : Unfold region
- `Ctrl+K Ctrl+0` : Fold all
- `Ctrl+K Ctrl+J` : Unfold all

#### Visual Indicators

```javascript
function myFunction() {...}  ← Collapsed (shows first line + ellipsis)
```

### 4. Comment Toggle

**Keyboard Shortcut**: `Ctrl+/`

**Behavior:**
- **Single line**: Toggles `//` comment
- **Multiple lines**: Toggles block comment `/* ... */`

**Examples:**

```javascript
const x = 5;  →  // const x = 5;
```

```javascript
function test() {
  console.log('hello');
}

↓ Select multiple lines, press Ctrl+/

/*
function test() {
  console.log('hello');
}
*/
```

---

## Selection & Multi-Cursor

### 1. Text Selection

#### Mouse Selection

- **Single Click**: Place cursor
- **Double Click**: Select word
- **Triple Click**: Select line
- **Click + Drag**: Select range
- **Shift + Click**: Extend selection

#### Keyboard Selection

| Shortcut | Action |
|----------|--------|
| `Shift+→` | Select next character |
| `Shift+←` | Select previous character |
| `Shift+↑` | Select line above |
| `Shift+↓` | Select line below |
| `Ctrl+Shift+→` | Select next word |
| `Ctrl+Shift+←` | Select previous word |
| `Ctrl+A` | Select all |
| `Ctrl+L` | Select current line |

### 2. Multi-Cursor Editing

#### What is Multi-Cursor?

**Multiple cursors** allow you to edit multiple locations simultaneously, dramatically speeding up repetitive edits.

#### Creating Multiple Cursors

**Method 1: Alt+Click**
```javascript
// Click with Alt held down on three different lines:
const name|= 'John';
const age|= 30;
const city|= 'NYC';
// Now type simultaneously on all threelines
```

**Method 2: Ctrl+D (Select Next Occurrence)**

1. Select a word (e.g., `const`)
2. Press `Ctrl+D` → Selects next `const`
3. Press `Ctrl+D` again → Selects next `const`
4. Now you can edit all simultaneously

**Method 3: Ctrl+Shift+L (Select All Occurrences)**

- Select word
- Press `Ctrl+Shift+L`
- All instances selected with cursors

**Method 4: Alt+Shift+↑/↓ (Column Selection)**

- Add cursor on line above/below
- Creates vertical column of cursors

#### Multi-Cursor Use Cases

**Example 1: Rename Variables**
```javascript
// Before:
let x = 5;
console.log(x);
return x * 2;

// Select 'x', press Ctrl+Shift+L, type 'count'

// After:
let count = 5;
console.log(count);
return count * 2;
```

**Example 2: Add Semicolons**
```javascript
// Before (select end of each line with Alt+Click):
const a = 1|
const b = 2|
const c = 3|

// Type ; on all

// After:
const a = 1;
const b = 2;
const c = 3;
```

**Example 3: Bulk Editing**
```javascript
// Add quotes around multiple words
// Select: Apple, Banana, Cherry (with Ctrl+D)
// Press "

// Result: "Apple", "Banana", "Cherry"
```

### 3. Block Selection (Column Mode)

**Alt+Shift+Drag**

Creates a rectangular selection:

```javascript
const firstName  = 'John';
const lastName   = 'Doe';
const age        = 30;

// Alt+Shift+Drag to select the "= " part on all three lines
// Can now delete or replace simultaneously
```

---

## Search & Replace

### 1. Find (Ctrl+F)

Opens the **Find widget** at the top of the editor:

```
┌──────────────────────────────────┐
│ Find: [search term]  [⚙️ Options] │
│ 3 of 12 results                  │
└──────────────────────────────────┘
```

#### Find Options

| Icon | Option | Description |
|------|--------|-------------|
| `Aa` | Match Case | Case-sensitive search |
| `ab` | Match Whole Word | Only complete words |
| `.*` | Use Regular Expression | Regex patterns |

#### Navigation

- `Enter` / `F3`: Next match
- `Shift+Enter` / `Shift+F3`: Previous match
- `Esc`: Close find widget

#### Examples

**Simple Search:**
```
Find: const
Results: All instances of 'const'
```

**Case-Sensitive:**
```
Find: Button  [Aa enabled]
Results: 'Button' but not 'button'
```

**Whole Word:**
```
Find: log  [ab enabled]
Results: 'log' but not 'logout' or 'dialog'
```

**Regex Search:**
```
 Find: \d+px  [.* enabled]
Results: 16px, 32px, 100px (any number followed by 'px')
```

### 2. Replace (Ctrl+H)

Opens the **Replace widget**:

```
┌────────────────────────────────────────┐
│ Find:    [old term]         [⚙️ Options] │
│ Replace: [new term]                    │
│ [Replace] [Replace All] [Replace Next] │
└────────────────────────────────────────┘
```

#### Actions

| Button | Shortcut | Action |
|--------|----------|--------|
| **Replace** | `Ctrl+Shift+1` | Replace current match |
| **Replace All** | `Ctrl+Alt+Enter` | Replace all matches |
| **Replace Next** | `Ctrl+Shift+H` | Replace and move to next |

#### Examples

**Simple Replace:**
```
Find: var
Replace: const
→ Replaces all 'var' with 'const'
```

**Regex Replace with Capture Groups:**
```
Find:    color: (#[0-9a-f]{6})
Replace: background-color: $1

// Before: color: #ff0000
// After:  background-color: #ff0000
```

### 3. Advanced Find Features

#### Find in Selection

1. Select a code block
2. Press `Ctrl+F`
3. Click "Find in selection" icon (`⊞`)
4. Search only within selected text

#### Find All References

**Shortcut**: `Shift+F12` (when cursor on a symbol)

Shows all usages of afunction/variable in a popup:
```
References to 'handleClick':
  Line 15: function handleClick() {
  Line 42:   button.addEventListener('click', handleClick);
  Line 58:   cleanup: () => handleClick.remove();
```

---

## Editor Customization

### 1. Font Settings

#### Font Family

**Available Options:**
- **JetBrains Mono** (default) - Designed for code, excellent ligatures
- **Fira Code** - Popular with ligature support
- **Monaco** - Classic macOS font
- **Consolas** - Windows default
- **Default** - System monospace

**How to Change:**
1. Click Settings icon (⚙️)
2. Select "Font Family"
3. Choose from dropdown

**Font Features:**
```javascript
// With ligatures (JetBrains Mono / Fira Code):
!== → ≠
>= → ≥
=> → ⇒
```

#### Font Size

**Range**: 12px - 20px

**How to Adjust:**
1. Open Settings
2. Use "Font Size" slider
3. See real-time preview in editors

**Recommended Sizes:**
- **12-13px**: For small screens or fitting more code
- **14px**: Default, balanced for most uses
- **16-18px**: For better readability
- **20px**: For presentations or accessibility

### 2. Theme Selection

GB Coder offers **4 curated themes**:

| Theme | Primary Color | Background | Use Case |
|-------|--------------|------------|----------|
| **Dark** (default) | Gray | `#1a1a1a` | Classic VS Code dark |
| **Dark Blue** | Blue | `#1e3a5f` | Cool, ocean-inspired |
| **Dark Purple** | Purple | `#2d1b4e` | Vibrant, creative |
| **Light** | White | `#f5f5f5` | High-contrast, daytime |

**How to Change:**
1. Open Settings (⚙️)
2. Click desired theme card
3. Theme applies instantly (no reload needed)

**Theme Persistence:**
- Stored in `localStorage` (`gb-coder-settings`)
- Persists across sessions

### 3. Minimap

**What is Minimap?**

A zoomed-out view of your entire code on the right side of the editor, allowing quick navigation.

**Current Status:**
- **Disabled by default** for cleaner UI
- Can be enabled in future updates

**Benefits (when enabled):**
- Quick scroll to any part of large files
- Visual overview of code structure
- See all errors/warnings at a glance

### 4. Word Wrap

**Future Feature** (not yet implemented)

Will allow long lines to wrap instead of horizontal scrolling.

**Planned Shortcut**: `Alt+Z`

---

## Code Formatting

### 1. Auto-Format

**Current Implementation:**

Monaco Editor includes built-in formatting for HTML, CSS, and JavaScript using its formatter.

**Keyboard Shortcut**: `Shift+Alt+F`

**What It Does:**
- **Fixes indentation** (consistent 2-space tabs)
- **Adds missing spaces** (e.g., around operators)
- **Removes extra whitespace**
- **Aligns code** for readability

#### Format Examples

**Before Formatting:**
```javascript
function example(){const x=5;const y=10;if(x<y){console.log('x is less');}}
```

**After Formatting (`Shift+Alt+F`):**
```javascript
function example() {
  const x = 5;
  const y = 10;
  if (x < y) {
    console.log('x is less');
  }
}
```

**CSS Example:**

**Before:**
```css
.container{display:flex;justify-content:center;align-items:center;}
```

**After:**
```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### 2. Format on Type

Monaco automatically formats as you type:

**Examples:**
- Type `{` then `Enter` → Auto-indent and closing `}`
- Type `if(condition)` then `Enter` → Proper block structure
- Paste unformatted code → Auto-indent to match context

### 3. Format on Paste

When pasting code from external sources, Monaco automatically:
- Adjusts indentation to match surrounding code
- Preserves relative indentation
- Removes unnecessary whitespace

---

## Keyboard Shortcuts

### 1. Essential Shortcuts

| Category | Shortcut | Action |
|----------|----------|--------|
| **Editing** | | |
| | `Ctrl+C` | Copy |
| | `Ctrl+X` | Cut |
| | `Ctrl+V` | Paste |
| | `Ctrl+Z` | Undo |
| | `Ctrl+Y` | Redo |
| | `Ctrl+/` | Toggle comment |
| | `Shift+Alt+F` | Format document |
| | `Ctrl+D` | Select next occurrence |
| | `Ctrl+Shift+L` | Select all occurrences |
| **Navigation** | | |
| | `Ctrl+F` | Find |
| | `Ctrl+H` | Replace |
| | `Ctrl+G` | Go to line |
| | `F3` | Find next |
| | `Shift+F3` | Find previous |
| | `Ctrl+Home` | Go to beginning |
| | `Ctrl+End` | Go to end |
| **Selection** | | |
| | `Ctrl+A` | Select all |
| | `Ctrl+L` | Select current line |
| | `Shift+→/←/↑/↓` | Extend selection |
| | `Alt+Click` | Add cursor |
| | `Alt+Shift+↑/↓` | Add cursor above/below |
| **View** | | |
| | `Ctrl+Shift+[` | Fold region |
| | `Ctrl+Shift+]` | Unfold region |
| | `F1` | Command palette |

### 2. Command Palette (F1)

**Universal command access:**

Press `F1` to open the command palette with all Monaco commands:

```
> [Search commands...]

• Format Document
• Go to Line
• Change Language Mode
• Toggle Line Comment
• Transform to Uppercase
• Transform to Lowercase
• Sort Lines Ascending
• Trim Trailing Whitespace
```

**Search**: Type to filter commands  
**Execute**: Click or press `Enter`

### 3. Multi-Cursor Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt+Click` | Add cursor at click location |
| `Ctrl+Alt+↑` | Add cursor above |
| `Ctrl+Alt+↓` | Add cursor below |
| `Ctrl+D` | Add selection to next find match |
| `Ctrl+K Ctrl+D` | Move last selection to next match |
| `Ctrl+U` | Undo last cursor operation |
| `Esc` | Cancel multi-cursor mode |

---

## History & Persistence

### 1. Auto-Save

**How It Works:**

GB Coder automatically saves your code to `localStorage` as you type, with a debounce delay.

**Save Trigger:**
- After every code change (debounced)
- When switching projects
- Before closing tab (via `beforeunload` event)

**Storage Location:**
```javascript
localStorage.setItem('gb-coder-current-code', JSON.stringify({
  html: '...',
  css: '...',
  javascript: '...'
}));
```

**Benefits:**
- ✅ No manual save needed
- ✅ Work preserved on accidental tab close
- ✅ Survive browser crashes
- ✅ Resume work later

**Limitations:**
- ❌ `localStorage` quota (~5-10MB)
- ❌ Cleared if browser cache is cleared
- ❌ Not synced across devices

### 2. Undo/Redo

#### Standard Undo/Redo

**Shortcuts:**
- `Ctrl+Z`: Undo
- `Ctrl+Y` or `Ctrl+Shift+Z`: Redo

**History Depth**: Up to 500 actions per editor

**Undo Granularity:**
- Character-by-character for typing
- Full operations for paste, format, etc.

#### History Stack

GB Coder maintains a **global history stack** for code changes:

```typescript
interface HistoryEntry {
  html: string;
  css: string;
  javascript: string;
  timestamp: number;
}

// Stack stored in memory (max 50 entries)
```

**Features:**
- Timeline view of snapshots
- Jump to specific point in history
- Visual diff between versions

### 3. Project Persistence

**Current Project Storage:**
```javascript
localStorage.setItem('gb-coder-current-project', JSON.stringify({
  name: 'My Website',
  html: '...',
  css: '...',
  javascript: '...',
  lastModified: '2024-12-08T18:00:00Z'
}));
```

**On Page Load:**
1. Check for `gb-coder-current-project`
2. If exists, load code into editors
3. If not, start with empty template

---

## Advanced Features

### 1. Right-Click Context Menu

**Available Actions:**

- 📋 **Cut** (`Ctrl+X`)
- 📋 **Copy** (`Ctrl+C`)
- 📋 **Paste** (`Ctrl+V`)
- 🔍 **Find** (`Ctrl+F`)
- 🔁 **Replace** (`Ctrl+H`)
- 💬 **Comment/Uncomment** (`Ctrl+/`)
- 📐 **Format Selection** (`Shift+Alt+F`)
- **Go to Definition** (F12)
- **Peek Definition** (Alt+F12)
- **Rename Symbol** (F2)

### 2. Selection-Based AI Operations

When you select code, a **floating action bar** appears with AI-powered options:

```
┌──────────────────────────────────┐
│ Selected Code Here               │
└──────────────────────────────────┘
     ↓
[💡 Explain] [🐛 Debug] [⚡ Optimize] [🎨 Improve UI]
```

**See [AI_FEATURES.md](./AI_FEATURES.md#selection-operations) for complete documentation.**

### 3. Peek Definition

**Shortcut**: `Alt+F12`

Opens an inline preview of function/variable definition without leaving current location:

```javascript
function handleClick() {   // <- Definition (line 15)
  // ...
}

// Later in code (line 100):
button.addEventListener('click', handleClick);
                                 ▲ 
                        Alt+F12 here shows:
┌────────────────────────────┐
│ line 15: function handleClick() { │
│   ...                       │
│ }                           │
└─────────────────────────────┘
```

### 4. Bracket Pair Colorization

**Future Feature** (not yet implemented)

Will color nested brackets differently for easier matching:

```javascript
function example(<span style="color: gold">{</span>
  if (<span style="color: cyan">(</span>true<span style="color: cyan">)</span>) <span style="color: magenta">{</span>
    console.log(<span style="color: green">[</span>1, 2, 3<span style="color: green">]</span>);
  <span style="color: magenta">}</span>
<span style="color: gold">}</span>)
```

### 5. Diff Editor

**Purpose**: Compare code before/after AI enhancements

```
┌───────────── Original ─────────────┬────────── Enhanced ──────────┐
│ const x = 5;                      │ const count = 5;             │
│ console.log(x);                   │ console.log(count);          │
│ - Old line                         │ + New line                   │
└────────────────────────────────────┴──────────────────────────────┘
```

**Used In:**
- AI Code Enhancement modal
- AI Error Fix modal
- Format diff preview

---

## Performance Optimizations

### 1. Virtualized Rendering

Monaco uses **virtual scrolling** for large files:
- Only visible lines rendered
- Smooth scrolling even with 10,000+ lines
- Minimal memory footprint

### 2. Debounced Updates

**Preview Panel Sync:**
```typescript
// Default: 300ms debounce
useEffect(() => {
  const timer = setTimeout(() => {
    updatePreview(code);
  }, settings.previewDelay);
  
  return () => clearTimeout(timer);
}, [code]);
```

**Benefits:**
- Prevents excessive re-renders
- Smooth typing experience
- Reduces CPU usage

### 3. Web Worker Integration

Monaco offloads heavy computation to Web Workers:
- **Syntax validation**: Runs in background
- **IntelliSense**: Computed async
- **Formatting**: Non-blocking

**Result**: UI remains responsive even during complex operations.

---

## Accessibility

### 1. Keyboard Navigation

**Fully keyboard-accessible:**
- All features available via shortcuts
- No mouse required for coding
- Screen reader compatible

### 2. Screen Reader Support

Monaco includes ARIA labels and live regions:
- Announces cursor position
- Reads code line-by-line
- Describes syntax errors

**Shortcut**: `Ctrl+E` announces current line

### 3. High Contrast Themes

**Future Enhancement**: High-contrast theme variants for visual impairments.

---

## Troubleshooting

### Common Issues

**Issue: Editor not loading**
- **Cause**: Monaco CDN blocked
- **Solution**: Check browser console, disable ad blockers

**Issue: IntelliSense not working**
- **Cause**: TypeScript definitions not loaded
- **Solution**: Refresh page, check internet connection

**Issue: Slow performance with large files**
- **Cause**: File size exceeding optimal range (>10,000 lines)
- **Solution**: Split into multiple files or use pagination

**Issue: Keyboard shortcuts not working**
- **Cause**: Browser extensions intercepting keys
- **Solution**: Try incognito mode, check extension conflicts

**Issue: Code not saving**
- **Cause**: `localStorage` quota exceeded or disabled
- **Solution**: Export code to file, clear browser storage

**Issue: Formatting doesn't work**
- **Cause**: Invalid syntax prevents formatter from running
- **Solution**: Fix syntax errors first, then format

---

## Best Practices

### 1. Code Organization

```javascript
// ✅ Good: Organized, readable
function initApp() {
  setupEventListeners();
  loadData();
  renderUI();
}

// ❌ Bad: All in one line
function initApp(){setupEventListeners();loadData();renderUI();}
```

### 2. Use Multi-Cursor Wisely

**Efficient:**
- Renaming variables
- Adding/removing punctuation
- Bulk find-replace

**Not Efficient:**
- Making different changes on each line
- Complex logic adjustments

### 3. Leverage Snippets

**Common Patterns:**
- Event listeners
- API fetch calls
- Loop structures

**See [SNIPPET_GUIDE.md](./SNIPPET_GUIDE.md) for full guide.**

### 4. Format Regularly

- Format before committing code
- Format after paste
- Format after AI generation

**Shortcut**: `Shift+Alt+F`

---

## Conclusion

Monaco Editor in GB Coder provides a **professional-grade coding environment** with:

✅ **Intelligent Features**: IntelliSense, auto-completion, error detection  
✅ **Powerful Editing**: Multi-cursor, regex search/replace, code folding  
✅ **Customization**: Themes, fonts, behavior settings  
✅ **Performance**: Fast even with large files  
✅ **Productivity**: Rich shortcuts, command palette, AI integration  

**Master these features to code faster, smarter, and with fewer errors!**

---

**Document Version**: 2.0  
**Last Updated**: December 8, 2024  
**Related Docs**: [AI_FEATURES.md](./AI_FEATURES.md), [SNIPPET_GUIDE.md](./SNIPPET_GUIDE.md), [PREVIEW_AND_CONSOLE.md](./PREVIEW_AND_CONSOLE.md)
