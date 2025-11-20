import React, { useEffect, useState } from 'react';
import { Check, X, Undo } from 'lucide-react';

interface FormatToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    onUndo?: () => void;
    duration?: number;
    onClose: () => void;
}

const FormatToast: React.FC<FormatToastProps> = ({
    message,
    type = 'success',
    onUndo,
    duration = 3000,
    onClose,
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                setIsVisible(false);
                onClose();
            }, 300); // Match animation duration
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 300);
    };

    const handleUndo = () => {
        if (onUndo) {
            onUndo();
            handleClose();
        }
    };

    if (!isVisible) return null;

    const bgColor = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600',
    }[type];

    const Icon = {
        success: Check,
        error: X,
        info: Check,
    }[type];

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                }`}
        >
            <div
                className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}
            >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 font-medium">{message}</span>

                {onUndo && (
                    <button
                        onClick={handleUndo}
                        className="flex items-center gap-1 px-2 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors text-sm"
                        title="Undo format"
                    >
                        <Undo className="w-3 h-3" />
                        <span>Undo</span>
                    </button>
                )}

                <button
                    onClick={handleClose}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                    title="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default FormatToast;
