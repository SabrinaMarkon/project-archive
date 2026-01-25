import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PortfolioLayout from './PortfolioLayout';

// Mock Inertia
const mockPost = vi.fn();
const mockSetData = vi.fn();

vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>{children}</a>
    ),
    useForm: () => ({
        data: { email: '' },
        setData: mockSetData,
        post: mockPost,
        processing: false,
        errors: {},
    }),
    usePage: () => ({
        props: {
            flash: {},
        },
    }),
}));

// Mock newsletter components to avoid complex dependencies
vi.mock('@/Components/NewsletterModal', () => ({
    default: () => null,
}));

vi.mock('@/Components/NewsletterSignup', () => ({
    default: () => null,
}));

describe('PortfolioLayout', () => {
    it('renders children content', () => {
        render(
            <PortfolioLayout>
                <div>Test Content</div>
            </PortfolioLayout>
        );

        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders site name in navigation', () => {
        render(<PortfolioLayout><div /></PortfolioLayout>);

        expect(screen.getByText('Sabrina Markon')).toBeInTheDocument();
    });

    it('renders desktop navigation links', () => {
        render(<PortfolioLayout><div /></PortfolioLayout>);

        const homeLinks = screen.getAllByRole('link', { name: /Home/i });
        const projectsLinks = screen.getAllByRole('link', { name: /Projects/i });
        const writingLinks = screen.getAllByRole('link', { name: /Writing/i });
        const aboutLinks = screen.getAllByRole('link', { name: /About/i });
        const resumeLinks = screen.getAllByRole('link', { name: /Resume/i });
        const contactLinks = screen.getAllByRole('link', { name: /Contact/i });

        expect(homeLinks.length).toBeGreaterThan(0);
        expect(projectsLinks.length).toBeGreaterThan(0);
        expect(writingLinks.length).toBeGreaterThan(0);
        expect(aboutLinks.length).toBeGreaterThan(0);
        expect(resumeLinks.length).toBeGreaterThan(0);
        expect(contactLinks.length).toBeGreaterThan(0);
    });

    it('renders logo link to home', () => {
        render(<PortfolioLayout><div /></PortfolioLayout>);

        const logoLink = screen.getByRole('link', { name: /Sabrina Markon/i });
        expect(logoLink).toHaveAttribute('href', '/');
    });

    it('renders footer with copyright', () => {
        render(<PortfolioLayout><div /></PortfolioLayout>);

        expect(screen.getByText(/© 2026 Sabrina Markon/i)).toBeInTheDocument();
    });

    it('has fixed navigation bar', () => {
        const { container } = render(<PortfolioLayout><div /></PortfolioLayout>);

        const nav = container.querySelector('nav');
        expect(nav).toHaveClass('fixed', 'top-0', 'w-full');
    });

    it('wraps content in main element', () => {
        const { container } = render(
            <PortfolioLayout>
                <div data-testid="content">Test</div>
            </PortfolioLayout>
        );

        const main = container.querySelector('main');
        expect(main).toBeInTheDocument();
        expect(main).toContainElement(screen.getByTestId('content'));
    });
});
