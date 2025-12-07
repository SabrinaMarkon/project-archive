import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Unsubscribed from './Unsubscribed';

vi.mock('@inertiajs/react', () => ({
    Head: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: any }) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

describe('Newsletter Unsubscribed Page', () => {
    it('displays success message when unsubscribe succeeds', () => {
        render(
            <Unsubscribed
                success={true}
                message="You have been successfully unsubscribed from the newsletter."
            />
        );

        expect(screen.getByText('Unsubscribed Successfully')).toBeInTheDocument();
        expect(screen.getByText('You have been successfully unsubscribed from the newsletter.')).toBeInTheDocument();
        expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('displays error message when unsubscribe fails', () => {
        render(
            <Unsubscribed
                success={false}
                message="This unsubscribe link is invalid."
            />
        );

        expect(screen.getByText('Unsubscribe Failed')).toBeInTheDocument();
        expect(screen.getByText('This unsubscribe link is invalid.')).toBeInTheDocument();
        expect(screen.getByText('❌')).toBeInTheDocument();
    });

    it('displays return to home link', () => {
        render(
            <Unsubscribed
                success={true}
                message="You have been successfully unsubscribed."
            />
        );

        const homeLink = screen.getByRole('link', { name: /return to home/i });
        expect(homeLink).toBeInTheDocument();
        expect(homeLink).toHaveAttribute('href', '/');
    });

    it('shows checkmark emoji for success', () => {
        render(
            <Unsubscribed
                success={true}
                message="Unsubscribed"
            />
        );

        expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('shows X emoji for failure', () => {
        render(
            <Unsubscribed
                success={false}
                message="Failed"
            />
        );

        expect(screen.getByText('❌')).toBeInTheDocument();
    });
});
