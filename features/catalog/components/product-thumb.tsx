import { cn } from "@/lib/utils";

type ProductThumbProps = {
  name: string;
  colors: { hex: string | null }[];
  className?: string;
};

export const ProductThumb = ({ name, colors, className }: ProductThumbProps): React.ReactNode => {
  const stripes = colors.filter(({ hex }) => hex).slice(0, 4);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-soft text-base font-semibold text-primary-strong",
        className,
      )}
    >
      {name.charAt(0).toUpperCase()}
      {stripes.length > 0 && (
        <span className="absolute inset-x-0 bottom-0 flex h-1.5">
          {stripes.map(({ hex }, index) => (
            <span key={index} className="flex-1" style={{ backgroundColor: hex ?? undefined }} />
          ))}
        </span>
      )}
    </span>
  );
};
