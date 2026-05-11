'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useSocket } from '@/hooks/useSocket';
import { parseUrl, isValidMusicUrl } from '@/lib/url-parser';
import { Link2, Plus, PlayCircle, Music2, Waves, AlertCircle, CheckCircle } from 'lucide-react';


interface Props { roomId: string }

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  youtube:    <PlayCircle size={13} style={{ color: '#f87171' }} />,
  spotify:    <Music2     size={13} style={{ color: '#4ade80' }} />,
  soundcloud: <Waves      size={13} style={{ color: '#fb923c' }} />,
};

export function RightSidebar({ roomId }: Props) {
  const { username, sessionId, addToast } = useAppStore();
  const { addSong } = useSocket();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ platform: string; valid: boolean } | null>(null);

  const handleUrlChange = (val: string) => {
    setUrl(val);
    if (!val.trim()) { setPreview(null); return; }
    try {
      const parsed = parseUrl(val.trim());
      setPreview({ platform: parsed.platform, valid: parsed.platform !== 'unknown' });
    } catch {
      setPreview({ platform: 'unknown', valid: false });
    }
  };

  const handleAdd = useCallback(async () => {
    if (!url.trim() || !isValidMusicUrl(url.trim())) {
      addToast('Please enter a valid YouTube, Spotify, or SoundCloud URL', 'error');
      return;
    }
    setLoading(true);
    try {
      addSong(roomId, url.trim(), username, sessionId);
      setUrl('');
      setPreview(null);
      addToast('Song added to queue!', 'success');
    } catch {
      addToast('Failed to add song', 'error');
    } finally {
      setLoading(false);
    }
  }, [url, roomId, username, sessionId, addSong, addToast]);

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Add Song Card */}
      <div className="card" style={{ padding: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f5', marginBottom: 4 }}>
          Add a Song
        </p>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16, lineHeight: 1.5 }}>
          Paste a YouTube, Spotify, or SoundCloud URL
        </p>

        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Link2 size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a4d57' }} />
          <input
            className="input"
            style={{ paddingLeft: 34, paddingRight: preview ? 36 : 14 }}
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          {preview && (
            <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
              {preview.valid
                ? <CheckCircle size={14} style={{ color: '#4ade80' }} />
                : <AlertCircle size={14} style={{ color: '#f87171' }} />
              }
            </span>
          )}
        </div>

        {/* Platform preview */}
        {preview?.valid && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: '#0f0f10', borderRadius: 6, marginBottom: 10, border: '1px solid #2a2d35' }}>
            {PLATFORM_ICONS[preview.platform]}
            <span style={{ fontSize: 12, color: '#9ca3af', textTransform: 'capitalize' }}>{preview.platform} link detected</span>
          </div>
        )}

        <button
          id="add-song-btn"
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={handleAdd}
          disabled={loading || !preview?.valid}
        >
          {loading ? (
            <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #0f0f10', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-slow 0.6s linear infinite' }} />
          ) : (
            <><Plus size={15} /> Add to Queue</>
          )}
        </button>
      </div>

      {/* Supported platforms */}
      <div className="card" style={{ padding: 16 }}>
        <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Supported Platforms
        </p>
        {[
          { name: 'YouTube', icon: PLATFORM_ICONS.youtube, desc: 'Full playback control' },
          { name: 'Spotify', icon: PLATFORM_ICONS.spotify, desc: 'Embedded player' },
          { name: 'SoundCloud', icon: PLATFORM_ICONS.soundcloud, desc: 'Embedded player' },
        ].map((p) => (
          <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
            {p.icon}
            <div>
              <span style={{ fontSize: 13, color: '#f5f5f5', fontWeight: 500 }}>{p.name}</span>
              <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 6 }}>{p.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
