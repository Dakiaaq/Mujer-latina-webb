/**
 * Formats a numeric value into standard Colombian Pesos (COP).
 * Examples:
 *   formatCOP(25000)   -> "$25.000"
 *   formatCOP(35000)   -> "$35.000"
 *   formatCOP(49900)   -> "$49.900"
 *   formatCOP(120000)  -> "$120.000"
 */
export function formatCOP(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0';
  }
  const rounded = Math.round(amount);
  return '$' + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parses a Colombian currency string or input back to a number.
 */
export function parseCOP(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}
