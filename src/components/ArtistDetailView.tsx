import React from 'react';
import { ArrowLeft, CheckCircle2, Download, Layers, Play, Sparkles, Users } from 'lucide-react';
import { Album, Artist, AudioQuality, Track } from '../types';
import { ArtworkVisual } from './ArtworkVisual';

interface ArtistDetailViewProps {
  artist: Artist;
  onBack: () => void;
  onPlayTrack: (track: Track) => void;
  onQueueTrack: (track: Track, quality?: AudioQuality) => void;
  onQueueBatch: (tracks: Track[], quality?: AudioQuality) => void;
  onSelectAlbum: (album: Album) => void;
  currentPlayingTrack: Track | null;
  isPlaying: boolean;
  preferredQuality: AudioQuality;
}

export const ArtistDetailView: React.FC<ArtistDetailViewProps> = ({
  artist,
  onBack,
  onPlayTrack,
  onQueueTrack,
  onQueueBatch,
  onSelectAlbum,
  currentPlayingTrack,
  isPlaying,
  preferredQuality
}) => {
  return (
    <div className="space-y-8 pb-20">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-neutral-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Artist Profile Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-xl">
        <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr ${artist.avatarGradient} flex items-center justify-center text-4xl font-bold font-display text-white shadow-2xl border-4 border-neutral-800 shrink-0`}>
          {artist.name.charAt(0)}
        </div>

        <div className="flex-1 text-center md:text-left space-y-3 min-w-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {artist.verified && (
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED ARTIST
              </span>
            )}
            <span className="text-xs font-mono text-neutral-400">
              {(artist.monthlyListeners / 1000000).toFixed(1)}M Monthly Listeners
            </span>
          </div>

          <h1 className="font-display font-black text-2xl sm:text-4xl text-neutral-100 tracking-tight">
            {artist.name}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl font-normal">
            {artist.bio}
          </p>

          <div className="flex items-center justify-center md:justify-start gap-1.5 flex-wrap pt-1">
            {artist.genres.map(g => (
              <span key={g} className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                {g}
              </span>
            ))}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={() => onQueueBatch(artist.topTracks, preferredQuality)}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all shadow"
            >
              <Download className="w-4 h-4" />
              <span>Download Top Tracks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Tracks */}
      <section className="space-y-3">
        <h3 className="font-display font-bold text-base text-neutral-200">Popular Tracks</h3>
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800/60">
          {artist.topTracks.map((track, idx) => {
            const isCurrent = currentPlayingTrack?.id === track.id;
            return (
              <div
                key={track.id}
                className={`p-3 sm:px-4 flex items-center justify-between gap-3 group transition-colors ${
                  isCurrent ? 'bg-cyan-500/10' : 'hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="font-mono text-xs text-neutral-500 w-5 text-right">{idx + 1}</span>
                  <ArtworkVisual gradient={track.coverGradient} size="sm" isPlaying={isCurrent && isPlaying} />
                  <div className="min-w-0 flex-1">
                    <span
                      onClick={() => onPlayTrack(track)}
                      className={`text-xs font-semibold truncate cursor-pointer hover:underline block ${
                        isCurrent ? 'text-cyan-300' : 'text-neutral-100'
                      }`}
                    >
                      {track.title}
                    </span>
                    <span className="text-[11px] text-neutral-400 truncate block">{track.album}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono shrink-0">
                  <span className="text-neutral-400 hidden sm:inline">{track.sizeFlacMb} MB</span>
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
      </section>

      {/* Discography */}
      <section className="space-y-3">
        <h3 className="font-display font-bold text-base text-neutral-200">Discography</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {artist.albums.map(album => (
            <div
              key={album.id}
              onClick={() => onSelectAlbum(album)}
              className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 group cursor-pointer transition-all"
            >
              <ArtworkVisual gradient={album.coverGradient} size="lg" className="w-full aspect-square mb-2.5" />
              <h4 className="font-bold text-xs text-neutral-100 truncate group-hover:text-cyan-300">
                {album.title}
              </h4>
              <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{album.releaseYear} · {album.tracks.length} tracks</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
