import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Welcome from './Welcome';

// Mock Inertia components
vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

// Mock Portfolio components
vi.mock('@/Layouts/PortfolioLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="portfolio-layout">{children}</div>,
}));

vi.mock('@/Components/Portfolio/HeroSection', () => ({
    default: () => <div data-testid="hero-section">Hero Section</div>,
}));

vi.mock('@/Components/Portfolio/FeaturedProjects', () => ({
    default: ({ projects, limit }: any) => (
        <div data-testid="featured-projects">
            Featured Projects (showing {Math.min(projects.length, limit || projects.length)} of {projects.length})
        </div>
    ),
}));

vi.mock('@/Components/Portfolio/WritingSection', () => ({
    default: () => <div data-testid="writing-section">Writing Section</div>,
}));

vi.mock('@/Components/Portfolio/AboutSection', () => ({
    default: () => <div data-testid="about-section">About Section</div>,
}));

vi.mock('@/Components/Portfolio/ContactSection', () => ({
    default: () => <div data-testid="contact-section">Contact Section</div>,
}));

describe('Welcome Page (/)', () => {
    const mockProjects = [
        { slug: 'project-1', title: 'Project 1', description: 'Description 1' },
        { slug: 'project-2', title: 'Project 2', description: 'Description 2' },
        { slug: 'project-3', title: 'Project 3', description: 'Description 3' },
        { slug: 'project-4', title: 'Project 4', description: 'Description 4' },
    ];

    it('renders the page with PortfolioLayout', () => {
        render(<Welcome projects={mockProjects} />);

        expect(screen.getByTestId('portfolio-layout')).toBeInTheDocument();
    });

    it('sets the correct page title', () => {
        render(<Welcome projects={mockProjects} />);

        expect(screen.getByText('Sabrina Markon - Developer & Writer')).toBeInTheDocument();
    });

    it('renders all portfolio sections', () => {
        render(<Welcome projects={mockProjects} />);

        expect(screen.getByTestId('hero-section')).toBeInTheDocument();
        expect(screen.getByTestId('featured-projects')).toBeInTheDocument();
        expect(screen.getByTestId('writing-section')).toBeInTheDocument();
        expect(screen.getByTestId('about-section')).toBeInTheDocument();
        expect(screen.getByTestId('contact-section')).toBeInTheDocument();
    });

    it('passes projects to FeaturedProjects component', () => {
        render(<Welcome projects={mockProjects} />);

        const featuredProjects = screen.getByTestId('featured-projects');
        expect(featuredProjects).toBeInTheDocument();
        // FeaturedProjects should receive the projects array
        expect(featuredProjects.textContent).toContain('showing 3 of 4');
    });

    it('passes limit of 3 to FeaturedProjects', () => {
        render(<Welcome projects={mockProjects} />);

        const featuredProjects = screen.getByTestId('featured-projects');
        // Should show first 3 projects even though 4 are available
        expect(featuredProjects.textContent).toContain('showing 3');
    });

    it('renders with empty projects array', () => {
        render(<Welcome projects={[]} />);

        expect(screen.getByTestId('portfolio-layout')).toBeInTheDocument();
        expect(screen.getByTestId('featured-projects')).toBeInTheDocument();
    });

    it('renders sections in correct order', () => {
        const { container } = render(<Welcome projects={mockProjects} />);

        const sections = container.querySelectorAll('[data-testid]');
        const sectionIds = Array.from(sections).map(el => el.getAttribute('data-testid'));

        // Check order of sections
        expect(sectionIds.indexOf('hero-section')).toBeLessThan(sectionIds.indexOf('featured-projects'));
        expect(sectionIds.indexOf('featured-projects')).toBeLessThan(sectionIds.indexOf('writing-section'));
        expect(sectionIds.indexOf('writing-section')).toBeLessThan(sectionIds.indexOf('about-section'));
        expect(sectionIds.indexOf('about-section')).toBeLessThan(sectionIds.indexOf('contact-section'));
    });
});
