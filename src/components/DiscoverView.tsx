import React, { useState } from 'react';
import {
  Clock,
  Download,
  Flame,
  Layers,
  ListMusic,
  MoreVertical,
  Play,
  Radio,
  Sparkles,
  Users,
  Volume2
} from 'lucide-react';
import { Album, Artist, AudioQuality, Playlist, Track } from '../types';
import { ArtworkVisual } from './ArtworkVisual';

interface DiscoverViewProps {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  onPlayTrack: (track: Track) => void;
  onQueueTrack: (track: Track, quality?: AudioQuality) => void;
  onQueueBatch: (tracks: Track[], quality?: AudioQuality) => void;
  onSelectAlbum: (album: Album) => void;
  onSelectArtist: (artist: Artist) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
  currentPlayingTrack: Track | null;
  isPlaying: boolean;
  preferredQuality: AudioQuality;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  tracks,
  albums,
  artists,
  playlists,
  onPlayTrack,
  onQueueTrack,
  onQueueBatch,
  onSelectAlbum,
  onSelectArtist,
  onSelectPlaylist,
  currentPlayingTrack,
  isPlaying,
  preferredQuality
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'tracks' | 'albums' | 'artists' | 'playlists'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  const genres = ['All', 'Electronic', 'Synthwave', 'Jazz', 'Rock', 'Pop', 'Ambient', 'Cinematic'];

  const filteredTracks = tracks.filter(t => {
    if (selectedGenre === 'All') return true;
    return t.genre.toLowerCase().includes(selectedGenre.toLowerCase());
  });

  const featuredAlbum = albums[0];

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Master Feature */}
      {featuredAlbum && (
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-800 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
          <div className="relative group cursor-pointer" onClick={() => onSelectAlbum(featuredAlbum)}>
            <ArtworkVisual gradient={featuredAlbum.coverGradient} size="xl" isPlaying={currentPlayingTrack?.albumId === featuredAlbum.id && isPlaying} />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
              <Play className="w-12 h-12 text-white fill-current drop-shadow-lg" />
            </div>
          </div>

          <div className="flex-1 min-w-0 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold tracking-wider">
                STUDIO MASTER 24-BIT
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {featuredAlbum.releaseYear} · {featuredAlbum.genre} · {featuredAlbum.tracks.length} Tracks
              </span>
            </div>

            <h2
              onClick={() => onSelectAlbum(featuredAlbum)}
              className="font-display font-extrabold text-2xl sm:text-3xl text-neutral-100 tracking-tight cursor-pointer hover:text-cyan-400 transition-colors"
            >
              {featuredAlbum.title}
            </h2>

            <p className="text-sm text-neutral-400 font-medium">
              By <span className="text-neutral-200">{featuredAlbum.artist}</span> · Record Label: {featuredAlbum.recordLabel}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => onPlayTrack(featuredAlbum.tracks[0])}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Album</span>
              </button>

              <button
                onClick={() => onQueueBatch(featuredAlbum.tracks, preferredQuality)}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-semibold text-xs flex items-center gap-2 border border-neutral-700 transition-all shadow-sm"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download Album ({preferredQuality})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {genres.map(g => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedGenre === g
                ? 'bg-neutral-100 text-neutral-950 font-bold shadow-sm'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800/80 hover:border-neutral-700'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Top Lossless Master Tracks Table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-lg text-neutral-100">Trending Lossless Audio</h3>
          </div>
          <button
            onClick={() => onQueueBatch(filteredTracks, preferredQuality)}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All ({filteredTracks.length})</span>
          </button>
        </div>

        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="divide-y divide-neutral-800/60">
            {filteredTracks.map((track, idx) => {
              const isCurrent = currentPlayingTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  className={`p-3 sm:px-4 flex items-center justify-between gap-3 group transition-colors ${
                    isCurrent ? 'bg-cyan-500/10' : 'hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="font-mono text-xs text-neutral-500 w-5 text-right shrink-0">
                      {idx + 1}
                    </span>

                    {/* Artwork with hover play overlay */}
                    <div
                      className="relative cursor-pointer shrink-0"
                      onClick={() => onPlayTrack(track)}
                    >
                      <ArtworkVisual
                        gradient={track.coverGradient}
                        size="sm"
                        isPlaying={isCurrent && isPlaying}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => onPlayTrack(track)}
                          className={`text-xs font-semibold truncate cursor-pointer hover:underline ${
                            isCurrent ? 'text-cyan-300' : 'text-neutral-100'
                          }`}
                        >
                          {track.title}
                        </span>
                        {track.flacAvailable && (
                          <span className="text-[9px] font-mono font-bold px-1 rounded bg-neutral-800 text-cyan-400 border border-neutral-700 hidden sm:inline">
                            FLAC
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate">
                        <span>{track.artist}</span> · <span className="text-neutral-500">{track.album}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata and Actions */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span className="text-[11px] font-mono text-neutral-400 hidden md:inline">
                      {track.sizeFlacMb} MB
                    </span>

                    <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-600" />
                      {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                    </span>

                    {/* Download button */}
                    <button
                      onClick={() => onQueueTrack(track, preferredQuality)}
                      className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-neutral-800 hover:bg-cyan-500 text-neutral-300 hover:text-neutral-950 text-xs font-semibold transition-all border border-neutral-700 hover:border-cyan-400 flex items-center gap-1.5 shadow-sm"
                      title="Add to Download Queue"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Albums Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-lg text-neutral-100">Master Albums</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {albums.map(album => (
            <div
              key={album.id}
              onClick={() => onSelectAlbum(album)}
              className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 group cursor-pointer transition-all hover:-translate-y-1 shadow-sm"
            >
              <div className="relative mb-3">
                <ArtworkVisual gradient={album.coverGradient} size="lg" className="w-full aspect-square" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQueueBatch(album.tracks, preferredQuality);
                  }}
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-cyan-500 text-neutral-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-105"
                  title="Download Album"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <h4 className="font-bold text-xs text-neutral-100 truncate group-hover:text-cyan-300 transition-colors">
                {album.title}
              </h4>
              <p className="text-[11px] text-neutral-400 truncate mt-0.5">{album.artist}</p>
              <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono mt-1.5">
                <span>{album.releaseYear}</span>
                <span className="text-cyan-400 font-semibold">{album.tracks.length} tracks</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Curated Playlists */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-lg text-neutral-100">Audiophile Playlists</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map(pl => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl)}
              className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 flex items-center gap-4 cursor-pointer group transition-all"
            >
              <ArtworkVisual gradient={pl.coverGradient} size="md" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-neutral-100 truncate group-hover:text-cyan-300 transition-colors">
                  {pl.title}
                </h4>
                <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">{pl.description}</p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 mt-1.5">
                  <span className="text-cyan-400">{pl.tracks.length} tracks</span>
                  <span>·</span>
                  <span>{pl.curator}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
