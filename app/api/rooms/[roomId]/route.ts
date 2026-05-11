import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const songs = await prisma.song.findMany({
      where: { roomId, played: false },
      orderBy: [{ votes: 'desc' }, { createdAt: 'asc' }],
    });

    const currentSong = room.currentSongId
      ? await prisma.song.findUnique({ where: { id: room.currentSongId } })
      : null;

    const users = await prisma.userSession.findMany({ where: { roomId } });

    return NextResponse.json({ room, songs, currentSong, users });
  } catch (err) {
    console.error('[GET /api/rooms/[roomId]]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
