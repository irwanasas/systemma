import { cn } from "@/lib/utils";

type BrandMarkProps = {
  size?: "sm" | "md" | "lg";
  wordmark?: boolean;
  tagline?: string;
  className?: string;
};

const circleSizes = { sm: "size-8 text-lg", md: "size-10 text-xl", lg: "size-16 text-3xl" };

const wordSizes = { sm: "text-lg", md: "text-xl", lg: "text-2xl" };

export const BrandMark = ({ size = "md", wordmark = true, tagline, className }: BrandMarkProps): React.ReactNode => (
  <span className={cn("inline-flex items-center gap-2.5", className)}>
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-ochre font-heading leading-none font-semibold text-ochre-foreground",
        circleSizes[size],
      )}
    >
      A
    </span>
    {wordmark ? (
      <span className="flex flex-col leading-tight">
        <span className={cn("font-heading font-semibold tracking-tight", wordSizes[size])}>Aurora</span>
        {tagline && <span className="text-xs opacity-80">{tagline}</span>}
      </span>
    ) : (
      <span className="sr-only">Aurora</span>
    )}
  </span>
);
