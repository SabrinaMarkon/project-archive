import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Show from './Show';

// Mock Inertia
vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');
    return {
        ...actual,
        router: {
            post: vi.fn(),
            delete: vi.fn(),
        },
        usePage: () => ({
            props: {
                errors: {},
                flash: {},
            },
        }),
        Head: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
            <a href={href}>{children}</a>
        ),
        useForm: (initialData: any) => ({
            data: initialData,
            setData: (_key: string, _value: any) => {},
            post: vi.fn(),
            processing: false,
            errors: {},
        }),
    };
});

// Mock route helper
(global as any).route = vi.fn((_name: string, _params?: any) => `/`);

const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    email_verified_at: null,
    is_admin: false,
    created_at: '2025-01-01',
};

const mockEnrollments: any[] = [];
const mockPurchases: any[] = [];
const mockAvailableCourses: any[] = [];

describe('Admin Users Show Page', () => {
    it('shows resend verification email button when email not verified', () => {
        render(
            <Show
                user={mockUser}
                enrollments={mockEnrollments}
                purchases={mockPurchases}
                availableCourses={mockAvailableCourses}
            />
        );

        expect(screen.getByText(/Resend Verification Email/i)).toBeInTheDocument();
    });

    it('does not show resend verification button when email is verified', () => {
        const verifiedUser = { ...mockUser, email_verified_at: '2025-01-01' };

        render(
            <Show
                user={verifiedUser}
                enrollments={mockEnrollments}
                purchases={mockPurchases}
                availableCourses={mockAvailableCourses}
            />
        );

        expect(screen.queryByText(/Resend Verification Email/i)).not.toBeInTheDocument();
    });

    it('shows resend password reset button', () => {
        render(
            <Show
                user={mockUser}
                enrollments={mockEnrollments}
                purchases={mockPurchases}
                availableCourses={mockAvailableCourses}
            />
        );

        expect(screen.getByText(/Send Password Reset/i)).toBeInTheDocument();
    });
});
