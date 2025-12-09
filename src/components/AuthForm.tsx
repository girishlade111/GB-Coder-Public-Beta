import React, { useState } from 'react';
import { Mail, Lock, User, LogIn, UserPlus, X, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';

interface AuthFormProps {
    onClose?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onClose }) => {
    const { isDark } = useTheme();
    const { signIn, signUp } = useAuth();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            if (mode === 'login') {
                const result = await signIn(email, password);
                if (result.success) {
                    setSuccess('Login successful!');
                    setTimeout(() => onClose?.(), 1000);
                } else {
                    setError(result.error || 'Login failed');
                }
            } else {
                const result = await signUp(email, password, username);
                if (result.success) {
                    setSuccess('Account created! Please check your email to verify.');
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
    };

    return (
        <div className={`w-full px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-3">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                </h3>
                {onClose && (
                    <button
                        onClick={onClose}
                        className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                            }`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
                {mode === 'signup' && (
                    <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Username
                        </label>
                        <div className="relative">
                            <User className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="johndoe"
                                required
                                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors ${isDark
                                        ? 'bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-blue-500'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email
                    </label>
                    <div className="relative">
                        <Mail className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors ${isDark
                                    ? 'bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-blue-500'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        />
                    </div>
                </div>

                <div>
                    <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Password
                    </label>
                    <div className="relative">
                        <Lock className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors ${isDark
                                    ? 'bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-blue-500'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        />
                    </div>
                </div>

                {error && (
                    <div className={`flex items-center gap-2 text-xs p-2 rounded-lg ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'
                        }`}>
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className={`flex items-center gap-2 text-xs p-2 rounded-lg ${isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600'
                        }`}>
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${loading
                            ? isDark
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : isDark
                                ? 'bg-white text-black hover:bg-gray-100'
                                : 'bg-black text-white hover:bg-gray-900'
                        }`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                        </>
                    ) : (
                        <>
                            {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                            <span>{mode === 'login' ? 'Sign In' : 'Sign Up'}</span>
                        </>
                    )}
                </button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={toggleMode}
                        className={`text-xs transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AuthForm;
