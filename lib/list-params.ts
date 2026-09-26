export type ListParams = Record<string, string | undefined>;

export const readParam = (value: string | string[] | undefined): string | undefined => {
  const first = Array.isArray(value) ? value[0] : value;
  const trimmed = first?.trim();
  return trimmed ? trimmed : undefined;
};

export const buildHref = (pathname: string, params: ListParams): string => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
};

export type Page<T> = { items: T[]; page: number; pageCount: number; total: number };

export const paginate = <T>(items: T[], pageParam: string | undefined, pageSize: number): Page<T> => {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const requested = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), pageCount) : 1;
  return { items: items.slice((page - 1) * pageSize, page * pageSize), page, pageCount, total: items.length };
};

export const matchesQuery = (query: string | undefined, ...fields: (string | null | undefined)[]): boolean => {
  if (!query) return true;
  const needle = query.toLocaleLowerCase("id-ID");
  return fields.some((field) => field?.toLocaleLowerCase("id-ID").includes(needle));
};

export const toSearchTerm = (query: string | undefined): string =>
  (query ?? "").replace(/[%_*,()"\\]/g, " ").replace(/\s+/g, " ").trim();
