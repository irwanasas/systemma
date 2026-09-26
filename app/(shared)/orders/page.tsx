import { AdminOrderList } from "@/features/orders/components/admin-order-list";
import { AgentOrderList } from "@/features/orders/components/agent-order-list";
import { listAgentOrders, searchOrders, type OrderSearch } from "@/features/orders/server/queries";
import { ORDER_STATUSES } from "@/features/orders/types";
import { requireActiveUser } from "@/lib/auth/require-role";
import { pageRange, readPage, readPageSize, readParam } from "@/lib/list-params";

const loadPage = async (search: OrderSearch) => {
  const first = await searchOrders(search);
  const { pageCount } = pageRange(search.page, search.pageSize, first.total);
  const page = Math.min(search.page, pageCount);
  const result = page === search.page ? first : await searchOrders({ ...search, page });
  return { ...result, page, pageSize: search.pageSize };
};

const OrdersPage = async ({ searchParams }: PageProps<"/orders">): Promise<React.ReactNode> => {
  const user = await requireActiveUser();
  const params = await searchParams;
  const query = readParam(params.q);
  const page = readPage(readParam(params.page));

  if (user.role === "admin") {
    const statusParam = readParam(params.status);
    const status = ORDER_STATUSES.find((option) => option === statusParam) ?? null;
    const pageSize = readPageSize(readParam(params.size), 20);
    const result = await loadPage({ status, query, page, pageSize });
    return <AdminOrderList result={result} status={status} query={query} />;
  }

  const pageSize = readPageSize(readParam(params.size), 10);
  const placed = readParam(params.placed);
  const placedNumbers = placed ? placed.split(",") : [];
  const [result, placedOrders] = await Promise.all([
    loadPage({ status: null, query, page, pageSize, agentId: user.id }),
    placedNumbers.length ? listAgentOrders(user.id).then((orders) => orders.filter(({ number }) => placedNumbers.includes(number))) : [],
  ]);
  return <AgentOrderList result={result} placedOrders={placedOrders} query={query} />;
};

export default OrdersPage;
