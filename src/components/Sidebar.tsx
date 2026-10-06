import React from 'react';
import {
  Compass,
  Download,
  FolderHeart,
  HardDrive,
  KeyRound,
  Layers,
  ListMusic,
  Radio,
  Settings,
  Sparkles,
  Tag,
  Users,
  Wrench
} from 'lucide-react';

export type MainNavView = 'discover' | 'charts' | 'albums' | 'artists' | 'playlists' | 'queue' | 'library' | 'settings';

interface SidebarProps {
  currentView: MainNavView;
  onSelectView: (view: MainNavView) => void;
  queueCount: number;
  downloadedCount: number;
  onOpenLinkModal: () => void;
  onOpenAccountModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  queueCount,
  downloadedCount,
  onOpenLinkModal,
  onOpenAccountModal
}) => {
  const navItems: { id: MainNavView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'discover', label: 'Discover & Search', icon: <Compass className="w-4 h-4" /> },
    { id: 'charts', label: 'Hi-Res Charts', icon: <Sparkles className="w-4 h-4 text-cyan-400" /> },
    { id: 'albums', label: 'Master Albums', icon: <Layers className="w-4 h-4" /> },
    { id: 'artists', label: 'Artists', icon: <Users className="w-4 h-4" /> },
    { id: 'playlists', label: 'Curated Playlists', icon: <ListMusic className="w-4 h-4" /> },
    { id: 'queue', label: 'Download Queue', icon: <Download className="w-4 h-4" />, badge: queueCount },
    { id: 'library', label: 'Offline Library', icon: <HardDrive className="w-4 h-4" />, badge: downloadedCount },
    { id: 'settings', label: 'Engine Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-60 sm:w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col justify-between shrink-0 h-full select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-neutral-950 font-black text-lg tracking-tighter shadow-md">
            d
          </div>
          <div>
            <h1 className="font-display font-bold text-base tracking-tight text-neutral-100 flex items-center gap-1.5">
              deemix <span className="text-[10px] font-mono text-cyan-400 font-normal px-1 py-0.5 rounded bg-neutral-900 border border-neutral-800">v3.8</span>
            </h1>
            <p className="text-[11px] text-neutral-500 font-medium">Audiophile Lossless Downloader</p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 px-3 mb-2 font-mono">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map(item => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-neutral-900 text-cyan-400 font-semibold border border-neutral-800 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        active ? 'bg-cyan-500/20 text-cyan-300' : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Tools & Fixes */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 px-3 mb-2 font-mono">
            Direct Actions
          </div>
          <div className="space-y-1">
            <button
              onClick={onOpenLinkModal}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-cyan-300 hover:bg-neutral-900/50 transition-colors text-left"
            >
              <Radio className="w-4 h-4 text-cyan-500" />
              <span>Convert URL to FLAC</span>
            </button>
            <button
              onClick={onOpenAccountModal}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-emerald-400 hover:bg-neutral-900/50 transition-colors text-left"
            >
              <KeyRound className="w-4 h-4 text-emerald-500" />
              <span>ARL Token & Hi-Fi Status</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-950/60">
        <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
            <span className="font-medium">Deezer Stream</span>
            <span className="text-emerald-400 font-mono font-semibold">1411 kbps</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
            <span>FLAC 16-bit / 44.1kHz</span>
            <span className="text-cyan-400">Lossless</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
