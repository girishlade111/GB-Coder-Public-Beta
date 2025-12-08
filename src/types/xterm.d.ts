declare module 'xterm' {
    export class Terminal {
        constructor(options?: any);
        open(parent: HTMLElement): void;
        write(data: string): void;
        resize(cols: number, rows: number): void;
        onData(callback: (data: string) => void): { dispose: () => void };
        onResize(callback: (size: { cols: number; rows: number }) => void): { dispose: () => void };
        dispose(): void;
        cols: number;
        rows: number;
    }
}

declare module 'xterm/css/xterm.css';
