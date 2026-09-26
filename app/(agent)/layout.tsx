import { AppHeader } from "@/components/layout/app-header";
import { requireRole } from "@/lib/auth/require-role";

const agentLinks = [
  { href: "/catalog", label: "Katalog" },
  { href: "/cart", label: "Keranjang" },
  { href: "/orders", label: "Pesanan" },
  { href: "/change-password", label: "Ganti password" },
];

const AgentLayout = async ({ children }: LayoutProps<"/">): Promise<React.ReactNode> => {
  const user = await requireRole("agent");
  return (
    <>
      <AppHeader fullName={user.fullName} links={agentLinks} />
      {children}
    </>
  );
};

export default AgentLayout;
