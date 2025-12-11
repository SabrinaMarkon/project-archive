import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Index from './Index';
import { router } from '@inertiajs/react';

// Mock router and usePage
const mockUsePage = vi.fn();

vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');
    return {
        ...actual,
        router: {
            delete: vi.fn(),
            patch: vi.fn(),
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
    Download: () => <span>DownloadIcon</span>,
    Trash2: () => <span>Trash2Icon</span>,
    Mail: () => <span>MailIcon</span>,
    MailOpen: () => <span>MailOpenIcon</span>,
    BarChart: () => <span>BarChartIcon</span>,
    PenSquare: () => <span>PenSquareIcon</span>,
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

describe('Admin Newsletter Index Page', () => {
    const mockStats = {
        total: 15,
        active: 10,
        unsubscribed: 3,
        pending: 2,
    };

    const mockSubscribers = {
        data: [
            {
                id: 1,
                email: 'active@example.com',
                confirmed_at: '2024-01-01',
                unsubscribed_at: null,
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
            },
            {
                id: 2,
                email: 'unsubscribed@example.com',
                confirmed_at: '2024-01-01',
                unsubscribed_at: '2024-01-15',
                created_at: '2024-01-01',
                updated_at: '2024-01-15',
            },
            {
                id: 3,
                email: 'pending@example.com',
                confirmed_at: null,
                unsubscribed_at: null,
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
            },
        ],
        links: [],
        current_page: 1,
        per_page: 15,
        total: 3,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUsePage.mockReturnValue({
            props: { flash: {} },
        });
    });

    it('renders newsletter subscribers header', () => {
        render(<Index subscribers={mockSubscribers} stats={mockStats} />);

        expect(screen.getByText('Newsletter Subscribers')).toBeInTheDocument();
    });

    it('displays stats correctly', () => {
        render(<Index subscribers={mockSubscribers} stats={mockStats} />);

        expect(screen.getByText('15')).toBeInTheDocument(); // total
        expect(screen.getByText('10')).toBeInTheDocument(); // active
        expect(screen.getByText('3')).toBeInTheDocument(); // unsubscribed
    });

    it('displays all subscribers in the list', () => {
        render(<Index subscribers={mockSubscribers} stats={mockStats} />);

        expect(screen.getByText('active@example.com')).toBeInTheDocument();
        expect(screen.getByText('unsubscribed@example.com')).toBeInTheDocument();
        expect(screen.getByText('pending@example.com')).toBeInTheDocument();
    });

    it('shows active badge for confirmed subscribers', () => {
        render(<Index subscribers={mockSubscribers} stats={mockStats} />);

        const activeBadges = screen.getAllByText('Active');
        expect(activeBadges.length).toBeGreaterThan(0);
    });

    it('shows unsubscribed badge for unsubscribed subscribers', () => {
        render(<Index subscribers={mockSubscribers} stats={mockStats} />);

        const unsubscribedElements = screen.getAllByText('Unsubscribed');
        expect(unsubscribedElements.length).toBeGreaterThan(0);
    });

    it('renders filter buttons', () => {
        render(<Index subscribers={mockSubscribers} stats={mockStats} />);

        expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Subscribed' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Unsubscribed' })).toBeInTheDocument();
    });

    it('filters subscribers when clicking Subscribed filter', () => {
        render(<Index subscribers={mockSubscribers} stats={mockStats} />);

        const subscribedButton = screen.getByText('Subscribed');
        fireEvent.click(subscribedButton);

        // Should show active subscriber
        expect(screen.getByText('active@example.com')).toBeInTheDocument();
        // Should not show unsubscribed subscriber
        expect(screen.queryByText('unsubscribed@example.com')).not.toBeInTheDocument();
    });

    it('filters subscribers when clicking Unsubscribed filter', () => {
        render(<Index subscribers={mockSubscribers} stats={mockStats} />);

        const unsubscribedButtons = screen.getAllByText('Unsubscribed');
        // Click the filter button (not the badge or label)
        const unsubscribedButton = unsubscribedButtons.find(el => el.tagName === 'BUTTON');
        fireEvent.click(unsubscribedButton!);

        // Should show unsubscribed subscriber
        expect(screen.getByText('unsubscribed@example.com')).toBeInTheDocument();
        // Should not show active subscriber
        expect(screen.queryByText('active@example.com')).not.toBeInTheDocument();
    });

    it('renders compose newsletter button', () => {
        render(<Index subscribers={mockSubscribers} stats={mockStats} />);

        const composeButton = screen.getByText('Compose Newsletter');
        expect(composeButton).toBeInTheDocument();
        expect(composeButton.closest('a')).toHaveAttribute('href', '/admin/newsletter/compose');
    });

    it('renders export CSV button', () => {
        render(<Index subscribers={mockSubscribers} stats={mockStats} />);

        expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });

    it('renders newsletter history button', () => {
        render(<Index subscribers={mockSubscribers} stats={mockStats} />);

        const historyButton = screen.getByText('History');
        expect(historyButton).toBeInTheDocument();
        expect(historyButton.closest('a')).toHaveAttribute('href', '/admin/newsletter/history');
    });

    it('shows Unsubscribe button for active subscribers', () => {
        render(<Index subscribers={mockSubscribers} stats={mockStats} />);

        const unsubscribeButtons = screen.getAllByText('Unsubscribe');
        expect(unsubscribeButtons.length).toBeGreaterThan(0);
    });

    it('shows Delete button for unsubscribed subscribers', () => {
        render(<Index subscribers={mockSubscribers} stats={mockStats} />);

        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('opens delete confirmation modal on delete button click', () => {
        render(<Index subscribers={mockSubscribers} stats={mockStats} />);

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByText('Delete this subscriber permanently?')).toBeInTheDocument();
    });

    it('opens unsubscribe confirmation modal on unsubscribe button click', () => {
        render(<Index subscribers={mockSubscribers} stats={mockStats} />);

        const unsubscribeButtons = screen.getAllByText('Unsubscribe');
        fireEvent.click(unsubscribeButtons[0]);

        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByText('Unsubscribe this email address?')).toBeInTheDocument();
    });

    it('displays empty state when no subscribers match filter', () => {
        const emptySubscribers = {
            data: [],
            links: [],
            current_page: 1,
            per_page: 15,
            total: 0,
        };

        render(<Index subscribers={emptySubscribers} stats={mockStats} />);

        expect(screen.getByText('No subscribers found.')).toBeInTheDocument();
    });

    it('calls router.patch when confirming unsubscribe for active subscriber', () => {
        render(<Index subscribers={mockSubscribers} stats={mockStats} />);

        const unsubscribeButtons = screen.getAllByText('Unsubscribe');
        fireEvent.click(unsubscribeButtons[0]);

        // Click confirm in modal
        const confirmButtons = screen.getAllByText('Unsubscribe');
        const confirmButton = confirmButtons[confirmButtons.length - 1]; // Last one is in modal
        fireEvent.click(confirmButton);

        expect(router.patch).toHaveBeenCalled();
    });

    it('calls router.delete when confirming delete for unsubscribed subscriber', () => {
        render(<Index subscribers={mockSubscribers} stats={mockStats} />);

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        // Click confirm in modal
        const deleteProjectButton = screen.getByText('Delete Permanently');
        fireEvent.click(deleteProjectButton);

        expect(router.delete).toHaveBeenCalled();
    });

    it('closes modal when clicking Cancel', () => {
        render(<Index subscribers={mockSubscribers} stats={mockStats} />);

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        expect(screen.getByTestId('modal')).toBeInTheDocument();

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
});
