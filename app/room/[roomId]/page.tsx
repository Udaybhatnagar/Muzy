'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { SocketProvider, useSocket } from '@/hooks/useSocket';
import { LeftSidebar } from '@/components/room/LeftSidebar';
import { RightSidebar } from '@/components/room/RightSidebar';
import { MusicPlayer } from '@/components/player/MusicPlayer';
import { QueueList } from '@/components/queue/QueueList';
import { JoinRoomModal } from '@/components/landing/JoinRoomModal';
import { nanoid } from 'nanoid';
import { Users, Music, Plus, Radio } from 'lucide-react';

type MobileTab = 'player' | 'queue' | 'add';

function RoomInner({ roomId }: { roomId: string }) {
  const router = useRouter();
  const { username, sessionId, setSessionId, setQueue, setCurrentSong, setCurrentRoom } = useAppStore();
  const { joinRoom } = useSocket();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('player');

  useEffect(() => {
    if (!useAppStore.getState().sessionId) setSessionId(nanoid(16));
  }, [setSessionId]);

  useEffect(() => {
    if (!username) setShowJoinModal(true);
  }, [username]);

  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    fetch(`/api/rooms/${roomId}`)
      .then((r) => { if (!r.ok) { setNotFound(true); return null; } return r.json(); })
      .then((data) => {
        if (!data) return;
        setCurrentRoom(data.room);
        setQueue(data.songs || []);
        setCurrentSong(data.currentSong || null);
      })
      .finally(() => setLoading(false));
  }, [roomId, setCurrentRoom, setQueue, setCurrentSong]);

  useEffect(() => {
    if (username && sessionId && roomId) joinRoom(roomId, username, sessionId);
  }, [username, sessionId, roomId, joinRoom]);

  if (notFound) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>🚫</div>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#f5f5f5' }}>Room not found</p>
        <p style={{ fontSize: 14, color: '#9ca3af' }}>Room "{roomId}" doesn't exist.</p>
        <button className="btn btn-primary" onClick={() => router.push('/')}>Back to Home</button>
      </div>
    );
  }

  const tabs: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'queue',  label: 'Queue',  icon: <Radio size={18} /> },
    { id: 'player', label: 'Player', icon: <Music size={18} /> },
    { id: 'add',    label: 'Add',    icon: <Plus  size={18} /> },
  ];

  return (
    <>
      {showJoinModal && <JoinRoomModal mode="join" onClose={() => setShowJoinModal(false)} />}

      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

        {/* ── Top bar ─────────────────────────────────────────────── */}
        <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid #2a2d35', background: '#0f0f10', gap: 10, flexShrink: 0, zIndex: 10 }}>
          <button
            onClick={() => router.push('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: '#f5f5f5', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', padding: 0 }}
          >
            🎵 Muzy
          </button>
          <span style={{ color: '#2a2d35' }}>/</span>
          <span style={{ fontSize: 13, color: '#f5f5f5', fontWeight: 600, letterSpacing: '0.06em', fontFamily: 'monospace' }}>{roomId}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="live-dot" />
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Live</span>
          </div>
        </div>

        {/* ── Desktop: 3-col layout (original, unchanged) ─────── */}
        <div className="room-desktop-grid">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
            style={{ padding: 12, overflowY: 'auto', borderRight: '1px solid #2a2d35' }}
          >
            <LeftSidebar roomId={roomId} />
          </motion.div>

          {/* Center */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            style={{ padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <MusicPlayer roomId={roomId} />
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #2a2d35' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f5' }}>Queue</p>
              </div>
              <QueueList roomId={roomId} loading={loading} />
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
            style={{ padding: 12, overflowY: 'auto', borderLeft: '1px solid #2a2d35' }}
          >
            <RightSidebar roomId={roomId} />
          </motion.div>
        </div>

        {/* ── Mobile: tabbed content ───────────────────────────────── */}
        <div className="mobile-room">
          <div className="mobile-content">
            <AnimatePresence mode="wait">
              {mobileTab === 'player' && (
                <motion.div key="player"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  style={{ padding: '12px 12px 0', display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  <MusicPlayer roomId={roomId} />
                  <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #2a2d35' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f5' }}>Queue</p>
                    </div>
                    <QueueList roomId={roomId} loading={loading} />
                  </div>
                </motion.div>
              )}
              {mobileTab === 'queue' && (
                <motion.div key="queue"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  style={{ padding: '12px 12px 0' }}
                >
                  <LeftSidebar roomId={roomId} />
                </motion.div>
              )}
              {mobileTab === 'add' && (
                <motion.div key="add"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  style={{ padding: '12px 12px 0' }}
                >
                  <RightSidebar roomId={roomId} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom tab bar */}
          <div className="mobile-tabbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMobileTab(tab.id)}
                className="mobile-tab"
                style={{
                  color: mobileTab === tab.id ? '#f5f5f5' : '#9ca3af',
                  background: mobileTab === tab.id ? '#2a2d35' : 'transparent',
                }}
              >
                {tab.icon}
                <span style={{ fontSize: 10, fontWeight: 600, marginTop: 2 }}>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function RoomPage() {
  const params = useParams();
  const roomId = (params?.roomId as string)?.toUpperCase();
  return (
    <SocketProvider>
      <RoomInner roomId={roomId} />
    </SocketProvider>
  );
}
