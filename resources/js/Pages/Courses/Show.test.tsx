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

// Mock ContactSection
vi.mock('@/Components/Portfolio/ContactSection', () => ({
    default: () => <div>Contact Section</div>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    ArrowLeft: () => <span>ArrowLeftIcon</span>,
    Lock: () => <span>LockIcon</span>,
    Unlock: () => <span>UnlockIcon</span>,
    Clock: () => <span>ClockIcon</span>,
    DollarSign: () => <span>DollarSignIcon</span>,
    AlertTriangle: () => <span>AlertTriangleIcon</span>,
    ChevronDown: () => <span>ChevronDownIcon</span>,
    ChevronUp: () => <span>ChevronUpIcon</span>,
    Mail: () => <span>MailIcon</span>,
    Github: () => <span>GithubIcon</span>,
    Linkedin: () => <span>LinkedinIcon</span>,
}));

// Mock route helper
(global as any).route = vi.fn((_name: string, _params?: any) => `/`);

describe('Public Courses Show Page', () => {
    const mockCourse = {
        id: 1,
        title: 'Laravel Mastery',
        description: 'Complete Laravel course from beginner to advanced',
        price: '99.99',
        payment_type: 'one_time' as const,
        stripe_enabled: true,
        paypal_enabled: false,
        modules: [
            {
                id: 1,
                post_id: 1,
                is_free: true,
                order: 0,
                post: { id: 1, title: 'Introduction to Laravel', slug: 'introduction-to-laravel', excerpt: null, description: null },
            },
            {
                id: 2,
                post_id: 2,
                is_free: false,
                order: 1,
                post: { id: 2, title: 'Laravel Routing', slug: 'laravel-routing', excerpt: null, description: null },
            },
            {
                id: 3,
                post_id: 3,
                is_free: false,
                order: 2,
                post: { id: 3, title: 'Eloquent ORM', slug: 'eloquent-orm', excerpt: null, description: null },
            },
        ],
    };

    const defaultProps = {
        course: mockCourse,
        hasPurchased: false,
        modules: mockCourse.modules,
        sharedCourseSettings: {
            paymentSettings: {
                stripeConfigured: false,
                paypalConfigured: false,
            },
        },
    };

    it('renders course title', () => {
        render(<Show {...defaultProps} />);

        expect(screen.getByText('Laravel Mastery')).toBeInTheDocument();
    });

    it('renders course description', () => {
        render(<Show {...defaultProps} />);

        expect(screen.getByText('Complete Laravel course from beginner to advanced')).toBeInTheDocument();
    });

    it('displays course price', () => {
        render(<Show {...defaultProps} />);

        expect(screen.getByText('99.99')).toBeInTheDocument();
    });

    it('displays payment type', () => {
        render(<Show {...defaultProps} />);

        expect(screen.getByText(/one-time/i)).toBeInTheDocument();
    });

    it('displays back to courses link', () => {
        render(<Show {...defaultProps} />);

        expect(screen.getByText('Back to Courses')).toBeInTheDocument();
    });

    it('displays all course modules', () => {
        render(<Show {...defaultProps} />);

        expect(screen.getByText('Introduction to Laravel')).toBeInTheDocument();
        expect(screen.getByText('Laravel Routing')).toBeInTheDocument();
        expect(screen.getByText('Eloquent ORM')).toBeInTheDocument();
    });

    it('shows free badge for free modules', () => {
        render(<Show {...defaultProps} />);

        expect(screen.getByText('Free')).toBeInTheDocument();
    });

    it('shows locked badge for paid modules', () => {
        render(<Show {...defaultProps} />);

        const lockedBadges = screen.getAllByText('Locked');
        expect(lockedBadges.length).toBe(2); // Two paid modules
    });

    it('links free modules to post pages', () => {
        render(<Show {...defaultProps} />);

        const freeModuleLink = screen.getByText('Introduction to Laravel').closest('a');
        expect(freeModuleLink).toHaveAttribute('href', '/posts/introduction-to-laravel');
    });

    it('does not link locked modules', () => {
        render(<Show {...defaultProps} />);

        const lockedModuleTitle = screen.getByText('Laravel Routing');
        const parentLink = lockedModuleTitle.closest('a');
        expect(parentLink).toBeNull();
    });

    it('displays module count', () => {
        render(<Show {...defaultProps} />);

        expect(screen.getByText(/3 modules?/i)).toBeInTheDocument();
    });

    it('handles course with no modules', () => {
        const courseWithoutModules = {
            ...mockCourse,
            modules: [],
        };

        render(<Show {...defaultProps} course={courseWithoutModules} modules={[]} />);

        expect(screen.getByText(/no modules available/i)).toBeInTheDocument();
    });

    // Payment gateway validation tests
    it('shows stripe badge when stripe is configured and course has stripe enabled', () => {
        render(<Show
            course={mockCourse}
            hasPurchased={false}
            modules={mockCourse.modules}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: true,
                    paypalConfigured: false,
                }
            }}
        />);

        expect(screen.getByText('Stripe')).toBeInTheDocument();
    });

    it('shows paypal badge when paypal is configured and course has paypal enabled', () => {
        const courseWithPaypal = {
            ...mockCourse,
            paypal_enabled: true,
        };

        render(<Show
            course={courseWithPaypal}
            hasPurchased={false}
            modules={mockCourse.modules}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: false,
                    paypalConfigured: true,
                }
            }}
        />);

        expect(screen.getByText('PayPal')).toBeInTheDocument();
    });

    it('shows both payment badges when both are configured and course has both enabled', () => {
        const courseWithBothPayments = {
            ...mockCourse,
            stripe_enabled: true,
            paypal_enabled: true,
        };

        render(<Show
            course={courseWithBothPayments}
            hasPurchased={false}
            modules={mockCourse.modules}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: true,
                    paypalConfigured: true,
                }
            }}
        />);

        expect(screen.getByText('Stripe')).toBeInTheDocument();
        expect(screen.getByText('PayPal')).toBeInTheDocument();
    });

    it('does not show stripe badge when stripe is not configured', () => {
        render(<Show
            course={mockCourse}
            hasPurchased={false}
            modules={mockCourse.modules}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: false,
                    paypalConfigured: true,
                }
            }}
        />);

        expect(screen.queryByText('Stripe')).not.toBeInTheDocument();
    });

    it('does not show stripe badge when course does not have stripe enabled', () => {
        const courseWithoutStripe = {
            ...mockCourse,
            stripe_enabled: false,
        };

        render(<Show
            course={courseWithoutStripe}
            hasPurchased={false}
            modules={mockCourse.modules}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: true,
                    paypalConfigured: false,
                }
            }}
        />);

        expect(screen.queryByText('Stripe')).not.toBeInTheDocument();
    });

    it('shows warning and hides purchase button when no payment gateways are configured', () => {
        render(<Show
            course={mockCourse}
            hasPurchased={false}
            modules={mockCourse.modules}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: false,
                    paypalConfigured: false,
                }
            }}
        />);

        expect(screen.getByText(/No payment gateways are configured/)).toBeInTheDocument();
        expect(screen.queryByText('Purchase Course')).not.toBeInTheDocument();
    });

    it('shows purchase button when at least one payment gateway is configured', () => {
        render(<Show
            course={mockCourse}
            hasPurchased={false}
            modules={mockCourse.modules}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: true,
                    paypalConfigured: false,
                }
            }}
        />);

        expect(screen.queryByText(/No payment gateways are configured/)).not.toBeInTheDocument();
        expect(screen.getByText('Purchase Course')).toBeInTheDocument();
    });
});
