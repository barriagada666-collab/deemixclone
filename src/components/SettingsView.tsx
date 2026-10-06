import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Folder,
  Key,
  RefreshCw,
  Save,
  Settings,
  Sliders,
  Sparkles,
  Tag,
  Wrench
} from 'lucide-react';
import { AudioQuality, DeemixSettings } from '../types';

interface SettingsViewProps {
  settings: DeemixSettings;
  onUpdateSettings: (settings: DeemixSettings) => void;
  onOpenAccountModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onOpenAccountModal
}) => {
  const [form, setForm] = useState<DeemixSettings>({ ...settings });
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    onUpdateSettings(form);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const sampleFormattedTrack = form.trackNameTemplate
    .replace(/%artist%/g, 'Daft Punk')
    .replace(/%title%/g, 'Get Lucky')
    .replace(/%album%/g, 'Random Access Memories')
    .replace(/%year%/g, '2013')
    .replace(/%track%/g, '08')
    .replace(/%genre%/g, 'Disco')
    .replace(/%isrc%/g, 'USQX91300108') + `.${form.preferredQuality === 'FLAC' ? 'flac' : 'mp3'}`;

  return (
    <div className="space-y-8 pb-24 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h2 className="font-display font-black text-2xl text-neutral-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            <span>Deemix Engine Settings</span>
          </h2>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Configure download codecs, ID3 tag templates, LRC lyrics, and bitrate policies
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all shadow"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      {savedToast && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Settings saved successfully and applied to download workers.</span>
        </div>
      )}

      {/* Audio Quality & Codecs */}
      <section className="space-y-4 p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <h3 className="font-display font-bold text-sm text-neutral-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <span>01. Audio Bitrate & Quality Preset</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'FLAC', label: 'FLAC Lossless', desc: '1411 kbps 16-bit / 44.1 kHz Studio Quality', badge: 'LOSSLESS' },
            { id: 'MP3_320', label: 'MP3 320 kbps', desc: 'High Quality CBR Audio Master', badge: 'HQ' },
            { id: 'MP3_128', label: 'MP3 128 kbps', desc: 'Standard Quality Lightweight Files', badge: 'COMPACT' }
          ].map(q => (
            <button
              key={q.id}
              type="button"
              onClick={() => setForm({ ...form, preferredQuality: q.id as AudioQuality })}
              className={`p-4 rounded-xl border text-left transition-all ${
                form.preferredQuality === q.id
                  ? 'bg-neutral-950 border-cyan-500 text-neutral-100 ring-1 ring-cyan-500/40 shadow-sm'
                  : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs text-neutral-100 mb-1">
                <span>{q.label}</span>
                <span className="text-[10px] font-mono text-cyan-400 px-1 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                  {q.badge}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">{q.desc}</p>
            </button>
          ))}
        </div>

        <div className="pt-2 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-200 block">Fallback Bitrate Quality</span>
            <span className="text-[11px] text-neutral-400">If FLAC is unavailable for a track, automatically fallback to MP3 320kbps</span>
          </div>
          <input
            type="checkbox"
            checked={form.fallbackQuality}
            onChange={e => setForm({ ...form, fallbackQuality: e.target.checked })}
            className="w-4 h-4 rounded text-cyan-500 bg-neutral-950 border-neutral-700"
          />
        </div>
      </section>

      {/* File & Folder Naming Templates */}
      <section className="space-y-4 p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <h3 className="font-display font-bold text-sm text-neutral-200 uppercase tracking-wider font-mono">
          02. File & Folder Naming Template
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Track File Naming Template
            </label>
            <input
              type="text"
              value={form.trackNameTemplate}
              onChange={e => setForm({ ...form, trackNameTemplate: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
            <div className="mt-1.5 p-2 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-neutral-500">Live Preview Output:</span>
              <span className="text-neutral-200">{sampleFormattedTrack}</span>
            </div>
          </div>

          <div className="text-[11px] text-neutral-400 flex flex-wrap gap-2 pt-1 font-mono">
            <span className="text-neutral-500">Available variables:</span>
            <code className="text-cyan-400 bg-neutral-950 px-1 py-0.5 rounded">%artist%</code>
            <code className="text-cyan-400 bg-neutral-950 px-1 py-0.5 rounded">%title%</code>
            <code className="text-cyan-400 bg-neutral-950 px-1 py-0.5 rounded">%album%</code>
            <code className="text-cyan-400 bg-neutral-950 px-1 py-0.5 rounded">%year%</code>
            <code className="text-cyan-400 bg-neutral-950 px-1 py-0.5 rounded">%track%</code>
            <code className="text-cyan-400 bg-neutral-950 px-1 py-0.5 rounded">%isrc%</code>
          </div>
        </div>
      </section>

      {/* Metadata & Tagging Options */}
      <section className="space-y-4 p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <h3 className="font-display font-bold text-sm text-neutral-200 uppercase tracking-wider font-mono">
          03. Metadata & Companion Files
        </h3>

        <div className="space-y-3 divide-y divide-neutral-800/60">
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-xs font-semibold text-neutral-200 block">Embed High-Resolution Album Artwork</span>
              <span className="text-[11px] text-neutral-400">Embed Cover into FLAC Vorbis / ID3v2.4 frame</span>
            </div>
            <input
              type="checkbox"
              checked={form.embedCoverArt}
              onChange={e => setForm({ ...form, embedCoverArt: e.target.checked })}
              className="w-4 h-4 rounded text-cyan-500 bg-neutral-950 border-neutral-700"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="text-xs font-semibold text-neutral-200 block">Save Synchronized (.lrc) Lyrics File</span>
              <span className="text-[11px] text-neutral-400">Export timed karaoke lyrics alongside track for offline players</span>
            </div>
            <input
              type="checkbox"
              checked={form.saveLyricsFile}
              onChange={e => setForm({ ...form, saveLyricsFile: e.target.checked })}
              className="w-4 h-4 rounded text-cyan-500 bg-neutral-950 border-neutral-700"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="text-xs font-semibold text-neutral-200 block">Save Playlist (.m3u8) File</span>
              <span className="text-[11px] text-neutral-400">Create index playlist files for media servers and DAP players</span>
            </div>
            <input
              type="checkbox"
              checked={form.savePlaylistM3U}
              onChange={e => setForm({ ...form, savePlaylistM3U: e.target.checked })}
              className="w-4 h-4 rounded text-cyan-500 bg-neutral-950 border-neutral-700"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="text-xs font-semibold text-neutral-200 block">Save Separate Cover.jpg in Album Folder</span>
              <span className="text-[11px] text-neutral-400">Saves 1400x1400 high-resolution cover image</span>
            </div>
            <input
              type="checkbox"
              checked={form.saveCoverFile}
              onChange={e => setForm({ ...form, saveCoverFile: e.target.checked })}
              className="w-4 h-4 rounded text-cyan-500 bg-neutral-950 border-neutral-700"
            />
          </div>
        </div>
      </section>

      {/* Concurrency & Network */}
      <section className="space-y-4 p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <h3 className="font-display font-bold text-sm text-neutral-200 uppercase tracking-wider font-mono">
          04. Concurrency & Network Bandwidth
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Max Concurrent Downloads ({form.maxConcurrentDownloads} workers)
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={form.maxConcurrentDownloads}
              onChange={e => setForm({ ...form, maxConcurrentDownloads: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Bandwidth Throttle: {form.speedLimitMbps === 0 ? 'Unlimited' : `${form.speedLimitMbps} MB/s`}
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={form.speedLimitMbps}
              onChange={e => setForm({ ...form, speedLimitMbps: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
