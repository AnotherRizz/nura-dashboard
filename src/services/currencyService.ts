/**
 * Format number ke rupiah string: 1000000 -> "1.000.000"
 */
export function formatRupiah(value?: number | string): string {
  if (value === null || value === undefined || value === "") return "";

  const num =
    typeof value === "number"
      ? value
      : Number(value.toString().replace(/\D/g, ""));

  if (isNaN(num)) return "";

  return num.toLocaleString("id-ID");
}

/**
 * Parse input rupiah string ke number murni: "1.000.000" -> 1000000
 */
export function parseRupiah(value: string): number {
  if (!value) return 0;
  return Number(value.replace(/\D/g, ""));
}
