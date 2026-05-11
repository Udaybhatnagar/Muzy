'use client';

import { useAppStore } from '@/store/useAppStore';
import { useSocket } from '@/hooks/useSocket';
import { Music2, SkipForward, Crown } from 'lucide-react';
import { useEffect } from 'react';

interface Props { roomId: string }

function getYouTubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    return u.searchParams.get('v') || u.pathname.slice(1) || null;
  } catch { return null; }
}

export function Equalizer() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 20 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="eq-bar" style={{ height: 4 + i * 3 }} />
      ))}
    </div>
  );
}

export function MusicPlayer({ roomId }: Props) {
  const { currentSong, setIsPlaying, isOwner } = useAppStore();
  const { songEnded } = useSocket();
  const owner = isOwner();

  // Owner-only: listen for YouTube IFrame API postMessage to auto-advance
  useEffect(() => {
    if (!owner) return; // non-owners don't control playback

    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('youtube.com')) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.event === 'onStateChange') {
          if (data.info === 0 && currentSong) {  // ended
            songEnded(roomId, currentSong.id);
            setIsPlaying(false);
          } else if (data.info === 1) setIsPlaying(true);
          else if (data.info === 2) setIsPlaying(false);
        }
      } catch { /* ignore */ }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [owner, currentSong, roomId, songEnded, setIsPlaying]);

  const handleSkip = () => {
    if (!owner) return;
    if (currentSong) { songEnded(roomId, currentSong.id); setIsPlaying(false); }
  };

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!currentSong) {
    return (
      <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 200, textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, background: '#1d1f24', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #2a2d35' }}>
          <Music2 size={22} color="#9ca3af" />
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#f5f5f5' }}>Nothing playing</p>
        <p style={{ fontSize: 13, color: '#9ca3af' }}>Add songs to the queue to get started</p>
      </div>
    );
  }

  // ── Embed URL ────────────────────────────────────────────────────────────
  let embedSrc = currentSong.url;
  if (currentSong.platform === 'youtube') {
    const vid = getYouTubeVideoId(currentSong.url);
    if (vid) embedSrc = `https://www.youtube.com/embed/${vid}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
  }
  const iframeHeight = currentSong.platform === 'soundcloud' ? 166 : currentSong.platform === 'spotify' ? 152 : undefined;

  // ── Shared: song info header ─────────────────────────────────────────────
  const songInfoCard = (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #2a2d35', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Equalizer />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginLeft: 4 }}>Now Playing</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#3a3d47', background: '#17181c', padding: '2px 8px', borderRadius: 99, border: '1px solid #2a2d35', textTransform: 'capitalize' }}>
          {currentSong.platform}
        </span>
      </div>

      {/* Song meta */}
      <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid #2a2d35' }}>
        {currentSong.thumbnail ? (
          <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
            <img src={currentSong.thumbnail} alt={currentSong.title} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
          </div>
        ) : (
          <div style={{ width: 52, height: 52, borderRadius: 8, background: '#1d1f24', border: '1px solid #2a2d35', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Music2 size={20} color="#9ca3af" />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#f5f5f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentSong.title}</p>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Added by <span style={{ color: '#f5f5f5' }}>{currentSong.addedBy}</span></p>
        </div>
        {/* Skip only visible to owner */}
        {owner && (
          <button onClick={handleSkip} className="btn btn-ghost btn-icon" title="Skip">
            <SkipForward size={16} />
          </button>
        )}
      </div>
    </div>
  );

  // ── Non-owner: song info + "Owner controls playback" notice ─────────────
  if (!owner) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {songInfoCard}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#17181c', borderRadius: 10, border: '1px solid #2a2d35' }}>
          <Crown size={14} color="#f59e0b" />
          <p style={{ fontSize: 12, color: '#9ca3af' }}>
            Playback is controlled by the <span style={{ color: '#f5f5f5', fontWeight: 600 }}>room owner</span>. You can vote and add songs.
          </p>
        </div>
      </div>
    );
  }

  // ── Owner: full player with iframe ───────────────────────────────────────
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #2a2d35', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Equalizer />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginLeft: 4 }}>Now Playing</span>
        <Crown size={12} color="#f59e0b" style={{ marginLeft: 6 }} title="You are the owner" />
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#3a3d47', background: '#17181c', padding: '2px 8px', borderRadius: 99, border: '1px solid #2a2d35', textTransform: 'capitalize' }}>
          {currentSong.platform}
        </span>
      </div>

      {/* Song meta */}
      <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid #2a2d35' }}>
        {currentSong.thumbnail ? (
          <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
            <img src={currentSong.thumbnail} alt={currentSong.title} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
          </div>
        ) : (
          <div style={{ width: 52, height: 52, borderRadius: 8, background: '#1d1f24', border: '1px solid #2a2d35', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Music2 size={20} color="#9ca3af" />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#f5f5f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentSong.title}</p>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Added by <span style={{ color: '#f5f5f5' }}>{currentSong.addedBy}</span></p>
        </div>
        <button onClick={handleSkip} className="btn btn-ghost btn-icon" title="Skip">
          <SkipForward size={16} />
        </button>
      </div>

      {/* Embed */}
      <div style={{ padding: '16px 18px' }}>
        <div style={{ borderRadius: 10, overflow: 'hidden', background: '#0f0f10', ...(currentSong.platform === 'youtube' ? { aspectRatio: '16/9' } : {}) }}>
          <iframe
            key={currentSong.id}
            src={embedSrc}
            width="100%"
            height={iframeHeight ?? '100%'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ display: 'block', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
