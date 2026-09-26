import { CheckCircle, MinusCircle, UsersThree } from "@phosphor-icons/react/ssr";
import { DateTime } from "@/components/ui/date-time";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchField } from "@/components/ui/search-field";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableCard } from "@/components/ui/table-card";
import { AgentActions } from "@/features/auth/components/agent-actions";
import { CreateAgentForm } from "@/features/auth/components/create-agent-form";
import { listAgents } from "@/features/auth/server/queries";
import { requireRole } from "@/lib/auth/require-role";
import { matchesQuery, readParam } from "@/lib/list-params";

const muted = <span className="text-muted-foreground">–</span>;

const AgentsPage = async ({ searchParams }: PageProps<"/agents">): Promise<React.ReactNode> => {
  await requireRole("admin");
  const query = readParam((await searchParams).q);
  const agents = await listAgents();
  const visible = agents.filter((agent) => matchesQuery(query, agent.fullName, agent.username, agent.code, agent.city, agent.phone));
  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>Agen</h1>
        <CreateAgentForm />
      </div>
      {agents.length === 0 ? (
        <EmptyState icon={UsersThree} title="Belum ada agen" description="Tambah agen agar mereka bisa masuk dan memesan." />
      ) : (
        <>
          <SearchField label="Cari agen" placeholder="Nama, username, kode, kota, atau HP" defaultValue={query} />
          {visible.length === 0 ? (
            <EmptyState icon={UsersThree} title="Tidak ada agen" description="Tidak ada agen yang cocok dengan pencarian ini." />
          ) : (
            <TableCard>
              <table>
                <caption className="sr-only">Daftar agen</caption>
                <thead>
                  <tr>
                    <th scope="col">Nama</th>
                    <th scope="col">Kota</th>
                    <th scope="col">HP</th>
                    <th scope="col">Status</th>
                    <th scope="col">Pesanan terakhir</th>
                    <th scope="col">
                      <span className="sr-only">Tindakan</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(({ userId, code, fullName, username, city, phone, isActive, lastOrderAt }) => (
                    <tr key={userId}>
                      <td>
                        <span className="flex flex-col py-1">
                          <span className="font-medium">{fullName}</span>
                          <span className="text-sm text-muted-foreground">
                            {code} · {username}
                          </span>
                        </span>
                      </td>
                      <td>{city ?? muted}</td>
                      <td className="whitespace-nowrap">{phone ?? muted}</td>
                      <td>
                        {isActive ? (
                          <StatusBadge tone="success" icon={CheckCircle} label="Aktif" />
                        ) : (
                          <StatusBadge tone="neutral" icon={MinusCircle} label="Nonaktif" />
                        )}
                      </td>
                      <td>{lastOrderAt ? <DateTime value={lastOrderAt} /> : muted}</td>
                      <td className="text-right">
                        <AgentActions userId={userId} username={username} isActive={isActive} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableCard>
          )}
        </>
      )}
    </main>
  );
};

export default AgentsPage;
