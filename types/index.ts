export type Platform = 'youtube' | 'spotify' | 'soundcloud' | 'unknown';

export interface Room {
  id: string;
  name: string;
  currentSongId: string | null;
  createdBy: string;
  createdAt: string;
}

export interface UserSession {
  id: string;
  roomId: string;
  socketId: string;
  username: string;
  sessionId: string;
  joinedAt: string;
}

export interface Song {
  id: string;
  roomId: string;
  addedBy: string;
  url: string;
  platform: Platform;
  title: string;
  thumbnail: string;
  duration: number;
  votes: number;
  played: boolean;
  createdAt: string;
  userVote?: number; // -1, 0, or 1 for the current user
}

export interface Vote {
  id: string;
  songId: string;
  sessionId: string;
  value: number;
}

export interface RoomState {
  room: Room;
  songs: Song[];
  users: UserSession[];
  currentSong: Song | null;
}

// Socket event payloads
export interface JoinRoomPayload {
  roomId: string;
  username: string;
  sessionId: string;
}

export interface AddSongPayload {
  roomId: string;
  url: string;
  username: string;
  sessionId: string;
}

export interface VotePayload {
  songId: string;
  value: 1 | -1;
  sessionId: string;
  roomId: string;
}

export interface SongEndedPayload {
  roomId: string;
  songId: string;
}

export interface ParsedUrl {
  platform: Platform;
  embedUrl: string;
  videoId: string | null;
  originalUrl: string;
}
