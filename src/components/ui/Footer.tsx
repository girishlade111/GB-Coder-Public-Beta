import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Instagram, Linkedin, Github, Codepen, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const { isDark } = useTheme();

  const handleAboutClick = () => {
    window.dispatchEvent(new CustomEvent('navigate-to-about'));
  };

  return (
    <footer className={`mt-auto border-t transition-colors ${
      isDark 
        ? 'bg-gray-900 border-gray-700 text-gray-300' 
        : 'bg-white border-gray-200 text-gray-600'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm">
              © 2024 GB Coder. Created by Girish Lade in Mumbai, India. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={handleAboutClick}
              className={`text-sm hover:underline transition-colors ${
                isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'
              }`}
            >
              About Us
            </button>
            <a href="https://www.instagram.com/girish_lade_/" target="_blank" rel="noopener noreferrer" className={`text-sm transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}>
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/in/girish-lade-075bba201/" target="_blank" rel="noopener noreferrer" className={`text-sm transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}>
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="https://github.com/girishlade111" target="_blank" rel="noopener noreferrer" className={`text-sm transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}>
              <Github className="w-5 h-5" />
            </a>
            <a href="https://codepen.io/Girish-Lade-the-looper" target="_blank" rel="noopener noreferrer" className={`text-sm transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}>
              <Codepen className="w-5 h-5" />
            </a>
            <a href="mailto:girishlade111@gmail.com" className={`text-sm transition-colors ${isDark ? 'hover:text-gray-100' : 'hover:text-gray-900'}`}>
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
