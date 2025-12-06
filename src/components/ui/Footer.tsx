import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Instagram, Linkedin, Github, Codepen, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const { isDark } = useTheme();

  const handleNavigation = (view: string) => {
    window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: { view } }));
  };

  return (
    <footer className={`mt-auto border-t transition-colors ${isDark
      ? 'bg-matte-black border-gray-700 text-bright-white'
      : 'bg-bright-white border-gray-200 text-gray-600'
      }`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Section */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-bright-white' : 'text-gray-900'}`}>
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation('about')}
                  className={`text-sm hover:underline transition-colors ${isDark ? 'hover:text-bright-white' : 'hover:text-gray-900'
                    }`}
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('contact')}
                  className={`text-sm hover:underline transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'
                    }`}
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation('privacy')}
                  className={`text-sm hover:underline transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'
                    }`}
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('terms')}
                  className={`text-sm hover:underline transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'
                    }`}
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('cookies')}
                  className={`text-sm hover:underline transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'
                    }`}
                >
                  Cookie Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('disclaimer')}
                  className={`text-sm hover:underline transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'
                    }`}
                >
                  Disclaimer
                </button>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Connect With Us
            </h3>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/girish_lade_/" target="_blank" rel="noopener noreferrer"
                className={`transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
                aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/girish-lade-075bba201/" target="_blank" rel="noopener noreferrer"
                className={`transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
                aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://github.com/girishlade111" target="_blank" rel="noopener noreferrer"
                className={`transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
                aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://codepen.io/Girish-Lade-the-looper" target="_blank" rel="noopener noreferrer"
                className={`transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
                aria-label="CodePen">
                <Codepen className="w-5 h-5" />
              </a>
              <a href="mailto:girishlade111@gmail.com"
                className={`transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}
                aria-label="Email">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-sm">
            © 2024 GB Coder. Created by Girish Lade in Mumbai, India. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
