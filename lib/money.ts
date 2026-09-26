declare const rupiahBrand: unique symbol;

export type Rupiah = number & { readonly [rupiahBrand]: true };

export const toRupiah = (value: number): Rupiah => {
  if (!Number.isSafeInteger(value)) throw new Error(`Invalid rupiah amount: ${value}`);
  return value as Rupiah;
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const formatRupiah = (value: Rupiah): string => rupiahFormatter.format(value);

export const parseRupiahInput = (input: string): Rupiah | null => {
  const digits = input.replace(/[\s.]/g, "").replace(/^Rp/i, "");
  if (!/^\d+$/.test(digits)) return null;
  const value = Number(digits);
  return value > 0 && Number.isSafeInteger(value) ? toRupiah(value) : null;
};

export const dpAmountFor = (subtotal: number, dpPercent: number): Rupiah =>
  toRupiah(Math.floor((subtotal * dpPercent + 99) / 100));

const compactFormatter = new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 });

export const formatRupiahCompact = (value: number): string => `Rp ${compactFormatter.format(value)}`;
