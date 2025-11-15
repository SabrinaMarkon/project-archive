/**
 * Format an ISO 8601 datetime string to datetime-local input format (YYYY-MM-DDTHH:MM)
 *
 * @param isoString - ISO 8601 datetime string (e.g., "2025-11-15T05:27:00.000000Z")
 * @returns Formatted string for datetime-local input (e.g., "2025-11-15T05:27"), or empty string if input is undefined/null
 *
 * @example
 * formatDateTimeLocal("2025-11-15T05:27:00.000000Z") // "2025-11-15T05:27"
 * formatDateTimeLocal(undefined) // ""
 */
export const formatDateTimeLocal = (isoString: string | undefined | null): string => {
    if (!isoString) return "";

    // HTML datetime-local input expects YYYY-MM-DDTHH:MM format
    // ISO string is "2025-11-15T05:27:00.000000Z"
    // We take the first 16 characters: "2025-11-15T05:27"
    return isoString.slice(0, 16);
};
