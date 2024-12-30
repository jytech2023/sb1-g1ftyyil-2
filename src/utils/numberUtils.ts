/**
 * Format a number with thousands separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

/**
 * Parse a string into a number, removing non-numeric characters
 */
export function parseNumber(value: string): number {
  return parseInt(value.replace(/[^0-9]/g, '')) || 0;
}