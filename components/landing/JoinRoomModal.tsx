'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { nanoid } from 'nanoid';
import { X, ArrowRight, Hash, User } from 'lucide-react';

interface Props {
  mode: 'join' | 'create';
  onClose: () => void;
}

export function JoinRoomModal({ mode, onClose }: Props) {
  const router = useRouter();
  const { setUsername, setSessionId, username } = useAppStore();
  const [name, setName] = useState(username || '');
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async () => {
    setError('');
    if (!name.trim()) { setError('Display name is required'); return; }
    if (mode === 'join' && !roomId.trim()) { setError('Room ID is required'); return; }

    setLoading(true);
    try {
      // Ensure session ID exists
      let sId = useAppStore.getState().sessionId;
      if (!sId) {
        sId = nanoid(16);
        setSessionId(sId);
      }
      setUsername(name.trim());

      if (mode === 'create') {
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: `${name.trim()}'s Room`, createdBy: sId }),
        });
        if (!res.ok) throw new Error('Failed to create room');
        const { room } = await res.json();
        router.push(`/room/${room.id}`);
      } else {
        // Validate room exists
        const res = await fetch(`/api/rooms/${roomId.trim().toUpperCase()}`);
        if (!res.ok) { setError('Room not found. Check the ID and try again.'); setLoading(false); return; }
        router.push(`/room/${roomId.trim().toUpperCase()}`);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }, [name, roomId, mode, router, setUsername, setSessionId]);

  return (
    <AnimatePresence>
      <motion.div
        className="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#17181c',
            border: '1px solid #2a2d35',
            borderRadius: 16,
            padding: 28,
            width: '100%',
            maxWidth: 400,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f5f5f5', letterSpacing: '-0.02em' }}>
                {mode === 'create' ? 'Create a Room' : 'Join a Room'}
              </h2>
              <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>
                {mode === 'create' ? 'Start your collaborative queue' : 'Enter the room details below'}
              </p>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                Display Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a4d57' }} />
                <input
                  className="input"
                  style={{ paddingLeft: 34 }}
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  maxLength={40}
                  autoFocus
                />
              </div>
            </div>

            {mode === 'join' && (
              <div>
                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                  Room ID
                </label>
                <div style={{ position: 'relative' }}>
                  <Hash size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a4d57' }} />
                  <input
                    className="input"
                    style={{ paddingLeft: 34, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    placeholder="XXXXXXXX"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    maxLength={8}
                  />
                </div>
              </div>
            )}

            {error && (
              <p style={{ fontSize: 12, color: '#f87171', background: 'rgba(248,113,113,0.08)', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(248,113,113,0.2)' }}>
                {error}
              </p>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 4 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #0f0f10', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-slow 0.6s linear infinite' }} />
              ) : (
                <>
                  {mode === 'create' ? 'Create Room' : 'Join Room'}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
