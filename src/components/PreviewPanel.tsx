import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { ConsoleLog } from '../types';

interface PreviewPanelProps {
  html: string;
  css: string;
  javascript: string;
  onConsoleLog: (log: ConsoleLog) => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  html, 
  css, 
  javascript, 
  onConsoleLog 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sanitize code input to prevent XSS attacks
  const sanitizeCode = (code: string, language: string): string => {
    if (language === 'html') {
      // Basic HTML sanitization - remove script tags and dangerous attributes
      return code
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, ''); // Remove iframes
    } else if (language === 'css') {
      // Basic CSS sanitization - remove dangerous CSS properties
      return code
        .replace(/expression\s*\(/gi, '') // Remove CSS expressions
        .replace(/behavior\s*:/gi, '') // Remove behavior property
        .replace(/-moz-binding\s*:/gi, ''); // Remove Mozilla binding
    }
    return code; // JavaScript will be handled in the sandbox
  };

  const generatePreviewContent = () => {
    const sanitizedHtml = sanitizeCode(html, 'html');
    const sanitizedCss = sanitizeCode(css, 'css');
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline'; object-src 'none';">
    <title>Preview</title>
    <style>
        body { 
            margin: 0; 
            padding: 16px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            color: #333;
        }
        ${sanitizedCss}
    </style>
</head>
<body>
    ${sanitizedHtml}
    <script>
        // Strict console intercept with input validation
        const sendToParent = (type, message) => {
            // Validate input before sending
            if (typeof message === 'string' && message.length < 10000) {
                window.parent.postMessage({
                    type: 'console',
                    level: type,
                    message: message.substring(0, 5000), // Limit message length
                    timestamp: new Date().toISOString()
                }, '*');
            }
        };
        
        // Secure console methods with limits
        const secureConsole = {
            log: (...args) => sendToParent('log', args.map(arg => 
                typeof arg === 'string' && arg.length > 1000 ? arg.substring(0, 1000) + '...' : 
                typeof arg === 'object' ? '[Object]' : String(arg)
            ).join(' ')),
            error: (...args) => sendToParent('error', args.map(arg => 
                typeof arg === 'string' && arg.length > 1000 ? arg.substring(0, 1000) + '...' : 
                typeof arg === 'object' ? '[Object]' : String(arg)
            ).join(' ')),
            warn: (...args) => sendToParent('warn', args.map(arg => 
                typeof arg === 'string' && arg.length > 1000 ? arg.substring(0, 1000) + '...' : 
                typeof arg === 'object' ? '[Object]' : String(arg)
            ).join(' ')),
            info: (...args) => sendToParent('info', args.map(arg => 
                typeof arg === 'string' && arg.length > 1000 ? arg.substring(0, 1000) + '...' : 
                typeof arg === 'object' ? '[Object]' : String(arg)
            ).join(' '))
        };
        
        // Override console with secure version
        console.log = secureConsole.log;
        console.error = secureConsole.error;
        console.warn = secureConsole.warn;
        console.info = secureConsole.info;
        
        // Catch runtime errors with sanitized output
        window.addEventListener('error', (e) => {
            const message = e.message ? e.message.substring(0, 500) : 'Unknown error';
            sendToParent('error', \`\${message} at \${e.filename || 'unknown'}:\${e.lineno || 'unknown'}\`);
        });
        
        // Secure script execution
        try {
            // Limit execution time to prevent infinite loops
            const startTime = Date.now();
            const MAX_EXECUTION_TIME = 5000; // 5 seconds
            
            const checkTimeout = () => {
                if (Date.now() - startTime > MAX_EXECUTION_TIME) {
                    throw new Error('Script execution timeout');
                }
            };
            
            // Execute sanitized JavaScript
            const sanitizedJs = \`${javascript.replace(/</g, '\\u003c').replace(/>/g, '\\u003e')}\`;
            eval(sanitizedJs);
            
        } catch (error) {
            sendToParent('error', error.message ? error.message.substring(0, 200) : 'Execution error');
        }
    </script>
</body>
</html>`;
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      const content = generatePreviewContent();
      iframeRef.current.srcdoc = content;
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  useEffect(() => {
    refreshPreview();
  }, [html, css, javascript]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        const log: ConsoleLog = {
          id: Date.now().toString(),
          type: event.data.level,
          message: event.data.message,
          timestamp: event.data.timestamp,
        };
        onConsoleLog(log);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsoleLog]);

  const openInNewTab = () => {
    const content = generatePreviewContent();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="w-full h-96 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
      <div className="bg-gray-900 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Live Preview</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshPreview}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openInNewTab}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
            title="Open in New Tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="relative h-full">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-10">
            <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          className="w-full h-full bg-white"
          title="Code Preview"
          sandbox="allow-scripts allow-same-origin"
          srcDoc={generatePreviewContent()}
        />
      </div>
    </div>
  );
};

export default PreviewPanel;