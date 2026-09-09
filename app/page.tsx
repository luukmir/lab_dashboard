// app/page.tsx
import prisma from '@/lib/prisma';
import { calculateWeekdayStreak } from '@/lib/streak';
import { CheckInCard } from '@/components/CheckInCard';
import { AttendanceHeatmap } from '@/components/AttendanceHeatmap';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Activity, Flame, Clock, CalendarDays } from 'lucide-react';
import type { Attendance } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const records: Attendance[] = await prisma.attendance.findMany({
    orderBy: { date: 'desc' },
  });

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const todayRecord = records.find((r: Attendance) => {
    const d = new Date(r.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === todayStr;
  });

  const streak = calculateWeekdayStreak(records);
  const recentRecords = records.slice(0, 8);

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
                {todayRecord?.stayMinutes ? `${Math.floor(todayRecord.stayMinutes / 60)}h ${todayRecord.stayMinutes % 60}m` : '--'}
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="pb-3 px-3 w-32">日付</th>
                <th className="pb-3 px-3 w-24">始業</th>
                <th className="pb-3 px-3 w-24">終業</th>
                <th className="pb-3 px-3 w-28">滞在時間</th>
                <th className="pb-3 px-3">朝のひとこと / 目標</th>
                <th className="pb-3 px-3">帰りのひとこと / 進捗</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {recentRecords.map((r: Attendance) => {
                const d = new Date(r.date);
                const dateText = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                return (
                  <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-3 font-mono text-zinc-700 dark:text-zinc-300 font-medium">{dateText}</td>
                    <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400 font-mono">
                      {r.checkInAt ? new Date(r.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400 font-mono">
                      {r.checkOutAt ? new Date(r.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                      {r.stayMinutes > 0 ? `${Math.floor(r.stayMinutes / 60)}h ${r.stayMinutes % 60}m` : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-zinc-800 dark:text-zinc-200">{r.checkInNote || <span className="text-zinc-400 dark:text-zinc-600">-</span>}</td>
                    <td className="py-3.5 px-3 text-zinc-800 dark:text-zinc-200">{r.checkOutNote || <span className="text-zinc-400 dark:text-zinc-600">-</span>}</td>
                  </tr>
                );
              })}
              {recentRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400 dark:text-zinc-500 text-sm">
                    まだ記録がありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
