import { Archive, CheckCircle, PencilSimpleLine } from "@phosphor-icons/react/ssr";
import { StatusBadge } from "@/components/ui/status-badge";
import { productStatusLabels, type ProductStatus } from "@/features/catalog/types";

const appearance = {
  draft: { tone: "neutral", icon: PencilSimpleLine },
  active: { tone: "success", icon: CheckCircle },
  archived: { tone: "warning", icon: Archive },
} as const;

export const ProductStatusBadge = ({ status }: { status: ProductStatus }): React.ReactNode => (
  <StatusBadge {...appearance[status]} label={productStatusLabels[status]} />
);
