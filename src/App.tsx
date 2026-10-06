import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CURRENT_USER,
  DEFAULT_SETTINGS,
  INITIAL_ALBUMS,
  INITIAL_ARTISTS,
  INITIAL_PLAYLISTS,
  INITIAL_TRACKS
} from './data/musicCatalog';
import { audioEngine } from './services/audioEngine';
import { DeezerService } from './services/deezerService';
import { downloadManager } from './services/downloadManager';
import { Album, Artist, AudioQuality, DeemixSettings, DownloadItem, Playlist, Track, UserAccount } from './types';

import { AccountManagerModal } from './components/AccountManagerModal';
import { AlbumDetailView } from './components/AlbumDetailView';
import { ArtistDetailView } from './components/ArtistDetailView';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { DiscoverView } from './components/DiscoverView';
import { DownloadQueueView } from './components/DownloadQueueView';
import { EqualizerModal } from './components/EqualizerModal';
import { Header } from './components/Header';
import { LibraryView } from './components/LibraryView';
import { LinkDownloaderModal } from './components/LinkDownloaderModal';
import { PlaylistDetailView } from './components/PlaylistDetailView';
import { SettingsView } from './components/SettingsView';
import { Sidebar, MainNavView } from './components/Sidebar';
import { SyncedLyricsModal } from './components/SyncedLyricsModal';
import { TagEditorModal } from './components/TagEditorModal';

export default function App() {
  // State
  const [currentView, setCurrentView] = useState<MainNavView>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [albums, setAlbums] = useState<Album[]>(INITIAL_ALBUMS);
  const [artists, setArtists] = useState<Artist[]>(INITIAL_ARTISTS);
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);

  // Detail views selection
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Settings & Account
  const [settings, setSettings] = useState<DeemixSettings>(DEFAULT_SETTINGS);
  const [userAccount, setUserAccount] = useState<UserAccount>(CURRENT_USER);

  // Download Queue State
  const [queue, setQueue] = useState<DownloadItem[]>([]);

  // Audio Playback State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Modals
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isLyricsModalOpen, setIsLyricsModalOpen] = useState(false);
  const [isEqualizerModalOpen, setIsEqualizerModalOpen] = useState(false);
  const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);

  // Initialize download manager & subscriptions
  useEffect(() => {
    downloadManager.init(settings);
    const unsubscribe = downloadManager.subscribe(updatedQueue => {
      setQueue(updatedQueue);
    });
    return () => unsubscribe();
  }, []);

  // Sync settings updates to manager
  const handleUpdateSettings = (newSettings: DeemixSettings) => {
    setSettings(newSettings);
    downloadManager.updateSettings(newSettings);
  };

  // Audio Engine Time Tracker
  useEffect(() => {
    audioEngine.onTimeUpdate(t => setCurrentTime(t));
  }, []);

  // Handle Search Filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setTracks(INITIAL_TRACKS);
      setAlbums(INITIAL_ALBUMS);
      setArtists(INITIAL_ARTISTS);
      setPlaylists(INITIAL_PLAYLISTS);
      return;
    }

    let isMounted = true;
    DeezerService.searchCatalog(searchQuery).then(res => {
      if (isMounted) {
        setTracks(res.tracks);
        setAlbums(res.albums);
        setArtists(res.artists);
        setPlaylists(res.playlists);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [searchQuery]);

  // Audio Control Handlers
  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioEngine.pause();
        setIsPlaying(false);
      } else {
        audioEngine.resume();
        setIsPlaying(true);
      }
    } else {
      setCurrentTrack(track);
      audioEngine.playTrack(track, 0);
      setIsPlaying(true);
    }
  };

  const handlePlayPause = () => {
    if (!currentTrack) {
      if (tracks.length > 0) {
        handlePlayTrack(tracks[0]);
      }
      return;
    }
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      audioEngine.resume();
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    const list = tracks;
    if (list.length === 0) return;
    const currentIndex = list.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % list.length;
    handlePlayTrack(list[nextIndex]);
  };

  const handlePrevTrack = () => {
    const list = tracks;
    if (list.length === 0) return;
    const currentIndex = list.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    handlePlayTrack(list[prevIndex]);
  };

  // Queue Handlers
  const handleQueueTrack = (track: Track, quality?: AudioQuality) => {
    downloadManager.addToQueue(track, quality || settings.preferredQuality);
  };

  const handleQueueBatch = (batchTracks: Track[], quality?: AudioQuality) => {
    downloadManager.addBatchToQueue(batchTracks, quality || settings.preferredQuality);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#06b6d4', '#38bdf8', '#818cf8']
      });
    } catch (e) {
      // Ignored
    }
  };

  // Tag Saving
  const handleSaveTrackTags = (updatedTrack: Track) => {
    setTracks(prev => prev.map(t => (t.id === updatedTrack.id ? updatedTrack : t)));
    if (currentTrack?.id === updatedTrack.id) {
      setCurrentTrack(updatedTrack);
    }
  };

  // Derived counts
  const activeQueueCount = queue.filter(q => q.status === 'downloading' || q.status === 'tagging' || q.status === 'queued').length;
  const completedItems = queue.filter(q => q.status === 'completed');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={view => {
          setCurrentView(view);
          setSelectedAlbum(null);
          setSelectedArtist(null);
          setSelectedPlaylist(null);
        }}
        queueCount={activeQueueCount}
        downloadedCount={completedItems.length}
        onOpenLinkModal={() => setIsLinkModalOpen(true)}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
      />

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header
          searchQuery={searchQuery}
          onSearchChange={q => setSearchQuery(q)}
          activeQueueCount={activeQueueCount}
          onOpenQueue={() => {
            setCurrentView('queue');
            setSelectedAlbum(null);
            setSelectedArtist(null);
            setSelectedPlaylist(null);
          }}
          onOpenLinkModal={() => setIsLinkModalOpen(true)}
          onOpenAccountModal={() => setIsAccountModalOpen(true)}
          userAccount={userAccount}
          preferredQuality={settings.preferredQuality}
          onQualityChange={q => handleUpdateSettings({ ...settings, preferredQuality: q })}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          {selectedAlbum ? (
            <AlbumDetailView
              album={selectedAlbum}
              onBack={() => setSelectedAlbum(null)}
              onPlayTrack={handlePlayTrack}
              onQueueTrack={handleQueueTrack}
              onQueueBatch={handleQueueBatch}
              currentPlayingTrack={currentTrack}
              isPlaying={isPlaying}
              preferredQuality={settings.preferredQuality}
            />
          ) : selectedArtist ? (
            <ArtistDetailView
              artist={selectedArtist}
              onBack={() => setSelectedArtist(null)}
              onPlayTrack={handlePlayTrack}
              onQueueTrack={handleQueueTrack}
              onQueueBatch={handleQueueBatch}
              onSelectAlbum={album => {
                setSelectedArtist(null);
                setSelectedAlbum(album);
              }}
              currentPlayingTrack={currentTrack}
              isPlaying={isPlaying}
              preferredQuality={settings.preferredQuality}
            />
          ) : selectedPlaylist ? (
            <PlaylistDetailView
              playlist={selectedPlaylist}
              onBack={() => setSelectedPlaylist(null)}
              onPlayTrack={handlePlayTrack}
              onQueueTrack={handleQueueTrack}
              onQueueBatch={handleQueueBatch}
              currentPlayingTrack={currentTrack}
              isPlaying={isPlaying}
              preferredQuality={settings.preferredQuality}
            />
          ) : currentView === 'queue' ? (
            <DownloadQueueView
              queue={queue}
              onPlayTrack={handlePlayTrack}
              onOpenAccountModal={() => setIsAccountModalOpen(true)}
            />
          ) : currentView === 'library' ? (
            <LibraryView
              downloadedItems={completedItems}
              onPlayTrack={handlePlayTrack}
              onEditTags={track => {
                setEditingTrack(track);
                setIsTagEditorOpen(true);
              }}
              currentPlayingTrack={currentTrack}
              isPlaying={isPlaying}
            />
          ) : currentView === 'settings' ? (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onOpenAccountModal={() => setIsAccountModalOpen(true)}
            />
          ) : (
            <DiscoverView
              tracks={tracks}
              albums={albums}
              artists={artists}
              playlists={playlists}
              onPlayTrack={handlePlayTrack}
              onQueueTrack={handleQueueTrack}
              onQueueBatch={handleQueueBatch}
              onSelectAlbum={album => setSelectedAlbum(album)}
              onSelectArtist={artist => setSelectedArtist(artist)}
              onSelectPlaylist={pl => setSelectedPlaylist(pl)}
              currentPlayingTrack={currentTrack}
              isPlaying={isPlaying}
              preferredQuality={settings.preferredQuality}
            />
          )}
        </main>
      </div>

      {/* Audiophile Bottom Playback Bar with Spectrum Analyser */}
      <AudioPlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onOpenLyrics={() => setIsLyricsModalOpen(true)}
        onOpenEqualizer={() => setIsEqualizerModalOpen(true)}
        onQueueTrack={t => handleQueueTrack(t)}
      />

      {/* Modals & Drawers */}
      <LinkDownloaderModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onQueueTracks={(batchTracks, qual) => handleQueueBatch(batchTracks, qual)}
        onPlayTrack={handlePlayTrack}
        preferredQuality={settings.preferredQuality}
      />

      <AccountManagerModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        userAccount={userAccount}
        onUpdateAccount={acc => {
          setUserAccount(acc);
          handleUpdateSettings({
            ...settings,
            arlToken: acc.arl,
            accountTier: acc.tier
          });
        }}
      />

      <SyncedLyricsModal
        isOpen={isLyricsModalOpen}
        onClose={() => setIsLyricsModalOpen(false)}
        track={currentTrack}
        currentTime={currentTime}
        onSeek={t => audioEngine.seek(t)}
      />

      <EqualizerModal
        isOpen={isEqualizerModalOpen}
        onClose={() => setIsEqualizerModalOpen(false)}
      />

      <TagEditorModal
        isOpen={isTagEditorOpen}
        onClose={() => {
          setIsTagEditorOpen(false);
          setEditingTrack(null);
        }}
        track={editingTrack}
        onSaveTrack={handleSaveTrackTags}
      />
    </div>
  );
}
