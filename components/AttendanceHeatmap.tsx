// components/AttendanceHeatmap.tsx
'use client';

import { addDays, format, startOfWeek } from 'date-fns';

interface RecordItem {
  date: Date;
  stayMinutes: number;
}

interface HeatmapValue {
  date: string;
  count: number;
}

export function AttendanceHeatmap({ records }: { records: RecordItem[] }) {
  const endDate = new Date();
  const lastMonday = startOfWeek(endDate, { weekStartsOn: 1 });
  const weekCount = 16;
  const firstMonday = addDays(lastMonday, -(weekCount - 1) * 7);

  const values: HeatmapValue[] = records.map((r: RecordItem) => {
    const d = new Date(r.date);
    return {
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      count: r.stayMinutes,
    };
  });
  const valueByDate = new Map(values.map((value) => [value.date, value.count]));
  const weeks = Array.from({ length: weekCount }, (_, weekIndex) => {
    const monday = addDays(firstMonday, weekIndex * 7);
    return Array.from({ length: 7 }, (_, weekdayIndex) => addDays(monday, weekdayIndex));
  });

  const getLevel = (count: number) => {
    if (count === 0) return 'color-empty';
    if (count < 180) return 'color-scale-1';
    if (count < 360) return 'color-scale-2';
    if (count < 540) return 'color-scale-3';
    return 'color-scale-4';
  };

  return (
    <div className="w-full flex flex-col justify-center overflow-x-auto py-2">
      <style jsx global>{`
        .attendance-heatmap-cell { width: 100%; aspect-ratio: 1; border-radius: 3px; }
        .attendance-heatmap .color-empty { background: #ebedf0; }
        .attendance-heatmap .color-scale-1 { background: #9be9a8; }
        .attendance-heatmap .color-scale-2 { background: #40c463; }
        .attendance-heatmap .color-scale-3 { background: #30a14e; }
        .attendance-heatmap .color-scale-4 { background: #216e39; }
        :global(.dark) .attendance-heatmap .color-empty { background: #161b22; }
        :global(.dark) .attendance-heatmap .color-scale-1 { background: #0e4429; }
        :global(.dark) .attendance-heatmap .color-scale-2 { background: #006d32; }
        :global(.dark) .attendance-heatmap .color-scale-3 { background: #26a641; }
        :global(.dark) .attendance-heatmap .color-scale-4 { background: #39d353; }
      `}</style>

      <div className="attendance-heatmap w-full min-w-[250px]">
        <div className="flex gap-2">
          <div className="w-5 shrink-0" />
          <div className="grid min-w-0 flex-1 gap-1" style={{ gridTemplateColumns: `repeat(${weekCount}, minmax(0, 1fr))` }}>
            {weeks.map((week, weekIndex) => (
              <span key={weekIndex} className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {week[0].getDate() <= 7 ? format(week[0], 'M月') : ''}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-1 flex gap-2">
          <div className="grid w-5 shrink-0 grid-rows-7 gap-1 text-[10px] leading-[1] text-zinc-500 dark:text-zinc-400">
            {['日', '月', '火', '水', '木', '金', '土'].map((label) => <span key={label}>{label}</span>)}
          </div>
          <div className="grid min-w-0 flex-1 grid-rows-7 grid-flow-col gap-1" style={{ gridTemplateColumns: `repeat(${weekCount}, minmax(0, 1fr))` }}>
            {weeks.flatMap((week) => week.map((date) => {
              const dateText = format(date, 'yyyy-MM-dd');
              const count = valueByDate.get(dateText) ?? 0;
              const hours = Math.floor(count / 60);
              const mins = count % 60;
              return (
                <span
                  key={dateText}
                  className={`attendance-heatmap-cell ${getLevel(count)}`}
                  title={`${dateText}: 滞在時間 ${hours}時間${mins}分`}
                />
              );
            }))}
          </div>
        </div>
      </div>
    </div>
  );
}
