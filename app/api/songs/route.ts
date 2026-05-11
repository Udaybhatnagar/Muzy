import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseUrl, fetchSongMetadata } from '@/lib/url-parser';
import { z } from 'zod';

export const runtime = 'nodejs';

const AddSongSchema = z.object({
  roomId: z.string(),
  url: z.string().url(),
  username: z.string().min(1).max(40),
  sessionId: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, url, username } = AddSongSchema.parse(body);

    const parsed = parseUrl(url);
    if (parsed.platform === 'unknown') {
      return NextResponse.json({ error: 'Unsupported URL' }, { status: 400 });
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
      },
    });

    return NextResponse.json({ song }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/songs]', err);
    return NextResponse.json({ error: 'Failed to add song' }, { status: 500 });
  }
}
