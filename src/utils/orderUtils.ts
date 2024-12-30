/**
 * Delay helper to ensure backend updates are complete
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}