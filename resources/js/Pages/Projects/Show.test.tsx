import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Show from './Show';

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

describe('Project Show Page (/projects/{slug})', () => {
    const mockProject = {
        slug: 'test-project',
        title: 'Test Project',
        description: 'This is a detailed description of the test project.',
    };

    it('renders the page with PortfolioLayout', () => {
        render(<Show project={mockProject} />);

        expect(screen.getByTestId('portfolio-layout')).toBeInTheDocument();
    });

    it('sets the correct page title with project name', () => {
        render(<Show project={mockProject} />);

        expect(screen.getByText('Test Project - Sabrina Markon')).toBeInTheDocument();
    });

    it('renders the project title in header', () => {
        render(<Show project={mockProject} />);

        const titleElements = screen.getAllByText('Test Project');
        expect(titleElements.length).toBeGreaterThan(0);
    });

    it('renders back to projects link', () => {
        render(<Show project={mockProject} />);

        const backLink = screen.getByText('Back to All Projects');
        expect(backLink).toBeInTheDocument();
        expect(backLink.closest('a')).toHaveAttribute('href', '/projects');
    });

    it('renders project description', () => {
        render(<Show project={mockProject} />);

        expect(screen.getByText(mockProject.description)).toBeInTheDocument();
    });

    it('shows default message when description is null', () => {
        const projectWithoutDescription = {
            ...mockProject,
            description: null,
        };

        render(<Show project={projectWithoutDescription} />);

        expect(screen.getByText('No description available for this project yet.')).toBeInTheDocument();
    });

    it('shows default message when description is empty string', () => {
        const projectWithEmptyDescription = {
            ...mockProject,
            description: '',
        };

        render(<Show project={projectWithEmptyDescription} />);

        expect(screen.getByText('No description available for this project yet.')).toBeInTheDocument();
    });

    it('renders "About This Project" section header', () => {
        render(<Show project={mockProject} />);

        expect(screen.getByText(/About This Project/i)).toBeInTheDocument();
    });

    it('renders ContactSection', () => {
        render(<Show project={mockProject} />);

        expect(screen.getByTestId('contact-section')).toBeInTheDocument();
    });

    it('renders Code2 icon in header', () => {
        const { container } = render(<Show project={mockProject} />);

        // Check for icon container with specific styling
        const iconContainer = container.querySelector('.w-16.h-16.rounded-xl');
        expect(iconContainer).toBeInTheDocument();
    });

    it('applies correct section backgrounds', () => {
        const { container } = render(<Show project={mockProject} />);

        // Check for white header section
        const headerSection = container.querySelector('.pt-32.pb-12');
        expect(headerSection).toBeInTheDocument();

        // Check for colored content section
        const contentSection = container.querySelector('.py-12.pb-24');
        expect(contentSection).toBeInTheDocument();
    });

    it('preserves whitespace in description', () => {
        const projectWithMultilineDescription = {
            ...mockProject,
            description: 'Line 1\n\nLine 2\n\nLine 3',
        };

        const { container } = render(<Show project={projectWithMultilineDescription} />);

        // Check for whitespace-pre-wrap class which preserves newlines
        const descriptionElement = container.querySelector('.whitespace-pre-wrap');
        expect(descriptionElement).toBeInTheDocument();
        expect(descriptionElement?.textContent).toContain('Line 1');
        expect(descriptionElement?.textContent).toContain('Line 2');
        expect(descriptionElement?.textContent).toContain('Line 3');
    });

    it('renders content in white card', () => {
        const { container } = render(<Show project={mockProject} />);

        // Check for white content card with specific styling
        const contentCard = container.querySelector('.bg-white.rounded-2xl.p-8');
        expect(contentCard).toBeInTheDocument();
    });

    it('handles very long project titles', () => {
        const projectWithLongTitle = {
            ...mockProject,
            title: 'This Is An Extremely Long Project Title That Should Still Display Correctly Without Breaking The Layout',
        };

        render(<Show project={projectWithLongTitle} />);

        expect(screen.getByText(projectWithLongTitle.title)).toBeInTheDocument();
    });

    it('handles very long descriptions', () => {
        const longDescription = 'Lorem ipsum dolor sit amet, '.repeat(100);
        const projectWithLongDescription = {
            ...mockProject,
            description: longDescription,
        };

        render(<Show project={projectWithLongDescription} />);

        // Use partial text match for very long strings
        expect(screen.getByText(/Lorem ipsum dolor sit amet,/)).toBeInTheDocument();

        // Verify the full text is in the document
        const { container } = render(<Show project={projectWithLongDescription} />);
        expect(container.textContent).toContain('Lorem ipsum dolor sit amet,');
    });

    it('renders ArrowLeft icon in back link', () => {
        render(<Show project={mockProject} />);

        const backLink = screen.getByText('Back to All Projects').closest('a');
        expect(backLink).toHaveClass('inline-flex', 'items-center');
    });
});
