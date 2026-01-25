import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SelectPayment from './SelectPayment';

// Mock router
vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');
    return {
        ...actual,
        Head: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
            <a href={href}>{children}</a>
        ),
        router: {
            post: vi.fn(),
        },
    };
});

// Mock PortfolioLayout
vi.mock('@/Layouts/PortfolioLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    CreditCard: () => <span>CreditCardIcon</span>,
    DollarSign: () => <span>DollarSignIcon</span>,
    ArrowLeft: () => <span>ArrowLeftIcon</span>,
}));

// Mock route helper
(global as any).route = vi.fn((_name: string, _params?: any) => `/`);

describe('Checkout SelectPayment Page', () => {
    const mockCourse = {
        id: 1,
        title: 'Laravel Mastery',
        description: 'Complete Laravel course',
        price: 99.99,
        stripe_enabled: true,
        paypal_enabled: true,
    };

    const defaultProps = {
        course: mockCourse,
        sharedCourseSettings: {
            paymentSettings: {
                stripeConfigured: false,
                paypalConfigured: false,
            },
        },
    };

    it('renders course title', () => {
        render(<SelectPayment {...defaultProps} />);

        expect(screen.getByText('Laravel Mastery')).toBeInTheDocument();
    });

    it('renders course price', () => {
        render(<SelectPayment {...defaultProps} />);

        expect(screen.getByText('$99.99')).toBeInTheDocument();
    });

    it('shows back to course link', () => {
        render(<SelectPayment {...defaultProps} />);

        const backLink = screen.getByText('Back to Course').closest('a');
        expect(backLink).toHaveAttribute('href', '/courses/1');
    });

    it('shows stripe payment button when stripe is configured and course has stripe enabled', () => {
        render(<SelectPayment
            course={mockCourse}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: true,
                    paypalConfigured: false,
                }
            }}
        />);

        expect(screen.getByText('Pay with Stripe')).toBeInTheDocument();
    });

    it('shows paypal payment button when paypal is configured and course has paypal enabled', () => {
        render(<SelectPayment
            course={mockCourse}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: false,
                    paypalConfigured: true,
                }
            }}
        />);

        expect(screen.getByText('Pay with PayPal')).toBeInTheDocument();
    });

    it('shows both payment buttons when both are configured and course has both enabled', () => {
        render(<SelectPayment
            course={mockCourse}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: true,
                    paypalConfigured: true,
                }
            }}
        />);

        expect(screen.getByText('Pay with Stripe')).toBeInTheDocument();
        expect(screen.getByText('Pay with PayPal')).toBeInTheDocument();
    });

    it('does not show stripe button when stripe is not configured', () => {
        render(<SelectPayment
            course={mockCourse}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: false,
                    paypalConfigured: true,
                }
            }}
        />);

        expect(screen.queryByText('Pay with Stripe')).not.toBeInTheDocument();
    });

    it('does not show stripe button when course does not have stripe enabled', () => {
        const courseWithoutStripe = {
            ...mockCourse,
            stripe_enabled: false,
        };

        render(<SelectPayment
            course={courseWithoutStripe}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: true,
                    paypalConfigured: false,
                }
            }}
        />);

        expect(screen.queryByText('Pay with Stripe')).not.toBeInTheDocument();
    });

    it('does not show paypal button when course does not have paypal enabled', () => {
        const courseWithoutPaypal = {
            ...mockCourse,
            paypal_enabled: false,
        };

        render(<SelectPayment
            course={courseWithoutPaypal}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: false,
                    paypalConfigured: true,
                }
            }}
        />);

        expect(screen.queryByText('Pay with PayPal')).not.toBeInTheDocument();
    });

    it('shows error message when no payment methods are configured', () => {
        render(<SelectPayment
            course={mockCourse}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: false,
                    paypalConfigured: false,
                }
            }}
        />);

        expect(screen.getByText('Payment methods not configured')).toBeInTheDocument();
        expect(screen.getByText(/Please contact support/)).toBeInTheDocument();
    });

    it('shows single payment button when only one method is available', () => {
        render(<SelectPayment
            course={mockCourse}
            sharedCourseSettings={{
                paymentSettings: {
                    stripeConfigured: true,
                    paypalConfigured: false,
                }
            }}
        />);

        expect(screen.getByText('Pay with Stripe')).toBeInTheDocument();
        expect(screen.queryByText('Pay with PayPal')).not.toBeInTheDocument();
    });
});
