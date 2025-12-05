import { useState, useCallback, useRef } from 'react';

export interface CodeWriterProgress {
    current: string;
    totalChars: number;
    writtenChars: number;
    isComplete: boolean;
}

export const useCodeWriter = () => {
    const [isWriting, setIsWriting] = useState(false);
    const [progress, setProgress] = useState<CodeWriterProgress>({
        current: '',
        totalChars: 0,
        writtenChars: 0,
        isComplete: false
    });
    const animationRef = useRef<number | null>(null);
    const abortRef = useRef(false);

    const writeCode = useCallback(async (
        code: string,
        onUpdate: (partial: string, progress: CodeWriterProgress) => void,
        charsPerFrame: number = 15 // Speed of writing
    ): Promise<void> => {
        return new Promise((resolve) => {
            abortRef.current = false;
            setIsWriting(true);

            const totalChars = code.length;
            let writtenChars = 0;
            let currentText = '';

            const animate = () => {
                if (abortRef.current) {
                    setIsWriting(false);
                    resolve();
                    return;
                }

                // Write characters
                const remainingChars = totalChars - writtenChars;
                const charsToWrite = Math.min(charsPerFrame, remainingChars);

                currentText += code.substring(writtenChars, writtenChars + charsToWrite);
                writtenChars += charsToWrite;

                const progressData: CodeWriterProgress = {
                    current: currentText,
                    totalChars,
                    writtenChars,
                    isComplete: writtenChars >= totalChars
                };

                setProgress(progressData);
                onUpdate(currentText, progressData);

                if (writtenChars < totalChars) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    setIsWriting(false);
                    resolve();
                }
            };

            animationRef.current = requestAnimationFrame(animate);
        });
    }, []);

    const abort = useCallback(() => {
        abortRef.current = true;
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        setIsWriting(false);
    }, []);

    const reset = useCallback(() => {
        setProgress({
            current: '',
            totalChars: 0,
            writtenChars: 0,
            isComplete: false
        });
    }, []);

    return { writeCode, isWriting, progress, abort, reset };
};
