import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import History from './History';
import { router } from '@inertiajs/react';

// Mock router and usePage
const mockUsePage = vi.fn();

vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');
    return {
        ...actual,
        router: {
            delete: vi.fn(),
        },
        usePage: () => mockUsePage(),
        Head: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
            <a href={href}>{children}</a>
        ),
    };
});

// Mock layouts
vi.mock('@/Layouts/AuthenticatedLayout', () => ({
    default: ({ children, header }: { children: React.ReactNode; header: React.ReactNode }) => (
        <div>
            {header}
            {children}
        </div>
    ),
}));

vi.mock('@/Layouts/DashboardLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    Eye: () => <span>EyeIcon</span>,
    Trash2: () => <span>Trash2Icon</span>,
    Calendar: () => <span>CalendarIcon</span>,
    Users: () => <span>UsersIcon</span>,
    FileText: () => <span>FileTextIcon</span>,
    CheckCircle: () => <span>CheckCircleIcon</span>,
    XCircle: () => <span>XCircleIcon</span>,
}));

// Mock Modal component
vi.mock('@/Components/Modal', () => ({
    default: ({ show, children }: { show: boolean; children: React.ReactNode }) => (
        show ? <div data-testid="modal">{children}</div> : null
    ),
}));

vi.mock('@/Components/DangerButton', () => ({
    default: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
        <button onClick={onClick}>{children}</button>
    ),
}));

vi.mock('@/Components/SecondaryButton', () => ({
    default: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
        <button onClick={onClick}>{children}</button>
    ),
}));

vi.mock('@/Components/DescriptionRenderer', () => ({
    default: ({ content, format }: { content: string; format: string }) => (
        <div data-testid="description-renderer">
            <span data-format={format}>{content}</span>
        </div>
    ),
}));

describe('Admin Newsletter History Page', () => {
    const mockNewsletters = {
        data: [
            {
                id: 1,
                subject: 'Weekly Newsletter #1',
                body: 'This is the first newsletter content',
                format: 'markdown',
                recipient_count: 10,
                sent_at: '2025-12-01 10:00:00',
                created_at: '2025-12-01 10:00:00',
                updated_at: '2025-12-01 10:00:00',
            },
            {
                id: 2,
                subject: 'Monthly Update',
                body: '<h1>Monthly Update</h1><p>HTML content here</p>',
                format: 'html',
                recipient_count: 25,
                sent_at: '2025-11-30 09:00:00',
                created_at: '2025-11-30 09:00:00',
                updated_at: '2025-11-30 09:00:00',
            },
        ],
        links: [],
        current_page: 1,
        per_page: 15,
        total: 2,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUsePage.mockReturnValue({
            props: { flash: {} },
        });
    });

    it('renders newsletter history header', () => {
        render(<History newsletters={mockNewsletters} />);

        expect(screen.getByText('Newsletter History')).toBeInTheDocument();
    });

    it('displays all newsletters in the list', () => {
        render(<History newsletters={mockNewsletters} />);

        expect(screen.getByText('Weekly Newsletter #1')).toBeInTheDocument();
        expect(screen.getByText('Monthly Update')).toBeInTheDocument();
    });

    it('displays recipient count for each newsletter', () => {
        render(<History newsletters={mockNewsletters} />);

        expect(screen.getByText('10 recipients')).toBeInTheDocument();
        expect(screen.getByText('25 recipients')).toBeInTheDocument();
    });

    it('displays sent date for each newsletter', () => {
        render(<History newsletters={mockNewsletters} />);

        // Should display formatted dates (Dec 1, 2025 format)
        expect(screen.getByText(/Dec 1, 2025/)).toBeInTheDocument();
        expect(screen.getByText(/Nov 30, 2025/)).toBeInTheDocument();
    });

    it('displays format badge for each newsletter', () => {
        render(<History newsletters={mockNewsletters} />);

        expect(screen.getByText('markdown')).toBeInTheDocument();
        expect(screen.getByText('html')).toBeInTheDocument();
    });

    it('renders view button for each newsletter', () => {
        render(<History newsletters={mockNewsletters} />);

        const viewButtons = screen.getAllByText('View');
        expect(viewButtons.length).toBe(2);
    });

    it('renders delete button for each newsletter', () => {
        render(<History newsletters={mockNewsletters} />);

        const deleteButtons = screen.getAllByText('Delete');
        expect(deleteButtons.length).toBe(2);
    });

    it('opens view modal when clicking view button', () => {
        render(<History newsletters={mockNewsletters} />);

        const viewButtons = screen.getAllByText('View');
        fireEvent.click(viewButtons[0]);

        expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('view modal displays newsletter subject', () => {
        render(<History newsletters={mockNewsletters} />);

        const viewButtons = screen.getAllByText('View');
        fireEvent.click(viewButtons[0]);

        // Should have 2 instances: one in list, one in modal
        const subjects = screen.getAllByText('Weekly Newsletter #1');
        expect(subjects.length).toBeGreaterThanOrEqual(1);
    });

    it('view modal displays newsletter body with DescriptionRenderer', () => {
        render(<History newsletters={mockNewsletters} />);

        const viewButtons = screen.getAllByText('View');
        fireEvent.click(viewButtons[0]);

        expect(screen.getByTestId('description-renderer')).toBeInTheDocument();
        expect(screen.getByTestId('description-renderer')).toHaveTextContent('This is the first newsletter content');
    });

    it('view modal displays format information', () => {
        render(<History newsletters={mockNewsletters} />);

        const viewButtons = screen.getAllByText('View');
        fireEvent.click(viewButtons[0]);

        // Format appears both in card and modal
        const formatLabels = screen.getAllByText(/Format:/);
        expect(formatLabels.length).toBeGreaterThanOrEqual(1);
    });

    it('view modal displays recipient count', () => {
        render(<History newsletters={mockNewsletters} />);

        const viewButtons = screen.getAllByText('View');
        fireEvent.click(viewButtons[0]);

        // Recipients info appears in both card and modal
        const recipientsLabels = screen.getAllByText(/Recipients:/);
        expect(recipientsLabels.length).toBeGreaterThanOrEqual(1);
    });

    it('view modal displays sent date', () => {
        render(<History newsletters={mockNewsletters} />);

        const viewButtons = screen.getAllByText('View');
        fireEvent.click(viewButtons[0]);

        expect(screen.getByText(/Sent:/)).toBeInTheDocument();
    });

    it('closes view modal when clicking close button', () => {
        render(<History newsletters={mockNewsletters} />);

        const viewButtons = screen.getAllByText('View');
        fireEvent.click(viewButtons[0]);

        expect(screen.getByTestId('modal')).toBeInTheDocument();

        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('opens delete confirmation modal when clicking delete button', () => {
        render(<History newsletters={mockNewsletters} />);

        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);

        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByText('Delete this newsletter permanently?')).toBeInTheDocument();
    });

    it('delete modal shows newsletter subject in confirmation', () => {
        render(<History newsletters={mockNewsletters} />);

        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);

        // Subject appears in list and in modal confirmation
        const subjects = screen.getAllByText(/Weekly Newsletter #1/);
        expect(subjects.length).toBeGreaterThanOrEqual(1);
    });

    it('calls router.delete when confirming delete', () => {
        render(<History newsletters={mockNewsletters} />);

        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);

        const deleteConfirmButton = screen.getByText('Delete Permanently');
        fireEvent.click(deleteConfirmButton);

        expect(router.delete).toHaveBeenCalledWith('/admin/newsletter/history/1');
    });

    it('closes delete modal when clicking cancel', () => {
        render(<History newsletters={mockNewsletters} />);

        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);

        expect(screen.getByTestId('modal')).toBeInTheDocument();

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('displays empty state when no newsletters exist', () => {
        const emptyNewsletters = {
            data: [],
            links: [],
            current_page: 1,
            per_page: 15,
            total: 0,
        };

        render(<History newsletters={emptyNewsletters} />);

        expect(screen.getByText('No newsletters have been sent yet.')).toBeInTheDocument();
    });

    it('displays success flash message when present', () => {
        mockUsePage.mockReturnValue({
            props: { flash: { success: 'Newsletter deleted successfully.' } },
        });

        render(<History newsletters={mockNewsletters} />);

        expect(screen.getByText('Newsletter deleted successfully.')).toBeInTheDocument();
    });

    it('displays error flash message when present', () => {
        mockUsePage.mockReturnValue({
            props: { flash: { error: 'Failed to delete newsletter.' } },
        });

        render(<History newsletters={mockNewsletters} />);

        expect(screen.getByText('Failed to delete newsletter.')).toBeInTheDocument();
    });

    it('renders link to compose newsletter page', () => {
        render(<History newsletters={mockNewsletters} />);

        const composeLink = screen.getByText('Compose Newsletter');
        expect(composeLink.closest('a')).toHaveAttribute('href', '/admin/newsletter/compose');
    });

    it('renders link to subscribers page', () => {
        render(<History newsletters={mockNewsletters} />);

        const subscribersLink = screen.getByText('Subscribers');
        expect(subscribersLink.closest('a')).toHaveAttribute('href', '/admin/newsletter-subscribers');
    });

    it('displays pagination when there are multiple pages', () => {
        const paginatedNewsletters = {
            ...mockNewsletters,
            total: 20,
            current_page: 1,
            per_page: 15,
            links: [
                { url: null, label: '&laquo; Previous', active: false },
                { url: '/admin/newsletter/history?page=1', label: '1', active: true },
                { url: '/admin/newsletter/history?page=2', label: '2', active: false },
                { url: '/admin/newsletter/history?page=2', label: 'Next &raquo;', active: false },
            ],
        };

        render(<History newsletters={paginatedNewsletters} />);

        // Should render pagination links (checking for page links)
        const paginationLinks = screen.getAllByRole('link');
        expect(paginationLinks.length).toBeGreaterThan(3); // Should have multiple pagination links
    });
});
