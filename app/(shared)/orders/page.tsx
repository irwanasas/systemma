import { AdminOrderList } from "@/features/orders/components/admin-order-list";
import { AgentOrderList } from "@/features/orders/components/agent-order-list";
import { listAgentOrders, searchOrders } from "@/features/orders/server/queries";
import { ORDER_STATUSES } from "@/features/orders/types";
import { requireActiveUser } from "@/lib/auth/require-role";
import { readParam } from "@/lib/list-params";

const PAGE_SIZE = 20;

const OrdersPage = async ({ searchParams }: PageProps<"/orders">): Promise<React.ReactNode> => {
  const user = await requireActiveUser();
  const params = await searchParams;

  if (user.role === "admin") {
    const statusParam = readParam(params.status);
    const status = ORDER_STATUSES.find((option) => option === statusParam) ?? null;
    const query = readParam(params.q);
    const requested = Math.max(1, Number.parseInt(readParam(params.page) ?? "1", 10) || 1);
    let result = await searchOrders({ status, query, page: requested, pageSize: PAGE_SIZE });
    const pageCount = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
    const page = Math.min(requested, pageCount);
    if (page !== requested) result = await searchOrders({ status, query, page, pageSize: PAGE_SIZE });
    return <AdminOrderList result={{ ...result, page, pageCount }} status={status} query={query} />;
  }

  const placed = readParam(params.placed);
  return <AgentOrderList orders={await listAgentOrders(user.id)} placedNumbers={placed ? placed.split(",") : []} />;
};

export default OrdersPage;
