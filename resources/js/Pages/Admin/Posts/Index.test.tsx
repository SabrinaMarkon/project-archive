import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Index from './Index';
import { router } from '@inertiajs/react';

// Mock Inertia
vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');
    return {
        ...actual,
        router: {
            delete: vi.fn(),
        },
        Head: ({ title }: { title: string }) => <title>{title}</title>,
        Link: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
    };
});

// Mock AuthenticatedLayout
vi.mock('@/Layouts/AuthenticatedLayout', () => ({
    default: ({ children, header }: any) => (
        <div data-testid="authenticated-layout">
            <header>{header}</header>
            {children}
        </div>
    ),
}));

// Mock DashboardLayout
vi.mock('@/Layouts/DashboardLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="dashboard-layout">{children}</div>,
}));

// Mock components
vi.mock('@/Components/Modal', () => ({
    default: ({ show, onClose, children }: any) => (
        show ? <div data-testid="modal" onClick={onClose}>{children}</div> : null
    ),
}));

vi.mock('@/Components/DangerButton', () => ({
    default: ({ children, onClick }: any) => (
        <button onClick={onClick} data-testid="danger-button">{children}</button>
    ),
}));

vi.mock('@/Components/SecondaryButton', () => ({
    default: ({ children, onClick }: any) => (
        <button onClick={onClick}>{children}</button>
    ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    ExternalLink: () => <span>ExternalLink</span>,
    Edit: () => <span>Edit</span>,
    Trash2: () => <span>Trash2</span>,
    ChevronDown: () => <span>ChevronDown</span>,
    ChevronRight: () => <span>ChevronRight</span>,
}));

describe('Admin Posts Index', () => {
    const mockPosts = [
        {
            id: 1,
            title: 'Test Post 1',
            slug: 'test-post-1',
            description: 'This is test post 1 description',
            excerpt: 'Short excerpt for post 1',
            status: 'published',
            format: 'markdown',
            readTime: '5 min read',
            publishedAt: '2024-01-15',
            tags: ['Laravel', 'PHP'],
            isFeatured: true,
        },
        {
            id: 2,
            title: 'Test Post 2',
            slug: 'test-post-2',
            description: 'This is test post 2 description',
            excerpt: 'Short excerpt for post 2',
            status: 'draft',
            format: 'html',
            readTime: '3 min read',
            publishedAt: null,
            tags: ['React', 'TypeScript'],
            isFeatured: false,
        },
    ];

    it('renders posts list page with header', () => {
        render(<Index posts={mockPosts} />);
        expect(screen.getByText('Posts List')).toBeInTheDocument();
    });

    it('displays all posts', () => {
        render(<Index posts={mockPosts} />);
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
        expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    });

    it('shows status badges with correct labels', () => {
        render(<Index posts={mockPosts} />);
        expect(screen.getByText('published')).toBeInTheDocument();
        expect(screen.getByText('draft')).toBeInTheDocument();
    });

    it('displays action buttons for each post', () => {
        render(<Index posts={mockPosts} />);
        const viewButtons = screen.getAllByText(/View/);
        const updateButtons = screen.getAllByText(/Update/);
        const deleteButtons = screen.getAllByText(/Delete/);

        expect(viewButtons).toHaveLength(2);
        expect(updateButtons).toHaveLength(2);
        expect(deleteButtons).toHaveLength(2);
    });

    it('expands post details when title is clicked', async () => {
        render(<Index posts={mockPosts} />);

        // Initially, description should not be visible
        expect(screen.queryByText('This is test post 1 description')).not.toBeInTheDocument();

        // Click the first post title
        const postButton = screen.getByText('Test Post 1');
        fireEvent.click(postButton);

        // Description should now be visible (truncated)
        await waitFor(() => {
            expect(screen.getByText(/This is test post 1 description/)).toBeInTheDocument();
        });
    });

    it('collapses post details when clicked again', async () => {
        render(<Index posts={mockPosts} />);

        // Click to expand
        const postButton = screen.getByText('Test Post 1');
        fireEvent.click(postButton);

        await waitFor(() => {
            expect(screen.getByText(/This is test post 1 description/)).toBeInTheDocument();
        });

        // Click to collapse
        fireEvent.click(postButton);

        await waitFor(() => {
            expect(screen.queryByText('This is test post 1 description')).not.toBeInTheDocument();
        });
    });

    it('displays excerpt when expanded', async () => {
        render(<Index posts={mockPosts} />);

        const postButton = screen.getByText('Test Post 1');
        fireEvent.click(postButton);

        await waitFor(() => {
            expect(screen.getByText('Short excerpt for post 1')).toBeInTheDocument();
        });
    });

    it('displays format and reading time when expanded', async () => {
        render(<Index posts={mockPosts} />);

        const postButton = screen.getByText('Test Post 1');
        fireEvent.click(postButton);

        await waitFor(() => {
            expect(screen.getByText(/Format:/)).toBeInTheDocument();
            expect(screen.getByText(/markdown/)).toBeInTheDocument();
            expect(screen.getByText(/Reading time:/)).toBeInTheDocument();
            expect(screen.getByText(/5 min read/)).toBeInTheDocument();
        });
    });

    it('displays published date when available and expanded', async () => {
        render(<Index posts={mockPosts} />);

        const postButton = screen.getByText('Test Post 1');
        fireEvent.click(postButton);

        await waitFor(() => {
            expect(screen.getByText(/Published:/)).toBeInTheDocument();
        });
    });

    it('displays tags when expanded', async () => {
        render(<Index posts={mockPosts} />);

        const postButton = screen.getByText('Test Post 1');
        fireEvent.click(postButton);

        await waitFor(() => {
            expect(screen.getByText('Laravel')).toBeInTheDocument();
            expect(screen.getByText('PHP')).toBeInTheDocument();
        });
    });

    it('view button opens in new tab', () => {
        render(<Index posts={mockPosts} />);
        const viewLinks = screen.getAllByRole('link', { name: /View/ });

        expect(viewLinks[0]).toHaveAttribute('href', '/posts/test-post-1');
        expect(viewLinks[0]).toHaveAttribute('target', '_blank');
        expect(viewLinks[0]).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('update button links to edit page', () => {
        render(<Index posts={mockPosts} />);
        const updateLinks = screen.getAllByRole('link', { name: /Update/ });

        expect(updateLinks[0]).toHaveAttribute('href', '/admin/posts/test-post-1');
    });

    it('opens delete confirmation modal when delete is clicked', () => {
        render(<Index posts={mockPosts} />);

        const deleteButtons = screen.getAllByRole('button', { name: /Delete/ });
        fireEvent.click(deleteButtons[0]);

        expect(screen.getByText('Are you sure you want to delete this post?')).toBeInTheDocument();
        expect(screen.getByText(/Test Post 1/)).toBeInTheDocument();
    });

    it('closes delete modal when cancel is clicked', async () => {
        render(<Index posts={mockPosts} />);

        // Open modal
        const deleteButtons = screen.getAllByRole('button', { name: /Delete/ });
        fireEvent.click(deleteButtons[0]);

        expect(screen.getByText('Are you sure you want to delete this post?')).toBeInTheDocument();

        // Click cancel
        const cancelButton = screen.getByRole('button', { name: /Cancel/ });
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByText('Are you sure you want to delete this post?')).not.toBeInTheDocument();
        });
    });

    it('calls router.delete when delete is confirmed', async () => {
        render(<Index posts={mockPosts} />);

        // Open modal
        const deleteButtons = screen.getAllByRole('button', { name: /Delete/ });
        fireEvent.click(deleteButtons[0]);

        // Click delete in modal
        const confirmButtons = screen.getAllByRole('button', { name: /Delete Post/ });
        fireEvent.click(confirmButtons[0]);

        await waitFor(() => {
            expect(router.delete).toHaveBeenCalledWith('/admin/posts/test-post-1', expect.any(Object));
        });
    });

    it('shows empty state message when no posts', () => {
        render(<Index posts={[]} />);
        expect(screen.getByText('No posts found. Create your first post!')).toBeInTheDocument();
    });

    it('shows create post link in empty state', () => {
        render(<Index posts={[]} />);
        const createLink = screen.getByRole('link', { name: /Create Post/ });
        expect(createLink).toHaveAttribute('href', '/admin/posts/create');
    });

    it('handles post without description', async () => {
        const postsWithoutDescription = [
            {
                id: 3,
                title: 'No Description Post',
                slug: 'no-description',
                description: null,
                excerpt: null,
                status: 'draft',
                format: 'markdown',
                readTime: '1 min read',
                publishedAt: null,
                tags: [],
                isFeatured: false,
            },
        ];

        render(<Index posts={postsWithoutDescription} />);

        const postButton = screen.getByText('No Description Post');
        fireEvent.click(postButton);

        await waitFor(() => {
            expect(screen.getByText('No description available')).toBeInTheDocument();
        });
    });

    it('handles post without tags', async () => {
        const postsWithoutTags = [
            {
                id: 4,
                title: 'No Tags Post',
                slug: 'no-tags',
                description: 'Description here',
                excerpt: 'Excerpt here',
                status: 'published',
                format: 'markdown',
                readTime: '2 min read',
                publishedAt: '2024-01-10',
                tags: [],
                isFeatured: false,
            },
        ];

        render(<Index posts={postsWithoutTags} />);

        const postButton = screen.getByText('No Tags Post');
        fireEvent.click(postButton);

        await waitFor(() => {
            expect(screen.queryByText('Tags:')).not.toBeInTheDocument();
        });
    });
});
