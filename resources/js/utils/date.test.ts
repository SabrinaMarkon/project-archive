import { describe, it, expect } from 'vitest';
import { formatDateTimeLocal } from './date';

describe('formatDateTimeLocal', () => {
    it('formats ISO datetime string to datetime-local format', () => {
        const isoString = '2025-11-15T05:27:00.000000Z';
        const result = formatDateTimeLocal(isoString);
        expect(result).toBe('2025-11-15T05:27');
    });

    it('handles ISO string without microseconds', () => {
        const isoString = '2025-11-15T05:27:00Z';
        const result = formatDateTimeLocal(isoString);
        expect(result).toBe('2025-11-15T05:27');
    });

    it('handles ISO string without timezone', () => {
        const isoString = '2025-11-15T05:27:00';
        const result = formatDateTimeLocal(isoString);
        expect(result).toBe('2025-11-15T05:27');
    });

    it('handles midnight time correctly', () => {
        const isoString = '2025-01-01T00:00:00.000000Z';
        const result = formatDateTimeLocal(isoString);
        expect(result).toBe('2025-01-01T00:00');
    });

    it('handles noon time correctly', () => {
        const isoString = '2025-06-15T12:00:00.000000Z';
        const result = formatDateTimeLocal(isoString);
        expect(result).toBe('2025-06-15T12:00');
    });

    it('handles end of day time correctly', () => {
        const isoString = '2025-12-31T23:59:00.000000Z';
        const result = formatDateTimeLocal(isoString);
        expect(result).toBe('2025-12-31T23:59');
    });

    it('returns empty string for undefined', () => {
        const result = formatDateTimeLocal(undefined);
        expect(result).toBe('');
    });

    it('returns empty string for null', () => {
        const result = formatDateTimeLocal(null);
        expect(result).toBe('');
    });

    it('returns empty string for empty string', () => {
        const result = formatDateTimeLocal('');
        expect(result).toBe('');
    });

    it('preserves single digit hours and minutes', () => {
        const isoString = '2025-03-05T09:05:00.000000Z';
        const result = formatDateTimeLocal(isoString);
        expect(result).toBe('2025-03-05T09:05');
    });
});
