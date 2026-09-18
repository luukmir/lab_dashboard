// components/CheckInCard.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { checkInAction, checkOutAction } from '@/app/actions';
import { LogIn, LogOut, Sparkles, CheckCircle2 } from 'lucide-react';

const timeFormatOptions: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Tokyo',
};

interface Props {
  todayRecord?: {
    checkInAt: Date | null;
    checkInNote: string | null;
    checkOutAt: Date | null;
    checkOutNote: string | null;
  } | null;
}

export function CheckInCard({ todayRecord }: Props) {
  const router = useRouter();
  const [inNote, setInNote] = useState(todayRecord?.checkInNote || '');
  const [outNote, setOutNote] = useState(todayRecord?.checkOutNote || '');
  const [checkInTime, setCheckInTime] = useState<Date | null>(todayRecord?.checkInAt && !todayRecord.checkOutAt ? new Date(todayRecord.checkInAt) : null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(todayRecord?.checkInAt && todayRecord.checkOutAt ? new Date(todayRecord.checkOutAt) : null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckIn = async () => {
    setIsLoading(true);
    await checkInAction(inNote);
    setCheckInTime(new Date());
    setCheckOutTime(null);
    setInNote('');
    setOutNote('');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7 },
    });
    setIsLoading(false);
    router.refresh();
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    await checkOutAction(outNote);
    setCheckInTime(null);
    setCheckOutTime(new Date());
    setOutNote('');
    setIsLoading(false);
    router.refresh();
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">本日のタイムカード</span>
          {checkInTime && (
            <span className="flex items-center gap-1 text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 px-2 py-0.5 rounded-md font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> 登校中
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
        {/* 始業 */}
        <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">始業メモ（今日の目標・タスク）</span>
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
              {checkInTime
                ? checkInTime.toLocaleTimeString('ja-JP', timeFormatOptions)
                : '未打刻'}
            </span>
          </div>
          <textarea
            placeholder="今日は何をしよう？"
            value={inNote}
            onChange={(e) => setInNote(e.target.value)}
            className="w-full flex-1 min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg p-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none mb-3"
          />
          <button
            onClick={handleCheckIn}
            disabled={isLoading || !!checkInTime}
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 disabled:shadow-none dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500 text-white font-medium py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            {checkInTime ? '始業済み' : '登校する'}
          </button>
        </div>

        {/* 終業 */}
        <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">終業メモ（進捗・振り返り・明日やること）</span>
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
              {checkOutTime
                ? checkOutTime.toLocaleTimeString('ja-JP', timeFormatOptions)
                : '未打刻'}
            </span>
          </div>
          <textarea
            placeholder="今日はどんな一日だった？"
            value={outNote}
            onChange={(e) => setOutNote(e.target.value)}
            className="w-full flex-1 min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg p-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none mb-3"
          />
          <button
            onClick={handleCheckOut}
            disabled={isLoading || !checkInTime}
            className="w-full border border-blue-700/30 bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-700/20 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-700/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-200 disabled:text-zinc-500 disabled:shadow-none dark:disabled:border-zinc-700 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
          >
            <LogOut className="w-4 h-4" />
            {checkOutTime && !checkInTime ? '下校済み' : checkOutTime ? '終業コメントを更新' : '下校する'}
          </button>
        </div>
      </div>
    </div>
  );
}
