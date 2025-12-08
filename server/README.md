# GB Coder Terminal Server

This directory contains the backend terminal server for GB Coder's integrated terminal feature.

## Installation

```bash
cd server
npm install
```

## Running the Server

```bash
npm start
```

The server will start on port 3001 by default. You can change the port by setting the `PORT` environment variable:

```bash
PORT=4000 npm start
```

## Technical Details

- **Express**: HTTP server
- **ws**: WebSocket library for real-time communication
- **node-pty**: Pseudo-terminal for spawning shell processes
- **Shell Detection**: Automatically uses PowerShell/cmd on Windows, bash on Unix

## Security Note

⚠️ This server allows executing any command on the host machine. It is designed for **local development only**. Do not expose the WebSocket endpoint publicly without authentication.
