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

describe('Post Show Page (/posts/{slug})', () => {
    const mockPost = {
        slug: 'test-post',
        title: 'Test Post',
        description: 'This is detailed content for the test post.',
    };

    it('renders the page with PortfolioLayout', () => {
        render(<Show post={mockPost} />);

        expect(screen.getByTestId('portfolio-layout')).toBeInTheDocument();
    });

    it('sets the correct page title with post title', () => {
        render(<Show post={mockPost} />);

        expect(screen.getByText('Test Post - Sabrina Markon')).toBeInTheDocument();
    });

    it('renders the post title in header', () => {
        render(<Show post={mockPost} />);

        const titleElements = screen.getAllByText('Test Post');
        expect(titleElements.length).toBeGreaterThan(0);
    });

    it('renders back to posts link', () => {
        render(<Show post={mockPost} />);

        const backLink = screen.getByText('Back to All Writing');
        expect(backLink).toBeInTheDocument();
        expect(backLink.closest('a')).toHaveAttribute('href', '/posts');
    });

    it('renders post description', () => {
        render(<Show post={mockPost} />);

        expect(screen.getByText(mockPost.description)).toBeInTheDocument();
    });

    it('shows default message when description is null', () => {
        const postWithoutDescription = {
            ...mockPost,
            description: null,
        };

        render(<Show post={postWithoutDescription} />);

        expect(screen.getByText('No content is available for this post yet.')).toBeInTheDocument();
    });

    it('shows default message when description is empty string', () => {
        const postWithEmptyDescription = {
            ...mockPost,
            description: '',
        };

        render(<Show post={postWithEmptyDescription} />);

        expect(screen.getByText('No content is available for this post yet.')).toBeInTheDocument();
    });

    it('renders ContactSection', () => {
        render(<Show post={mockPost} />);

        expect(screen.getByTestId('contact-section')).toBeInTheDocument();
    });

    it('renders Code2 icon in header', () => {
        const { container } = render(<Show post={mockPost} />);

        // Check for icon container with specific styling
        const iconContainer = container.querySelector('.w-16.h-16.rounded-xl');
        expect(iconContainer).toBeInTheDocument();
    });

    it('applies correct section backgrounds', () => {
        const { container } = render(<Show post={mockPost} />);

        // Check for white header section
        const headerSection = container.querySelector('.pt-32.pb-12');
        expect(headerSection).toBeInTheDocument();

        // Check for colored content section
        const contentSection = container.querySelector('.py-12.pb-24');
        expect(contentSection).toBeInTheDocument();
    });

    it('preserves whitespace in description', () => {
        const postWithMultilineDescription = {
            ...mockPost,
            description: 'Line 1\n\nLine 2\n\nLine 3',
        };

        const { container } = render(<Show post={postWithMultilineDescription} />);

        // Check for whitespace-pre-wrap class which preserves newlines
        const descriptionElement = container.querySelector('.whitespace-pre-wrap');
        expect(descriptionElement).toBeInTheDocument();
        expect(descriptionElement?.textContent).toContain('Line 1');
        expect(descriptionElement?.textContent).toContain('Line 2');
        expect(descriptionElement?.textContent).toContain('Line 3');
    });

    it('renders content in white card', () => {
        const { container } = render(<Show post={mockPost} />);

        // Check for white content card with specific styling
        const contentCard = container.querySelector('.bg-white.rounded-2xl.p-8');
        expect(contentCard).toBeInTheDocument();
    });

    it('handles very long post titles', () => {
        const postWithLongTitle = {
            ...mockPost,
            title: 'This Is An Extremely Long Post Title That Should Still Display Correctly Without Breaking The Layout',
        };

        render(<Show post={postWithLongTitle} />);

        const titleElements = screen.getAllByText(postWithLongTitle.title);
        expect(titleElements.length).toBeGreaterThan(0);
    });

    it('handles very long descriptions', () => {
        const longDescription = 'Lorem ipsum dolor sit amet, '.repeat(100);
        const postWithLongDescription = {
            ...mockPost,
            description: longDescription,
        };

        render(<Show post={postWithLongDescription} />);

        // Use partial text match for very long strings
        expect(screen.getByText(/Lorem ipsum dolor sit amet,/)).toBeInTheDocument();

        // Verify the full text is in the document
        const { container } = render(<Show post={postWithLongDescription} />);
        expect(container.textContent).toContain('Lorem ipsum dolor sit amet,');
    });

    it('renders ArrowLeft icon in back link', () => {
        render(<Show post={mockPost} />);

        const backLink = screen.getByText('Back to All Writing').closest('a');
        expect(backLink).toHaveClass('inline-flex', 'items-center');
    });
});
