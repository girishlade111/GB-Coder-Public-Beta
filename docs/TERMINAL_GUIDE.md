# GB Coder Terminal - Complete Technical Guide

This comprehensive guide explains how the integrated terminal works in GB Coder, from the backend PTY server to the frontend xterm.js interface, and provides step-by-step instructions to make it fully functional.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [How the Terminal Works](#how-the-terminal-works)
3. [Backend Server Deep Dive](#backend-server-deep-dive)
4. [WebSocket Protocol](#websocket-protocol)
5. [Frontend Implementation](#frontend-implementation)
6. [Complete Setup Guide](#complete-setup-guide)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Configuration](#advanced-configuration)
9. [Security Considerations](#security-considerations)

---

## Architecture Overview

The terminal system uses a **client-server architecture** with three main components:

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  GB Coder Frontend (React + Vite)                          │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ TerminalConsolePanel (Multi-tab Manager)             │  │ │
│  │  │   ├─ Tab 1: TerminalView (xterm.js instance)         │  │ │
│  │  │   ├─ Tab 2: TerminalView (xterm.js instance)         │  │ │
│  │  │   └─ Tab 3: TerminalView (xterm.js instance)         │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────────────────┘
                   │ WebSocket (ws://localhost:3001/terminal)
                   │ Messages: input, data, resize, exit
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│              Terminal Server (Node.js + Express)                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ WebSocket Server (ws library)                              │ │
│  │  ├─ Connection 1 → PTY Instance 1 (bash/PowerShell)       │ │
│  │  ├─ Connection 2 → PTY Instance 2 (bash/PowerShell)       │ │
│  │  └─ Connection 3 → PTY Instance 3 (bash/PowerShell)       │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────────────────┘
                   │ PTY (Pseudo-Terminal) Interface
                   │ node-pty library
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Operating System Shell                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Windows: PowerShell / cmd.exe                              │ │
│  │ macOS/Linux: bash / zsh / sh                               │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Technology |
|-----------|---------------|------------|
| **Frontend UI** | Render terminal display, handle user keyboard input | React, xterm.js |
| **WebSocket Client** | Maintain connection to backend, send/receive messages | Browser WebSocket API |
| **Backend Server** | HTTP server, WebSocket upgrade, session management | Node.js, Express, ws |
| **PTY Manager** | Spawn shell processes, manage I/O, handle signals | node-pty |
| **Shell Process** | Execute commands, maintain environment, process output | OS-specific shell |

---

## How the Terminal Works

### Complete Data Flow

Here's what happens when you type a command and press Enter:

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User Types "ls" and Presses Enter                       │
└─────────────────────────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: xterm.js Captures Keystrokes                            │
│                                                                  │
│  terminal.onData((data) => {                                    │
│    // data = "ls\r" (\r is Enter key)                           │
│    websocket.send(JSON.stringify({                              │
│      type: 'input',                                             │
│      data: data                                                 │
│    }));                                                         │
│  });                                                            │
└─────────────────────────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: WebSocket Sends Message to Backend                      │
│                                                                  │
│  Frontend → Backend:                                            │
│  {                                                              │
│    "type": "input",                                             │
│    "data": "ls\r"                                               │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Backend Receives Message & Writes to PTY                │
│                                                                  │
│  ws.on('message', (message) => {                                │
│    const msg = JSON.parse(message);                             │
│    if (msg.type === 'input') {                                  │
│      ptyProcess.write(msg.data); // Write "ls\r" to shell       │
│    }                                                            │
│  });                                                            │
└─────────────────────────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: PTY Sends Command to Shell Process                      │
│                                                                  │
│  Shell receives: "ls\r"                                         │
│  Shell executes: ls command                                     │
│  Shell produces output:                                         │
│    file1.txt                                                    │
│    file2.js                                                     │
│    directory/                                                   │
└─────────────────────────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: PTY Captures Shell Output                               │
│                                                                  │
│  ptyProcess.onData((data) => {                                  │
│    // data contains ANSI-formatted output from shell            │
│    ws.send(JSON.stringify({                                     │
│      type: 'data',                                              │
│      data: data  // "file1.txt\r\nfile2.js\r\ndirectory/\r\n"   │
│    }));                                                         │
│  });                                                            │
└─────────────────────────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: WebSocket Sends Output to Frontend                      │
│                                                                  │
│  Backend → Frontend:                                            │
│  {                                                              │
│    "type": "data",                                              │
│    "data": "file1.txt\r\nfile2.js\r\ndirectory/\r\n"           │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 8: xterm.js Renders Output in Browser                      │
│                                                                  │
│  ws.onmessage = (event) => {                                    │
│    const msg = JSON.parse(event.data);                          │
│    if (msg.type === 'data') {                                   │
│      terminal.write(msg.data); // Display in terminal           │
│    }                                                            │
│  };                                                             │
│                                                                  │
│  User sees:                                                     │
│  $ ls                                                           │
│  file1.txt                                                      │
│  file2.js                                                       │
│  directory/                                                     │
│  $                                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Key Concepts

#### 1. **PTY (Pseudo-Terminal)**
A PTY is a software abstraction that emulates a physical terminal. It creates a pair of virtual devices:
- **Master side** (controlled by node-pty): Reads/writes data as if it were a terminal
- **Slave side** (connected to shell): The shell thinks it's running in a real terminal

**Why PTY instead of stdin/stdout?**
- Shell coloring and formatting require TTY (terminal) detection
- Interactive programs (vim, nano) need terminal control codes
- Job control (Ctrl+C, Ctrl+Z) requires terminal semantics
- Command history and line editing work properly

#### 2. **WebSocket vs HTTP**
WebSocket is used instead of HTTP because:
- **Bidirectional**: Real-time communication in both directions
- **Low latency**: No request/response overhead
- **Persistent**: Connection stays open for the session
- **Efficient**: Binary data support, minimal framing overhead

#### 3. **xterm.js Rendering**
xterm.js is a full-featured terminal emulator that:
- Parses ANSI escape codes for colors, cursor positioning, etc.
- Handles terminal control sequences (clear screen, scroll, etc.)
- Manages cursor state and blinking
- Supports full Unicode and emoji rendering
- Provides a familiar terminal experience in the browser

---

## Backend Server Deep Dive

### File: `server/index.js`

#### 1. **Dependencies & Setup**

```javascript
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const pty = require('node-pty');
const cors = require('cors');
const os = require('os');
```

**Why each dependency:**
- `express`: Lightweight HTTP server framework
- `http`: Native Node.js HTTP server (required for WebSocket upgrade)
- `ws`: WebSocket library for real-time communication
- `node-pty`: Creates pseudo-terminals and spawns shells
- `cors`: Cross-Origin Resource Sharing (allows frontend on different port)
- `os`: Operating system utilities (platform detection, env vars)

#### 2. **Server Initialization**

```javascript
const app = express();
const server = http.createServer(app);
app.use(cors());

app.get('/', (req, res) => {
  res.send('GB Coder Terminal Server running');
});

const wss = new WebSocket.Server({ 
  server,
  path: '/terminal'
});
```

**Explanation:**
- `app = express()`: Creates Express application
- `server = http.createServer(app)`: Creates HTTP server from Express app
- `app.use(cors())`: Enables CORS for all routes (allows browser from different origin)
- `app.get('/')`: Health check endpoint
- `WebSocket.Server({ server, path })`: Upgrades HTTP connections to WebSocket at `/terminal` path

#### 3. **Shell Detection**

```javascript
function getDefaultShell() {
  const platform = os.platform();
  
  if (platform === 'win32') {
    // Windows: prefer PowerShell, fallback to cmd
    return process.env.COMSPEC || 'powershell.exe';
  } else {
    // Unix-like systems: use user's default shell or bash
    return process.env.SHELL || '/bin/bash';
  }
}
```

**Platform-specific shells:**
- **Windows**: `COMSPEC` env var points to `cmd.exe`, or use PowerShell
- **macOS**: `SHELL` env var usually `/bin/zsh` (default since Catalina)
- **Linux**: `SHELL` env var usually `/bin/bash`

#### 4. **PTY Process Spawning**

```javascript
wss.on('connection', (ws) => {
  console.log('New terminal connection established');
  
  const sessionId = Date.now().toString();
  const shell = getDefaultShell();
  
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',    // Terminal type (supports 256 colors)
    cols: 80,                // Initial columns
    rows: 30,                // Initial rows
    cwd: process.cwd(),      // Working directory (server's directory)
    env: process.env         // Environment variables
  });
  
  sessions.set(sessionId, ptyProcess);
  // ... rest of handler
});
```

**PTY spawn parameters:**
- `shell`: Full path to shell executable
- `[]`: Command arguments (empty = interactive shell)
- `name`: Terminal type identifier (affects color support)
- `cols/rows`: Terminal dimensions (affects line wrapping, program layout)
- `cwd`: Initial working directory
- `env`: Environment variables passed to shell

#### 5. **Data Flow Handlers**

**PTY → WebSocket (Shell output to browser):**
```javascript
ptyProcess.onData((data) => {
  try {
    ws.send(JSON.stringify({
      type: 'data',
      data: data  // Raw shell output with ANSI codes
    }));
  } catch (error) {
    console.error('Error sending data to client:', error);
  }
});
```

**WebSocket → PTY (User input to shell):**
```javascript
ws.on('message', (message) => {
  try {
    const msg = JSON.parse(message);
    
    switch (msg.type) {
      case 'input':
        if (msg.data) {
          ptyProcess.write(msg.data);  // Send keystrokes to shell
        }
        break;
        
      case 'resize':
        if (msg.cols && msg.rows) {
          ptyProcess.resize(msg.cols, msg.rows);  // Adjust PTY size
        }
        break;
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
});
```

#### 6. **Cleanup & Session Management**

**PTY exit handler:**
```javascript
ptyProcess.onExit(({ exitCode, signal }) => {
  console.log(`PTY process exited with code ${exitCode}, signal ${signal}`);
  try {
    ws.send(JSON.stringify({
      type: 'exit',
      exitCode,
      signal
    }));
    ws.close();
  } catch (error) {
    console.error('Error sending exit message:', error);
  }
  sessions.delete(sessionId);
});
```

**WebSocket disconnect handler:**
```javascript
ws.on('close', () => {
  console.log('Terminal connection closed');
  if (sessions.has(sessionId)) {
    const pty = sessions.get(sessionId);
    try {
      pty.kill();  // Terminate shell process
    } catch (error) {
      console.error('Error killing PTY process:', error);
    }
    sessions.delete(sessionId);
  }
});
```

**Graceful shutdown:**
```javascript
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, closing all sessions...');
  sessions.forEach((pty, sessionId) => {
    try {
      pty.kill();
    } catch (error) {
      console.error(`Error killing session ${sessionId}:`, error);
    }
  });
  sessions.clear();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
```

---

## WebSocket Protocol

### Message Format

All messages are JSON-encoded strings with a `type` field and type-specific data.

### Message Types

#### 1. **Frontend → Backend: `input`**

Sent when user types in terminal.

```json
{
  "type": "input",
  "data": "ls -la\r"
}
```

**Fields:**
- `type`: Always `"input"`
- `data`: String containing user keystrokes
  - Regular characters: `"a"`, `"b"`, `"1"`
  - Enter key: `"\r"` (carriage return)
  - Backspace: `"\x7f"` (DEL character)
  - Ctrl+C: `"\x03"` (ETX character)
  - Arrow up: `"\x1b[A"` (ANSI escape sequence)

#### 2. **Frontend → Backend: `resize`**

Sent when terminal dimensions change.

```json
{
  "type": "resize",
  "cols": 120,
  "rows": 40
}
```

**Fields:**
- `type`: Always `"resize"`
- `cols`: Number of columns (characters per line)
- `rows`: Number of rows (lines visible)

**Why resize matters:**
- Programs adjust output formatting to fit terminal width
- Text editors (vim, nano) need dimensions for proper layout
- Long lines wrap correctly based on column count

#### 3. **Backend → Frontend: `data`**

Sent when shell produces output.

```json
{
  "type": "data",
  "data": "\x1b[32mSuccess!\x1b[0m\r\n"
}
```

**Fields:**
- `type`: Always `"data"`
- `data`: Raw shell output including:
  - Text content
  - ANSI escape codes for colors
  - Cursor control sequences
  - Carriage returns `\r` and newlines `\n`

**Example ANSI codes in output:**
- `\x1b[31m`: Red text
- `\x1b[32m`: Green text
- `\x1b[0m`: Reset formatting
- `\x1b[2J`: Clear screen
- `\x1b[H`: Move cursor to home

#### 4. **Backend → Frontend: `exit`**

Sent when shell process terminates.

```json
{
  "type": "exit",
  "exitCode": 0,
  "signal": null
}
```

**Fields:**
- `type`: Always `"exit"`
- `exitCode`: Process exit code (0 = success, non-zero = error)
- `signal`: Signal that terminated process (e.g., `"SIGTERM"`) or `null`

### WebSocket Connection Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CONNECTING                                                    │
│    Frontend: ws = new WebSocket('ws://localhost:3001/terminal') │
│    Backend: Receives upgrade request                            │
└─────────────────────────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. OPEN                                                          │
│    Frontend: ws.onopen() fires                                  │
│    Backend: wss.on('connection') fires                          │
│    Backend: Spawns PTY process                                  │
│    Backend: Sets up event handlers                              │
└─────────────────────────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. ACTIVE SESSION                                                │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │ User types → input messages → PTY                        │ │
│    │ PTY output → data messages → xterm display              │ │
│    │ Window resize → resize messages → PTY.resize()          │ │
│    └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. CLOSING (User closes tab or types 'exit')                    │
│    Frontend: ws.close() OR Backend: PTY exits                   │
│    Backend: Kills PTY process                                   │
│    Backend: Sends exit message                                  │
│    Frontend: ws.onclose() fires                                 │
└─────────────────────────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. CLOSED                                                        │
│    Connection terminated                                         │
│    Resources cleaned up                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Implementation

### Component Architecture

```
TerminalConsolePanel (src/components/Console/TerminalConsolePanel.tsx)
  │
  ├─ State: terminals[] (array of TerminalTab)
  ├─ State: activeId (currently visible terminal)
  │
  ├─ Header Bar
  │   ├─ Tabs (map over terminals[])
  │   │   └─ Tab { label, close button }
  │   ├─ New Terminal (+) Button
  │   └─ "TERMINAL" Label
  │
  └─ Body (renders all TerminalView components)
      ├─ TerminalView (id="1", active=true)
      ├─ TerminalView (id="2", active=false)
      └─ TerminalView (id="3", active=false)
```

### TerminalView Component

**File:** `src/components/Console/TerminalView.tsx`

#### Key Implementation Details

**1. xterm.js Initialization:**
```typescript
const term = new Terminal({
  cursorBlink: true,                // Blinking cursor
  fontSize: 14,                     // Font size in pixels
  fontFamily: 'Consolas, "Courier New", monospace',
  theme: {
    background: '#020617',          // bg-slate-950 (matches GB Coder)
    foreground: '#e2e8f0',          // slate-200
    cursor: '#60a5fa',              // blue-400
    // ... 16 ANSI colors
  },
  cols: 80,                         // Initial columns
  rows: 30                          // Initial rows
});

term.open(terminalRef.current);    // Attach to DOM element
```

**2. User Input Handling:**
```typescript
term.onData((data) => {
  // Capture all user keystrokes
  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify({
      type: 'input',
      data  // Send raw keystroke data
    }));
  }
});
```

**3. WebSocket Message Processing:**
```typescript
ws.onmessage = (event) => {
  try {
    const msg = JSON.parse(event.data);
    
    switch (msg.type) {
      case 'data':
        term.write(msg.data);  // Display shell output
        break;
      case 'exit':
        term.write(`\r\n\x1b[1;33m[Process exited with code ${msg.exitCode}]\x1b[0m\r\n`);
        break;
    }
  } catch (error) {
    console.error('Error handling WebSocket message:', error);
  }
};
```

**4. Dynamic Resize with ResizeObserver:**
```typescript
const resizeObserver = new ResizeObserver(() => {
  if (terminalRef.current && xtermRef.current) {
    const { clientWidth, clientHeight } = terminalRef.current;
    
    // Calculate dimensions based on font metrics
    const cols = Math.floor(clientWidth / 9);   // ~9px per char
    const rows = Math.floor(clientHeight / 17); // ~17px per line
    
    if (cols > 0 && rows > 0) {
      xtermRef.current.resize(cols, rows);
      
      // Notify backend
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'resize',
          cols,
          rows
        }));
      }
    }
  }
});

resizeObserver.observe(terminalRef.current);
```

**5. Auto-Reconnect Logic:**
```typescript
ws.onclose = () => {
  term.write('\r\n\x1b[1;31m● Disconnected from terminal server\x1b[0m\r\n');
  
  // Attempt reconnect after 3 seconds
  reconnectTimeoutRef.current = setTimeout(() => {
    term.write('\x1b[1;33m● Attempting to reconnect...\x1b[0m\r\n');
    connectWebSocket(term);  // Retry connection
  }, 3000);
};
```

**6. Tab Visibility Management:**
```typescript
// Use CSS display instead of unmounting to preserve state
<div
  ref={terminalRef}
  className="h-full w-full bg-slate-950"
  style={{ display: active ? 'block' : 'none' }}
/>
```

**Why `display: none` instead of conditional rendering?**
- Preserves terminal state when switching tabs
- Keeps WebSocket connection alive
- Maintains scroll position and command history
- Avoids reconnection overhead

### TerminalConsolePanel Component

**File:** `src/components/Console/TerminalConsolePanel.tsx`

#### Tab Management

**1. State Structure:**
```typescript
interface TerminalTab {
  id: string;      // Unique identifier (timestamp)
  label: string;   // Display name ("bash", "sh #2", etc.)
}

const [terminals, setTerminals] = useState<TerminalTab[]>([
  { id: '1', label: 'bash' }
]);
const [activeId, setActiveId] = useState<string>('1');
```

**2. Creating New Terminal:**
```typescript
const handleNewTerminal = () => {
  terminalCounter++;
  const newTerminal: TerminalTab = {
    id: Date.now().toString(),      // Unique ID
    label: `sh #${terminalCounter}` // Incremental label
  };
  setTerminals(prev => [...prev, newTerminal]);
  setActiveId(newTerminal.id);      // Switch to new terminal
};
```

**3. Closing Terminal:**
```typescript
const handleCloseTab = (id: string) => {
  setTerminals(prev => {
    const filtered = prev.filter(t => t.id !== id);
    
    // If closing active tab, activate another
    if (id === activeId && filtered.length > 0) {
      const closedIndex = prev.findIndex(t => t.id === id);
      const newActiveIndex = closedIndex >= filtered.length 
        ? filtered.length - 1 
        : closedIndex;
      setActiveId(filtered[newActiveIndex].id);
    }
    
    // Always keep at least one terminal
    if (filtered.length === 0) {
      const defaultTab: TerminalTab = {
        id: Date.now().toString(),
        label: 'bash'
      };
      setActiveId(defaultTab.id);
      return [defaultTab];
    }
    
    return filtered;
  });
};
```

**4. Rendering Multiple Terminals:**
```typescript
<div className="flex-1 overflow-hidden relative bg-slate-950">
  {terminals.map(terminal => (
    <TerminalView
      key={terminal.id}
      id={terminal.id}
      active={terminal.id === activeId}
      onClosed={() => console.log(`Terminal ${terminal.id} closed`)}
    />
  ))}
</div>
```

---

## Complete Setup Guide

### Prerequisites

- **Node.js**: v16 or higher (v18/v20 recommended)
- **npm**: v7 or higher
- **Operating System**: Windows 10/11, macOS 10.14+, or Linux

### Step 1: Verify Prerequisites

```bash
# Check Node.js version
node -v
# Should output: v18.x.x or higher

# Check npm version
npm -v
# Should output: v8.x.x or higher
```

### Step 2: Install Windows Build Tools (Windows Only)

**Why needed?** `node-pty` is a native Node.js addon that requires C++ compilation during installation.

#### Option A: Visual Studio Build Tools (Recommended)

1. Download [Visual Studio Build Tools 2022](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
2. Run the installer
3. Select "Desktop development with C++"
4. Install (requires ~7GB disk space)
5. **Reboot your computer**

#### Option B: windows-build-tools Package

Open PowerShell **as Administrator**:

```powershell
npm install --global windows-build-tools
```

Wait 5-10 minutes for installation. This installs:
- Python 2.7 (required by node-gyp)
- Visual C++ Build Tools

**Verify installation:**
```powershell
npm config get msvs_version
# Should output: 2017 or 2019 or 2022
```

### Step 3: Install Frontend Dependencies

From project root:

```bash
npm install
```

This installs:
- `xterm@^5.3.0` - Terminal rendering library
- All other GB Coder dependencies

**Verify xterm installation:**
```bash
npm list xterm
# Should show: gb-coder@0.0.0 C:\path\to\GB-Coder-Public-Beta
#              └── xterm@5.3.0
```

### Step 4: Install Backend Dependencies

```bash
cd server
npm install
```

This installs:
- `express` - HTTP server framework
- `ws` - WebSocket library
- `node-pty` - Pseudo-terminal interface (requires compilation)
- `cors` - Cross-origin resource sharing

**Common errors during `npm install`:**

**Error 1: `gyp ERR! stack Error: Could not find any Visual Studio installation`**
- **Solution**: Install Visual Studio Build Tools (Step 2)

**Error 2: `gyp ERR! stack Error: Python not found`**
- **Solution**: Install Python 2.7 or run `npm install --global windows-build-tools`

**Error 3: `node-gyp rebuild` fails**
- **Solution**: Ensure Node.js version is 16+ and build tools are installed

**Successful installation looks like:**
```
added 4 packages, and audited 5 packages in 3s

found 0 vulnerabilities
```

### Step 5: Start the Terminal Server

From `server/` directory:

```bash
npm start
```

**Expected output:**
```
Terminal server running on port 3001
WebSocket endpoint: ws://localhost:3001/terminal
```

**Server is now running!** Keep this terminal window open.

**Test the server:**
Open browser to `http://localhost:3001` - should see:
```
GB Coder Terminal Server running
```

### Step 6: Start the Frontend Dev Server

Open a **new terminal window** (keep server running in first window).

From project root:

```bash
npm run dev
```

**Expected output:**
```
VITE v5.4.2  ready in 823 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 7: Open GB Coder in Browser

Navigate to `http://localhost:5173`

**Verify terminal tab:**
1. Look at bottom panel (Enhanced Console)
2. You should see 4 tabs: **Console**, **Validator**, **Preview**, **Terminal**
3. Click **Terminal** tab

### Step 8: Test Terminal Functionality

In the terminal, try these commands:

**Test 1: Echo**
```bash
echo "Hello from GB Coder Terminal!"
```
Expected: Displays the text

**Test 2: Directory listing**
- Windows: `dir`
- macOS/Linux: `ls -la`

**Test 3: Node.js version**
```bash
node -v
```
Expected: Displays your Node.js version

**Test 4: Multiple tabs**
1. Click the `+` button
2. New terminal tab appears
3. Run `echo "Tab 2"` in new tab
4. Switch back to first tab
5. Verify first tab still shows previous commands

**Test 5: Keyboard shortcuts**
- Arrow Up/Down: Navigate command history
- Ctrl+C: Interrupt running command
- Tab: Auto-completion (OS-dependent)

### Step 9: Verify Existing Features (Regression Testing)

Ensure terminal integration didn't break anything:

1. **Code Editor**: Type in HTML/CSS/JS editors
2. **Live Preview**: See changes reflected
3. **Console Tab**: Check console logs appear
4. **Validator Tab**: Run validation
5. **AI Features**: Test AI suggestions

---

## Troubleshooting

### Issue 1: "Cannot type in terminal"

**Symptoms:**
- Terminal tab appears
- Terminal UI is rendered
- Cursor is visible
- But typing has no effect

**Cause:** Backend server is not running

**Solution:**
```bash
# In server/ directory
npm start
```

Verify server is running on port 3001

---

### Issue 2: Connection error messages in terminal

**Symptoms:**
Terminal displays:
```
● Failed to connect to terminal server
Make sure the server is running on port 3001
```

**Causes & Solutions:**

**A. Server not started**
```bash
cd server
npm start
```

**B. Port 3001 already in use**
```bash
# Windows
netstat -ano | findstr :3001

# macOS/Linux
lsof -i :3001
```

Kill the process using port 3001, or change server port:
```bash
# Start server on different port
PORT=4000 npm start
```

Then update frontend WebSocket URL in `TerminalView.tsx`:
```typescript
const WS_URL = 'ws://localhost:4000/terminal';
```

**C. Firewall blocking WebSocket**
- Add exception for `node.exe` on port 3001
- Windows: Windows Defender Firewall → Allow an app
- macOS: System Preferences → Security → Firewall

---

### Issue 3: `node-pty` installation fails

**Error message:**
```
gyp ERR! stack Error: Could not find any Visual Studio installation to use
```

**Solution:**
Install Visual Studio Build Tools (see Step 2 in Setup Guide)

**Alternative:** Use pre-built binaries (if available):
```bash
cd server
npm install --save node-pty-prebuilt
```

Then update `server/index.js`:
```javascript
const pty = require('node-pty-prebuilt');
```

---

### Issue 4: Terminal displays garbled characters

**Symptoms:**
Colors don't show correctly, or strange characters appear

**Cause:** Terminal encoding mismatch

**Solution:**

**Windows PowerShell:**
```powershell
# Add to PowerShell profile
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
```

**Update `server/index.js`:** Add encoding to PTY spawn:
```javascript
const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.cwd(),
  env: { ...process.env, LANG: 'en_US.UTF-8' }  // Force UTF-8
});
```

---

### Issue 5: Terminal tabs don't preserve state

**Symptoms:**
Switching tabs loses command history or closes connection

**Cause:** TerminalView is being unmounted/remounted

**Solution:**
Verify `TerminalView` uses `display: none` instead of conditional rendering:

```typescript
// CORRECT ✓
<div style={{ display: active ? 'block' : 'none' }}>
  <TerminalView ... />
</div>

// INCORRECT ✗
{active && <TerminalView ... />}
```

---

### Issue 6: Server crashes with "EADDRINUSE"

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**

**Windows:**
```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Find and kill process
lsof -ti :3001 | xargs kill -9
```

---

## Advanced Configuration

### Custom Shell Configuration

**Pass environment variables to shell:**

Edit `server/index.js`:
```javascript
const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.cwd(),
  env: {
    ...process.env,
    // Custom variables
    TERM: 'xterm-256color',
    COLORTERM: 'truecolor',
    MY_VAR: 'custom_value'
  }
});
```

**Use specific shell:**
```javascript
// Force bash on macOS/Linux
const shell = '/bin/bash';

// Force PowerShell 7 on Windows
const shell = 'C:\\Program Files\\PowerShell\\7\\pwsh.exe';
```

### Custom Starting Directory

Change initial working directory:

```javascript
const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: 'C:\\Users\\YourName\\Projects',  // Custom directory
  env: process.env
});
```

### Custom Terminal Theme

Edit `TerminalView.tsx` theme object:

```typescript
const term = new Terminal({
  cursorBlink: true,
  fontSize: 16,  // Larger font
  fontFamily: 'Fira Code, monospace',  // Different font
  theme: {
    background: '#1a1b26',    // Tokyo Night theme
    foreground: '#c0caf5',
    cursor: '#c0caf5',
    black: '#15161e',
    red: '#f7768e',
    green: '#9ece6a',
    yellow: '#e0af68',
    blue: '#7aa2f7',
    magenta: '#bb9af7',
    cyan: '#7dcfff',
    white: '#a9b1d6',
    brightBlack: '#414868',
    brightRed: '#f7768e',
    brightGreen: '#9ece6a',
    brightYellow: '#e0af68',
    brightBlue: '#7aa2f7',
    brightMagenta: '#bb9af7',
    brightCyan: '#7dcfff',
    brightWhite: '#c0caf5'
  }
});
```

### Enable HTTPS/WSS for Production

**Backend:** Use `https` module and certificates:

```javascript
const https = require('https');
const fs = require('fs');

const server = https.createServer({
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem')
}, app);

const wss = new WebSocket.Server({ 
  server,
  path: '/terminal'
});
```

**Frontend:** Update WebSocket URL:
```typescript
const WS_URL = 'wss://your-domain.com:3001/terminal';
```

### Add Authentication

**Backend:** Verify tokens before accepting WebSocket:

```javascript
wss.on('connection', (ws, req) => {
  // Extract token from URL or headers
  const token = new URLSearchParams(req.url.split('?')[1]).get('token');
  
  if (!isValidToken(token)) {
    ws.close(1008, 'Unauthorized');
    return;
  }
  
  // Proceed with PTY spawn...
});
```

**Frontend:** Send token in URL:
```typescript
const token = getUserToken();
const ws = new WebSocket(`ws://localhost:3001/terminal?token=${token}`);
```

### Persistent Command History

Save command history across sessions:

**Backend:** Log commands to file:
```javascript
ws.on('message', (message) => {
  const msg = JSON.parse(message);
  if (msg.type === 'input' && msg.data.includes('\r')) {
    // Command was submitted
    const command = currentCommand.trim();
    if (command) {
      fs.appendFileSync('history.log', `${command}\n`);
    }
    currentCommand = '';
  } else if (msg.type === 'input') {
    currentCommand += msg.data;
  }
});
```

---

## Security Considerations

### Current Security Posture

**⚠️ WARNING:** The current implementation has **NO authentication or authorization**. It is designed for **local development only**.

### Security Risks

1. **Arbitrary Command Execution**
   - Any client can run any command on the server
   - Full file system access
   - Network access from shell

2. **No Input Validation**
   - Commands are passed directly to shell
   - Potential for command injection

3. **No Rate Limiting**
   - Unlimited PTY spawning
   - Potential DoS attack

4. **Sensitive Data Exposure**
   - Environment variables passed to shell
   - Access to all server files

### Recommendations for Production

#### 1. Add Authentication

```javascript
// JWT-based auth example
const jwt = require('jsonwebtoken');

wss.on('connection', (ws, req) => {
  const token = extractToken(req);
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.userId;
    
    // Proceed with PTY spawn for authenticated user
  } catch (error) {
    ws.close(1008, 'Invalid token');
    return;
  }
});
```

#### 2. Use Docker Containers

Run each terminal in isolated Docker container:

```javascript
const { spawn } = require('child_process');

// Instead of node-pty, spawn docker container
const docker = spawn('docker', [
  'run', '-it', '--rm',
  '--network', 'none',  // No network access
  '--cpus', '0.5',      // CPU limit
  '--memory', '512m',   // Memory limit
  'alpine:latest',      // Minimal image
  '/bin/sh'
]);
```

#### 3. Implement Command Filtering

```javascript
const BLOCKED_COMMANDS = ['rm -rf', 'dd', 'mkfs', 'sudo', 'su'];

ws.on('message', (message) => {
  const msg = JSON.parse(message);
  if (msg.type === 'input') {
    // Check for dangerous commands
    if (BLOCKED_COMMANDS.some(cmd => msg.data.includes(cmd))) {
      ws.send(JSON.stringify({
        type: 'data',
        data: '\r\n\x1b[31mCommand blocked by security policy\x1b[0m\r\n'
      }));
      return;
    }
    ptyProcess.write(msg.data);
  }
});
```

#### 4. Limit Resource Usage

```javascript
const MAX_SESSIONS_PER_USER = 3;
const userSessions = new Map();

wss.on('connection', (ws, req) => {
  const userId = getUserId(req);
  const sessionCount = userSessions.get(userId) || 0;
  
  if (sessionCount >= MAX_SESSIONS_PER_USER) {
    ws.close(1008, 'Maximum sessions exceeded');
    return;
  }
  
  userSessions.set(userId, sessionCount + 1);
  
  ws.on('close', () => {
    userSessions.set(userId, userSessions.get(userId) - 1);
  });
});
```

#### 5. Enable Audit Logging

Log all commands for security auditing:

```javascript
const fs = require('fs');

function logCommand(userId, command, timestamp) {
  const logEntry = {
    userId,
    command,
    timestamp,
    ip: req.socket.remoteAddress
  };
  
  fs.appendFileSync(
    'audit.log',
    JSON.stringify(logEntry) + '\n'
  );
}
```

---

## Summary

You now have a comprehensive understanding of:

- ✅ **Terminal Architecture**: Client-server with WebSocket and PTY
- ✅ **Backend Server**: Express + ws + node-pty implementation
- ✅ **WebSocket Protocol**: Message types and data flow
- ✅ **Frontend**: xterm.js + React components
- ✅ **Setup Process**: Windows build tools → Dependencies → Servers
- ✅ **Troubleshooting**: Common issues and solutions
- ✅ **Advanced Config**: Custom shells, themes, auth
- ✅ **Security**: Risks and production hardening

**Next Steps:**
1. Install Windows build tools (if on Windows)
2. Run `cd server && npm install`
3. Start both servers
4. Test the terminal
5. Implement security measures before production deployment

For support, refer to:
- [xterm.js documentation](https://xtermjs.org/)
- [node-pty GitHub](https://github.com/microsoft/node-pty)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
