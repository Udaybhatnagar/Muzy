'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, LogIn } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { AnimatedQueuePreview } from '@/components/landing/AnimatedQueuePreview';
import { JoinRoomModal } from '@/components/landing/JoinRoomModal';

export default function LandingPage() {
  const [modal, setModal] = useState<'join' | 'create' | null>(null);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <main
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px 48px',
          maxWidth: 1100,
          margin: '0 auto',
          gap: 64,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 64,
            width: '100%',
          }}
        >
          {/* Text block */}
          <div style={{ textAlign: 'center', maxWidth: 620 }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 14px',
                  background: '#1d1f24',
                  border: '1px solid #2a2d35',
                  borderRadius: 99,
                  fontSize: 12,
                  color: '#9ca3af',
                  marginBottom: 28,
                  fontWeight: 500,
                }}
              >
                <span className="live-dot" style={{ width: 6, height: 6 }} />
                Real-time · No signup required
              </div>

              <h1
                style={{
                  fontSize: 'clamp(36px, 6vw, 64px)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  color: '#f5f5f5',
                  lineHeight: 1.1,
                  marginBottom: 20,
                }}
              >
                Real-time collaborative
                <br />
                <span style={{ color: '#9ca3af' }}>music rooms.</span>
              </h1>

              <p
                style={{
                  fontSize: 'clamp(15px, 2vw, 18px)',
                  color: '#9ca3af',
                  lineHeight: 1.7,
                  marginBottom: 36,
                }}
              >
                Create rooms, queue songs, vote together, and let the crowd
                decide what plays next. No account needed.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <button
                id="create-room-btn"
                className="btn btn-primary btn-lg"
                onClick={() => setModal('create')}
              >
                <Plus size={18} />
                Create Room
              </button>
              <button
                id="join-room-btn"
                className="btn btn-secondary btn-lg"
                onClick={() => setModal('join')}
              >
                <LogIn size={18} />
                Join Room
              </button>
            </motion.div>
          </div>

          {/* Animated Queue Preview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ width: '100%', maxWidth: 480 }}
          >
            <AnimatedQueuePreview />
          </motion.div>
        </div>

        {/* Features row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            width: '100%',
          }}
        >
          {[
            { emoji: '🎵', title: 'Queue Songs', desc: 'Add YouTube, Spotify or SoundCloud links' },
            { emoji: '👍', title: 'Vote Together', desc: 'Upvote or downvote to rank the queue' },
            { emoji: '⚡', title: 'Real-time Sync', desc: 'All users see changes instantly' },
            { emoji: '🎮', title: 'No Signup', desc: 'Just enter your name and start' },
          ].map((f) => (
            <div key={f.title} className="card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.emoji}</div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f5', marginBottom: 4 }}>{f.title}</p>
              <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <p style={{ fontSize: 12, color: '#3a3d47', textAlign: 'center' }}>
          Built with Next.js · Socket.IO · PostgreSQL
        </p>
      </main>

      {/* Modal */}
      {modal && <JoinRoomModal mode={modal} onClose={() => setModal(null)} />}
    </>
  );
}
