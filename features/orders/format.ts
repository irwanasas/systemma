const formatCentimeters = (value: number): string => value.toLocaleString("id-ID", { maximumFractionDigits: 1 });

export const describeSize = (sizeCode: string | null, chestCm: number | null, lengthCm: number | null): string =>
  sizeCode ?? `Custom (lingkar dada ${formatCentimeters(chestCm ?? 0)} cm, panjang badan ${formatCentimeters(lengthCm ?? 0)} cm)`;
