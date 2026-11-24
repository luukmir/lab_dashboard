'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AttendanceLogActions } from '@/components/AttendanceLogActions';
import type { Attendance } from '@prisma/client';

const PAGE_SIZE = 15;

export function AttendanceLogTable({ records }: { records: Attendance[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageCount = Math.ceil(records.length / PAGE_SIZE);
  const visiblePage = Math.min(currentPage, Math.max(pageCount, 1));
  const pageRecords = records.slice((visiblePage - 1) * PAGE_SIZE, visiblePage * PAGE_SIZE);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="pb-3 px-3 w-32">日付</th>
              <th className="pb-3 px-3 w-24">始業</th>
              <th className="pb-3 px-3 w-24">終業</th>
              <th className="pb-3 px-3 w-28">滞在時間</th>
              <th className="pb-3 px-3 w-[280px]">朝のひとこと / 目標</th>
              <th className="pb-3 px-3 w-[280px]">帰りのひとこと / 進捗</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {pageRecords.map((record) => (
              <AttendanceLogActions key={record.id} record={record} />
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-400 dark:text-zinc-500 text-sm">
                  まだ記録がありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <nav className="mt-5 flex items-center justify-center gap-1" aria-label="打刻ログのページ一覧">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={visiblePage === 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="前のページ"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              aria-current={visiblePage === page ? 'page' : undefined}
              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors ${visiblePage === page
                ? 'bg-emerald-600 font-semibold text-white dark:bg-emerald-500 dark:text-zinc-950'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
            disabled={visiblePage === pageCount}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="次のページ"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </>
  );
}
