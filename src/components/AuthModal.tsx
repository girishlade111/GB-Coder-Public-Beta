import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { isDark } = useTheme();
    const { signIn, signUp } = useAuth();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setUsername('');
            setError(null);
            setSuccess(null);
            setMode('login');
        }
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (mode === 'signup' && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            if (mode === 'login') {
                const result = await signIn(email, password);
                if (result.success) {
                    setSuccess('Login successful!');
                    setTimeout(() => onClose(), 1000);
                } else {
                    setError(result.error || 'Login failed');
                }
            } else {
                const result = await signUp(email, password, username);
                if (result.success) {
                    setSuccess('Account created! Check your email to verify.');
                    setTimeout(() => {
                        setMode('login');
                        setSuccess(null);
                    }, 2000);
                } else {
                    setError(result.error || 'Signup failed');
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setError(null);
        setSuccess(null);
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <>
            {/* Full Screen Overlay with Grid Centering */}
            <div
                className="fixed inset-0 z-[9999] grid place-items-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'grid',
                    placeItems: 'center'
                }}
            >
                {/* Modal Container */}
                <div
                    className={`relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${mode === 'login' ? 'bg-black text-white' : 'bg-white text-black'
                        }`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-colors ${mode === 'login'
                                ? 'hover:bg-white/10 text-white/70 hover:text-white'
                                : 'hover:bg-black/10 text-black/70 hover:text-black'
                            }`}
                        type="button"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Content */}
                    <div className="px-8 py-10">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold tracking-wide">
                                {mode === 'login' ? 'LOGIN' : 'SIGN UP'}
                            </h2>
                            <p className={`text-sm mt-1 ${mode === 'login' ? 'text-white/60' : 'text-black/60'
                                }`}>
                                {mode === 'login' ? 'TO CONTINUE' : 'FOR YOUR ACCOUNT'}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {mode === 'signup' && (
                                <div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="username"
                                        required
                                        autoComplete="username"
                                        className={`w-full bg-transparent border-b-2 py-3 px-1 text-sm focus:outline-none transition-colors ${mode === 'login'
                                                ? 'border-white/30 focus:border-white placeholder-white/40'
                                                : 'border-black/30 focus:border-black placeholder-black/40'
                                            }`}
                                    />
                                </div>
                            )}

                            <div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your email"
                                    required
                                    autoComplete="email"
                                    className={`w-full bg-transparent border-b-2 py-3 px-1 text-sm focus:outline-none transition-colors ${mode === 'login'
                                            ? 'border-white/30 focus:border-white placeholder-white/40'
                                            : 'border-black/30 focus:border-black placeholder-black/40'
                                        }`}
                                />
                            </div>

                            <div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="your password"
                                    required
                                    minLength={6}
                                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                    className={`w-full bg-transparent border-b-2 py-3 px-1 text-sm focus:outline-none transition-colors ${mode === 'login'
                                            ? 'border-white/30 focus:border-white placeholder-white/40'
                                            : 'border-black/30 focus:border-black placeholder-black/40'
                                        }`}
                                />
                            </div>

                            {mode === 'signup' && (
                                <div>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="confirm password"
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                        className={`w-full bg-transparent border-b-2 py-3 px-1 text-sm focus:outline-none transition-colors ${mode === 'login'
                                                ? 'border-white/30 focus:border-white placeholder-white/40'
                                                : 'border-black/30 focus:border-black placeholder-black/40'
                                            }`}
                                    />
                                </div>
                            )}

                            {/* Error/Success Messages */}
                            {error && (
                                <p className={`text-sm text-center py-2 ${mode === 'login' ? 'text-red-400' : 'text-red-600'
                                    }`}>
                                    {error}
                                </p>
                            )}
                            {success && (
                                <p className={`text-sm text-center py-2 ${mode === 'login' ? 'text-green-400' : 'text-green-600'
                                    }`}>
                                    {success}
                                </p>
                            )}

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3 px-6 rounded-full border-2 font-semibold text-sm tracking-wider transition-all duration-200 ${loading
                                            ? 'opacity-50 cursor-not-allowed'
                                            : mode === 'login'
                                                ? 'border-white hover:bg-white hover:text-black'
                                                : 'border-black bg-black text-white hover:bg-transparent hover:text-black'
                                        }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {mode === 'login' ? 'SIGNING IN...' : 'CREATING...'}
                                        </span>
                                    ) : (
                                        mode === 'login' ? 'LOG IN' : 'SIGN UP'
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Mode Toggle Dots */}
                        <div className="flex items-center justify-center gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setMode('login')}
                                className={`w-3 h-3 rounded-full transition-all duration-200 ${mode === 'login'
                                        ? (mode === 'login' ? 'bg-white' : 'bg-black')
                                        : (mode === 'login' ? 'bg-white/30' : 'bg-black/30')
                                    }`}
                                aria-label="Switch to login"
                            />
                            <button
                                type="button"
                                onClick={() => setMode('signup')}
                                className={`w-3 h-3 rounded-full transition-all duration-200 ${mode === 'signup'
                                        ? (mode === 'login' ? 'bg-white' : 'bg-black')
                                        : (mode === 'login' ? 'bg-white/30' : 'bg-black/30')
                                    }`}
                                aria-label="Switch to signup"
                            />
                        </div>

                        {/* Toggle Text */}
                        <p className={`text-center text-xs mt-4 ${mode === 'login' ? 'text-white/50' : 'text-black/50'
                            }`}>
                            {mode === 'login' ? (
                                <>Don't have an account? <button type="button" onClick={toggleMode} className="underline hover:no-underline">Sign up</button></>
                            ) : (
                                <>Already have an account? <button type="button" onClick={toggleMode} className="underline hover:no-underline">Log in</button></>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthModal;
