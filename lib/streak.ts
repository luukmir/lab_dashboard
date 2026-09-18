import { listYear } from '@liha-labs/holiday/full';

const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export async function calculateWeekdayStreak(attendances: { date: Date }[]): Promise<number> {
  if (!attendances.length) return 0;

  const attendedDates = new Set(
    attendances.map((a) => {
      return new Date(a.date).toISOString().slice(0, 10);
    })
  );

  const years = new Set([
    new Date().getFullYear(),
    ...attendances.map((attendance) => new Date(attendance.date).getUTCFullYear()),
  ]);
  const holidays = new Set<string>(
    (await Promise.all([...years].map((year) => listYear(year)))).flat().map((holiday) => holiday.date)
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!attendedDates.has(getDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const day = cursor.getDay(); // 0: 日, 6: 土
    if (day === 0 || day === 6 || holidays.has(getDateKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    if (attendedDates.has(getDateKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
