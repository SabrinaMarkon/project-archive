import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Index from './Index';

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
    BookOpen: () => <span>BookOpenIcon</span>,
    Clock: () => <span>ClockIcon</span>,
    DollarSign: () => <span>DollarSignIcon</span>,
    AlertTriangle: () => <span>AlertTriangleIcon</span>,
    Mail: () => <span>MailIcon</span>,
    Github: () => <span>GithubIcon</span>,
    Linkedin: () => <span>LinkedinIcon</span>,
}));

// Mock ContactSection
vi.mock('@/Components/Portfolio/ContactSection', () => ({
    default: () => <div>Contact Section</div>,
}));

describe('Public Courses Index Page', () => {
    const mockCourses = [
        {
            id: 1,
            title: 'Laravel Mastery',
            description: 'Complete Laravel course',
            price: '99.99',
            payment_type: 'one_time' as const,
            stripe_enabled: true,
            paypal_enabled: false,
            modules_count: 5,
        },
        {
            id: 2,
            title: 'React Advanced',
            description: 'Advanced React patterns',
            price: '49.99',
            payment_type: 'monthly' as const,
            stripe_enabled: true,
            paypal_enabled: true,
            modules_count: 3,
        },
    ];

    // Default props - tests override only what they need
    const defaultProps = {
        courses: [],
        sharedCourseSettings: {
            paymentSettings: {
                stripeConfigured: false,
                paypalConfigured: false,
            },
        },
    };

    it('renders courses heading', () => {
        render(<Index {...defaultProps} />);

        expect(screen.getByText('Courses')).toBeInTheDocument();
    });

    it('displays all courses', () => {
        render(<Index {...defaultProps} courses={mockCourses} />);

        expect(screen.getByText('Laravel Mastery')).toBeInTheDocument();
        expect(screen.getByText('React Advanced')).toBeInTheDocument();
    });

    it('displays course descriptions', () => {
        render(<Index {...defaultProps} courses={mockCourses} />);

        expect(screen.getByText('Complete Laravel course')).toBeInTheDocument();
        expect(screen.getByText('Advanced React patterns')).toBeInTheDocument();
    });

    it('displays course prices', () => {
        render(<Index {...defaultProps} courses={mockCourses} />);

        expect(screen.getByText('99.99')).toBeInTheDocument();
        expect(screen.getByText('49.99')).toBeInTheDocument();
    });

    it('displays module count', () => {
        render(<Index {...defaultProps} courses={mockCourses} />);

        expect(screen.getByText(/5 modules?/i)).toBeInTheDocument();
        expect(screen.getByText(/3 modules?/i)).toBeInTheDocument();
    });

    it('displays payment type', () => {
        render(<Index {...defaultProps} courses={mockCourses} />);

        expect(screen.getByText(/one-time/i)).toBeInTheDocument();
        expect(screen.getByText(/monthly/i)).toBeInTheDocument();
    });

    it('links to course detail pages', () => {
        render(<Index {...defaultProps} courses={mockCourses} />);

        const courseLinks = screen.getAllByText('View Course').map(el => el.closest('a'));

        expect(courseLinks[0]).toHaveAttribute('href', '/courses/1');
        expect(courseLinks[1]).toHaveAttribute('href', '/courses/2');
    });

    it('displays empty state when no courses exist', () => {
        render(<Index {...defaultProps} courses={[]} />);

        expect(screen.getByText(/no courses available/i)).toBeInTheDocument();
    });

    it('handles course with no description', () => {
        const coursesWithoutDesc = [
            {
                id: 1,
                title: 'No Description Course',
                description: null,
                price: '29.99',
                payment_type: 'one_time' as const,
                stripe_enabled: true,
                paypal_enabled: false,
                modules_count: 0,
            },
        ];

        render(<Index {...defaultProps} courses={coursesWithoutDesc} />);

        expect(screen.getByText('No Description Course')).toBeInTheDocument();
    });

    // Payment gateway validation tests
    it('shows stripe badge when stripe is configured and course has stripe enabled', () => {
        render(<Index
            courses={mockCourses}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: true,
                    paypalConfigured: true,
                }
            }}
        />);

        expect(screen.getAllByText('Stripe').length).toBeGreaterThan(0);
    });

    it('shows paypal badge when paypal is configured and course has paypal enabled', () => {
        render(<Index
            courses={mockCourses}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: true,
                    paypalConfigured: true,
                }
            }}
        />);

        expect(screen.getByText('PayPal')).toBeInTheDocument();
    });

    it('does not show stripe badge when stripe is not configured', () => {
        render(<Index
            courses={mockCourses}
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
        const coursesWithoutStripe = [{
            ...mockCourses[0],
            stripe_enabled: false,
        }];

        render(<Index
            courses={coursesWithoutStripe}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: true,
                    paypalConfigured: true,
                }
            }}
        />);

        expect(screen.queryByText('Stripe')).not.toBeInTheDocument();
    });

    it('shows warning banner when no payment gateways are configured and courses exist', () => {
        render(<Index
            courses={mockCourses}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: false,
                    paypalConfigured: false,
                }
            }}
        />);

        expect(screen.getByText(/No payment gateways are configured/)).toBeInTheDocument();
    });

    it('does not show warning banner when at least one gateway is configured', () => {
        render(<Index
            courses={mockCourses}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: true,
                    paypalConfigured: false,
                }
            }}
        />);

        expect(screen.queryByText(/No payment gateways are configured/)).not.toBeInTheDocument();
    });

    it('does not show warning banner when course list is empty', () => {
        render(<Index {...defaultProps} courses={[]} />);

        expect(screen.queryByText(/No payment gateways are configured/)).not.toBeInTheDocument();
    });
});
