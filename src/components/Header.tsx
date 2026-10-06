import React, { useState } from 'react';
import { Download, Key, Link2, Search, Sliders, Sparkles, User, Volume2, ShieldCheck, AlertCircle } from 'lucide-react';
import { AudioQuality, UserAccount } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeQueueCount: number;
  onOpenQueue: () => void;
  onOpenLinkModal: () => void;
  onOpenAccountModal: () => void;
  userAccount: UserAccount;
  preferredQuality: AudioQuality;
  onQualityChange: (q: AudioQuality) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  activeQueueCount,
  onOpenQueue,
  onOpenLinkModal,
  onOpenAccountModal,
  userAccount,
  preferredQuality,
  onQualityChange
}) => {
  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shrink-0">
      {/* Search Input Bar */}
      <div className="relative flex-1 max-w-xl">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search tracks, albums, artists, ISRC, or paste Deezer / Spotify link..."
          className="w-full bg-neutral-900/90 hover:bg-neutral-900 text-sm text-neutral-100 placeholder-neutral-500 rounded-lg pl-10 pr-4 py-2 border border-neutral-800 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-200 px-1.5 py-0.5 rounded bg-neutral-800"
          >
            Clear
          </button>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick URL Link Downloader Button */}
        <button
          onClick={onOpenLinkModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-cyan-500/40 text-xs font-medium text-neutral-200 hover:text-white transition-all shadow-sm"
          title="Paste URL to Download"
        >
          <Link2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Paste URL</span>
        </button>

        {/* Audio Quality Selector */}
        <div className="hidden md:flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => onQualityChange('FLAC')}
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors ${
              preferredQuality === 'FLAC'
                ? 'bg-cyan-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            FLAC
          </button>
          <button
            onClick={() => onQualityChange('MP3_320')}
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors ${
              preferredQuality === 'MP3_320'
                ? 'bg-cyan-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            320K
          </button>
          <button
            onClick={() => onQualityChange('MP3_128')}
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors ${
              preferredQuality === 'MP3_128'
                ? 'bg-cyan-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            128K
          </button>
        </div>

        {/* Download Queue Trigger */}
        <button
          onClick={onOpenQueue}
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-neutral-950 transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-neutral-950" />
          <span className="hidden sm:inline">Queue</span>
          {activeQueueCount > 0 && (
            <span className="flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-neutral-950 text-cyan-400 font-mono text-[10px] font-bold animate-pulse">
              {activeQueueCount}
            </span>
          )}
        </button>

        {/* ARL Token & Account Status */}
        <button
          onClick={onOpenAccountModal}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 transition-colors"
          title="Deezer ARL & Account Settings"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="hidden lg:inline font-mono text-[11px] text-emerald-400 font-medium">
            Hi-Fi ARL Active
          </span>
        </button>
      </div>
    </header>
  );
};
