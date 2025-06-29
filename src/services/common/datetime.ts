// utils/date.ts
import { format } from "date-fns/format";
import { toZonedTime } from "date-fns-tz";

const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Formats a date to Indian Standard Time (IST)
 * @param date - Date object or ISO string to format
 * @param formatStr - Format string (default: 'yyyy-MM-dd HH:mm:ss')
 * @returns Formatted date string in IST, or empty string if invalid date
 */
export function formatToIST(
  date: Date | string,
  formatStr = "yyyy-MM-dd HH:mm:ss"
): string {
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(parsedDate.getTime())) {
    return "";
  }

  const istDate = toZonedTime(parsedDate, IST_TIMEZONE);
  return format(istDate, formatStr);
}

/**
 * Gets current date/time in IST
 * @param formatStr - Format string (default: 'yyyy-MM-dd HH:mm:ss')
 * @returns Current date/time formatted in IST
 */
export function getCurrentIST(formatStr = "yyyy-MM-dd HH:mm:ss"): string {
  return formatToIST(new Date(), formatStr);
}

/**
 * Converts any date to IST Date object
 * @param date - Date object or ISO string
 * @returns Date object in IST timezone
 */
export function toIST(date: Date | string): Date {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return toZonedTime(parsedDate, IST_TIMEZONE);
}

/**
 * Checks if a date string or Date object is valid
 * @param date - Date to validate
 * @returns Boolean indicating if date is valid
 */
export function isValidDate(date: Date | string): boolean {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return !isNaN(parsedDate.getTime());
}

/**
 * Common date format presets
 */
export const DATE_FORMATS = {
  DATE_ONLY: "yyyy-MM-dd",
  TIME_ONLY: "HH:mm:ss",
  DATETIME: "yyyy-MM-dd HH:mm:ss",
  DATETIME_12H: "yyyy-MM-dd hh:mm:ss a",
  DISPLAY: "dd MMM yyyy, HH:mm",
  DISPLAY_12H: "dd MMM yyyy, hh:mm a",
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

/**
 * Quick format functions using common presets
 */
export const formatIST = {
  dateOnly: (date: Date | string) => formatToIST(date, DATE_FORMATS.DATE_ONLY),
  timeOnly: (date: Date | string) => formatToIST(date, DATE_FORMATS.TIME_ONLY),
  dateTime: (date: Date | string) => formatToIST(date, DATE_FORMATS.DATETIME),
  dateTime12h: (date: Date | string) =>
    formatToIST(date, DATE_FORMATS.DATETIME_12H),
  display: (date: Date | string) => formatToIST(date, DATE_FORMATS.DISPLAY),
  display12h: (date: Date | string) =>
    formatToIST(date, DATE_FORMATS.DISPLAY_12H),
};
