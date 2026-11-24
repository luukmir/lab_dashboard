// app/page.tsx
import prisma from '@/lib/prisma';
import { calculateWeekdayStreak } from '@/lib/streak';
import { CheckInCard } from '@/components/CheckInCard';
import { AttendanceHeatmap } from '@/components/AttendanceHeatmap';
import { AttendanceLogTable } from '@/components/AttendanceLogTable';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Activity, Flame, Clock, CalendarDays, Timer } from 'lucide-react';
import type { Attendance } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const records: Attendance[] = await prisma.attendance.findMany({
    orderBy: { date: 'desc' },
  });

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const todayRecord = records.find((r: Attendance) => {
    return new Date(r.date).toISOString().slice(0, 10) === todayStr;
  });

  const streak = await calculateWeekdayStreak(records);
  const currentStayMinutes = todayRecord?.checkInAt
    ? todayRecord.checkOutAt
      ? todayRecord.stayMinutes
      : Math.max(0, Math.floor((now.getTime() - new Date(todayRecord.checkInAt).getTime()) / (1000 * 60)))
    : 0;
  const totalStayMinutes = records.reduce((total, record) => total + record.stayMinutes, 0)
    + (todayRecord?.checkOutAt ? 0 : currentStayMinutes);

  return (
    <main className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 lg:p-8 flex flex-col gap-6 transition-colors duration-200">
      {/* トップヘッダー */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 dark:bg-emerald-500 dark:text-zinc-950">
            <Activity className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Lab Dashboard</h1>
            <p className="mt-0.5 text-xs font-medium tracking-wide text-zinc-500 dark:text-zinc-400">研究室ログ</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* メトリクス */}
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-2xl shadow-sm">
            <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
            <div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">連続ストリーク</div>
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{streak} <span className="text-xs font-normal">日</span></div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-2xl shadow-sm">
            <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
            <div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">本日の滞在時間</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {currentStayMinutes ? `${Math.floor(currentStayMinutes / 60)}h ${currentStayMinutes % 60}m` : '--'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-2xl shadow-sm">
            <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            <div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">累計登校</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{records.length} <span className="text-xs font-normal">日</span></div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-2xl shadow-sm">
            <Timer className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            <div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">総滞在時間</div>
              <div className="text-lg font-bold text-violet-600 dark:text-violet-400">
                {Math.floor(totalStayMinutes / 60)}h {totalStayMinutes % 60}m
              </div>
            </div>
          </div>

          {/* テーマ切り替えボタン */}
          <ThemeToggle />
        </div>
      </header>

      {/* メインエリア */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div className="xl:col-span-7">
          <CheckInCard todayRecord={todayRecord} />
        </div>

        <div className="xl:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">登校ヒートマップ</span>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span>0時間</span>
              <span className="w-3 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
              <span className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-900" />
              <span className="w-3 h-3 rounded bg-emerald-400 dark:bg-emerald-700" />
              <span className="w-3 h-3 rounded bg-emerald-500 dark:bg-emerald-500" />
              <span className="w-3 h-3 rounded bg-emerald-700 dark:bg-emerald-400" />
              <span>9時間以上</span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[160px]">
            <AttendanceHeatmap records={records} />
          </div>
        </div>
      </div>

      {/* 直近の打刻ログ */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex-1">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">直近の打刻ログ</h2>
        <AttendanceLogTable records={records} />
      </div>
    </main>
  );
}
