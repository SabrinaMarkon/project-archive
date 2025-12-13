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
    Mail: () => <span>MailIcon</span>,
    Github: () => <span>GithubIcon</span>,
    Linkedin: () => <span>LinkedinIcon</span>,
}));

describe('Public Courses Index Page', () => {
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

    it('renders courses heading', () => {
        render(<Index courses={[]} />);

        expect(screen.getByText('Courses')).toBeInTheDocument();
    });

    it('displays all courses', () => {
        render(<Index courses={mockCourses} />);

        expect(screen.getByText('Laravel Mastery')).toBeInTheDocument();
        expect(screen.getByText('React Advanced')).toBeInTheDocument();
    });

    it('displays course descriptions', () => {
        render(<Index courses={mockCourses} />);

        expect(screen.getByText('Complete Laravel course')).toBeInTheDocument();
        expect(screen.getByText('Advanced React patterns')).toBeInTheDocument();
    });

    it('displays course prices', () => {
        render(<Index courses={mockCourses} />);

        expect(screen.getByText('99.99')).toBeInTheDocument();
        expect(screen.getByText('49.99')).toBeInTheDocument();
    });

    it('displays module count', () => {
        render(<Index courses={mockCourses} />);

        expect(screen.getByText(/5 modules?/i)).toBeInTheDocument();
        expect(screen.getByText(/3 modules?/i)).toBeInTheDocument();
    });

    it('displays payment type', () => {
        render(<Index courses={mockCourses} />);

        expect(screen.getByText(/one-time/i)).toBeInTheDocument();
        expect(screen.getByText(/monthly/i)).toBeInTheDocument();
    });

    it('links to course detail pages', () => {
        render(<Index courses={mockCourses} />);

        const courseLinks = screen.getAllByText('View Course').map(el => el.closest('a'));

        expect(courseLinks[0]).toHaveAttribute('href', '/courses/1');
        expect(courseLinks[1]).toHaveAttribute('href', '/courses/2');
    });

    it('displays empty state when no courses exist', () => {
        render(<Index courses={[]} />);

        expect(screen.getByText(/no courses available/i)).toBeInTheDocument();
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

        expect(screen.getByText('No Description Course')).toBeInTheDocument();
    });
});
