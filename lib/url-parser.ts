import type { ParsedUrl, Platform } from '@/types';

export function parseUrl(url: string): ParsedUrl {
  try {
    const parsed = new URL(url.trim());
    const hostname = parsed.hostname.replace('www.', '');

    // YouTube
    if (hostname === 'youtube.com' || hostname === 'youtu.be') {
      let videoId: string | null = null;

      if (hostname === 'youtu.be') {
        videoId = parsed.pathname.slice(1);
      } else if (parsed.searchParams.get('v')) {
        videoId = parsed.searchParams.get('v');
      } else if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/shorts/')[1];
      }

      if (videoId) {
        return {
          platform: 'youtube',
          embedUrl: `https://www.youtube.com/watch?v=${videoId}`,
          videoId,
          originalUrl: url,
        };
      }
    }

    // Spotify
    if (hostname === 'open.spotify.com') {
      const parts = parsed.pathname.split('/');
      const type = parts[1]; // track, album, playlist
      const id = parts[2];
      if (id) {
        return {
          platform: 'spotify',
          embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
          videoId: id,
          originalUrl: url,
        };
      }
    }

    // SoundCloud
    if (hostname === 'soundcloud.com') {
      return {
        platform: 'soundcloud',
        embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ffffff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false`,
        videoId: null,
        originalUrl: url,
      };
    }

    return { platform: 'unknown', embedUrl: url, videoId: null, originalUrl: url };
  } catch {
    return { platform: 'unknown', embedUrl: url, videoId: null, originalUrl: url };
  }
}

export async function fetchSongMetadata(url: string, platform: Platform): Promise<{
  title: string;
  thumbnail: string;
  duration: number;
}> {
  try {
    if (platform === 'youtube') {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title || 'Unknown Title',
          thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${new URL(url).searchParams.get('v')}/mqdefault.jpg`,
          duration: 0,
        };
      }
    }

    if (platform === 'spotify') {
      const res = await fetch(
        `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`
      );
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title || 'Unknown Title',
          thumbnail: data.thumbnail_url || '',
          duration: 0,
        };
      }
    }

    if (platform === 'soundcloud') {
      const res = await fetch(
        `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title || 'Unknown Title',
          thumbnail: data.thumbnail_url || '',
          duration: 0,
        };
      }
    }
  } catch {
    // fallback
  }

  return { title: 'Unknown Title', thumbnail: '', duration: 0 };
}

export function isValidMusicUrl(url: string): boolean {
  const parsed = parseUrl(url);
  return parsed.platform !== 'unknown';
}
