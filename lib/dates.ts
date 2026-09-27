const JAKARTA_TIME_ZONE = "Asia/Jakarta";

const JAKARTA_OFFSET = "+07:00";

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: JAKARTA_TIME_ZONE,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: JAKARTA_TIME_ZONE });

export const formatDateTime = (value: string | Date): string => `${dateTimeFormatter.format(new Date(value))} WIB`;

export const formatDate = (value: string | Date): string => dateFormatter.format(new Date(value));

export const jakartaInputToIso = (value: string): string | null => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00${JAKARTA_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const isoToJakartaInput = (value: string): string =>
  new Date(new Date(value).getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16);

export const hoursFromNow = (hours: number): Date => new Date(Date.now() + hours * 60 * 60 * 1000);

const shortDateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: JAKARTA_TIME_ZONE,
});

export const formatShortDateTime = (value: string | Date): string => shortDateTimeFormatter.format(new Date(value));

const relativeFormatter = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });

export const formatRelativeTime = (value: string, now: number = Date.now()): string => {
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  if (Math.abs(seconds) < 60) return "baru saja";
  if (Math.abs(seconds) >= 7 * 86400) return formatShortDateTime(value);
  const [unit, size] = units.find(([, unitSeconds]) => Math.abs(seconds) >= unitSeconds) ?? ["minute", 60];
  return relativeFormatter.format(Math.round(seconds / size), unit);
};
