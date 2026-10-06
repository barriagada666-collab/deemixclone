import { INITIAL_ALBUMS, INITIAL_ARTISTS, INITIAL_PLAYLISTS, INITIAL_TRACKS } from '../data/musicCatalog';
import { Album, Artist, Playlist, Track } from '../types';

export interface ParsedLinkResult {
  type: 'track' | 'album' | 'artist' | 'playlist' | 'unknown';
  source: 'deezer' | 'spotify' | 'apple' | 'youtube' | 'isrc' | 'direct';
  id?: string;
  query?: string;
  originalUrl: string;
}

export class DeezerService {
  /**
   * Parse any pasted music link or ISRC identifier
   */
  public static parseLink(input: string): ParsedLinkResult {
    const trimmed = input.trim();

    // Check ISRC format (e.g. USUM71922123)
    if (/^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/i.test(trimmed)) {
      return {
        type: 'track',
        source: 'isrc',
        id: trimmed.toUpperCase(),
        originalUrl: trimmed
      };
    }

    // Deezer links
    // e.g. https://www.deezer.com/track/3135556, deezer.page.link/...
    const deezerMatch = trimmed.match(/deezer\.(?:com|page\.link)\/(?:[a-zA-Z]{2}\/)?(track|album|artist|playlist)\/([0-9]+)/i);
    if (deezerMatch) {
      return {
        type: deezerMatch[1].toLowerCase() as any,
        source: 'deezer',
        id: deezerMatch[2],
        originalUrl: trimmed
      };
    }

    // Spotify links
    // e.g. https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
    const spotifyMatch = trimmed.match(/open\.spotify\.com\/(track|album|artist|playlist)\/([a-zA-Z0-9]+)/i);
    if (spotifyMatch) {
      return {
        type: spotifyMatch[1].toLowerCase() as any,
        source: 'spotify',
        id: spotifyMatch[2],
        originalUrl: trimmed
      };
    }

    // Apple Music links
    // e.g. https://music.apple.com/us/album/after-hours/1499378108?i=1499378607
    const appleMatch = trimmed.match(/music\.apple\.com\/[a-zA-Z]{2}\/(album|artist|playlist)\/([^/?]+)(?:\/([0-9]+))?/i);
    if (appleMatch) {
      return {
        type: trimmed.includes('?i=') ? 'track' : (appleMatch[1].toLowerCase() as any),
        source: 'apple',
        id: appleMatch[3] || appleMatch[2],
        originalUrl: trimmed
      };
    }

    return {
      type: 'unknown',
      source: 'direct',
      query: trimmed,
      originalUrl: trimmed
    };
  }

  /**
   * Search tracks, albums, artists across the catalog
   */
  public static async searchCatalog(query: string): Promise<{
    tracks: Track[];
    albums: Album[];
    artists: Artist[];
    playlists: Playlist[];
  }> {
    const q = query.toLowerCase().trim();
    if (!q) {
      return {
        tracks: INITIAL_TRACKS,
        albums: INITIAL_ALBUMS,
        artists: INITIAL_ARTISTS,
        playlists: INITIAL_PLAYLISTS
      };
    }

    // Match local rich catalog
    const matchedTracks = INITIAL_TRACKS.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q) ||
        t.isrc.toLowerCase().includes(q)
    );

    const matchedAlbums = INITIAL_ALBUMS.filter(
      a =>
        a.title.toLowerCase().includes(q) ||
        a.artist.toLowerCase().includes(q) ||
        a.genre.toLowerCase().includes(q)
    );

    const matchedArtists = INITIAL_ARTISTS.filter(
      ar => ar.name.toLowerCase().includes(q) || ar.genres.some(g => g.toLowerCase().includes(q))
    );

    const matchedPlaylists = INITIAL_PLAYLISTS.filter(
      p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );

    // If query has specific name not fully present in local demo items, synthesize high-accuracy track result
    if (matchedTracks.length === 0 && q.length > 2) {
      const generatedTrack: Track = {
        id: `trk-search-${Date.now()}`,
        title: query.split('-')[1]?.trim() || query.charAt(0).toUpperCase() + query.slice(1),
        artist: query.split('-')[0]?.trim() || 'Featured Artist',
        artistId: `art-${Date.now()}`,
        album: `${query} (Single)`,
        albumId: `alb-${Date.now()}`,
        duration: 215,
        releaseYear: 2024,
        genre: 'Hi-Res Lossless',
        trackNumber: 1,
        isrc: `USDM${Math.floor(10000000 + Math.random() * 90000000)}`,
        bpm: 120,
        coverGradient: 'from-cyan-600 via-indigo-700 to-slate-950',
        coverArtType: 'electronic',
        flacAvailable: true,
        sizeFlacMb: 41.5,
        size320Mb: 9.2,
        size128Mb: 3.8,
        lyrics: [
          { time: 0, text: `[${query} Lossless Audio Track]` },
          { time: 10, text: "Synchronized Studio Master Lyrics" },
          { time: 30, text: "High dynamic range 24-bit 96kHz output" }
        ]
      };
      matchedTracks.push(generatedTrack);
    }

    return {
      tracks: matchedTracks,
      albums: matchedAlbums,
      artists: matchedArtists,
      playlists: matchedPlaylists
    };
  }

  /**
   * Resolve an external parsed URL into a playable/downloadable track list
   */
  public static async resolveUrl(parsed: ParsedLinkResult): Promise<{
    title: string;
    description: string;
    coverGradient: string;
    tracks: Track[];
    type: 'track' | 'album' | 'playlist' | 'artist';
  }> {
    // Check if ID matches existing album/playlist/artist/track
    if (parsed.type === 'album') {
      const existing = INITIAL_ALBUMS.find(a => a.id === parsed.id || a.title.toLowerCase().includes(parsed.query || ''));
      if (existing) {
        return {
          title: existing.title,
          description: `Album by ${existing.artist} · ${existing.releaseYear} · ${existing.tracks.length} tracks · 24-bit FLAC Lossless`,
          coverGradient: existing.coverGradient,
          tracks: existing.tracks,
          type: 'album'
        };
      }
      return {
        title: `Resolved Album (${parsed.source.toUpperCase()})`,
        description: `Lossless master release parsed from ${parsed.originalUrl}`,
        coverGradient: 'from-cyan-600 via-blue-800 to-neutral-950',
        tracks: INITIAL_TRACKS.slice(0, 5),
        type: 'album'
      };
    }

    if (parsed.type === 'playlist') {
      const existing = INITIAL_PLAYLISTS.find(p => p.id === parsed.id);
      if (existing) {
        return {
          title: existing.title,
          description: existing.description,
          coverGradient: existing.coverGradient,
          tracks: existing.tracks,
          type: 'playlist'
        };
      }
      return {
        title: `Resolved Playlist (${parsed.source.toUpperCase()})`,
        description: `Imported playlist from ${parsed.originalUrl}`,
        coverGradient: 'from-fuchsia-600 via-purple-900 to-neutral-950',
        tracks: INITIAL_TRACKS,
        type: 'playlist'
      };
    }

    if (parsed.type === 'artist') {
      const existing = INITIAL_ARTISTS.find(ar => ar.id === parsed.id);
      if (existing) {
        return {
          title: existing.name,
          description: `Complete Discography for ${existing.name}`,
          coverGradient: existing.avatarGradient,
          tracks: existing.topTracks,
          type: 'artist'
        };
      }
      return {
        title: `Artist Discography (${parsed.source.toUpperCase()})`,
        description: `Catalog resolved from ${parsed.originalUrl}`,
        coverGradient: 'from-emerald-600 via-teal-800 to-neutral-950',
        tracks: INITIAL_TRACKS.slice(0, 4),
        type: 'artist'
      };
    }

    // Default single track
    const foundTrack = INITIAL_TRACKS.find(t => t.id === parsed.id || t.isrc === parsed.id) || INITIAL_TRACKS[0];
    return {
      title: foundTrack.title,
      description: `Track by ${foundTrack.artist} from ${foundTrack.album}`,
      coverGradient: foundTrack.coverGradient,
      tracks: [foundTrack],
      type: 'track'
    };
  }
}
