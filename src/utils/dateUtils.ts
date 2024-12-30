/**
 * Format date to Pacific Time
 */
export function formatPacificTime(timestamp: string) {
  return new Date(timestamp).toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Get estimated pickup time (30 minutes before arrival)
 */
export function getEstimatedPickupTime(arrivalTime: Date): Date {
  const pickupTime = new Date(arrivalTime);
  pickupTime.setMinutes(pickupTime.getMinutes() - 30);
  return pickupTime;
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
}

/**
 * Format a date for datetime-local input
 */
export function formatDateForInput(date: Date): string {
  return date.toISOString().slice(0, 16);
}