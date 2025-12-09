import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';

interface AuthPageProps {
    onClose: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onClose }) => {
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
        <div className={`min-h-screen w-full ${mode === 'login' ? 'bg-black' : 'bg-white'
            }`}>
            {/* Back Button */}
            <button
                onClick={onClose}
                className={`fixed top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${mode === 'login'
                    ? 'text-white/70 hover:text-white hover:bg-white/10'
                    : 'text-black/70 hover:text-black hover:bg-black/10'
                    }`}
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Editor</span>
            </button>

            {/* Main Content - Centered */}
            <div className="min-h-screen flex items-center justify-center px-6 py-20">
                <div className={`w-full max-w-md ${mode === 'login' ? 'text-white' : 'text-black'
                    }`}>
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-wide mb-2">
                            {mode === 'login' ? 'LOGIN' : 'SIGN UP'}
                        </h1>
                        <p className={`text-base ${mode === 'login' ? 'text-white/60' : 'text-black/60'
                            }`}>
                            {mode === 'login' ? 'TO CONTINUE' : 'FOR YOUR ACCOUNT'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {mode === 'signup' && (
                            <div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="username"
                                    required
                                    autoComplete="username"
                                    className={`w-full bg-transparent border-b-2 py-4 px-2 text-base focus:outline-none transition-colors ${mode === 'login'
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
                                className={`w-full bg-transparent border-b-2 py-4 px-2 text-base focus:outline-none transition-colors ${mode === 'login'
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
                                className={`w-full bg-transparent border-b-2 py-4 px-2 text-base focus:outline-none transition-colors ${mode === 'login'
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
                                    className={`w-full bg-transparent border-b-2 py-4 px-2 text-base focus:outline-none transition-colors ${mode === 'login'
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
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 px-8 rounded-full border-2 font-semibold text-base tracking-wider transition-all duration-200 ${loading
                                    ? 'opacity-50 cursor-not-allowed'
                                    : mode === 'login'
                                        ? 'border-white hover:bg-white hover:text-black'
                                        : 'border-black bg-black text-white hover:bg-transparent hover:text-black'
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {mode === 'login' ? 'SIGNING IN...' : 'CREATING...'}
                                    </span>
                                ) : (
                                    mode === 'login' ? 'LOG IN' : 'SIGN UP'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Mode Toggle Dots */}
                    <div className="flex items-center justify-center gap-3 mt-10">
                        <button
                            type="button"
                            onClick={() => setMode('login')}
                            className={`w-3 h-3 rounded-full transition-all duration-200 ${mode === 'login'
                                ? 'bg-white'
                                : 'bg-black/30 hover:bg-black/50'
                                }`}
                            aria-label="Switch to login"
                        />
                        <button
                            type="button"
                            onClick={() => setMode('signup')}
                            className={`w-3 h-3 rounded-full transition-all duration-200 ${mode === 'signup'
                                ? 'bg-black'
                                : 'bg-white/30 hover:bg-white/50'
                                }`}
                            aria-label="Switch to signup"
                        />
                    </div>

                    {/* Toggle Text */}
                    <p className={`text-center text-sm mt-6 ${mode === 'login' ? 'text-white/50' : 'text-black/50'
                        }`}>
                        {mode === 'login' ? (
                            <>Don't have an account? <button type="button" onClick={toggleMode} className="underline hover:no-underline font-medium">Sign up</button></>
                        ) : (
                            <>Already have an account? <button type="button" onClick={toggleMode} className="underline hover:no-underline font-medium">Log in</button></>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
