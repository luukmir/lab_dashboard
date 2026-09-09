export function calculateWeekdayStreak(attendances: { date: Date }[]): number {
  if (!attendances.length) return 0;

  const attendedDates = new Set(
    attendances.map((a) => {
      const d = new Date(a.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  const getFormat = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  if (!attendedDates.has(getFormat(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const day = cursor.getDay(); // 0: 日, 6: 土
    if (day === 0 || day === 6) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    if (attendedDates.has(getFormat(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
