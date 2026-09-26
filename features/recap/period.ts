const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isValidDate = (value: unknown): value is string => {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

export type RecapPeriod = {
  from: string;
  to: string;
  fromIso: string;
  toExclusiveIso: string;
};

export const jakartaToday = (): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

const nextDay = (date: string): string => {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
};

export const parseRecapPeriod = (from: unknown, to: unknown): RecapPeriod => {
  const today = jakartaToday();
  const validTo = isValidDate(to) ? to : today;
  const validFrom = isValidDate(from) && from <= validTo ? from : `${validTo.slice(0, 7)}-01`;
  return {
    from: validFrom,
    to: validTo,
    fromIso: new Date(`${validFrom}T00:00:00+07:00`).toISOString(),
    toExclusiveIso: new Date(`${nextDay(validTo)}T00:00:00+07:00`).toISOString(),
  };
};

export type RecapPreset = { label: string; from: string; to: string };

const shiftDays = (date: string, days: number): string => {
  const shifted = new Date(`${date}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
};

export const recapPresets = (today: string): RecapPreset[] => {
  const monthStart = `${today.slice(0, 7)}-01`;
  const lastMonthEnd = shiftDays(monthStart, -1);
  return [
    { label: "Bulan ini", from: monthStart, to: today },
    { label: "Bulan lalu", from: `${lastMonthEnd.slice(0, 7)}-01`, to: lastMonthEnd },
    { label: "7 hari terakhir", from: shiftDays(today, -6), to: today },
    { label: "30 hari terakhir", from: shiftDays(today, -29), to: today },
    { label: "Tahun ini", from: `${today.slice(0, 4)}-01-01`, to: today },
  ];
};
