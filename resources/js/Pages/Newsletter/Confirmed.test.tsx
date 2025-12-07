import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Confirmed from './Confirmed';

vi.mock('@inertiajs/react', () => ({
    Head: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: any }) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

describe('Newsletter Confirmed Page', () => {
    it('displays success message when confirmation succeeds', () => {
        render(
            <Confirmed
                success={true}
                message="Thank you! Your subscription is confirmed."
            />
        );

        expect(screen.getByText('Subscription Confirmed!')).toBeInTheDocument();
        expect(screen.getByText('Thank you! Your subscription is confirmed.')).toBeInTheDocument();
        expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('displays error message when confirmation fails', () => {
        render(
            <Confirmed
                success={false}
                message="This confirmation link is invalid or has expired."
            />
        );

        expect(screen.getByText('Confirmation Failed')).toBeInTheDocument();
        expect(screen.getByText('This confirmation link is invalid or has expired.')).toBeInTheDocument();
        expect(screen.getByText('❌')).toBeInTheDocument();
    });

    it('displays return to home link', () => {
        render(
            <Confirmed
                success={true}
                message="Thank you! Your subscription is confirmed."
            />
        );

        const homeLink = screen.getByRole('link', { name: /return to home/i });
        expect(homeLink).toBeInTheDocument();
        expect(homeLink).toHaveAttribute('href', '/');
    });

    it('shows checkmark emoji for success', () => {
        render(
            <Confirmed
                success={true}
                message="Confirmed"
            />
        );

        expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('shows X emoji for failure', () => {
        render(
            <Confirmed
                success={false}
                message="Failed"
            />
        );

        expect(screen.getByText('❌')).toBeInTheDocument();
    });
});
