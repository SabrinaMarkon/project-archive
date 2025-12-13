import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Index from './Index';
import { router } from '@inertiajs/react';

// Mock router
vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');
    return {
        ...actual,
        router: {
            delete: vi.fn(),
        },
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
    Edit: () => <span>EditIcon</span>,
    Trash2: () => <span>Trash2Icon</span>,
    ChevronDown: () => <span>ChevronDownIcon</span>,
    ChevronRight: () => <span>ChevronRightIcon</span>,
    Book: () => <span>BookIcon</span>,
}));

describe('Admin Courses Index Page', () => {
    const mockCourses = [
        {
            id: 1,
            title: 'Laravel Mastery',
            description: 'Complete Laravel course',
            price: '99.99',
            payment_type: 'one_time',
            stripe_enabled: true,
            paypal_enabled: false,
            modules_count: 5,
        },
        {
            id: 2,
            title: 'React Advanced',
            description: 'Advanced React patterns',
            price: '49.99',
            payment_type: 'monthly',
            stripe_enabled: true,
            paypal_enabled: true,
            modules_count: 3,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders course list header', () => {
        render(<Index courses={[]} />);

        expect(screen.getByText('Courses')).toBeInTheDocument();
    });

    it('displays all courses in the list', () => {
        render(<Index courses={mockCourses} />);

        expect(screen.getByText('Laravel Mastery')).toBeInTheDocument();
        expect(screen.getByText('React Advanced')).toBeInTheDocument();
    });

    it('displays module count for each course', () => {
        render(<Index courses={mockCourses} />);

        expect(screen.getByText(/5 modules?/i)).toBeInTheDocument();
        expect(screen.getByText(/3 modules?/i)).toBeInTheDocument();
    });

    it('displays price and payment type', () => {
        render(<Index courses={mockCourses} />);

        expect(screen.getByText(/\$99\.99/)).toBeInTheDocument();
        expect(screen.getByText(/\$49\.99/)).toBeInTheDocument();
    });

    it('renders action buttons for each course', () => {
        render(<Index courses={mockCourses} />);

        // Should have Edit and Delete buttons for each course
        const editButtons = screen.getAllByText('Edit');
        const deleteButtons = screen.getAllByText('Delete');

        expect(editButtons).toHaveLength(2);
        expect(deleteButtons).toHaveLength(2);
    });

    it('displays empty state when no courses exist', () => {
        render(<Index courses={[]} />);

        expect(screen.getByText('No courses found. Create your first course!')).toBeInTheDocument();
        const createButtons = screen.getAllByText('Create Course');
        expect(createButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('Edit button links to edit page', () => {
        render(<Index courses={mockCourses} />);

        const editLinks = screen.getAllByText('Edit').map(el => el.closest('a'));

        expect(editLinks[0]).toHaveAttribute('href', '/admin/courses/1');
        expect(editLinks[1]).toHaveAttribute('href', '/admin/courses/2');
    });

    it('expands course description on title click', () => {
        render(<Index courses={mockCourses} />);

        const firstCourseButton = screen.getByText('Laravel Mastery').closest('button');
        expect(firstCourseButton).toBeInTheDocument();

        // Initially, description should not be visible
        expect(screen.queryByText('Complete Laravel course')).not.toBeInTheDocument();

        // Click to expand
        fireEvent.click(firstCourseButton!);

        // Description should now be visible
        expect(screen.getByText('Complete Laravel course')).toBeInTheDocument();
    });

    it('shows delete confirmation modal on delete button click', () => {
        render(<Index courses={mockCourses} />);

        const deleteButtons = screen.getAllByText('Delete');

        // Click first delete button
        fireEvent.click(deleteButtons[0]);

        // Modal should appear
        expect(screen.getByText('Are you sure you want to delete this course?')).toBeInTheDocument();
        expect(screen.getByText(/Once deleted, "Laravel Mastery" will be permanently removed/)).toBeInTheDocument();
    });

    it('modal has cancel and confirm delete buttons', () => {
        render(<Index courses={mockCourses} />);

        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);

        // Should have Cancel and Delete Course buttons in modal
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        const deleteInModal = screen.getByText(/Delete Course/);
        expect(deleteInModal).toBeInTheDocument();
    });

    it('handles course with no description', () => {
        const coursesWithoutDesc = [
            {
                id: 1,
                title: 'No Description Course',
                description: null,
                price: '29.99',
                payment_type: 'one_time',
                stripe_enabled: true,
                paypal_enabled: false,
                modules_count: 0,
            },
        ];

        render(<Index courses={coursesWithoutDesc} />);

        const courseButton = screen.getByText('No Description Course').closest('button');
        fireEvent.click(courseButton!);

        expect(screen.getByText('No description available')).toBeInTheDocument();
    });

    it('displays payment method badges', () => {
        render(<Index courses={mockCourses} />);

        // Check for Stripe and PayPal badges
        const stripeBadges = screen.getAllByText('Stripe');
        const paypalBadges = screen.getAllByText('PayPal');

        // First course has Stripe only
        expect(stripeBadges.length).toBeGreaterThanOrEqual(1);
        // Second course has both
        expect(paypalBadges.length).toBeGreaterThanOrEqual(1);
    });

    it('formats payment type for display', () => {
        render(<Index courses={mockCourses} />);

        const firstCourseButton = screen.getByText('Laravel Mastery').closest('button');
        fireEvent.click(firstCourseButton!);

        expect(screen.getByText(/one-time/i)).toBeInTheDocument();

        const secondCourseButton = screen.getByText('React Advanced').closest('button');
        fireEvent.click(secondCourseButton!);

        expect(screen.getByText(/monthly/i)).toBeInTheDocument();
    });

    it('shows create course button in header', () => {
        render(<Index courses={mockCourses} />);

        const createButton = screen.getByText('Create Course');
        expect(createButton).toBeInTheDocument();
        expect(createButton.closest('a')).toHaveAttribute('href', '/admin/courses/create');
    });
});
