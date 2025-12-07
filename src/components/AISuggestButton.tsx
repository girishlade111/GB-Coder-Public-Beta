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
          glowColor: 'rgba(251, 146, 60, 0.5)',
          icon: <Brain className="w-4 h-4" />,
          contextLabel: 'Improve HTML',
          loadingLabel: 'Improving...'
        };
      case 'css':
        return {
          gradient: 'from-blue-500 via-cyan-500 to-teal-500',
          hoverGradient: 'from-blue-600 via-cyan-600 to-teal-600',
          glowColor: 'rgba(59, 130, 246, 0.5)',
          icon: <Zap className="w-4 h-4" />,
          contextLabel: 'Fix CSS',
          loadingLabel: 'Fixing...'
        };
      case 'javascript':
        return {
          gradient: 'from-yellow-500 via-amber-500 to-orange-500',
          hoverGradient: 'from-yellow-600 via-amber-600 to-orange-600',
          glowColor: 'rgba(234, 179, 8, 0.5)',
          icon: <Sparkles className="w-4 h-4" />,
          contextLabel: 'Optimize JS',
          loadingLabel: 'Optimizing...'
        };
      default:
        return {
          gradient: 'from-purple-500 via-pink-500 to-rose-500',
          hoverGradient: 'from-purple-600 via-pink-600 to-rose-600',
          glowColor: 'rgba(168, 85, 247, 0.5)',
          icon: <Wand2 className="w-4 h-4" />,
          contextLabel: 'AI Enhance',
          loadingLabel: 'Enhancing...'
        };
    }
  };

  const config = getLanguageConfig(language);

  if (!hasContent) {
    return (
      <div className="absolute top-3 right-3 z-10">
        <div className="px-3 py-2 bg-gray-800/80 backdrop-blur-sm text-gray-400 text-sm rounded-lg border border-gray-600/50">
          <span className="hidden sm:inline">Add {language.toUpperCase()} code to enhance</span>
          <span className="sm:hidden">Add code</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-3 right-3 z-10">
      {/* Animated gradient border container */}
      <div className="relative group">
        {/* Animated gradient border (visible on hover and when loading) */}
        <div
          className={`
            absolute -inset-0.5 bg-gradient-to-r ${config.gradient} rounded-lg blur opacity-0
            ${isHovered || isLoading ? 'opacity-75 animate-pulse' : ''}
            transition-opacity duration-300
          `}
          style={{
            boxShadow: `0 0 20px ${config.glowColor}`
          }}
        />

        {/* Main Button */}
        <button
          onClick={onSuggest}
          disabled={disabled || isLoading || !hasContent}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            relative flex items-center gap-2.5 px-4 py-2.5
            bg-gradient-to-r ${isHovered && !isLoading ? config.hoverGradient : config.gradient}
            text-white text-sm font-semibold
            rounded-lg shadow-xl border border-white/30
            transition-all duration-300 ease-out
            hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-0.5
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0
            backdrop-blur-md
            overflow-hidden
          `}
          title={`${config.contextLabel} - Analyze and improve your ${language.toUpperCase()} code with AI`}
        >
          {/* Shimmer effect overlay when loading */}
          {isLoading && (
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          )}

          {/* Icon container with rotation animation when loading */}
          <div className="relative flex items-center justify-center">
            <div className={`${isLoading ? 'animate-spin' : ''} transition-transform duration-300`}>
              {config.icon}
            </div>

            {/* Particle effect on hover */}
            {!isLoading && (
              <>
                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                </div>
                <div className="absolute -bottom-1 -left-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                  <div className="w-1 h-1 bg-white/80 rounded-full animate-ping" />
                </div>
              </>
            )}
          </div>

          {/* Context Label */}
          <div className="flex flex-col items-start">
            <span className="hidden sm:inline leading-tight">
              {isLoading ? config.loadingLabel : config.contextLabel}
            </span>
            <span className="sm:hidden leading-tight">
              {isLoading ? '...' : 'AI'}
            </span>

            {/* Subtle subtitle when not loading */}
            {!isLoading && (
              <span className="hidden md:inline text-[10px] text-white/70 font-normal leading-tight">
                with AI
              </span>
            )}
          </div>

          {/* Progress bar when loading */}
          {isLoading && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
              <div className="h-full bg-white/60 animate-[progress_2s_ease-in-out_infinite]" />
            </div>
          )}
        </button>
      </div>

      {/* Keyframes for custom animations */}
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