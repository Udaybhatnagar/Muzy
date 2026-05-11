'use client';

import { useAppStore } from '@/store/useAppStore';
import { Copy, Check, Users, LogOut, Hash } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';

interface Props {
  roomId: string;
}

function UserAvatar({ name }: { name: string }) {
  const colors = ['#2a2d35', '#1d1f24', '#17181c'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: color,
        border: '1px solid #2a2d35',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 600,
        color: '#f5f5f5',
        flexShrink: 0,
      }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function LeftSidebar({ roomId }: Props) {
  const [copied, setCopied] = useState(false);
  const { currentRoom, onlineUsers, username, sessionId, leaveRoom } = useAppStore();
  const { leaveRoom: socketLeave } = useSocket();
  const router = useRouter();

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    socketLeave(roomId, sessionId);
    leaveRoom();
    router.push('/');
  };

  return (
    <aside
      style={{
        background: '#17181c',
        border: '1px solid #2a2d35',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Room Info */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #2a2d35' }}>
        <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8 }}>
          Room
        </p>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f5', letterSpacing: '-0.01em', marginBottom: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {currentRoom?.name || 'Loading...'}
        </p>

        {/* Room ID copy */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#1d1f24',
            border: '1px solid #2a2d35',
            borderRadius: 8,
            padding: '8px 12px',
          }}
        >
          <Hash size={13} color="#9ca3af" />
          <span style={{ fontSize: 12, color: '#9ca3af', flex: 1, letterSpacing: '0.06em', fontWeight: 600 }}>
            {roomId}
          </span>
          <button
            onClick={handleCopy}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#4ade80' : '#9ca3af', display: 'flex', transition: 'color 0.2s' }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      {/* Online Users */}
      <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Users size={13} color="#9ca3af" />
          <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Online · {onlineUsers.length}
          </span>
          <span className="live-dot" style={{ marginLeft: 'auto' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {onlineUsers.length === 0 ? (
            <p style={{ fontSize: 12, color: '#3a3d47', textAlign: 'center', padding: '12px 0' }}>
              No users yet
            </p>
          ) : (
            onlineUsers.map((u) => (
              <div
                key={u.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 0',
                }}
              >
                <UserAvatar name={u.username} />
                <span style={{ fontSize: 13, color: u.username === username ? '#f5f5f5' : '#9ca3af', fontWeight: u.username === username ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.username}
                  {u.username === username && (
                    <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400, marginLeft: 4 }}>(you)</span>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Leave */}
      <div style={{ padding: 16, borderTop: '1px solid #2a2d35' }}>
        <button
          onClick={handleLeave}
          className="btn btn-ghost"
          style={{ width: '100%', color: '#f87171', fontSize: 13 }}
        >
          <LogOut size={14} />
          Leave Room
        </button>
      </div>
    </aside>
  );
}
