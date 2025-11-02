import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';

// Mock Inertia components
vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
    useForm: () => ({
        data: { email: '', password: '', remember: false },
        setData: vi.fn(),
        post: vi.fn(),
        processing: false,
        errors: {},
        reset: vi.fn(),
    }),
}));

// Mock GuestLayout
vi.mock('@/Layouts/GuestLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="guest-layout">
            <header>
                <a href="/">Sabrina Markon</a>
            </header>
            <main>{children}</main>
            <footer>© 2025 Sabrina Markon. Crafted with care and code 💚</footer>
        </div>
    ),
}));

describe('Login Page', () => {
    it('renders login form with all fields', () => {
        render(<Login />);

        // Check for heading
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByText('Sign in to access your admin dashboard')).toBeInTheDocument();

        // Check for form fields
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();

        // Check for submit button
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it('displays status message when provided', () => {
        render(<Login status="Your password has been reset!" />);

        expect(screen.getByText('Your password has been reset!')).toBeInTheDocument();
    });

    it('has email input with correct attributes', () => {
        render(<Login />);

        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

        expect(emailInput).toHaveAttribute('type', 'email');
        expect(emailInput).toHaveAttribute('name', 'email');
        expect(emailInput).toHaveAttribute('autocomplete', 'username');
    });

    it('has password input with correct attributes', () => {
        render(<Login />);

        const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(passwordInput).toHaveAttribute('name', 'password');
        expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });

    it('has remember me checkbox', () => {
        render(<Login />);

        const checkbox = screen.getByLabelText(/remember me/i) as HTMLInputElement;

        expect(checkbox).toHaveAttribute('type', 'checkbox');
        expect(checkbox).toHaveAttribute('name', 'remember');
    });

    it('displays site branding with logo', () => {
        render(<Login />);

        // Check for Sabrina Markon branding
        expect(screen.getByText('Sabrina Markon')).toBeInTheDocument();
    });

    it('displays footer with copyright', () => {
        render(<Login />);

        expect(screen.getByText(/© 2025 Sabrina Markon/i)).toBeInTheDocument();
        expect(screen.getByText(/Crafted with care and code/i)).toBeInTheDocument();
    });

    it('sets correct page title', () => {
        render(<Login />);

        // Check that Head component is setting the title
        const headTitle = document.querySelector('title');
        expect(headTitle?.textContent).toContain('Log in');
    });
});
