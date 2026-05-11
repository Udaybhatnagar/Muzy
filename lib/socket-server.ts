import { Server as SocketIOServer, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import prisma from './prisma';
import { parseUrl, fetchSongMetadata } from './url-parser';
import { nanoid } from 'nanoid';
import type {
  JoinRoomPayload,
  AddSongPayload,
  VotePayload,
  SongEndedPayload,
  Song,
} from '@/types';

let io: SocketIOServer;

function sortQueue(songs: Song[]): Song[] {
  return [...songs].sort(
    (a, b) =>
      b.votes - a.votes ||
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

async function getRoomQueue(roomId: string) {
  const songs = await prisma.song.findMany({
    where: { roomId, played: false },
    orderBy: [{ votes: 'desc' }, { createdAt: 'asc' }],
  });
  return songs;
}

export function initSocketServer(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    path: '/socket.io',
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // ─── room:join ───────────────────────────────────────────
    socket.on('room:join', async ({ roomId, username, sessionId }: JoinRoomPayload) => {
      try {
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        socket.join(roomId);

        // Remove any stale session for this sessionId in this room, then create fresh
        await prisma.userSession.deleteMany({ where: { roomId, sessionId } });
        await prisma.userSession.create({
          data: { roomId, socketId: socket.id, username, sessionId },
        });

        // Re-fetch all users in room
        const users = await prisma.userSession.findMany({ where: { roomId } });
        io.to(roomId).emit('room:users', { users });

        // Send current queue
        const songs = await getRoomQueue(roomId);
        const currentSong = room.currentSongId
          ? await prisma.song.findUnique({ where: { id: room.currentSongId } })
          : null;

        socket.emit('queue:update', { songs, currentSong, room });
        console.log(`[socket] ${username} joined room ${roomId}`);
      } catch (err) {
        console.error('[room:join]', err);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // ─── room:leave ──────────────────────────────────────────
    socket.on('room:leave', async ({ roomId, sessionId }: { roomId: string; sessionId: string }) => {
      try {
        socket.leave(roomId);
        await prisma.userSession.deleteMany({ where: { roomId, sessionId } });
        const users = await prisma.userSession.findMany({ where: { roomId } });
        io.to(roomId).emit('room:users', { users });
      } catch (err) {
        console.error('[room:leave]', err);
      }
    });

    // ─── song:add ────────────────────────────────────────────
    socket.on('song:add', async ({ roomId, url, username }: AddSongPayload) => {
      try {
        const parsed = parseUrl(url);
        if (parsed.platform === 'unknown') {
          socket.emit('error', { message: 'Unsupported URL. Use YouTube, Spotify, or SoundCloud.' });
          return;
        }

        // Check duplicate in queue
        const existing = await prisma.song.findFirst({
          where: { roomId, url, played: false },
        });
        if (existing) {
          socket.emit('error', { message: 'Song already in queue!' });
          return;
        }

        const meta = await fetchSongMetadata(parsed.embedUrl || url, parsed.platform);

        const song = await prisma.song.create({
          data: {
            roomId,
            addedBy: username,
            url: parsed.embedUrl,
            platform: parsed.platform,
            title: meta.title,
            thumbnail: meta.thumbnail,
            duration: meta.duration,
            votes: 0,
          },
        });

        // If no current song, set this as playing
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (!room?.currentSongId) {
          await prisma.room.update({ where: { id: roomId }, data: { currentSongId: song.id } });
          io.to(roomId).emit('song:play', { song });
        }

        const songs = await getRoomQueue(roomId);
        io.to(roomId).emit('queue:update', { songs });
        console.log(`[socket] song added: ${song.title}`);
      } catch (err) {
        console.error('[song:add]', err);
        socket.emit('error', { message: 'Failed to add song' });
      }
    });

    // ─── song:vote ───────────────────────────────────────────
    socket.on('song:vote', async ({ songId, value, sessionId, roomId }: VotePayload) => {
      try {
        const existingVote = await prisma.vote.findUnique({
          where: { songId_sessionId: { songId, sessionId } },
        });

        let delta = 0;
        if (!existingVote) {
          // New vote
          await prisma.vote.create({ data: { songId, sessionId, value } });
          delta = value;
        } else if (existingVote.value === value) {
          // Undo vote
          await prisma.vote.delete({ where: { songId_sessionId: { songId, sessionId } } });
          delta = -value;
        } else {
          // Flip vote
          await prisma.vote.update({
            where: { songId_sessionId: { songId, sessionId } },
            data: { value },
          });
          delta = value - existingVote.value;
        }

        await prisma.song.update({
          where: { id: songId },
          data: { votes: { increment: delta } },
        });

        const songs = await getRoomQueue(roomId);
        io.to(roomId).emit('queue:update', { songs });
      } catch (err) {
        console.error('[song:vote]', err);
      }
    });

    // ─── song:ended ──────────────────────────────────────────
    socket.on('song:ended', async ({ roomId, songId }: SongEndedPayload) => {
      try {
        // Only the room owner can skip / advance
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        const session = await prisma.userSession.findFirst({ where: { socketId: socket.id, roomId } });
        if (!room || !session || room.createdBy !== session.sessionId) {
          socket.emit('error', { message: 'Only the room owner can skip songs' });
          return;
        }
        // Mark song as played
        await prisma.song.update({ where: { id: songId }, data: { played: true } });

        // Get next top-voted song
        const next = await prisma.song.findFirst({
          where: { roomId, played: false },
          orderBy: [{ votes: 'desc' }, { createdAt: 'asc' }],
        });

        await prisma.room.update({
          where: { id: roomId },
          data: { currentSongId: next?.id ?? null },
        });

        const songs = await getRoomQueue(roomId);
        io.to(roomId).emit('queue:update', { songs });
        io.to(roomId).emit('song:play', { song: next ?? null });
      } catch (err) {
        console.error('[song:ended]', err);
      }
    });

    // ─── disconnect ──────────────────────────────────────────
    socket.on('disconnect', async () => {
      try {
        const sessions = await prisma.userSession.findMany({
          where: { socketId: socket.id },
        });
        for (const s of sessions) {
          await prisma.userSession.delete({ where: { id: s.id } });
          const users = await prisma.userSession.findMany({ where: { roomId: s.roomId } });
          io.to(s.roomId).emit('room:users', { users });
        }
      } catch (err) {
        console.error('[disconnect]', err);
      }
    });
  });

  return io;
}

export { io };
