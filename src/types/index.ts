export type AudioQuality = 'FLAC' | 'MP3_320' | 'MP3_128';

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  duration: number; // in seconds
  releaseYear: number;
  genre: string;
  trackNumber: number;
  discNumber?: number;
  isrc: string;
  bpm?: number;
  musicalKey?: string;
  explicit?: boolean;
  coverGradient: string;
  coverArtType?: 'synthwave' | 'cyberpunk' | 'ambient' | 'jazz' | 'rock' | 'pop' | 'electronic' | 'classical';
  previewNotes?: number[]; // Frequencies/notes for custom web audio synth preview
  previewUrl?: string;
  flacAvailable: boolean;
  sizeFlacMb: number;
  size320Mb: number;
  size128Mb: number;
  lyrics?: LyricLine[];
  playCount?: number;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  releaseYear: number;
  genre: string;
  totalTracks: number;
  totalDuration: number; // seconds
  coverGradient: string;
  coverArtType: 'synthwave' | 'cyberpunk' | 'ambient' | 'jazz' | 'rock' | 'pop' | 'electronic' | 'classical';
  recordLabel: string;
  upc: string;
  tracks: Track[];
  type: 'album' | 'ep' | 'single' | 'compilation';
  flacLossless: boolean;
}

export interface Artist {
  id: string;
  name: string;
  monthlyListeners: number;
  verified: boolean;
  bio: string;
  avatarGradient: string;
  genres: string[];
  topTracks: Track[];
  albums: Album[];
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  curator: string;
  trackCount: number;
  totalDuration: number;
  coverGradient: string;
  coverArtType: 'synthwave' | 'cyberpunk' | 'ambient' | 'jazz' | 'rock' | 'pop' | 'electronic' | 'classical';
  tracks: Track[];
}

export type DownloadStatus = 'queued' | 'downloading' | 'converting' | 'tagging' | 'completed' | 'failed' | 'paused';

export interface DownloadItem {
  id: string;
  track: Track;
  quality: AudioQuality;
  status: DownloadStatus;
  progress: number; // 0 to 100
  downloadedBytes: number;
  totalBytes: number;
  speedBps: number; // bytes per second
  etaSeconds: number;
  folderPath: string;
  fileName: string;
  addedAt: number;
  completedAt?: number;
  error?: string;
}

export interface DeemixSettings {
  preferredQuality: AudioQuality;
  fallbackQuality: boolean; // if FLAC not available, fallback to 320k
  maxConcurrentDownloads: number;
  downloadFolder: string;
  trackNameTemplate: string; // e.g. "%artist% - %title%"
  albumFolderTemplate: string; // e.g. "%albumartist% - %album% (%year%)"
  embedCoverArt: boolean;
  coverArtResolution: 500 | 1000 | 1400;
  saveCoverFile: boolean;
  saveLyricsFile: boolean;
  savePlaylistM3U: boolean;
  writeId3v24: boolean;
  createAlbumFolder: boolean;
  removeDuplicates: boolean;
  speedLimitMbps: number; // 0 = unlimited
  arlToken: string;
  accountTier: 'hifi' | 'premium' | 'free';
}

export interface UserAccount {
  name: string;
  email: string;
  tier: 'hifi' | 'premium' | 'free';
  arl: string;
  country: string;
  expiresAt: string;
  flacAccess: boolean;
}
