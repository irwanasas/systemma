import Link from "next/link";
import { AUDIT_PAGE_SIZE, listAuditEntities, listAuditLogs } from "@/features/audit/server/queries";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/dates";

const AuditLogPage = async ({ searchParams }: PageProps<"/audit-log">): Promise<React.ReactNode> => {
  await requireRole("admin");
  const { entity, page } = await searchParams;
  const entities = await listAuditEntities();
  const entityFilter = typeof entity === "string" && entities.includes(entity) ? entity : null;
  const pageNumber = Math.max(0, Number.parseInt(typeof page === "string" ? page : "0", 10) || 0);
  const entries = await listAuditLogs(entityFilter, pageNumber);
  const pageLink = (target: number): string =>
    `/audit-log?${new URLSearchParams({ ...(entityFilter ? { entity: entityFilter } : {}), page: String(target) })}`;

  return (
    <main>
      <h1>Log audit</h1>
      <form method="get" className="!flex-row flex-wrap !items-end">
      <div className="!w-auto">
        <label htmlFor="entity">Jenis data</label>
        <select id="entity" name="entity" defaultValue={entityFilter ?? ""}>
          <option value="">Semua</option>
          {entities.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        </div>
        <button type="submit">Terapkan</button>
      </form>
      {entries.length === 0 ? (
        <p>Tidak ada catatan.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Waktu</th>
              <th scope="col">Pelaku</th>
              <th scope="col">Tindakan</th>
              <th scope="col">Data</th>
              <th scope="col">Rincian</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(({ id, createdAt, actorName, action, entity: entryEntity, entityId, before, after }) => (
              <tr key={id}>
                <td>{formatDateTime(createdAt)}</td>
                <td>{actorName ?? "Sistem"}</td>
                <td>{action}</td>
                <td>
                  {entryEntity}
                  {entityId && ` ${entityId.slice(0, 8)}`}
                </td>
                <td>
                  {(before !== null || after !== null) && (
                    <details>
                      <summary>Lihat</summary>
                      {before !== null && <pre>Sebelum: {JSON.stringify(before, null, 2)}</pre>}
                      {after !== null && <pre>Sesudah: {JSON.stringify(after, null, 2)}</pre>}
                    </details>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <nav aria-label="Halaman log">
        {pageNumber > 0 && <Link href={pageLink(pageNumber - 1)}>Lebih baru</Link>}{" "}
        {entries.length === AUDIT_PAGE_SIZE && <Link href={pageLink(pageNumber + 1)}>Lebih lama</Link>}
      </nav>
    </main>
  );
};

export default AuditLogPage;
