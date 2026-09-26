import { requireRole } from "@/lib/auth/require-role";

const DashboardPage = async (): Promise<React.ReactNode> => {
  await requireRole("admin");
  return (
    <main>
      <h1>Dasbor</h1>
    </main>
  );
};

export default DashboardPage;
