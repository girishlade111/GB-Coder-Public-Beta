import React, { useState } from 'react';
import { ArrowLeft, Loader2, Mail, CheckCircle, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';

interface AuthPageProps {
    onClose: () => void;
}

// Email Verification Popup Component
const EmailVerificationPopup: React.FC<{ email: string; onClose: () => void }> = ({ email, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white rounded-full animate-pulse" />
                    <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="relative px-8 py-12 text-center text-white">
                    {/* Animated Icon */}
                    <div className="relative inline-flex items-center justify-center mb-6">
                        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                        <div className="relative w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Mail className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: '1s' }}>
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    {/* Sparkle decoration */}
                    <div className="flex items-center justify-center gap-1 mb-4">
                        <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                        <span className="text-sm font-medium text-white/80 tracking-widest uppercase">Almost There!</span>
                        <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold mb-3 tracking-tight">
                        Verify Your Email
                    </h2>

                    {/* Description */}
                    <p className="text-white/80 mb-6 text-base leading-relaxed">
                        We've sent a verification link to
                    </p>

                    {/* Email display */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 mb-6 inline-block">
                        <p className="text-lg font-semibold text-white break-all">
                            {email}
                        </p>
                    </div>

                    <p className="text-white/70 text-sm mb-8">
                        Click the link in your inbox to activate your account and start coding!
                    </p>

                    {/* Action button */}
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-white text-purple-700 font-bold rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Got It!
                    </button>

                    {/* Footer text */}
                    <p className="text-white/50 text-xs mt-6">
                        Didn't receive the email? Check your spam folder
                    </p>
                </div>
            </div>
        </div>
    );
};

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
    const [showVerificationPopup, setShowVerificationPopup] = useState(false);
    const [signupEmail, setSignupEmail] = useState('');

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
                    // Show the verification popup
                    setSignupEmail(email);
                    setShowVerificationPopup(true);
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

    const handleCloseVerificationPopup = () => {
        setShowVerificationPopup(false);
        setMode('login');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setUsername('');
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
            {/* Verification Popup */}
            {showVerificationPopup && (
                <EmailVerificationPopup
                    email={signupEmail}
                    onClose={handleCloseVerificationPopup}
                />
            )}

            <div className={`min-h-screen w-full ${mode === 'login' ? 'bg-black' : 'bg-white'}`}>
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
                    <div className={`w-full max-w-md ${mode === 'login' ? 'text-white' : 'text-black'}`}>
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold tracking-wide mb-2">
                                {mode === 'login' ? 'LOGIN' : 'SIGN UP'}
                            </h1>
                            <p className={`text-base ${mode === 'login' ? 'text-white/60' : 'text-black/60'}`}>
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
                                <p className={`text-sm text-center py-2 ${mode === 'login' ? 'text-red-400' : 'text-red-600'}`}>
                                    {error}
                                </p>
                            )}
                            {success && (
                                <p className={`text-sm text-center py-2 ${mode === 'login' ? 'text-green-400' : 'text-green-600'}`}>
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
                        <p className={`text-center text-sm mt-6 ${mode === 'login' ? 'text-white/50' : 'text-black/50'}`}>
                            {mode === 'login' ? (
                                <>Don't have an account? <button type="button" onClick={toggleMode} className="underline hover:no-underline font-medium">Sign up</button></>
                            ) : (
                                <>Already have an account? <button type="button" onClick={toggleMode} className="underline hover:no-underline font-medium">Log in</button></>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthPage;
