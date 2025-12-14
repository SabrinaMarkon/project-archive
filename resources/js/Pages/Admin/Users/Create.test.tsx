import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { router } from '@inertiajs/react';
import Create from './Create';

// Mock Inertia
vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');
    return {
        ...actual,
        router: {
            post: vi.fn(),
        },
        usePage: () => ({
            props: {
                errors: {},
            },
        }),
        Head: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
            <a href={href}>{children}</a>
        ),
        useForm: (initialData: any) => ({
            data: initialData,
            setData: (key: string, value: any) => {},
            post: vi.fn(),
            processing: false,
            errors: {},
        }),
    };
});

// Mock route helper
global.route = vi.fn((name: string) => `/${name}`);

describe('Admin Create User', () => {
    it('renders create user form', () => {
        render(<Create />);

        expect(screen.getByText('Create New User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    });

    it('shows admin checkbox', () => {
        render(<Create />);

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        expect(screen.getByText(/Admin user/i)).toBeInTheDocument();
    });

    it('has create user button', () => {
        render(<Create />);

        const submitButton = screen.getByRole('button', { name: /Create User/i });
        expect(submitButton).toBeInTheDocument();
    });

    it('has cancel button linking to users index', () => {
        render(<Create />);

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        expect(cancelButton).toBeInTheDocument();
    });

    it('shows password minimum length helper text', () => {
        render(<Create />);

        expect(screen.getByText('Minimum 8 characters')).toBeInTheDocument();
    });
});
