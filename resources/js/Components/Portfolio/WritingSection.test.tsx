import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WritingSection from './WritingSection';
import { Post } from '@/types/post';

// Mock Inertia Link for ContentCard
vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

describe('WritingSection', () => {
    const mockPosts: Post[] = [
        {
            id: 1,
            title: 'Post 1',
            slug: 'post-1',
            description: 'Description 1',
            excerpt: 'Excerpt 1',
            format: 'markdown',
            status: 'published',
            authorId: 1,
            readTime: '5 min read',
        },
        {
            id: 2,
            title: 'Post 2',
            slug: 'post-2',
            description: 'Description 2',
            excerpt: 'Excerpt 2',
            format: 'markdown',
            status: 'published',
            authorId: 1,
            readTime: '3 min read',
        },
    ];

    it('renders section heading', () => {
        render(<WritingSection posts={mockPosts} />);

        expect(screen.getByText('Latest Writing')).toBeInTheDocument();
    });

    it('renders section description', () => {
        render(<WritingSection posts={mockPosts} />);

        expect(screen.getByText(/Thoughts on development/)).toBeInTheDocument();
    });

    it('renders all posts', () => {
        render(<WritingSection posts={mockPosts} />);

        expect(screen.getByText('Post 1')).toBeInTheDocument();
        expect(screen.getByText('Post 2')).toBeInTheDocument();
    });

    it('handles undefined posts prop gracefully', () => {
        // @ts-expect-error - Testing runtime behavior when prop is undefined
        const { container } = render(<WritingSection />);

        expect(screen.getByText('Latest Writing')).toBeInTheDocument();
        // Should not crash, should render empty grid
        const cards = container.querySelectorAll('a[href^="/posts/"]');
        expect(cards).toHaveLength(0);
    });

    it('prefers excerpt over description for card content', () => {
        render(<WritingSection posts={[mockPosts[0]]} />);

        // Excerpt is preferred, so we should see it in the description area
        expect(screen.getByText('Excerpt 1')).toBeInTheDocument();
    });

    it('uses description when excerpt is not available', () => {
        const postWithoutExcerpt: Post = {
            ...mockPosts[0],
            excerpt: undefined,
        };

        render(<WritingSection posts={[postWithoutExcerpt]} />);

        expect(screen.getByText('Description 1')).toBeInTheDocument();
    });

    it('passes readTime to ContentCard', () => {
        render(<WritingSection posts={[mockPosts[0]]} />);

        expect(screen.getByText('5 min read')).toBeInTheDocument();
    });

    it('handles empty posts array', () => {
        const { container } = render(<WritingSection posts={[]} />);

        expect(screen.getByText('Latest Writing')).toBeInTheDocument();
        const cards = container.querySelectorAll('a[href^="/posts/"]');
        expect(cards).toHaveLength(0);
    });
});
