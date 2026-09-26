const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

export const e2eDatabaseUrl = (): string => {
  const url = process.env.E2E_DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
  const { hostname } = new URL(url);
  if (!LOCAL_HOSTS.has(hostname)) throw new Error(`E2E_DATABASE_URL must point to a local database, got host ${hostname}`);
  return url;
};
