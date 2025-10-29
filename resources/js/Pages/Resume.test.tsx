import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Resume from './Resume';

// Mock Inertia components
vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ href, children, className, ...props }: any) => (
        <a href={href} className={className} {...props}>{children}</a>
    ),
}));

vi.mock('@/Layouts/PortfolioLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="portfolio-layout">{children}</div>,
}));

vi.mock('@/Components/Portfolio/ContactSection', () => ({
    default: () => <div data-testid="contact-section">Contact Section</div>,
}));

describe('Resume Page (/resume)', () => {
    it('renders the page with PortfolioLayout', () => {
        render(<Resume />);

        expect(screen.getByTestId('portfolio-layout')).toBeInTheDocument();
    });

    it('sets the correct page title', () => {
        render(<Resume />);

        expect(screen.getByText('Resume - Sabrina Markon')).toBeInTheDocument();
    });

    it('renders the page header', () => {
        render(<Resume />);

        expect(screen.getByText('Resume')).toBeInTheDocument();
        expect(screen.getByText(/my resume showcasing my skills, experience, and education/i)).toBeInTheDocument();
    });
});
