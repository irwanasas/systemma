import { requireRole } from "@/lib/auth/require-role";

const CatalogPage = async (): Promise<React.ReactNode> => {
  await requireRole("agent");
  return (
    <main>
      <h1>Katalog</h1>
    </main>
  );
};

export default CatalogPage;
