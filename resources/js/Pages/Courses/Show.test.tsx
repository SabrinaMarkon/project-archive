import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Show from './Show';

// Mock Inertia
vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');
    return {
        ...actual,
        Head: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
            <a href={href}>{children}</a>
        ),
    };
});

// Mock PortfolioLayout
vi.mock('@/Layouts/PortfolioLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    ArrowLeft: () => <span>ArrowLeftIcon</span>,
    Lock: () => <span>LockIcon</span>,
    Unlock: () => <span>UnlockIcon</span>,
    Clock: () => <span>ClockIcon</span>,
    DollarSign: () => <span>DollarSignIcon</span>,
    Mail: () => <span>MailIcon</span>,
    Github: () => <span>GithubIcon</span>,
    Linkedin: () => <span>LinkedinIcon</span>,
}));

describe('Public Courses Show Page', () => {
    const mockCourse = {
        id: 1,
        title: 'Laravel Mastery',
        description: 'Complete Laravel course from beginner to advanced',
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
                post: { id: 1, title: 'Introduction to Laravel', slug: 'introduction-to-laravel' },
            },
            {
                id: 2,
                post_id: 2,
                is_free: false,
                order: 1,
                post: { id: 2, title: 'Laravel Routing', slug: 'laravel-routing' },
            },
            {
                id: 3,
                post_id: 3,
                is_free: false,
                order: 2,
                post: { id: 3, title: 'Eloquent ORM', slug: 'eloquent-orm' },
            },
        ],
    };

    it('renders course title', () => {
        render(<Show course={mockCourse} />);

        expect(screen.getByText('Laravel Mastery')).toBeInTheDocument();
    });

    it('renders course description', () => {
        render(<Show course={mockCourse} />);

        expect(screen.getByText('Complete Laravel course from beginner to advanced')).toBeInTheDocument();
    });

    it('displays course price', () => {
        render(<Show course={mockCourse} />);

        expect(screen.getByText('99.99')).toBeInTheDocument();
    });

    it('displays payment type', () => {
        render(<Show course={mockCourse} />);

        expect(screen.getByText(/one-time/i)).toBeInTheDocument();
    });

    it('displays back to courses link', () => {
        render(<Show course={mockCourse} />);

        const backLink = screen.getByText('Back to Courses').closest('a');
        expect(backLink).toHaveAttribute('href', '/courses');
    });

    it('displays all course modules', () => {
        render(<Show course={mockCourse} />);

        expect(screen.getByText('Introduction to Laravel')).toBeInTheDocument();
        expect(screen.getByText('Laravel Routing')).toBeInTheDocument();
        expect(screen.getByText('Eloquent ORM')).toBeInTheDocument();
    });

    it('shows free badge for free modules', () => {
        render(<Show course={mockCourse} />);

        expect(screen.getByText('Free')).toBeInTheDocument();
    });

    it('shows locked badge for paid modules', () => {
        render(<Show course={mockCourse} />);

        const lockedBadges = screen.getAllByText('Locked');
        expect(lockedBadges.length).toBe(2); // Two paid modules
    });

    it('links free modules to post pages', () => {
        render(<Show course={mockCourse} />);

        const freeModuleLink = screen.getByText('Introduction to Laravel').closest('a');
        expect(freeModuleLink).toHaveAttribute('href', '/posts/introduction-to-laravel');
    });

    it('does not link locked modules', () => {
        render(<Show course={mockCourse} />);

        const lockedModuleTitle = screen.getByText('Laravel Routing');
        const parentLink = lockedModuleTitle.closest('a');
        expect(parentLink).toBeNull();
    });

    it('displays module count', () => {
        render(<Show course={mockCourse} />);

        expect(screen.getByText(/3 modules?/i)).toBeInTheDocument();
    });

    it('shows purchase button', () => {
        render(<Show course={mockCourse} />);

        expect(screen.getByText(/purchase course/i)).toBeInTheDocument();
    });

    it('handles course with no modules', () => {
        const courseWithoutModules = {
            ...mockCourse,
            modules: [],
        };

        render(<Show course={courseWithoutModules} />);

        expect(screen.getByText(/no modules available/i)).toBeInTheDocument();
    });

    it('displays payment methods', () => {
        const courseWithBothPayments = {
            ...mockCourse,
            stripe_enabled: true,
            paypal_enabled: true,
        };

        render(<Show course={courseWithBothPayments} />);

        expect(screen.getByText(/stripe/i)).toBeInTheDocument();
        expect(screen.getByText(/paypal/i)).toBeInTheDocument();
    });
});
