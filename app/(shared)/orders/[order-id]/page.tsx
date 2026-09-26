import { notFound } from "next/navigation";
import { AdminOrderDetail } from "@/features/orders/components/admin-order-detail";
import { AgentOrderDetail } from "@/features/orders/components/agent-order-detail";
import { getOrderDetail } from "@/features/orders/server/queries";
import { createProofUrl, getInvoice, listOrderPayments } from "@/features/payments/server/queries";
import { getSettings } from "@/features/settings/server/queries";
import { requireActiveUser } from "@/lib/auth/require-role";

const OrderPage = async ({ params }: PageProps<"/orders/[order-id]">): Promise<React.ReactNode> => {
  const user = await requireActiveUser();
  const { "order-id": orderId } = await params;
  const order = await getOrderDetail(orderId);
  if (!order || (user.role === "agent" && order.agentId !== user.id)) notFound();

  const [payments, invoice, settings] = await Promise.all([listOrderPayments(order.id), getInvoice(order.id), getSettings()]);

  if (user.role === "admin") {
    const proofUrls = Object.fromEntries(
      await Promise.all(
        payments.map(async ({ id, proofPath }) => [id, proofPath ? await createProofUrl(proofPath) : null] as const),
      ),
    );
    return (
      <AdminOrderDetail
        order={order}
        payments={payments}
        proofUrls={proofUrls}
        invoice={invoice}
        invoiceHeader={settings.invoice_header}
      />
    );
  }

  return <AgentOrderDetail order={order} payments={payments} invoice={invoice} settings={settings} />;
};

export default OrderPage;
