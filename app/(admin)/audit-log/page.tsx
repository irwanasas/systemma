import type { Icon } from "@phosphor-icons/react";
import {
  ClockCounterClockwise,
  Gear,
  Megaphone,
  Package,
  Receipt,
  ShoppingCartSimple,
  TShirt,
  CalendarBlank,
  User,
} from "@phosphor-icons/react/ssr";
import { ListFilterSelect, ListPager, ListSearch } from "@/components/ui/list-controls";
import { DateTime } from "@/components/ui/date-time";
import { EmptyState } from "@/components/ui/empty-state";
import { TableCard } from "@/components/ui/table-card";
import { auditActionLabel, auditActionsMatching, auditEntityLabel } from "@/features/audit/labels";
import { listAuditActors, listAuditEntities, listAuditLogs } from "@/features/audit/server/queries";
import { requireRole } from "@/lib/auth/require-role";
import { pageRange, readPage, readPageSize, readParam } from "@/lib/list-params";

const entityIcons: Record<string, Icon> = {
  announcement: Megaphone,
  cart: ShoppingCartSimple,
  cart_item: ShoppingCartSimple,
  order: Package,
  payment: Receipt,
  po_batch: CalendarBlank,
  product: TShirt,
  settings: Gear,
  user: User,
};

const AuditLogPage = async ({ searchParams }: PageProps<"/audit-log">): Promise<React.ReactNode> => {
  await requireRole("admin");
  const params = await searchParams;
  const [entities, actors] = await Promise.all([listAuditEntities(), listAuditActors()]);
  const entityParam = readParam(params.entity);
  const actorParam = readParam(params.actor);
  const entityFilter = entityParam && entities.includes(entityParam) ? entityParam : null;
  const actorFilter = actors.find(({ id }) => id === actorParam)?.id ?? null;
  const query = readParam(params.q);
  const pageSize = readPageSize(readParam(params.size), 50);
  const search = {
    entity: entityFilter,
    actor: actorFilter,
    actions: query ? auditActionsMatching(query) : null,
    pageSize,
  };
  const requested = readPage(readParam(params.page));
  const first = await listAuditLogs({ ...search, page: requested });
  const page = Math.min(requested, pageRange(requested, pageSize, first.total).pageCount);
  const { items: entries, total } = page === requested ? first : await listAuditLogs({ ...search, page });

  return (
    <main>
      <h1>Log audit</h1>
      <div className="flex flex-col gap-3">
        <ListSearch label="Cari tindakan" placeholder="Cari tindakan, misalnya DP disetujui" />
        <div className="flex flex-wrap items-end gap-3">
          <ListFilterSelect
            id="entity"
            param="entity"
            label="Jenis data"
            allLabel="Semua jenis"
            options={entities.map((option) => ({ value: option, label: auditEntityLabel(option) }))}
          />
          <ListFilterSelect
            id="actor"
            param="actor"
            label="Pelaku"
            allLabel="Semua pelaku"
            options={actors.map(({ id, name }) => ({ value: id, label: name }))}
          />
        </div>
      </div>
      {entries.length === 0 ? (
        <EmptyState icon={ClockCounterClockwise} title="Tidak ada catatan" description="Tidak ada catatan untuk filter ini." />
      ) : (
        <TableCard>
          <table>
            <caption className="sr-only">Catatan audit</caption>
            <thead>
              <tr>
                <th scope="col">Waktu</th>
                <th scope="col">Pelaku</th>
                <th scope="col">Tindakan</th>
                <th scope="col">Data</th>
                <th scope="col">
                  <span className="sr-only">Rincian</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map(({ id, createdAt, actorName, action, entity: entryEntity, entityId, before, after }) => {
                const EntityIcon = entityIcons[entryEntity] ?? ClockCounterClockwise;
                const hasDetails = before !== null || after !== null;
                return (
                  <tr key={id} className="align-top">
                    <td className="text-muted-foreground">
                      <DateTime value={createdAt} />
                    </td>
                    <td>{actorName ?? <span className="text-muted-foreground">Sistem</span>}</td>
                    <td className="font-medium">{auditActionLabel(action)}</td>
                    <td>
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        <EntityIcon aria-hidden="true" className="size-4 text-muted-foreground" />
                        {auditEntityLabel(entryEntity)}
                        {entityId && <code className="text-sm text-muted-foreground">{entityId.slice(0, 8)}</code>}
                      </span>
                    </td>
                    <td>
                      {hasDetails && (
                        <details className="group">
                          <summary className="inline-flex min-h-9 list-none items-center rounded-md px-2 text-sm font-medium text-primary-strong hover:bg-muted [&::-webkit-details-marker]:hidden">
                            <span className="group-open:hidden">Lihat</span>
                            <span className="hidden group-open:inline">Tutup</span>
                          </summary>
                          <div className="mt-2 flex max-w-md flex-col gap-2">
                            {before !== null && (
                              <pre className="rounded-md bg-muted p-2">Sebelum: {JSON.stringify(before, null, 2)}</pre>
                            )}
                            {after !== null && <pre className="rounded-md bg-muted p-2">Sesudah: {JSON.stringify(after, null, 2)}</pre>}
                          </div>
                        </details>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableCard>
      )}
      {total > 0 && <ListPager total={total} page={page} pageSize={pageSize} />}
    </main>
  );
};

export default AuditLogPage;
