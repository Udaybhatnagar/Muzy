'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useSocket } from '@/hooks/useSocket';
import { ThumbsUp, ThumbsDown, Music2 } from 'lucide-react';
import type { Song } from '@/types';

interface QueueItemProps {
  song: Song;
  index: number;
  roomId: string;
  isPlaying?: boolean;
}

function VoteButtons({ song, roomId }: { song: Song; roomId: string }) {
  const { sessionId, votedSongs, optimisticVote } = useAppStore();
  const { voteSong } = useSocket();

  const currentVote = votedSongs[song.id] || 0;

  const playClickSound = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  };

  const handleVote = (value: 1 | -1) => {
    playClickSound();
    optimisticVote(song.id, value);
    voteSong(song.id, value, sessionId, roomId);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <button
        onClick={() => handleVote(1)}
        className={`btn btn-ghost btn-icon vote-up ${currentVote === 1 ? 'active' : ''}`}
        style={{
          padding: '5px',
          borderRadius: 6,
          color: currentVote === 1 ? '#4ade80' : '#9ca3af',
          background: currentVote === 1 ? 'rgba(74,222,128,0.08)' : 'transparent',
          transition: 'all 0.15s ease',
        }}
        title="Upvote"
      >
        <ThumbsUp size={13} />
      </button>

      <motion.span
        key={song.votes}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: song.votes > 0 ? '#f5f5f5' : song.votes < 0 ? '#f87171' : '#9ca3af',
          minWidth: 26,
          textAlign: 'center',
        }}
      >
        {song.votes}
      </motion.span>

      <button
        onClick={() => handleVote(-1)}
        className={`btn btn-ghost btn-icon vote-down ${currentVote === -1 ? 'active' : ''}`}
        style={{
          padding: '5px',
          borderRadius: 6,
          color: currentVote === -1 ? '#f87171' : '#9ca3af',
          background: currentVote === -1 ? 'rgba(248,113,113,0.08)' : 'transparent',
          transition: 'all 0.15s ease',
        }}
        title="Downvote"
      >
        <ThumbsDown size={13} />
      </button>
    </div>
  );
}

export function QueueItem({ song, index, roomId, isPlaying }: QueueItemProps) {
  return (
    <motion.div
      layout
      layoutId={song.id}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        background: isPlaying ? '#1d1f24' : 'transparent',
        borderLeft: isPlaying ? '2px solid #f5f5f5' : '2px solid transparent',
        borderRadius: isPlaying ? '0 8px 8px 0' : 0,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      {/* Position */}
      <span style={{ fontSize: 12, color: '#3a3d47', width: 20, textAlign: 'center', flexShrink: 0 }}>
        {isPlaying ? <Music2 size={12} color="#f5f5f5" /> : index + 1}
      </span>

      {/* Thumbnail */}
      {song.thumbnail ? (
        <img
          src={song.thumbnail}
          alt={song.title}
          style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <div style={{ width: 40, height: 40, borderRadius: 6, background: '#1d1f24', border: '1px solid #2a2d35', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Music2 size={16} color="#9ca3af" />
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {song.title}
        </p>
        <p style={{ fontSize: 11, color: '#9ca3af' }}>
          {song.addedBy} ·{' '}
          <span style={{
            textTransform: 'capitalize',
            color: song.platform === 'youtube' ? '#f87171' : song.platform === 'spotify' ? '#4ade80' : '#fb923c'
          }}>
            {song.platform}
          </span>
        </p>
      </div>

      {/* Votes */}
      <VoteButtons song={song} roomId={roomId} />
    </motion.div>
  );
}

export function QueueSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
          <div className="skeleton" style={{ width: 20, height: 12 }} />
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 6 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="skeleton" style={{ height: 13, width: '65%' }} />
            <div className="skeleton" style={{ height: 11, width: '40%' }} />
          </div>
          <div className="skeleton" style={{ width: 64, height: 28, borderRadius: 6 }} />
        </div>
      ))}
    </div>
  );
}

export function EmptyQueue() {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ fontSize: 40 }}>🎵</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#f5f5f5' }}>Queue is empty</p>
      <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5, maxWidth: 240 }}>
        Add a YouTube, Spotify, or SoundCloud link to get the party started.
      </p>
    </div>
  );
}

interface QueueListProps {
  roomId: string;
  loading?: boolean;
}

export function QueueList({ roomId, loading }: QueueListProps) {
  const { queue, currentSong } = useAppStore();

  if (loading) return <QueueSkeleton />;

  const upNext = queue.filter((s) => s.id !== currentSong?.id);
  const isEmpty = upNext.length === 0 && !currentSong;

  if (isEmpty) return <EmptyQueue />;

  return (
    <div>
      {/* Now Playing row */}
      {currentSong && (
        <>
          <div style={{ padding: '10px 16px 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#f5f5f5', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Now Playing
            </span>
          </div>
          <QueueItem song={currentSong} index={0} roomId={roomId} isPlaying />
        </>
      )}

      {/* Up Next */}
      {upNext.length > 0 && (
        <>
          <div style={{ padding: '10px 16px 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Up Next · {upNext.length}
            </span>
          </div>
          <AnimatePresence mode="popLayout">
            {upNext.map((song, i) => (
              <QueueItem key={song.id} song={song} index={i} roomId={roomId} />
            ))}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

