import { AdminOrderList } from "@/features/orders/components/admin-order-list";
import { AgentOrderList } from "@/features/orders/components/agent-order-list";
import { listAgentOrders, listAllOrders } from "@/features/orders/server/queries";
import { ORDER_STATUSES } from "@/features/orders/types";
import { requireActiveUser } from "@/lib/auth/require-role";
import { matchesQuery, paginate, readParam } from "@/lib/list-params";

const PAGE_SIZE = 20;

const OrdersPage = async ({ searchParams }: PageProps<"/orders">): Promise<React.ReactNode> => {
  const user = await requireActiveUser();
  const params = await searchParams;

  if (user.role === "admin") {
    const statusParam = readParam(params.status);
    const status = ORDER_STATUSES.find((option) => option === statusParam) ?? null;
    const query = readParam(params.q);
    const orders = (await listAllOrders(status)).filter((order) =>
      matchesQuery(query, order.number, order.agentName, order.agentCode, order.productName),
    );
    return <AdminOrderList result={paginate(orders, readParam(params.page), PAGE_SIZE)} status={status} query={query} />;
  }

  const placed = readParam(params.placed);
  return <AgentOrderList orders={await listAgentOrders(user.id)} placedNumbers={placed ? placed.split(",") : []} />;
};

export default OrdersPage;
