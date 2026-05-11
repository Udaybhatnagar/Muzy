'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Music } from 'lucide-react';
import { useState, useEffect } from 'react';

const DEMO_SONGS = [
  { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', votes: 24, platform: 'youtube' },
  { id: '2', title: 'Levitating',      artist: 'Dua Lipa',   votes: 18, platform: 'spotify' },
  { id: '3', title: 'Stay',            artist: 'Kid Laroi',  votes: 15, platform: 'youtube' },
  { id: '4', title: 'Peaches',         artist: 'Justin Bieber', votes: 9, platform: 'spotify' },
  { id: '5', title: 'good 4 u',        artist: 'Olivia R.',  votes: 7,  platform: 'soundcloud' },
];

const PLATFORM_COLORS: Record<string, string> = {
  youtube: '#f87171',
  spotify: '#4ade80',
  soundcloud: '#fb923c',
};

export function AnimatedQueuePreview() {
  const [songs, setSongs] = useState(DEMO_SONGS);
  const [voted, setVoted] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setSongs((prev) => {
        const idx = Math.floor(Math.random() * prev.length);
        const updated = prev.map((s, i) =>
          i === idx ? { ...s, votes: s.votes + (Math.random() > 0.3 ? 1 : -1) } : s
        );
        return [...updated].sort((a, b) => b.votes - a.votes);
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        background: '#17181c',
        border: '1px solid #2a2d35',
        borderRadius: 16,
        overflow: 'hidden',
        width: '100%',
        maxWidth: 480,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid #2a2d35',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span className="live-dot" />
        <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
          Live Queue · demo-room
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: '#3a3d47',
            background: '#1d1f24',
            padding: '2px 8px',
            borderRadius: 99,
          }}
        >
          {songs.length} songs
        </span>
      </div>

      {/* Queue */}
      <div style={{ padding: '8px 0' }}>
        <AnimatePresence mode="popLayout">
          {songs.map((song, idx) => (
            <motion.div
              key={song.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 18px',
                background: idx === 0 ? '#1d1f24' : 'transparent',
                borderLeft: idx === 0 ? '2px solid #f5f5f5' : '2px solid transparent',
              }}
            >
              {/* Rank */}
              <span style={{ fontSize: 11, color: '#3a3d47', width: 16, textAlign: 'center' }}>
                {idx === 0 ? (
                  <Music size={12} color="#f5f5f5" />
                ) : (
                  idx + 1
                )}
              </span>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#f5f5f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {song.title}
                </p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>{song.artist}</p>
              </div>

              {/* Platform dot */}
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: PLATFORM_COLORS[song.platform],
                  flexShrink: 0,
                }}
              />

              {/* Votes */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}
                >
                  <ThumbsUp size={13} />
                </button>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#f5f5f5', minWidth: 22, textAlign: 'center' }}>
                  {song.votes}
                </span>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}
                >
                  <ThumbsDown size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
