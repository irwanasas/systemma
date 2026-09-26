export type ValuePoint = { label: string; value: number };

type OrderValue = { createdAt: string; subtotal: number };

const DAY_MS = 24 * 60 * 60 * 1000;

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

export const jakartaDate = (iso: string): string => new Date(new Date(iso).getTime() + JAKARTA_OFFSET_MS).toISOString().slice(0, 10);

const addDays = (date: string, days: number): string => new Date(new Date(`${date}T00:00:00Z`).getTime() + days * DAY_MS).toISOString().slice(0, 10);

const mondayOf = (date: string): string => addDays(date, -((new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7));

const shortLabel = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" });

const labelFor = (date: string): string => shortLabel.format(new Date(`${date}T00:00:00Z`));

export const firstWeekStart = (today: string, weeks: number): string => addDays(mondayOf(today), -7 * (weeks - 1));

export const weeklyValues = (orders: OrderValue[], today: string, weeks: number): ValuePoint[] => {
  const starts = Array.from({ length: weeks }, (_, index) => addDays(firstWeekStart(today, weeks), 7 * index));
  const totals = new Map(starts.map((start) => [start, 0]));
  for (const { createdAt, subtotal } of orders) {
    const week = mondayOf(jakartaDate(createdAt));
    if (totals.has(week)) totals.set(week, (totals.get(week) ?? 0) + subtotal);
  }
  return starts.map((start) => ({ label: labelFor(start), value: totals.get(start) ?? 0 }));
};

export const dailyValues = (orders: OrderValue[], from: string, to: string): ValuePoint[] => {
  const days: string[] = [];
  for (let day = from; day <= to; day = addDays(day, 1)) days.push(day);
  const totals = new Map(days.map((day) => [day, 0]));
  for (const { createdAt, subtotal } of orders) {
    const day = jakartaDate(createdAt);
    if (totals.has(day)) totals.set(day, (totals.get(day) ?? 0) + subtotal);
  }
  return days.map((day) => ({ label: labelFor(day), value: totals.get(day) ?? 0 }));
};
