import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Room, Song, UserSession } from '@/types';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  // User identity
  username: string;
  sessionId: string;
  setUsername: (name: string) => void;
  setSessionId: (id: string) => void;

  // Room state
  currentRoom: Room | null;
  queue: Song[];
  currentSong: Song | null;
  onlineUsers: UserSession[];
  isPlaying: boolean;
  playbackProgress: number;

  // Voted songs map { songId: 1 | -1 }
  votedSongs: Record<string, number>;

  // Actions
  setCurrentRoom: (room: Room | null) => void;
  setQueue: (songs: Song[]) => void;
  setCurrentSong: (song: Song | null) => void;
  setOnlineUsers: (users: UserSession[]) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackProgress: (progress: number) => void;
  setVote: (songId: string, value: number) => void;
  removeVote: (songId: string) => void;
  optimisticVote: (songId: string, value: 1 | -1) => void;

  // Toasts
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;

  // Computed
  isOwner: () => boolean;

  // Reset
  leaveRoom: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      username: '',
      sessionId: '',
      setUsername: (name) => set({ username: name }),
      setSessionId: (id) => set({ sessionId: id }),

      currentRoom: null,
      queue: [],
      currentSong: null,
      onlineUsers: [],
      isPlaying: false,
      playbackProgress: 0,
      votedSongs: {},

      setCurrentRoom: (room) => set({ currentRoom: room }),
      setQueue: (songs) => set({ queue: songs }),
      setCurrentSong: (song) => set({ currentSong: song }),
      setOnlineUsers: (users) => set({ onlineUsers: users }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setPlaybackProgress: (progress) => set({ playbackProgress: progress }),

      setVote: (songId, value) =>
        set((state) => ({ votedSongs: { ...state.votedSongs, [songId]: value } })),
      removeVote: (songId) =>
        set((state) => {
          const next = { ...state.votedSongs };
          delete next[songId];
          return { votedSongs: next };
        }),

      optimisticVote: (songId, value) => {
        const state = get();
        const existing = state.votedSongs[songId];
        const isUndo = existing === value;
        const delta = isUndo ? -value : existing ? value - existing : value;

        set({
          votedSongs: isUndo
            ? (() => { const n = { ...state.votedSongs }; delete n[songId]; return n; })()
            : { ...state.votedSongs, [songId]: value },
          queue: state.queue
            .map((s) => (s.id === songId ? { ...s, votes: s.votes + delta } : s))
            .sort((a, b) => b.votes - a.votes || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
        });
      },

      toasts: [],
      addToast: (message, type = 'info') => {
        const id = Math.random().toString(36).slice(2);
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => get().removeToast(id), 3500);
      },
      removeToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

      isOwner: () => {
        const { currentRoom, sessionId } = get();
        return !!currentRoom && currentRoom.createdBy === sessionId;
      },

      leaveRoom: () =>
        set({ currentRoom: null, queue: [], currentSong: null, onlineUsers: [], isPlaying: false, votedSongs: {} }),
    }),
    {
      name: 'muzy-store',
      partialize: (state) => ({
        username: state.username,
        sessionId: state.sessionId,
        votedSongs: state.votedSongs,
      }),
    }
  )
);
