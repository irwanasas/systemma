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
