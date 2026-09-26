import { AgentActions } from "@/features/auth/components/agent-actions";
import { CreateAgentForm } from "@/features/auth/components/create-agent-form";
import { listAgents } from "@/features/auth/server/queries";
import { requireRole } from "@/lib/auth/require-role";

const AgentsPage = async (): Promise<React.ReactNode> => {
  await requireRole("admin");
  const agents = await listAgents();
  return (
    <main>
      <h1>Agen</h1>
      <section aria-labelledby="agent-list-heading">
        <h2 id="agent-list-heading">Daftar agen</h2>
        {agents.length === 0 ? (
          <p>Belum ada agen.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th scope="col">Kode</th>
                <th scope="col">Nama</th>
                <th scope="col">Username</th>
                <th scope="col">Kota</th>
                <th scope="col">Status</th>
                <th scope="col">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(({ userId, code, fullName, username, city, isActive }) => (
                <tr key={userId}>
                  <td>{code}</td>
                  <td>{fullName}</td>
                  <td>{username}</td>
                  <td>{city ?? "–"}</td>
                  <td>{isActive ? "Aktif" : "Nonaktif"}</td>
                  <td>
                    <AgentActions userId={userId} username={username} isActive={isActive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section aria-labelledby="create-agent-heading">
        <h2 id="create-agent-heading">Tambah agen</h2>
        <CreateAgentForm />
      </section>
    </main>
  );
};

export default AgentsPage;
