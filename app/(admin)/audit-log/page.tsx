import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";
import {
  CaretLeft,
  CaretRight,
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
import { Button } from "@/components/ui/button";
import { DateTime } from "@/components/ui/date-time";
import { EmptyState } from "@/components/ui/empty-state";
import { TableCard } from "@/components/ui/table-card";
import { auditActionLabel, auditEntityLabel } from "@/features/audit/labels";
import { AUDIT_PAGE_SIZE, listAuditActors, listAuditEntities, listAuditLogs } from "@/features/audit/server/queries";
import { requireRole } from "@/lib/auth/require-role";
import { buildHref, readParam } from "@/lib/list-params";

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
  const pageNumber = Math.max(0, Number.parseInt(readParam(params.page) ?? "0", 10) || 0);
  const entries = await listAuditLogs(entityFilter, actorFilter, pageNumber);
  const pageLink = (target: number): string =>
    buildHref("/audit-log", {
      entity: entityFilter ?? undefined,
      actor: actorFilter ?? undefined,
      page: target > 0 ? String(target) : undefined,
    });
  const hasNewer = pageNumber > 0;
  const hasOlder = entries.length === AUDIT_PAGE_SIZE;

  return (
    <main>
      <h1>Log audit</h1>
      <form method="get" className="!flex-row !flex-wrap !items-end !gap-2">
        <div className="!w-auto">
          <label htmlFor="entity">Jenis data</label>
          <select id="entity" name="entity" defaultValue={entityFilter ?? ""}>
            <option value="">Semua jenis</option>
            {entities.map((option) => (
              <option key={option} value={option}>
                {auditEntityLabel(option)}
              </option>
            ))}
          </select>
        </div>
        <div className="!w-auto">
          <label htmlFor="actor">Pelaku</label>
          <select id="actor" name="actor" defaultValue={actorFilter ?? ""}>
            <option value="">Semua pelaku</option>
            {actors.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="outline" className="min-h-[var(--control-height)] text-ui">
          Terapkan
        </Button>
      </form>
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
      {(hasNewer || hasOlder) && (
        <nav aria-label="Halaman log" className="flex justify-end gap-2">
          {hasNewer && (
            <Button asChild variant="outline" size="sm" className="min-h-9 text-ui">
              <Link href={pageLink(pageNumber - 1)} className="text-foreground no-underline hover:no-underline">
                <CaretLeft aria-hidden="true" />
                Lebih baru
              </Link>
            </Button>
          )}
          {hasOlder && (
            <Button asChild variant="outline" size="sm" className="min-h-9 text-ui">
              <Link href={pageLink(pageNumber + 1)} className="text-foreground no-underline hover:no-underline">
                Lebih lama
                <CaretRight aria-hidden="true" />
              </Link>
            </Button>
          )}
        </nav>
      )}
    </main>
  );
};

export default AuditLogPage;
