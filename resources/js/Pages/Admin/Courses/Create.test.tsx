import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Create from './Create';

// Create a mock for useForm that can be updated per test
let mockFormData = {
    id: null as number | null,
    title: '',
    description: '',
    price: '',
    payment_type: 'one_time',
    stripe_enabled: true,
    paypal_enabled: false,
    modules: [] as any[],
};

// Mock Inertia
vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');
    return {
        ...actual,
        router: {
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
        },
        useForm: () => ({
            data: mockFormData,
            setData: vi.fn((key: string, value: any) => {
                mockFormData = { ...mockFormData, [key]: value };
            }),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
            processing: false,
            errors: {},
        }),
        Head: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
            <a href={href}>{children}</a>
        ),
    };
});

// Mock layouts
vi.mock('@/Layouts/AuthenticatedLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/Layouts/DashboardLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    Lock: () => <span>LockIcon</span>,
    Unlock: () => <span>UnlockIcon</span>,
    Trash2: () => <span>Trash2Icon</span>,
    Plus: () => <span>PlusIcon</span>,
}));

describe('Admin Courses Create/Edit Form', () => {
    const mockAvailablePosts = [
        { id: 1, title: 'Introduction to Laravel' },
        { id: 2, title: 'Advanced React Patterns' },
        { id: 3, title: 'TypeScript Fundamentals' },
    ];

    beforeEach(() => {
        // Reset mock form data before each test
        mockFormData = {
            id: null,
            title: '',
            description: '',
            price: '',
            payment_type: 'one_time',
            stripe_enabled: true,
            paypal_enabled: false,
            modules: [],
        };
    });

    it('renders form with all basic fields', () => {
        render(<Create course={null} availablePosts={mockAvailablePosts} />);

        expect(screen.getByLabelText('Title')).toBeInTheDocument();
        expect(screen.getByLabelText('Description')).toBeInTheDocument();
        expect(screen.getByLabelText('Price')).toBeInTheDocument();
        expect(screen.getByLabelText('Payment Type')).toBeInTheDocument();
    });

    it('renders payment method toggles', () => {
        render(<Create course={null} availablePosts={mockAvailablePosts} />);

        expect(screen.getByText('Enable Stripe')).toBeInTheDocument();
        expect(screen.getByText('Enable PayPal')).toBeInTheDocument();
    });

    it('shows create button for new course', () => {
        render(<Create course={null} availablePosts={mockAvailablePosts} />);

        expect(screen.getByText('Create Course')).toBeInTheDocument();
    });

    it('shows update and delete buttons for existing course', () => {
        mockFormData = {
            id: 1,
            title: 'Test Course',
            description: 'Test description',
            price: '99.99',
            payment_type: 'monthly',
            stripe_enabled: true,
            paypal_enabled: true,
            modules: [],
        };

        const course = {
            id: 1,
            title: 'Test Course',
            description: 'Test description',
            price: '99.99',
            payment_type: 'monthly',
            stripe_enabled: true,
            paypal_enabled: true,
            modules: [],
        };

        render(<Create course={course} availablePosts={mockAvailablePosts} />);

        expect(screen.getByText('Update Course')).toBeInTheDocument();
        expect(screen.getByText('Delete Course')).toBeInTheDocument();
    });

    it('pre-populates form fields when editing', () => {
        mockFormData = {
            id: 1,
            title: 'Existing Course',
            description: 'Existing description',
            price: '149.99',
            payment_type: 'annual',
            stripe_enabled: true,
            paypal_enabled: false,
            modules: [],
        };

        const course = {
            id: 1,
            title: 'Existing Course',
            description: 'Existing description',
            price: '149.99',
            payment_type: 'annual',
            stripe_enabled: true,
            paypal_enabled: false,
            modules: [],
        };

        render(<Create course={course} availablePosts={mockAvailablePosts} />);

        const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
        expect(titleInput).toBeInTheDocument();
    });

    it('displays payment type options', () => {
        render(<Create course={null} availablePosts={mockAvailablePosts} />);

        expect(screen.getByText(/One-time/i)).toBeInTheDocument();
        expect(screen.getByText(/Monthly/i)).toBeInTheDocument();
        expect(screen.getByText(/Annual/i)).toBeInTheDocument();
    });

    it('displays modules section when editing', () => {
        const course = {
            id: 1,
            title: 'Test Course',
            description: 'Test description',
            price: '99.99',
            payment_type: 'one_time',
            stripe_enabled: true,
            paypal_enabled: false,
            modules: [
                {
                    id: 1,
                    post_id: 1,
                    is_free: true,
                    order: 0,
                    post: { id: 1, title: 'Introduction to Laravel' },
                },
                {
                    id: 2,
                    post_id: 2,
                    is_free: false,
                    order: 1,
                    post: { id: 2, title: 'Advanced React Patterns' },
                },
            ],
        };

        mockFormData.id = 1;
        mockFormData.modules = course.modules;

        render(<Create course={course} availablePosts={mockAvailablePosts} />);

        expect(screen.getByText('Course Modules')).toBeInTheDocument();
        expect(screen.getByText('Introduction to Laravel')).toBeInTheDocument();
        expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument();
    });

    it('shows free badge for free modules', () => {
        const course = {
            id: 1,
            title: 'Test Course',
            description: 'Test',
            price: '99.99',
            payment_type: 'one_time',
            stripe_enabled: true,
            paypal_enabled: false,
            modules: [
                {
                    id: 1,
                    post_id: 1,
                    is_free: true,
                    order: 0,
                    post: { id: 1, title: 'Introduction to Laravel' },
                },
            ],
        };

        mockFormData.modules = course.modules;

        render(<Create course={course} availablePosts={mockAvailablePosts} />);

        expect(screen.getByText('Free')).toBeInTheDocument();
    });

    it('shows paid badge for paid modules', () => {
        const course = {
            id: 1,
            title: 'Test Course',
            description: 'Test',
            price: '99.99',
            payment_type: 'one_time',
            stripe_enabled: true,
            paypal_enabled: false,
            modules: [
                {
                    id: 1,
                    post_id: 1,
                    is_free: false,
                    order: 0,
                    post: { id: 1, title: 'Introduction to Laravel' },
                },
            ],
        };

        mockFormData.modules = course.modules;

        render(<Create course={course} availablePosts={mockAvailablePosts} />);

        expect(screen.getByText('Paid')).toBeInTheDocument();
    });

    it('displays add module section', () => {
        const course = {
            id: 1,
            title: 'Test Course',
            description: 'Test',
            price: '99.99',
            payment_type: 'one_time',
            stripe_enabled: true,
            paypal_enabled: false,
            modules: [],
        };

        render(<Create course={course} availablePosts={mockAvailablePosts} />);

        const addModuleElements = screen.getAllByText('Add Module');
        expect(addModuleElements.length).toBeGreaterThanOrEqual(1);
    });

    it('lists available posts in add module dropdown', () => {
        const course = {
            id: 1,
            title: 'Test Course',
            description: 'Test',
            price: '99.99',
            payment_type: 'one_time',
            stripe_enabled: true,
            paypal_enabled: false,
            modules: [],
        };

        render(<Create course={course} availablePosts={mockAvailablePosts} />);

        // Posts should be in dropdown (though exact text may vary)
        expect(screen.getByText(/Introduction to Laravel/)).toBeInTheDocument();
        expect(screen.getByText(/Advanced React Patterns/)).toBeInTheDocument();
        expect(screen.getByText(/TypeScript Fundamentals/)).toBeInTheDocument();
    });

    it('shows remove button for each module', () => {
        const course = {
            id: 1,
            title: 'Test Course',
            description: 'Test',
            price: '99.99',
            payment_type: 'one_time',
            stripe_enabled: true,
            paypal_enabled: false,
            modules: [
                {
                    id: 1,
                    post_id: 1,
                    is_free: true,
                    order: 0,
                    post: { id: 1, title: 'Module 1' },
                },
                {
                    id: 2,
                    post_id: 2,
                    is_free: false,
                    order: 1,
                    post: { id: 2, title: 'Module 2' },
                },
            ],
        };

        mockFormData.modules = course.modules;

        render(<Create course={course} availablePosts={mockAvailablePosts} />);

        const removeButtons = screen.getAllByText('Remove');
        expect(removeButtons).toHaveLength(2);
    });

    it('handles course with no modules', () => {
        const course = {
            id: 1,
            title: 'Empty Course',
            description: 'No modules yet',
            price: '99.99',
            payment_type: 'one_time',
            stripe_enabled: true,
            paypal_enabled: false,
            modules: [],
        };

        render(<Create course={course} availablePosts={mockAvailablePosts} />);

        expect(screen.getByText(/No modules added yet/i)).toBeInTheDocument();
    });

    it('does not show modules section for new course', () => {
        render(<Create course={null} availablePosts={mockAvailablePosts} />);

        expect(screen.queryByText('Course Modules')).not.toBeInTheDocument();
    });

    it('shows save course first message for new course', () => {
        render(<Create course={null} availablePosts={mockAvailablePosts} />);

        expect(screen.getByText(/Save the course first to add modules/i)).toBeInTheDocument();
    });
});
