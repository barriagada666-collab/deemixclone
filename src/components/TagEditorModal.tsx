import React, { useState } from 'react';
import { Check, Edit3, Save, Tag, X } from 'lucide-react';
import { Track } from '../types';
import { ArtworkVisual } from './ArtworkVisual';

interface TagEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  onSaveTrack: (updatedTrack: Track) => void;
}

export const TagEditorModal: React.FC<TagEditorModalProps> = ({
  isOpen,
  onClose,
  track,
  onSaveTrack
}) => {
  if (!isOpen || !track) return null;

  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [album, setAlbum] = useState(track.album);
  const [genre, setGenre] = useState(track.genre);
  const [year, setYear] = useState(track.releaseYear.toString());
  const [trackNumber, setTrackNumber] = useState(track.trackNumber.toString());
  const [discNumber, setDiscNumber] = useState((track.discNumber || 1).toString());
  const [isrc, setIsrc] = useState(track.isrc);

  const handleSave = () => {
    const updated: Track = {
      ...track,
      title: title.trim() || track.title,
      artist: artist.trim() || track.artist,
      album: album.trim() || track.album,
      genre: genre.trim() || track.genre,
      releaseYear: parseInt(year) || track.releaseYear,
      trackNumber: parseInt(trackNumber) || track.trackNumber,
      discNumber: parseInt(discNumber) || 1,
      isrc: isrc.trim() || track.isrc
    };
    onSaveTrack(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-neutral-100">ID3v2.4 / Vorbis Tag Editor</h2>
              <p className="text-xs text-neutral-400">Embedded lossless metadata tagger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center gap-4 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <ArtworkVisual gradient={track.coverGradient} size="md" title={title} artist={artist} />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                Target Bitrate: 1411 kbps FLAC
              </span>
              <h3 className="font-display font-bold text-sm text-neutral-100 truncate mt-1">{title}</h3>
              <p className="text-xs text-neutral-400 truncate">{artist} · {album}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                Track Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                Artist / Track Artist
              </label>
              <input
                type="text"
                value={artist}
                onChange={e => setArtist(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                Album
              </label>
              <input
                type="text"
                value={album}
                onChange={e => setAlbum(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                Genre
              </label>
              <input
                type="text"
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                Release Year
              </label>
              <input
                type="text"
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                Track Number
              </label>
              <input
                type="number"
                value={trackNumber}
                onChange={e => setTrackNumber(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                Disc Number
              </label>
              <input
                type="number"
                value={discNumber}
                onChange={e => setDiscNumber(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                ISRC Code (International Standard Recording Code)
              </label>
              <input
                type="text"
                value={isrc}
                onChange={e => setIsrc(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-cyan-500 uppercase"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all shadow"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Metadata</span>
          </button>
        </div>
      </div>
    </div>
  );
};
