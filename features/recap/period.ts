const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type RecapPeriod = {
  from: string;
  to: string;
  fromIso: string;
  toExclusiveIso: string;
};

const jakartaToday = (): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

const nextDay = (date: string): string => {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
};

export const parseRecapPeriod = (from: unknown, to: unknown): RecapPeriod => {
  const today = jakartaToday();
  const validTo = typeof to === "string" && DATE_PATTERN.test(to) ? to : today;
  const validFrom = typeof from === "string" && DATE_PATTERN.test(from) && from <= validTo ? from : `${validTo.slice(0, 7)}-01`;
  return {
    from: validFrom,
    to: validTo,
    fromIso: new Date(`${validFrom}T00:00:00+07:00`).toISOString(),
    toExclusiveIso: new Date(`${nextDay(validTo)}T00:00:00+07:00`).toISOString(),
  };
};
