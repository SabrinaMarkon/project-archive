import { describe, it, expect } from 'vitest';
import { formatSlug } from './validation';

describe('formatSlug', () => {
    it('converts uppercase to lowercase', () => {
        expect(formatSlug('HelloWorld')).toBe('helloworld');
    });

    it('replaces spaces with hyphens', () => {
        expect(formatSlug('my cool project')).toBe('my-cool-project');
    });

    it('removes special characters', () => {
        expect(formatSlug('slug!@#$%^&*()')).toBe('slug');
    });

    it('collapses multiple spaces or hyphens into a single hyphen', () => {
        expect(formatSlug('a   b---c')).toBe('a-b-c');
    });

    it('preserves internal hyphens and digits', () => {
        expect(formatSlug('Project-2025')).toBe('project-2025');
    });

    it('trims leading/trailing hyphens ()', () => {
        expect(formatSlug(' -slug- ')).toBe('slug');
    });
});
