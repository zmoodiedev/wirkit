/**
 * Utility functions for consistent date handling across the app
 * Ensures all date operations use the user's local timezone
 */

/**
 * Get today's date in YYYY-MM-DD format using local timezone
 */
export const getTodayDate = (): string => {
  const now = new Date();
  const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
  return localDate.toISOString().split('T')[0];
};

/**
 * Get a date N days ago in YYYY-MM-DD format using local timezone
 */
export const getDaysAgoDate = (daysAgo: number): string => {
  const now = new Date();
  now.setDate(now.getDate() - daysAgo);
  const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
  return localDate.toISOString().split('T')[0];
};

/**
 * Convert any date to YYYY-MM-DD format using local timezone
 */
export const formatDateToLocal = (date: Date): string => {
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  return localDate.toISOString().split('T')[0];
};

/**
 * Get current hour in local timezone (0-23)
 */
export const getCurrentHour = (): number => {
  return new Date().getHours();
};