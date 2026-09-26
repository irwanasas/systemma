import { MAIN_STATUS_PATH, orderStatusLabels, type OrderStatus } from "@/features/orders/types";

export const OrderStatusTimeline = ({ status }: { status: OrderStatus }): React.ReactNode => {
  if (status === "CANCELLED" || status === "EXPIRED") {
    return (
      <section aria-labelledby="timeline-heading">
        <h2 id="timeline-heading">Status</h2>
        <p>
          {status === "CANCELLED"
            ? "Pesanan dibatalkan sebelum DP dibayar."
            : "Pesanan kedaluwarsa karena bukti DP tidak diunggah dalam batas waktu."}
        </p>
      </section>
    );
  }
  const currentIndex = MAIN_STATUS_PATH.indexOf(status);
  return (
    <section aria-labelledby="timeline-heading">
      <h2 id="timeline-heading">Status</h2>
      <ol>
        {MAIN_STATUS_PATH.map((step, index) => (
          <li key={step} aria-current={index === currentIndex ? "step" : undefined}>
            {orderStatusLabels[step]} —{" "}
            {index < currentIndex ? "selesai" : index === currentIndex ? "tahap sekarang" : "belum"}
          </li>
        ))}
      </ol>
    </section>
  );
};
