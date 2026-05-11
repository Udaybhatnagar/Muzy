'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '@/store/useAppStore';
import type { Song, UserSession, Room } from '@/types';

interface SocketContextValue {
  joinRoom: (roomId: string, username: string, sessionId: string) => void;
  leaveRoom: (roomId: string, sessionId: string) => void;
  addSong: (roomId: string, url: string, username: string, sessionId: string) => void;
  voteSong: (songId: string, value: 1 | -1, sessionId: string, roomId: string) => void;
  songEnded: (roomId: string, songId: string) => void;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const pendingJoinRef = useRef<{ roomId: string; username: string; sessionId: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { setQueue, setCurrentSong, setOnlineUsers, setCurrentRoom, setIsPlaying, addToast } = useAppStore();

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      path: '/socket.io',
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      console.log('[socket] connected:', s.id);
      setIsConnected(true);
      // Re-emit pending join if any (handles reconnects)
      if (pendingJoinRef.current) {
        s.emit('room:join', pendingJoinRef.current);
      }
    });
    s.on('disconnect', (r) => { console.log('[socket] disconnected:', r); setIsConnected(false); });

    s.on('room:users', ({ users }: { users: UserSession[] }) => setOnlineUsers(users));

    s.on('queue:update', ({ songs, currentSong, room }: { songs: Song[]; currentSong?: Song | null; room?: Room }) => {
      setQueue(songs);
      if (currentSong !== undefined) setCurrentSong(currentSong);
      if (room) setCurrentRoom(room);
    });

    s.on('song:play', ({ song }: { song: Song | null }) => {
      setCurrentSong(song);
      setIsPlaying(!!song);
      if (song) addToast(`Now playing: ${song.title}`, 'info');
    });

    s.on('error', ({ message }: { message: string }) => addToast(message, 'error'));

    socketRef.current = s;
    return () => { s.disconnect(); socketRef.current = null; };
  }, [setQueue, setCurrentSong, setOnlineUsers, setCurrentRoom, setIsPlaying, addToast]);

  const joinRoom = (roomId: string, username: string, sessionId: string) => {
    pendingJoinRef.current = { roomId, username, sessionId };
    if (socketRef.current?.connected) {
      socketRef.current.emit('room:join', { roomId, username, sessionId });
    }
    // else: will auto-fire on connect via the connect handler
  };

  const leaveRoom = (roomId: string, sessionId: string) =>
    socketRef.current?.emit('room:leave', { roomId, sessionId });

  const addSong = (roomId: string, url: string, username: string, sessionId: string) =>
    socketRef.current?.emit('song:add', { roomId, url, username, sessionId });

  const voteSong = (songId: string, value: 1 | -1, sessionId: string, roomId: string) =>
    socketRef.current?.emit('song:vote', { songId, value, sessionId, roomId });

  const songEnded = (roomId: string, songId: string) =>
    socketRef.current?.emit('song:ended', { roomId, songId });

  const value: SocketContextValue = {
    joinRoom, leaveRoom, addSong, voteSong, songEnded,
    isConnected,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
  return ctx;
}
