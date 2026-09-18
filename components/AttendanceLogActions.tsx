'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { deleteAttendanceAction, updateAttendanceAction } from '@/app/actions';
import { ExpandableNote } from '@/components/ExpandableNote';

interface AttendanceRecord {
  id: string;
  date: Date;
  checkInAt: Date | null;
  checkInNote: string | null;
  checkOutAt: Date | null;
  checkOutNote: string | null;
  stayMinutes: number;
}

function toDateTimeLocal(value: Date | null) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
}

function formatDate(value: Date) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatTime(value: Date | null) {
  return value ? new Date(value).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }) : '-';
}

export function AttendanceLogActions({ record }: { record: AttendanceRecord }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [checkInAt, setCheckInAt] = useState(toDateTimeLocal(record.checkInAt));
  const [checkOutAt, setCheckOutAt] = useState(toDateTimeLocal(record.checkOutAt));
  const [checkInNote, setCheckInNote] = useState(record.checkInNote || '');
  const [checkOutNote, setCheckOutNote] = useState(record.checkOutNote || '');

  const cancelEditing = () => {
    setCheckInAt(toDateTimeLocal(record.checkInAt));
    setCheckOutAt(toDateTimeLocal(record.checkOutAt));
    setCheckInNote(record.checkInNote || '');
    setCheckOutNote(record.checkOutNote || '');
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateAttendanceAction(record.id, checkInAt, checkOutAt, checkInNote, checkOutNote);
    setIsSaving(false);
    setIsEditing(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!window.confirm('この打刻ログを削除しますか？')) return;
    setIsSaving(true);
    await deleteAttendanceAction(record.id);
    router.refresh();
  };

  const parsedCheckIn = checkInAt ? new Date(checkInAt) : null;
  const parsedCheckOut = checkOutAt ? new Date(checkOutAt) : null;
  const editedStayMinutes = parsedCheckIn && parsedCheckOut
    ? Math.max(0, Math.floor((parsedCheckOut.getTime() - parsedCheckIn.getTime()) / (1000 * 60)))
    : 0;

  const inputClass = 'w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';
  const noteClass = `${inputClass} min-h-16 resize-y`;

  return (
    <tr className={`group transition-colors ${isEditing ? 'bg-emerald-50/60 dark:bg-emerald-950/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}>
      <td className="py-3.5 px-3 font-mono font-medium text-zinc-700 dark:text-zinc-300">{formatDate(record.date)}</td>
      <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400 font-mono">
        {isEditing ? <input aria-label="始業日時" type="datetime-local" value={checkInAt} onChange={(event) => setCheckInAt(event.target.value)} className={inputClass} /> : formatTime(record.checkInAt)}
      </td>
      <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400 font-mono">
        {isEditing ? <input aria-label="終業日時" type="datetime-local" value={checkOutAt} onChange={(event) => setCheckOutAt(event.target.value)} className={inputClass} /> : formatTime(record.checkOutAt)}
      </td>
      <td className="py-3.5 px-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
        {isEditing
          ? editedStayMinutes > 0 ? `${Math.floor(editedStayMinutes / 60)}h ${editedStayMinutes % 60}m` : '-'
          : record.stayMinutes > 0 ? `${Math.floor(record.stayMinutes / 60)}h ${record.stayMinutes % 60}m` : '-'}
      </td>
      <td className="w-[280px] max-w-[280px] py-3.5 px-3 text-zinc-800 dark:text-zinc-200">
        {isEditing ? <textarea aria-label="始業メモ" value={checkInNote} onChange={(event) => setCheckInNote(event.target.value)} className={noteClass} /> : <ExpandableNote note={record.checkInNote} />}
      </td>
      <td className="w-[280px] max-w-[280px] py-3.5 px-3 text-zinc-800 dark:text-zinc-200">
        {isEditing ? <textarea aria-label="終業メモ" value={checkOutNote} onChange={(event) => setCheckOutNote(event.target.value)} className={noteClass} /> : <ExpandableNote note={record.checkOutNote} />}
      </td>
      <td className="w-20 px-3">
        <div className={isEditing
          ? 'flex items-center justify-end gap-2'
          : 'pointer-events-none flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100'}>
          {isEditing ? (
            <>
              <button type="button" onClick={handleSave} disabled={isSaving} className="text-emerald-600 hover:text-emerald-500 disabled:opacity-50" aria-label="変更を保存" title="保存"><Check className="h-4 w-4" /></button>
              <button type="button" onClick={cancelEditing} disabled={isSaving} className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200" aria-label="編集をキャンセル" title="キャンセル"><X className="h-4 w-4" /></button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setIsEditing(true)} className="text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400" aria-label="ログを編集" title="編集"><Pencil className="h-4 w-4" /></button>
              <button type="button" onClick={handleDelete} disabled={isSaving} className="text-zinc-500 hover:text-red-600 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-red-400" aria-label="ログを削除" title="削除"><Trash2 className="h-4 w-4" /></button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
