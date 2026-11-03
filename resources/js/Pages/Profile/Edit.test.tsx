import { describe, it, expect } from 'vitest';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Edit from './Edit';

describe('Profile Edit layout', () => {
    it('does not wrap the page in the admin layout for regular users', () => {
        const page = { props: { auth: { user: { is_admin: false } } } } as any;

        expect(Edit.layout(page)).toBe(page);
    });

    it('wraps the page in the admin layout for admins', () => {
        const page = { props: { auth: { user: { is_admin: true } } } } as any;

        expect((Edit.layout(page) as any).type).toBe(DashboardLayout);
    });
});
