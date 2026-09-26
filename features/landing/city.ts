export const cityFromAddress = (address: string): string | null => {
  const lastPart = address.split(",").at(-1)?.replace(/\d+/g, "").trim();
  return lastPart ? lastPart : null;
};
