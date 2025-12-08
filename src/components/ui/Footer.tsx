import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Instagram, Linkedin, Github, Codepen, Mail, EyeOff } from 'lucide-react';

interface FooterProps {
  focusMode?: boolean;
  onToggleFocusMode?: () => void;
}

const Footer: React.FC<FooterProps> = ({ focusMode = false, onToggleFocusMode }) => {
  const { isDark } = useTheme();

  const handleNavigation = (view: string) => {
    // Dispatch specific events that App.tsx listens for
    window.dispatchEvent(new CustomEvent(`navigate-to-${view}`));
  };

  // Hide footer when Focus Mode is enabled
  if (focusMode) {
    return null;
  }

  return (
    <footer className={`mt-auto border-t transition-colors ${isDark
      ? 'bg-matte-black border-gray-700 text-bright-white'
      : 'bg-bright-white border-gray-200 text-gray-600'
      }`}>
      {/* Compact Single-Line Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          {/* Left: Links */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => handleNavigation('about')}
              className={`hover:underline transition-colors ${isDark ? 'hover:text-bright-white' : 'hover:text-gray-900'}`}
            >
              About
            </button>
            <button
              onClick={() => handleNavigation('documentation')}
              className={`hover:underline transition-colors ${isDark ? 'hover:text-bright-white' : 'hover:text-gray-900'}`}
            >
              Documentation
            </button>
            <button
              onClick={() => handleNavigation('contact')}
              className={`hover:underline transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
            >
              Contact
            </button>
            <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>|</span>
            <button
              onClick={() => handleNavigation('privacy')}
              className={`hover:underline transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
            >
              Privacy
            </button>
            <button
              onClick={() => handleNavigation('terms')}
              className={`hover:underline transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
            >
              Terms
            </button>
            <button
              onClick={() => handleNavigation('cookies')}
              className={`hover:underline transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
            >
              Cookies
            </button>
            <button
              onClick={() => handleNavigation('disclaimer')}
              className={`hover:underline transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
            >
              Disclaimer
            </button>
          </div>

          {/* Center: Copyright */}
          <div className="text-xs hidden lg:block">
            © 2024 GB Coder. Created by Girish Lade in Mumbai, India.
          </div>

          {/* Right: Social Icons & Focus Mode Toggle */}
          <div className="flex items-center gap-3">
            <a href="https://www.instagram.com/girish_lade_/" target="_blank" rel="noopener noreferrer"
              className={`transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
              aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://www.linkedin.com/in/girish-lade-075bba201/" target="_blank" rel="noopener noreferrer"
              className={`transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
              aria-label="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://github.com/girishlade111" target="_blank" rel="noopener noreferrer"
              className={`transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
              aria-label="GitHub">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://codepen.io/Girish-Lade-the-looper" target="_blank" rel="noopener noreferrer"
              className={`transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
              aria-label="CodePen">
              <Codepen className="w-4 h-4" />
            </a>
            <a href="mailto:girishlade111@gmail.com"
              className={`transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
              aria-label="Email">
              <Mail className="w-4 h-4" />
            </a>

            {/* Focus Mode Toggle */}
            {onToggleFocusMode && (
              <>
                <span className={`mx-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>|</span>
                <button
                  onClick={onToggleFocusMode}
                  className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-gray-800 hover:text-bright-white' : 'hover:bg-gray-200 hover:text-gray-900'}`}
                  aria-label="Toggle Focus Mode"
                  title="Focus Mode (Hide Footer)"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Copyright */}
        <div className="text-xs text-center mt-2 lg:hidden">
          © 2024 GB Coder. Created by Girish Lade in Mumbai, India.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
