import React, { useState } from 'react';
import { Check, Download, FileText, Globe, Link2, Loader2, Music, Play, Sparkles, X } from 'lucide-react';
import { DeezerService } from '../services/deezerService';
import { AudioQuality, Track } from '../types';
import { ArtworkVisual } from './ArtworkVisual';

interface LinkDownloaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQueueTracks: (tracks: Track[], quality: AudioQuality) => void;
  onPlayTrack: (track: Track) => void;
  preferredQuality: AudioQuality;
}

export const LinkDownloaderModal: React.FC<LinkDownloaderModalProps> = ({
  isOpen,
  onClose,
  onQueueTracks,
  onPlayTrack,
  preferredQuality
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [resolvedResult, setResolvedResult] = useState<{
    title: string;
    description: string;
    coverGradient: string;
    tracks: Track[];
    type: string;
  } | null>(null);
  const [selectedTrackIds, setSelectedTrackIds] = useState<Set<string>>(new Set());
  const [chosenQuality, setChosenQuality] = useState<AudioQuality>(preferredQuality);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResolve = async () => {
    if (!urlInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const parsed = DeezerService.parseLink(urlInput);
      const result = await DeezerService.resolveUrl(parsed);
      setResolvedResult(result);
      setSelectedTrackIds(new Set(result.tracks.map(t => t.id)));
    } catch (e: any) {
      setError('Could not parse or resolve the provided link. Please check the URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTrack = (id: string) => {
    const next = new Set(selectedTrackIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedTrackIds(next);
  };

  const handleSelectAll = () => {
    if (!resolvedResult) return;
    if (selectedTrackIds.size === resolvedResult.tracks.length) {
      setSelectedTrackIds(new Set());
    } else {
      setSelectedTrackIds(new Set(resolvedResult.tracks.map(t => t.id)));
    }
  };

  const handleDownload = () => {
    if (!resolvedResult) return;
    const tracksToQueue = resolvedResult.tracks.filter(t => selectedTrackIds.has(t.id));
    if (tracksToQueue.length > 0) {
      onQueueTracks(tracksToQueue, chosenQuality);
      onClose();
      setUrlInput('');
      setResolvedResult(null);
    }
  };

  const sampleLinks = [
    { label: 'Deezer Track', url: 'https://www.deezer.com/track/3135556' },
    { label: 'Daft Punk Album', url: 'https://open.spotify.com/album/4m28RiFD0zR2F1qE70u2K1' },
    { label: 'Lossless Playlist', url: 'https://www.deezer.com/playlist/ply-audiophile-masters' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-neutral-100">Link Downloader & Converter</h2>
              <p className="text-xs text-neutral-400">Paste Spotify, Deezer, Apple Music, or ISRC track/album URLs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* URL Input Bar */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950/60 space-y-3 shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleResolve()}
                placeholder="Paste URL (e.g. https://www.deezer.com/album/..., open.spotify.com/track/...)"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
              />
            </div>
            <button
              onClick={handleResolve}
              disabled={loading || !urlInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all shrink-0 shadow"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Resolve</span>
            </button>
          </div>

          {/* Preset test links */}
          <div className="flex items-center gap-2 text-[11px] text-neutral-400 flex-wrap">
            <span className="text-neutral-500 font-medium">Quick examples:</span>
            {sampleLinks.map(s => (
              <button
                key={s.label}
                onClick={() => {
                  setUrlInput(s.url);
                }}
                className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-cyan-400 transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resolved Content or Placeholder */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {resolvedResult ? (
            <div className="space-y-4">
              {/* Header card */}
              <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center gap-4">
                <ArtworkVisual gradient={resolvedResult.coverGradient} size="md" title={resolvedResult.title} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {resolvedResult.type}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      {resolvedResult.tracks.length} track{resolvedResult.tracks.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-neutral-100 text-base truncate">
                    {resolvedResult.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-1">{resolvedResult.description}</p>
                </div>
              </div>

              {/* Track Selection Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase font-mono tracking-wider text-neutral-400">
                    Tracks to Download ({selectedTrackIds.size}/{resolvedResult.tracks.length})
                  </span>
                  <button
                    onClick={handleSelectAll}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                  >
                    {selectedTrackIds.size === resolvedResult.tracks.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {resolvedResult.tracks.map((t, idx) => {
                    const isSelected = selectedTrackIds.has(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleToggleTrack(t.id)}
                        className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-neutral-950 border-cyan-500/50 text-neutral-100'
                            : 'bg-neutral-950/40 border-neutral-800/60 text-neutral-400 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                              isSelected ? 'bg-cyan-500 border-cyan-400 text-neutral-950' : 'border-neutral-700 bg-neutral-900'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="font-mono text-xs text-neutral-500 w-5 text-right">{idx + 1}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate text-neutral-200">{t.title}</div>
                            <div className="text-[11px] text-neutral-500 truncate">{t.artist}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-mono shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayTrack(t);
                            }}
                            className="p-1 rounded text-neutral-400 hover:text-cyan-400 hover:bg-neutral-800 transition-colors"
                            title="Preview track"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <span className="text-cyan-400 text-[11px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                            {chosenQuality === 'FLAC' ? `${t.sizeFlacMb} MB` : `${t.size320Mb} MB`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-neutral-500 space-y-2">
              <Globe className="w-10 h-10 mx-auto text-neutral-700" />
              <p className="text-xs font-medium text-neutral-400">Paste any music streaming URL above</p>
              <p className="text-[11px] text-neutral-600 max-w-sm mx-auto">
                Supports Deezer track, album, artist, playlist URLs, Spotify links, and Apple Music IDs
              </p>
            </div>
          )}
        </div>

        {/* Footer with Quality Selector and Download Action */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-medium">Quality:</span>
            <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
              <button
                type="button"
                onClick={() => setChosenQuality('FLAC')}
                className={`px-2 py-1 text-xs font-mono font-medium rounded transition-colors ${
                  chosenQuality === 'FLAC' ? 'bg-cyan-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                FLAC Lossless
              </button>
              <button
                type="button"
                onClick={() => setChosenQuality('MP3_320')}
                className={`px-2 py-1 text-xs font-mono font-medium rounded transition-colors ${
                  chosenQuality === 'MP3_320' ? 'bg-cyan-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                320K MP3
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              disabled={!resolvedResult || selectedTrackIds.size === 0}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-neutral-950 text-xs font-bold transition-all shadow flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Queue {selectedTrackIds.size} Track{selectedTrackIds.size > 1 ? 's' : ''}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
