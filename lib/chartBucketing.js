function getWeekStart(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as week start
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

function getMonthStart(dateStr) {
  return dateStr.slice(0, 7) + '-01';
}

// Auto-adjusts grouping granularity based on the selected range width, so a
// 1-year view doesn't try to plot 365 individual daily bars.
export function bucketDailyData(daily, dateFrom, dateTo) {
  const rangeDays =
    Math.round((new Date(dateTo) - new Date(dateFrom)) / (1000 * 60 * 60 * 24)) + 1;

  if (rangeDays <= 31) {
    return { granularity: 'daily', points: daily.map((d) => ({ label: d.date, signups: d.signups })) };
  }

  if (rangeDays <= 180) {
    const buckets = {};
    daily.forEach((d) => {
      const weekStart = getWeekStart(d.date);
      buckets[weekStart] = (buckets[weekStart] || 0) + d.signups;
    });
    const points = Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, signups]) => ({ label, signups }));
    return { granularity: 'weekly', points };
  }

  const buckets = {};
  daily.forEach((d) => {
    const monthStart = getMonthStart(d.date);
    buckets[monthStart] = (buckets[monthStart] || 0) + d.signups;
  });
  const points = Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, signups]) => ({ label, signups }));
  return { granularity: 'monthly', points };
}
