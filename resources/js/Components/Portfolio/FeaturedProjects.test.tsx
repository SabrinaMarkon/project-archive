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
        },
        {
            id: 2,
            title: 'Project 2',
            slug: 'project-2',
            description: 'Description 2',
            tags: ['Laravel', 'PHP'],
        },
        {
            id: 3,
            title: 'Project 3',
            slug: 'project-3',
            description: 'Description 3',
            tags: ['Vue'],
        },
        {
            id: 4,
            title: 'Project 4',
            slug: 'project-4',
            description: 'Description 4',
            tags: [],
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

    it('passes correct props to ContentCard', () => {
        render(<FeaturedProjects projects={[mockProjects[0]]} />);

        expect(screen.getByText('Project 1')).toBeInTheDocument();
        expect(screen.getByText('Description 1')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });
});
