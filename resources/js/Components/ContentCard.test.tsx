import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContentCard from './ContentCard';

// Mock Inertia Link component
vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

describe('ContentCard', () => {
    const defaultProps = {
        title: 'Test Project',
        slug: 'test-project',
        description: 'This is a test description',
        href: '/projects/test-project',
    };

    it('renders with required props', () => {
        render(<ContentCard {...defaultProps} />);

        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(screen.getByText('This is a test description')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/projects/test-project');
    });

    it('renders default link text "View"', () => {
        render(<ContentCard {...defaultProps} />);

        expect(screen.getByText('View')).toBeInTheDocument();
    });

    it('renders custom link text', () => {
        render(<ContentCard {...defaultProps} linkText="Read More" />);

        expect(screen.getByText('Read More')).toBeInTheDocument();
    });

    it('renders fallback when description is null', () => {
        render(<ContentCard {...defaultProps} description={null} />);

        expect(screen.getByText('No description available.')).toBeInTheDocument();
    });

    it('renders fallback when description is empty string', () => {
        render(<ContentCard {...defaultProps} description="" />);

        expect(screen.getByText('No description available.')).toBeInTheDocument();
    });

    it('renders tags when provided', () => {
        render(<ContentCard {...defaultProps} tags={['React', 'TypeScript', 'Laravel']} />);

        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('Laravel')).toBeInTheDocument();
    });

    it('does not render tags section when tags array is empty', () => {
        const { container } = render(<ContentCard {...defaultProps} tags={[]} />);

        // Check that no tag elements exist
        const tags = container.querySelectorAll('.px-3.py-1.text-sm.rounded-full');
        expect(tags).toHaveLength(0);
    });

    it('does not render tags section when tags is undefined', () => {
        const { container } = render(<ContentCard {...defaultProps} />);

        const tags = container.querySelectorAll('.px-3.py-1.text-sm.rounded-full');
        expect(tags).toHaveLength(0);
    });

    it('renders readTime when provided', () => {
        render(<ContentCard {...defaultProps} readTime="5 min read" />);

        expect(screen.getByText('5 min read')).toBeInTheDocument();
    });

    it('does not render readTime when not provided', () => {
        const { container } = render(<ContentCard {...defaultProps} />);

        // Check that readTime badge doesn't exist
        expect(screen.queryByText(/min read/)).not.toBeInTheDocument();
    });

    it('renders with both tags and readTime', () => {
        render(
            <ContentCard
                {...defaultProps}
                tags={['React', 'Laravel']}
                readTime="3 min read"
            />
        );

        expect(screen.getByText('3 min read')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Laravel')).toBeInTheDocument();
    });

    it('applies hover effects class', () => {
        const { container } = render(<ContentCard {...defaultProps} />);

        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass('hover:shadow-xl', 'hover:-translate-y-1');
    });

    it('has correct accessibility attributes', () => {
        render(<ContentCard {...defaultProps} linkText="View Project" />);

        const link = screen.getByRole('link');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/projects/test-project');
    });

    it('renders icon', () => {
        const { container } = render(<ContentCard {...defaultProps} />);

        // Check for icon container
        const iconContainer = container.querySelector('.w-12.h-12.rounded-xl');
        expect(iconContainer).toBeInTheDocument();
    });
});
