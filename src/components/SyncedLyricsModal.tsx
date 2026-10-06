import React, { useEffect, useRef } from 'react';
import { Disc3, ListMusic, Music, Volume2, X } from 'lucide-react';
import { Track } from '../types';
import { ArtworkVisual } from './ArtworkVisual';

interface SyncedLyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  currentTime: number;
  onSeek: (seconds: number) => void;
}

export const SyncedLyricsModal: React.FC<SyncedLyricsModalProps> = ({
  isOpen,
  onClose,
  track,
  currentTime,
  onSeek
}) => {
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const lyrics = track?.lyrics || [];

  // Find active lyric index
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Smooth autoscroll to active line
  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  if (!isOpen || !track) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-2xl h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Ambient Gradient Glow from Album Art */}
        <div className={`absolute top-0 inset-x-0 h-48 bg-gradient-to-b ${track.coverGradient} opacity-20 pointer-events-none blur-3xl`} />

        {/* Header */}
        <div className="p-5 border-b border-neutral-800/80 flex items-center justify-between z-10 shrink-0 bg-neutral-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <ArtworkVisual gradient={track.coverGradient} size="sm" isPlaying />
            <div>
              <h2 className="font-display font-bold text-sm sm:text-base text-neutral-100 flex items-center gap-2">
                <span>{track.title}</span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  LRC Synced
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-medium">{track.artist} · {track.album}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Synchronized Lyrics Canvas */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-6 py-12 space-y-6 text-center select-none"
        >
          {lyrics.length > 0 ? (
            lyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;

              return (
                <div
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => onSeek(line.time)}
                  className={`cursor-pointer transition-all duration-300 py-1.5 px-4 rounded-xl max-w-lg mx-auto ${
                    isActive
                      ? 'text-cyan-300 font-extrabold text-xl sm:text-2xl scale-105 bg-cyan-500/10 border border-cyan-500/20 shadow-lg'
                      : isPast
                      ? 'text-neutral-400 hover:text-neutral-200 text-base sm:text-lg opacity-80'
                      : 'text-neutral-600 hover:text-neutral-300 text-base sm:text-lg opacity-50'
                  }`}
                >
                  <p className="leading-relaxed tracking-tight">{line.text}</p>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-neutral-500 text-sm">
              <ListMusic className="w-10 h-10 mx-auto text-neutral-700 mb-2" />
              <p>No embedded LRC synchronized lyrics for this track.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/90 flex items-center justify-between text-xs text-neutral-500 font-mono shrink-0">
          <span>Click any line to scrub playback</span>
          <span className="text-cyan-400">Time: {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  );
};
