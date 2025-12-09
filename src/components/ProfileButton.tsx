import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';

const ProfileButton: React.FC = () => {
    const { isDark } = useTheme();
    const { user, signOut, loading } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        setIsDropdownOpen(false);
    };

    const handleSignIn = () => {
        // Dispatch custom event to navigate to auth page
        window.dispatchEvent(new CustomEvent('navigate-to-auth'));
    };

    // Show loading state
    if (loading) {
        return (
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Not logged in - show Sign In button
    if (!user) {
        return (
            <button
                onClick={handleSignIn}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${isDark
                        ? 'bg-white text-black hover:bg-gray-100'
                        : 'bg-black text-white hover:bg-gray-900'
                    }`}
                title="Sign In"
            >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Sign In</span>
            </button>
        );
    }

    // Logged in - show user profile dropdown
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 ${isDropdownOpen
                        ? isDark ? 'bg-gray-700' : 'bg-gray-100'
                        : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
            >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-white text-black' : 'bg-black text-white'
                    }`}>
                    {(user.user_metadata?.username?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </div>

                {/* Name (hidden on small screens) */}
                <span className={`text-sm font-medium hidden md:inline max-w-24 truncate ${isDark ? 'text-white' : 'text-black'
                    }`}>
                    {user.user_metadata?.username || user.email?.split('@')[0]}
                </span>

                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''
                    } ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg border overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                    {/* User Info */}
                    <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {user.user_metadata?.username || user.email?.split('@')[0]}
                        </p>
                        <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {user.email}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="py-1">
                        <button
                            onClick={handleSignOut}
                            className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileButton;
