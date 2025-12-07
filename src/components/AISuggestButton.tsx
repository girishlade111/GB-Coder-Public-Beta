import React, { useState } from 'react';
import { Sparkles, Zap, Brain, Wand2 } from 'lucide-react';
import { EditorLanguage } from '../types';

interface AISuggestButtonProps {
  language: EditorLanguage;
  onSuggest: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  hasContent?: boolean;
}

const AISuggestButton: React.FC<AISuggestButtonProps> = ({
  language,
  onSuggest,
  isLoading = false,
  disabled = false,
  hasContent = true
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getLanguageConfig = (lang: EditorLanguage) => {
    switch (lang) {
      case 'html':
        return {
          gradient: 'from-orange-500 via-red-500 to-pink-500',
          hoverGradient: 'from-orange-600 via-red-600 to-pink-600',
          glowColor: 'rgba(251, 146, 60, 0.15)',
          icon: <Brain className="w-3.5 h-3.5" />,
          contextLabel: 'Improve HTML',
          loadingLabel: 'Improving...'
        };
      case 'css':
        return {
          gradient: 'from-blue-500 via-cyan-500 to-teal-500',
          hoverGradient: 'from-blue-600 via-cyan-600 to-teal-600',
          glowColor: 'rgba(59, 130, 246, 0.15)',
          icon: <Zap className="w-3.5 h-3.5" />,
          contextLabel: 'Fix CSS',
          loadingLabel: 'Fixing...'
        };
      case 'javascript':
        return {
          gradient: 'from-yellow-500 via-amber-500 to-orange-500',
          hoverGradient: 'from-yellow-600 via-amber-600 to-orange-600',
          glowColor: 'rgba(234, 179, 8, 0.15)',
          icon: <Sparkles className="w-3.5 h-3.5" />,
          contextLabel: 'Optimize JS',
          loadingLabel: 'Optimizing...'
        };
      default:
        return {
          gradient: 'from-purple-500 via-pink-500 to-rose-500',
          hoverGradient: 'from-purple-600 via-pink-600 to-rose-600',
          glowColor: 'rgba(168, 85, 247, 0.15)',
          icon: <Wand2 className="w-3.5 h-3.5" />,
          contextLabel: 'AI Enhance',
          loadingLabel: 'Enhancing...'
        };
    }
  };

  const config = getLanguageConfig(language);

  if (!hasContent) {
    return (
      <div className="absolute top-3 right-3 z-10">
        <div className="px-2 py-1 bg-gray-800/80 backdrop-blur-sm text-gray-400 text-xs rounded border border-gray-600/50">
          <span className="hidden sm:inline">Add {language.toUpperCase()} code</span>
          <span className="sm:hidden">Add code</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-3 right-3 z-10">
      {/* Soft gradient border container */}
      <div className="relative group">
        {/* Subtle gradient glow (visible on hover and when loading) */}
        <div
          className={`
            absolute -inset-0.5 bg-gradient-to-r ${config.gradient} rounded-md blur-sm opacity-0
            ${isHovered || isLoading ? 'opacity-30' : ''}
            transition-opacity duration-600 ease-in-out
          `}
          style={{
            boxShadow: `0 0 12px ${config.glowColor}`
          }}
        />

        {/* Main Button - Compact Size */}
        <button
          onClick={onSuggest}
          disabled={disabled || isLoading || !hasContent}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            relative flex items-center gap-1.5 px-2.5 py-1.5
            bg-gradient-to-r ${isHovered && !isLoading ? config.hoverGradient : config.gradient}
            text-white text-xs font-medium
            rounded-md shadow-md border border-white/20
            transition-all duration-600 ease-in-out
            hover:shadow-lg hover:scale-[1.01] hover:-translate-y-px
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0
            backdrop-blur-sm
            overflow-hidden
          `}
          title={`${config.contextLabel} - Analyze and improve your ${language.toUpperCase()} code with AI`}
        >
          {/* Gentle shimmer effect when loading */}
          {isLoading && (
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          )}

          {/* Icon with soft rotation when loading */}
          <div className="relative flex items-center justify-center">
            <div className={`${isLoading ? 'animate-[spin_1.5s_linear_infinite]' : ''} transition-transform duration-600`}>
              {config.icon}
            </div>
          </div>

          {/* Compact Context Label */}
          <span className="hidden sm:inline leading-tight">
            {isLoading ? config.loadingLabel : config.contextLabel}
          </span>
          <span className="sm:hidden leading-tight">
            {isLoading ? '...' : 'AI'}
          </span>

          {/* Subtle progress indicator when loading */}
          {isLoading && (
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10">
              <div className="h-full bg-white/40 animate-[progress_3s_ease-in-out_infinite]" />
            </div>
          )}
        </button>
      </div>

      {/* Keyframes for soft animations */}
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AISuggestButton;