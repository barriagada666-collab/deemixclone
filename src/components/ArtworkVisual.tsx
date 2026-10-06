import React from 'react';
import { Disc3, Music2, Radio, Sparkles, Volume2 } from 'lucide-react';

interface ArtworkVisualProps {
  gradient: string;
  type?: 'synthwave' | 'cyberpunk' | 'ambient' | 'jazz' | 'rock' | 'pop' | 'electronic' | 'classical' | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  artist?: string;
  isPlaying?: boolean;
  className?: string;
}

export const ArtworkVisual: React.FC<ArtworkVisualProps> = ({
  gradient,
  type = 'electronic',
  size = 'md',
  title,
  artist,
  isPlaying = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10 rounded-md text-xs',
    md: 'w-16 h-16 rounded-lg text-sm',
    lg: 'w-32 h-32 rounded-xl text-base',
    xl: 'w-48 h-48 sm:w-56 sm:h-56 rounded-2xl text-lg'
  };

  const isLarge = size === 'lg' || size === 'xl';

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 select-none shadow-md ${sizeClasses[size]} ${className}`}
    >
      {/* Vinyl record concentric grooves overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="4" fill="currentColor" opacity="0.8" />
        </svg>
      </div>

      {/* Decorative center icon/motif */}
      {size === 'sm' ? (
        <Disc3 className={`w-5 h-5 text-white/80 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
      ) : size === 'md' ? (
        <div className="flex flex-col items-center justify-center">
          <Disc3 className={`w-7 h-7 text-white/90 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/20 mb-2 shadow-inner">
            <Disc3 className={`w-8 h-8 text-white ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          </div>
          {title && (
            <span className="font-display font-bold text-white text-xs sm:text-sm line-clamp-1 drop-shadow-md px-1">
              {title}
            </span>
          )}
          {artist && (
            <span className="text-[11px] text-white/75 line-clamp-1 drop-shadow">
              {artist}
            </span>
          )}
        </div>
      )}

      {/* Hi-Res Lossless Audio Corner Notch on Large covers */}
      {isLarge && (
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono font-semibold tracking-wider text-cyan-300">
          HI-RES FLAC
        </div>
      )}

      {/* Live Audio Visualizer bars overlay when playing */}
      {isPlaying && (
        <div className="absolute bottom-1.5 inset-x-2 flex items-end justify-center gap-0.5 h-3">
          <span className="w-1 bg-cyan-400 rounded-full animate-pulse" style={{ height: '70%', animationDuration: '0.6s' }} />
          <span className="w-1 bg-cyan-300 rounded-full animate-pulse" style={{ height: '100%', animationDuration: '0.4s' }} />
          <span className="w-1 bg-cyan-400 rounded-full animate-pulse" style={{ height: '50%', animationDuration: '0.7s' }} />
          <span className="w-1 bg-cyan-300 rounded-full animate-pulse" style={{ height: '85%', animationDuration: '0.5s' }} />
        </div>
      )}
    </div>
  );
};
