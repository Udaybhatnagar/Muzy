import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { z } from 'zod';

export const runtime = 'nodejs';

const CreateRoomSchema = z.object({
  name: z.string().min(1).max(50),
  createdBy: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, createdBy } = CreateRoomSchema.parse(body);
    const id = nanoid(8).toUpperCase();

    const room = await prisma.room.create({
      data: { id, name, createdBy },
    });

    return NextResponse.json({ room }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/rooms]', err);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
