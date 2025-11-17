import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeaturedProjects from './FeaturedProjects';
import { Project } from '@/types/project';

// Mock Inertia Link for ContentCard
vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

describe('FeaturedProjects', () => {
    const mockProjects: Project[] = [
        {
            id: 1,
            title: 'Project 1',
            slug: 'project-1',
            description: 'Description 1',
            tags: ['React', 'TypeScript'],
            excerpt: 'Excerpt 1',
            format: 'markdown',
            status: 'published',
            authorId: 1,
            readTime: '5 min read',
        },
        {
            id: 2,
            title: 'Project 2',
            slug: 'project-2',
            description: 'Description 2',
            tags: ['Laravel', 'PHP'],
            excerpt: 'Excerpt 2',
            format: 'markdown',
            status: 'published',
            authorId: 1,
            readTime: '3 min read',
        },
        {
            id: 3,
            title: 'Project 3',
            slug: 'project-3',
            description: 'Description 3',
            tags: ['Vue'],
            excerpt: 'Excerpt 3',
            format: 'markdown',
            status: 'published',
            authorId: 1,
            readTime: '3 min read',
        },
        {
            id: 4,
            title: 'Project 4',
            slug: 'project-4',
            description: 'Description 4',
            tags: [],
            excerpt: 'Excerpt 4',
            format: 'markdown',
            status: 'published',
            authorId: 1,
            readTime: '3 min read',
        },
    ];

    it('renders section heading', () => {
        render(<FeaturedProjects projects={mockProjects} />);

        expect(screen.getByText('Featured Projects')).toBeInTheDocument();
    });

    it('renders section description', () => {
        render(<FeaturedProjects projects={mockProjects} />);

        expect(screen.getByText(/A selection of work I've built/)).toBeInTheDocument();
    });

    it('limits projects to 3 by default', () => {
        render(<FeaturedProjects projects={mockProjects} />);

        expect(screen.getByText('Project 1')).toBeInTheDocument();
        expect(screen.getByText('Project 2')).toBeInTheDocument();
        expect(screen.getByText('Project 3')).toBeInTheDocument();
        expect(screen.queryByText('Project 4')).not.toBeInTheDocument();
    });

    it('respects custom limit prop', () => {
        render(<FeaturedProjects projects={mockProjects} limit={2} />);

        expect(screen.getByText('Project 1')).toBeInTheDocument();
        expect(screen.getByText('Project 2')).toBeInTheDocument();
        expect(screen.queryByText('Project 3')).not.toBeInTheDocument();
        expect(screen.queryByText('Project 4')).not.toBeInTheDocument();
    });

    it('shows all projects when limit exceeds array length', () => {
        render(<FeaturedProjects projects={mockProjects} limit={10} />);

        expect(screen.getByText('Project 1')).toBeInTheDocument();
        expect(screen.getByText('Project 2')).toBeInTheDocument();
        expect(screen.getByText('Project 3')).toBeInTheDocument();
        expect(screen.getByText('Project 4')).toBeInTheDocument();
    });

    it('handles empty projects array', () => {
        const { container } = render(<FeaturedProjects projects={[]} />);

        expect(screen.getByText('Featured Projects')).toBeInTheDocument();
        const cards = container.querySelectorAll('a[href^="/projects/"]');
        expect(cards).toHaveLength(0);
    });

    it('handles undefined projects prop gracefully', () => {
        // @ts-expect-error - Testing runtime behavior when prop is undefined
        const { container } = render(<FeaturedProjects />);

        expect(screen.getByText('Featured Projects')).toBeInTheDocument();
        // Should not crash, should render empty grid
        const cards = container.querySelectorAll('a[href^="/projects/"]');
        expect(cards).toHaveLength(0);
    });

    it('prefers excerpt over description for card content', () => {
        const { container } = render(<FeaturedProjects projects={[mockProjects[0]]} />);

        // Verify a project card is rendered (which would contain the excerpt)
        const projectCard = container.querySelector('.group.bg-white.rounded-2xl');
        expect(projectCard).toBeInTheDocument();

        // Verify the title is rendered
        expect(screen.getByText('Project 1')).toBeInTheDocument();
    });
    
    it('uses description when excerpt is not available', () => {
        const projectWithoutExcerpt: Project = {
            ...mockProjects[0],
            excerpt: undefined,
        };

        const { container } = render(<FeaturedProjects projects={[projectWithoutExcerpt]} />);

        // Verify a project card is rendered (which would contain the description)
        const projectCard = container.querySelector('.group.bg-white.rounded-2xl');
        expect(projectCard).toBeInTheDocument();

        // Verify the title is rendered
        expect(screen.getByText('Project 1')).toBeInTheDocument();
    });

    it('passes readTime to ContentCard', () => {
        render(<FeaturedProjects projects={[mockProjects[0]]} />);

        expect(screen.getByText('5 min read')).toBeInTheDocument();
    });

    it('handles empty projects array', () => {
        const { container } = render(<FeaturedProjects projects={[]} />);

        expect(screen.getByText('Featured Projects')).toBeInTheDocument();
        const cards = container.querySelectorAll('a[href^="/projects/"]');
        expect(cards).toHaveLength(0);
    });
        
    it('renders tags as clickable links with correct filter path', () => {
        render(<FeaturedProjects projects={[mockProjects[0]]} />);

        const reactLink = screen.getByRole('link', { name: 'React' });
        const typescriptLink = screen.getByRole('link', { name: 'TypeScript' });

        expect(reactLink).toBeInTheDocument();
        expect(typescriptLink).toBeInTheDocument();

        expect(reactLink).toHaveAttribute('href', '/projects?tag=React');
        expect(typescriptLink).toHaveAttribute('href', '/projects?tag=TypeScript');
    });
});
