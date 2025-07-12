/**
 * Utility function to combine class names
 * @param inputs Class names to combine
 * @returns Combined class string
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs
    .flat()
    .filter((input) => typeof input === 'string')
    .join(' ')
}

/**
 * Format currency value
 * @param amount Amount to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Format date
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
