import { CheckCircle, Circle, RecordIcon } from "@phosphor-icons/react/ssr";
import { SectionCard } from "@/components/ui/section-card";
import { MAIN_STATUS_PATH, orderStatusLabels, type OrderStatus } from "@/features/orders/types";
import { cn } from "@/lib/utils";

export const OrderStatusTimeline = ({ status }: { status: OrderStatus }): React.ReactNode => {
  if (status === "CANCELLED" || status === "EXPIRED") {
    return (
      <SectionCard id="timeline-heading" title="Perjalanan pesanan">
        <p className="text-ui">
          {status === "CANCELLED"
            ? "Pesanan dibatalkan sebelum DP dibayar."
            : "Pesanan kedaluwarsa karena bukti DP tidak diunggah dalam batas waktu."}
        </p>
      </SectionCard>
    );
  }
  const currentIndex = MAIN_STATUS_PATH.indexOf(status);
  return (
    <SectionCard id="timeline-heading" title="Perjalanan pesanan">
      <ol className="flex flex-col">
        {MAIN_STATUS_PATH.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const StepIcon = isDone ? CheckCircle : isCurrent ? RecordIcon : Circle;
          return (
            <li
              key={step}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "relative flex items-center gap-2.5 pb-3 text-ui last:pb-0",
                "before:absolute before:top-6 before:bottom-0 before:left-[9px] before:w-px before:bg-border last:before:hidden",
                isDone && "before:bg-success",
                isCurrent ? "font-semibold" : "text-muted-foreground",
                isDone && "text-foreground",
              )}
            >
              <StepIcon
                aria-hidden="true"
                weight={isCurrent || isDone ? "fill" : "regular"}
                className={cn(
                  "size-5 shrink-0 bg-surface",
                  isDone && "text-success",
                  isCurrent && "text-primary-strong",
                )}
              />
              <span>
                {orderStatusLabels[step]}
                <span className="sr-only"> — {isDone ? "selesai" : isCurrent ? "tahap sekarang" : "belum"}</span>
                {isCurrent && (
                  <span
                    aria-hidden="true"
                    className="ml-2 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary-strong"
                  >
                    sekarang
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </SectionCard>
  );
};
