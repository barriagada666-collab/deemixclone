import React, { useState } from 'react';
import {
  Archive,
  ArrowDownToLine,
  Clock,
  Edit,
  FileAudio,
  Folder,
  HardDrive,
  Music,
  Play,
  Search,
  Tag,
  Trash2
} from 'lucide-react';
import { downloadManager } from '../services/downloadManager';
import { DownloadItem, Track } from '../types';
import { ArtworkVisual } from './ArtworkVisual';

interface LibraryViewProps {
  downloadedItems: DownloadItem[];
  onPlayTrack: (track: Track) => void;
  onEditTags: (track: Track) => void;
  currentPlayingTrack: Track | null;
  isPlaying: boolean;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  downloadedItems,
  onPlayTrack,
  onEditTags,
  currentPlayingTrack,
  isPlaying
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFormat, setFilterFormat] = useState<'all' | 'FLAC' | 'MP3_320'>('all');

  const filtered = downloadedItems.filter(item => {
    const matchesSearch =
      item.track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.track.album.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = filterFormat === 'all' || item.quality === filterFormat;
    return matchesSearch && matchesFormat;
  });

  const totalSizeMb = downloadedItems.reduce((acc, i) => acc + (i.totalBytes / (1024 * 1024)), 0).toFixed(1);

  return (
    <div className="space-y-6 pb-20">
      {/* Library Header */}
      <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HardDrive className="w-6 h-6 text-cyan-400" />
            <h2 className="font-display font-black text-2xl text-neutral-100">Offline Music Library</h2>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
              {downloadedItems.length} Tracks
            </span>
          </div>
          <p className="text-xs text-neutral-400 font-mono">
            {totalSizeMb} MB Storage Used · Tagged & Lossless Ready
          </p>
        </div>

        {downloadedItems.length > 0 && (
          <button
            onClick={() => downloadManager.exportAllCompletedZip()}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all shadow"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Export Library as ZIP</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Filter downloaded tracks..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800 self-start sm:self-auto">
          <button
            onClick={() => setFilterFormat('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              filterFormat === 'all' ? 'bg-cyan-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All Formats
          </button>
          <button
            onClick={() => setFilterFormat('FLAC')}
            className={`px-3 py-1 text-xs font-mono font-medium rounded-lg transition-colors ${
              filterFormat === 'FLAC' ? 'bg-cyan-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            FLAC
          </button>
          <button
            onClick={() => setFilterFormat('MP3_320')}
            className={`px-3 py-1 text-xs font-mono font-medium rounded-lg transition-colors ${
              filterFormat === 'MP3_320' ? 'bg-cyan-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            MP3 320k
          </button>
        </div>
      </div>

      {/* Track List */}
      {filtered.length > 0 ? (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800/60">
          {filtered.map(item => {
            const isCurrent = currentPlayingTrack?.id === item.track.id;
            return (
              <div
                key={item.id}
                className={`p-3.5 sm:px-5 flex items-center justify-between gap-3 group transition-colors ${
                  isCurrent ? 'bg-cyan-500/10' : 'hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <ArtworkVisual gradient={item.track.coverGradient} size="sm" isPlaying={isCurrent && isPlaying} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        onClick={() => onPlayTrack(item.track)}
                        className={`text-xs sm:text-sm font-semibold truncate cursor-pointer hover:underline ${
                          isCurrent ? 'text-cyan-300' : 'text-neutral-100'
                        }`}
                      >
                        {item.track.title}
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-cyan-400 border border-neutral-700">
                        {item.quality}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 truncate">
                      {item.track.artist} · {item.track.album} ({item.track.releaseYear})
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-mono shrink-0">
                  <span className="text-neutral-400 hidden md:inline">
                    {(item.totalBytes / (1024 * 1024)).toFixed(1)} MB
                  </span>

                  <button
                    onClick={() => onPlayTrack(item.track)}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-cyan-400 transition-colors"
                    title="Play Track"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <button
                    onClick={() => onEditTags(item.track)}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                    title="Inspect & Edit ID3 Tags"
                  >
                    <Tag className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => downloadManager.triggerDirectDownload(item)}
                    className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold transition-colors"
                    title="Download File (.flac / .mp3)"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center text-neutral-500 space-y-3 bg-neutral-900/30 border border-neutral-800/60 rounded-3xl">
          <FileAudio className="w-12 h-12 mx-auto text-neutral-700" />
          <h3 className="font-display font-bold text-base text-neutral-300">No downloaded tracks found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Tracks you download in FLAC or 320k will automatically appear here with full metadata inspection and direct playback.
          </p>
        </div>
      )}
    </div>
  );
};
