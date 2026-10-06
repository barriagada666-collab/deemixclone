import React from 'react';
import { ArrowLeft, Clock, Disc3, Download, Hash, Music2, Play, Sparkles } from 'lucide-react';
import { Album, AudioQuality, Track } from '../types';
import { ArtworkVisual } from './ArtworkVisual';

interface AlbumDetailViewProps {
  album: Album;
  onBack: () => void;
  onPlayTrack: (track: Track) => void;
  onQueueTrack: (track: Track, quality?: AudioQuality) => void;
  onQueueBatch: (tracks: Track[], quality?: AudioQuality) => void;
  currentPlayingTrack: Track | null;
  isPlaying: boolean;
  preferredQuality: AudioQuality;
}

export const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({
  album,
  onBack,
  onPlayTrack,
  onQueueTrack,
  onQueueBatch,
  currentPlayingTrack,
  isPlaying,
  preferredQuality
}) => {
  const totalMbFlac = album.tracks.reduce((acc, t) => acc + t.sizeFlacMb, 0).toFixed(1);
  const totalMb320 = album.tracks.reduce((acc, t) => acc + t.size320Mb, 0).toFixed(1);

  return (
    <div className="space-y-6 pb-20">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-neutral-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Discover</span>
      </button>

      {/* Album Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-xl relative overflow-hidden">
        <ArtworkVisual gradient={album.coverGradient} size="xl" isPlaying={currentPlayingTrack?.albumId === album.id && isPlaying} />

        <div className="flex-1 text-center md:text-left space-y-3 min-w-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-mono">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
              {album.type.toUpperCase()}
            </span>
            <span className="text-neutral-400">{album.releaseYear}</span>
            <span>·</span>
            <span className="text-neutral-400">{album.genre}</span>
            <span>·</span>
            <span className="text-cyan-400 font-semibold">{totalMbFlac} MB FLAC</span>
          </div>

          <h1 className="font-display font-black text-2xl sm:text-4xl text-neutral-100 tracking-tight">
            {album.title}
          </h1>

          <p className="text-sm text-neutral-300 font-medium">
            Artist: <span className="text-white font-semibold">{album.artist}</span> · Label: {album.recordLabel}
          </p>

          <p className="text-xs font-mono text-neutral-500">
            UPC: {album.upc} · Total Tracks: {album.tracks.length}
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={() => onPlayTrack(album.tracks[0])}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all shadow"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Album</span>
            </button>

            <button
              onClick={() => onQueueBatch(album.tracks, 'FLAC')}
              className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-semibold text-xs flex items-center gap-2 border border-neutral-700 transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download FLAC ({totalMbFlac} MB)</span>
            </button>

            <button
              onClick={() => onQueueBatch(album.tracks, 'MP3_320')}
              className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium border border-neutral-800 transition-all"
            >
              <span>MP3 320K ({totalMb320} MB)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tracks Table */}
      <div className="space-y-3">
        <h3 className="font-display font-bold text-base text-neutral-200">Tracklist</h3>

        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="divide-y divide-neutral-800/60">
            {album.tracks.map((track, idx) => {
              const isCurrent = currentPlayingTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  className={`p-3.5 sm:px-5 flex items-center justify-between gap-3 group transition-colors ${
                    isCurrent ? 'bg-cyan-500/10' : 'hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <span className="font-mono text-xs text-neutral-500 w-6 text-right shrink-0">
                      {track.trackNumber || idx + 1}
                    </span>

                    <button
                      onClick={() => onPlayTrack(track)}
                      className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-cyan-400 hover:bg-neutral-700 transition-colors shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => onPlayTrack(track)}
                          className={`text-xs sm:text-sm font-semibold truncate cursor-pointer hover:underline ${
                            isCurrent ? 'text-cyan-300' : 'text-neutral-100'
                          }`}
                        >
                          {track.title}
                        </span>
                        {track.flacAvailable && (
                          <span className="text-[9px] font-mono font-bold px-1 rounded bg-neutral-800 text-cyan-400 border border-neutral-700">
                            FLAC
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-neutral-400 truncate">
                        ISRC: {track.isrc} {track.bpm ? `· ${track.bpm} BPM` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                    <span className="text-neutral-400 hidden sm:inline">{track.sizeFlacMb} MB</span>
                    <span className="text-neutral-500">
                      {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                    </span>
                    <button
                      onClick={() => onQueueTrack(track, preferredQuality)}
                      className="p-2 rounded-lg bg-neutral-800 hover:bg-cyan-500 text-neutral-300 hover:text-neutral-950 transition-colors"
                      title="Download Track"
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
    </div>
  );
};
