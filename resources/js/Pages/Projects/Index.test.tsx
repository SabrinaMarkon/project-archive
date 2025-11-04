import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Index from './Index';

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

describe('Projects Index Page (/projects)', () => {
    const mockProjects = [
        { slug: 'project-1', title: 'Project 1', description: 'Description 1' },
        { slug: 'project-2', title: 'Project 2', description: 'Description 2' },
        { slug: 'project-3', title: 'Project 3', description: null },
    ];

    it('renders the page with PortfolioLayout', () => {
        render(<Index projects={mockProjects} />);

        expect(screen.getByTestId('portfolio-layout')).toBeInTheDocument();
    });

    it('sets the correct page title', () => {
        render(<Index projects={mockProjects} />);

        expect(screen.getByText('Projects - Sabrina Markon')).toBeInTheDocument();
    });

    it('renders the page header', () => {
        render(<Index projects={mockProjects} />);

        expect(screen.getByText('All Projects')).toBeInTheDocument();
        expect(screen.getByText(/comprehensive collection of my work/i)).toBeInTheDocument();
    });

    it('renders all projects', () => {
        render(<Index projects={mockProjects} />);

        expect(screen.getByText('Project 1')).toBeInTheDocument();
        expect(screen.getByText('Project 2')).toBeInTheDocument();
        expect(screen.getByText('Project 3')).toBeInTheDocument();
    });

    it('renders project descriptions', () => {
        render(<Index projects={mockProjects} />);

        expect(screen.getByText('Description 1')).toBeInTheDocument();
        expect(screen.getByText('Description 2')).toBeInTheDocument();
    });

    it('shows default text when description is null', () => {
        render(<Index projects={mockProjects} />);

        expect(screen.getByText('No content is available yet.')).toBeInTheDocument();
    });

    it('renders links to individual project pages', () => {
        render(<Index projects={mockProjects} />);

        const links = screen.getAllByText('View Project');
        expect(links).toHaveLength(3);

        // Check href attributes
        const linkElements = screen.getAllByRole('link', { name: /View Project/i });
        expect(linkElements[0]).toHaveAttribute('href', '/projects/project-1');
        expect(linkElements[1]).toHaveAttribute('href', '/projects/project-2');
        expect(linkElements[2]).toHaveAttribute('href', '/projects/project-3');
    });

    it('renders links to individual project pages', () => {
        render(<Index projects={mockProjects} />);

        const links = screen.getAllByText('View Project');
        expect(links).toHaveLength(3);

        // Check href attributes
        const linkElements = screen.getAllByRole('link', { name: /View Project/i });
        expect(linkElements[0]).toHaveAttribute('href', '/projects/project-1');
        expect(linkElements[1]).toHaveAttribute('href', '/projects/project-2');
        expect(linkElements[2]).toHaveAttribute('href', '/projects/project-3');
    });

    it('renders ContactSection', () => {
        render(<Index projects={mockProjects} />);

        expect(screen.getByTestId('contact-section')).toBeInTheDocument();
    });

    it('shows message when no projects available', () => {
        render(<Index projects={[]} />);

        expect(screen.getByText('No projects available yet.')).toBeInTheDocument();
    });

    it('renders Code2 icon for each project', () => {
        const { container } = render(<Index projects={mockProjects} />);

        // Check that project cards are rendered (they have specific styling)
        const projectCards = container.querySelectorAll('.group.bg-white.rounded-2xl');
        expect(projectCards.length).toBe(3);
    });

    it('applies correct styling classes', () => {
        const { container } = render(<Index projects={mockProjects} />);

        // Check header section has white background
        const headerSection = container.querySelector('.pt-32.pb-12');
        expect(headerSection).toBeInTheDocument();

        // Check projects section has colored background
        const projectsSection = container.querySelector('.py-12.pb-24');
        expect(projectsSection).toBeInTheDocument();
    });

    it('handles large number of projects', () => {
        const manyProjects = Array.from({ length: 20 }, (_, i) => ({
            slug: `project-${i}`,
            title: `Project ${i}`,
            description: `Description ${i}`,
        }));

        render(<Index projects={manyProjects} />);

        // All projects should be rendered
        expect(screen.getByText('Project 0')).toBeInTheDocument();
        expect(screen.getByText('Project 19')).toBeInTheDocument();

        const viewProjectLinks = screen.getAllByText('View Project');
        expect(viewProjectLinks).toHaveLength(20);
    });
});
