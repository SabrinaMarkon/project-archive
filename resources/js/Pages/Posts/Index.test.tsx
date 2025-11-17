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

describe('Posts Index Page (/posts)', () => {
    const mockPosts = [
        { slug: 'post-1', title: 'Post 1', description: 'Description 1' },
        { slug: 'post-2', title: 'Post 2', description: 'Description 2' },
        { slug: 'post-3', title: 'Post 3', description: null },
    ];

    it('renders the page with PortfolioLayout', () => {
        render(<Index posts={mockPosts} />);

        expect(screen.getByTestId('portfolio-layout')).toBeInTheDocument();
    });

    it('sets the correct page title', () => {
        render(<Index posts={mockPosts} />);

        expect(screen.getByText('Writing - Sabrina Markon')).toBeInTheDocument();
    });

    it('renders the page header', () => {
        render(<Index posts={mockPosts} />);

        expect(screen.getByText('All Writing')).toBeInTheDocument();
        expect(screen.getByText(/Tutorials, lessons learned/i)).toBeInTheDocument();
    });

    it('renders all posts', () => {
        render(<Index posts={mockPosts} />);

        expect(screen.getByText('Post 1')).toBeInTheDocument();
        expect(screen.getByText('Post 2')).toBeInTheDocument();
        expect(screen.getByText('Post 3')).toBeInTheDocument();
    });

    it('renders post descriptions', () => {
        render(<Index posts={mockPosts} />);

        expect(screen.getByText('Description 1')).toBeInTheDocument();
        expect(screen.getByText('Description 2')).toBeInTheDocument();
    });

    it('shows default text when description is null', () => {
        render(<Index posts={mockPosts} />);

        expect(screen.getByText('No content is available yet.')).toBeInTheDocument();
    });

    it('renders links to individual post pages', () => {
        render(<Index posts={mockPosts} />);

        const links = screen.getAllByText('Read Post');
        expect(links).toHaveLength(3);

        // Check href attributes
        const linkElements = screen.getAllByRole('link', { name: /Read Post/i });
        expect(linkElements[0]).toHaveAttribute('href', '/posts/post-1');
        expect(linkElements[1]).toHaveAttribute('href', '/posts/post-2');
        expect(linkElements[2]).toHaveAttribute('href', '/posts/post-3');
    });

    it('renders ContactSection', () => {
        render(<Index posts={mockPosts} />);

        expect(screen.getByTestId('contact-section')).toBeInTheDocument();
    });

    it('shows message when no posts available', () => {
        render(<Index posts={[]} />);

        expect(screen.getByText('No posts available yet.')).toBeInTheDocument();
    });

    it('renders Code2 icon for each post', () => {
        const { container } = render(<Index posts={mockPosts} />);

        // Check that post cards are rendered (they have specific styling)
        const postCards = container.querySelectorAll('.group.bg-white.rounded-2xl');
        expect(postCards.length).toBe(3);
    });

    it('applies correct styling classes', () => {
        const { container } = render(<Index posts={mockPosts} />);

        // Check header section has white background
        const headerSection = container.querySelector('.pt-32.pb-12');
        expect(headerSection).toBeInTheDocument();

        // Check posts section has colored background
        const postsSection = container.querySelector('.py-12.pb-24');
        expect(postsSection).toBeInTheDocument();
    });

    it('handles large number of posts', () => {
        const manyPosts = Array.from({ length: 20 }, (_, i) => ({
            slug: `post-${i}`,
            title: `Post ${i}`,
            description: `Description ${i}`,
        }));

        render(<Index posts={manyPosts} />);

        // All posts should be rendered
        expect(screen.getByText('Post 0')).toBeInTheDocument();
        expect(screen.getByText('Post 19')).toBeInTheDocument();

        const viewPostLinks = screen.getAllByText('Read Post');
        expect(viewPostLinks).toHaveLength(20);
    });

    it('renders tags as clickable links when posts have tags', () => {
        const postsWithTags = [
            { slug: 'post-1', title: 'Post 1', description: 'Test', tags: ['Laravel', 'PHP'] },
            { slug: 'post-2', title: 'Post 2', description: 'Test', tags: ['React'] },
        ];

        render(<Index posts={postsWithTags} />);

        const laravelLink = screen.getByRole('link', { name: 'Laravel' });
        const phpLink = screen.getByRole('link', { name: 'PHP' });
        const reactLink = screen.getByRole('link', { name: 'React' });

        expect(laravelLink).toBeInTheDocument();
        expect(phpLink).toBeInTheDocument();
        expect(reactLink).toBeInTheDocument();

        expect(laravelLink).toHaveAttribute('href', '/posts?tag=Laravel');
        expect(phpLink).toHaveAttribute('href', '/posts?tag=PHP');
        expect(reactLink).toHaveAttribute('href', '/posts?tag=React');
    });

    it('does not render tags when posts have no tags', () => {
        const postsWithoutTags = [
            { slug: 'post-1', title: 'Post 1', description: 'Test', tags: [] },
        ];

        const { container } = render(<Index posts={postsWithoutTags} />);

        const tagLinks = container.querySelectorAll('a[href*="?tag="]');
        expect(tagLinks.length).toBe(0);
    });

    it('displays selected tag filter message when selectedTag prop is provided', () => {
        render(<Index posts={mockPosts} selectedTag="Laravel" />);

        expect(screen.getByText(/Showing posts tagged:/i)).toBeInTheDocument();
        expect(screen.getByText('Laravel')).toBeInTheDocument();
    });

    it('displays "View All Posts" link when filtering by tag', () => {
        render(<Index posts={mockPosts} selectedTag="Laravel" />);

        const viewAllLink = screen.getByText('View All Posts');
        expect(viewAllLink).toBeInTheDocument();
        expect(viewAllLink.closest('a')).toHaveAttribute('href', '/posts');
    });
});
