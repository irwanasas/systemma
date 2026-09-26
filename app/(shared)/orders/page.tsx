import { AdminOrderList } from "@/features/orders/components/admin-order-list";
import { AgentOrderList } from "@/features/orders/components/agent-order-list";
import { listAgentOrders, listAllOrders } from "@/features/orders/server/queries";
import { ORDER_STATUSES, type OrderStatus } from "@/features/orders/types";
import { requireActiveUser } from "@/lib/auth/require-role";

const OrdersPage = async ({ searchParams }: PageProps<"/orders">): Promise<React.ReactNode> => {
  const user = await requireActiveUser();
  const { placed, status } = await searchParams;

  if (user.role === "admin") {
    const statusFilter = ORDER_STATUSES.find((option) => option === status) ?? null;
    return <AdminOrderList orders={await listAllOrders(statusFilter as OrderStatus | null)} status={statusFilter} />;
  }

  const placedNumbers = typeof placed === "string" ? placed.split(",") : [];
  return <AgentOrderList orders={await listAgentOrders(user.id)} placedNumbers={placedNumbers} />;
};

export default OrdersPage;
