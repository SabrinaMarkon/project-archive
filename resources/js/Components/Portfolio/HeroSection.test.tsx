import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeroSection from './HeroSection';

// Mock Inertia Link
vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

describe('HeroSection', () => {
    it('renders main heading', () => {
        render(<HeroSection />);

        expect(screen.getByText(/Developer &/)).toBeInTheDocument();
        expect(screen.getByText('Writer')).toBeInTheDocument();
    });

    it('renders welcome message', () => {
        render(<HeroSection />);

        expect(screen.getByText(/Welcome to my portfolio/i)).toBeInTheDocument();
    });

    it('renders description text', () => {
        render(<HeroSection />);

        expect(screen.getByText(/I build elegant web applications/)).toBeInTheDocument();
    });

    it('renders View Projects link', () => {
        render(<HeroSection />);

        const link = screen.getByRole('link', { name: /View Projects/i });
        expect(link).toHaveAttribute('href', '/projects');
    });

    it('renders Read Writing link', () => {
        render(<HeroSection />);

        const link = screen.getByRole('link', { name: /Read Writing/i });
        expect(link).toHaveAttribute('href', '/posts');
    });

    it('has correct section id', () => {
        const { container } = render(<HeroSection />);

        const section = container.querySelector('#home');
        expect(section).toBeInTheDocument();
    });
});
