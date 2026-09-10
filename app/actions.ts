'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

function getTodayDate() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export async function checkInAction(note: string) {
  const today = getTodayDate();
  const now = new Date();

  await prisma.attendance.upsert({
    where: { date: today },
    update: {
      checkInAt: now,
      checkInNote: note,
    },
    create: {
      date: today,
      checkInAt: now,
      checkInNote: note,
    },
  });

  revalidatePath('/');
}

export async function checkOutAction(note: string) {
  const today = getTodayDate();
  const now = new Date();

  const record = await prisma.attendance.findUnique({ where: { date: today } });
  let stayMinutes = 0;

  if (record?.checkInAt) {
    stayMinutes = Math.floor((now.getTime() - new Date(record.checkInAt).getTime()) / (1000 * 60));
  }

  await prisma.attendance.update({
    where: { date: today },
    data: {
      checkOutAt: now,
      checkOutNote: note,
      stayMinutes: Math.max(0, stayMinutes),
    },
  });

  revalidatePath('/');
}

export async function updateAttendanceAction(
  id: string,
  checkInAt: string,
  checkOutAt: string,
  checkInNote: string,
  checkOutNote: string,
) {
  const parsedCheckInAt = checkInAt ? new Date(checkInAt) : null;
  const parsedCheckOutAt = checkOutAt ? new Date(checkOutAt) : null;
  const stayMinutes = parsedCheckInAt && parsedCheckOutAt
    ? Math.max(0, Math.floor((parsedCheckOutAt.getTime() - parsedCheckInAt.getTime()) / (1000 * 60)))
    : 0;

  await prisma.attendance.update({
    where: { id },
    data: {
      checkInAt: parsedCheckInAt,
      checkOutAt: parsedCheckOutAt,
      checkInNote: checkInNote || null,
      checkOutNote: checkOutNote || null,
      stayMinutes,
    },
  });

  revalidatePath('/');
}

export async function deleteAttendanceAction(id: string) {
  await prisma.attendance.delete({ where: { id } });
  revalidatePath('/');
}
