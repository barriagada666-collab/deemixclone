import React from 'react';
import { ArrowLeft, Clock, Download, ListMusic, Play, Sparkles } from 'lucide-react';
import { AudioQuality, Playlist, Track } from '../types';
import { ArtworkVisual } from './ArtworkVisual';

interface PlaylistDetailViewProps {
  playlist: Playlist;
  onBack: () => void;
  onPlayTrack: (track: Track) => void;
  onQueueTrack: (track: Track, quality?: AudioQuality) => void;
  onQueueBatch: (tracks: Track[], quality?: AudioQuality) => void;
  currentPlayingTrack: Track | null;
  isPlaying: boolean;
  preferredQuality: AudioQuality;
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({
  playlist,
  onBack,
  onPlayTrack,
  onQueueTrack,
  onQueueBatch,
  currentPlayingTrack,
  isPlaying,
  preferredQuality
}) => {
  const totalMb = playlist.tracks.reduce((acc, t) => acc + (preferredQuality === 'FLAC' ? t.sizeFlacMb : t.size320Mb), 0).toFixed(1);

  return (
    <div className="space-y-6 pb-20">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-neutral-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Playlist Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-xl">
        <ArtworkVisual gradient={playlist.coverGradient} size="xl" isPlaying={isPlaying} />

        <div className="flex-1 text-center md:text-left space-y-3 min-w-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-mono">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
              PLAYLIST
            </span>
            <span className="text-neutral-400">{playlist.tracks.length} Tracks</span>
            <span>·</span>
            <span className="text-cyan-400 font-semibold">{totalMb} MB Total</span>
          </div>

          <h1 className="font-display font-black text-2xl sm:text-4xl text-neutral-100 tracking-tight">
            {playlist.title}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl font-normal">
            {playlist.description}
          </p>

          <p className="text-xs text-neutral-500 font-mono">Curated by {playlist.curator}</p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={() => onPlayTrack(playlist.tracks[0])}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all shadow"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play All</span>
            </button>

            <button
              onClick={() => onQueueBatch(playlist.tracks, preferredQuality)}
              className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-semibold text-xs flex items-center gap-2 border border-neutral-700 transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download Playlist ({preferredQuality})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tracks Table */}
      <div className="space-y-3">
        <h3 className="font-display font-bold text-base text-neutral-200">Track List</h3>
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800/60">
          {playlist.tracks.map((track, idx) => {
            const isCurrent = currentPlayingTrack?.id === track.id;
            return (
              <div
                key={track.id}
                className={`p-3.5 sm:px-5 flex items-center justify-between gap-3 group transition-colors ${
                  isCurrent ? 'bg-cyan-500/10' : 'hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <span className="font-mono text-xs text-neutral-500 w-6 text-right shrink-0">{idx + 1}</span>
                  <ArtworkVisual gradient={track.coverGradient} size="sm" isPlaying={isCurrent && isPlaying} />
                  <div className="min-w-0 flex-1">
                    <span
                      onClick={() => onPlayTrack(track)}
                      className={`text-xs sm:text-sm font-semibold truncate cursor-pointer hover:underline block ${
                        isCurrent ? 'text-cyan-300' : 'text-neutral-100'
                      }`}
                    >
                      {track.title}
                    </span>
                    <span className="text-[11px] text-neutral-400 truncate block">{track.artist} · {track.album}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono shrink-0">
                  <span className="text-neutral-400 hidden sm:inline">{track.sizeFlacMb} MB</span>
                  <span className="text-neutral-500">
                    {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                  </span>
                  <button
                    onClick={() => onPlayTrack(track)}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => onQueueTrack(track, preferredQuality)}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-cyan-500 text-neutral-300 hover:text-neutral-950 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
