import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: ["ui"] }] } },
});

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
