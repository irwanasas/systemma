import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";

export const BackLink = ({ href, label }: { href: string; label: string }): React.ReactNode => (
  <Button asChild variant="ghost" className="-ml-3 min-h-[var(--control-height)] self-start text-ui">
    <Link href={href} className="text-foreground no-underline">
      <ArrowLeft aria-hidden="true" />
      {label}
    </Link>
  </Button>
);
