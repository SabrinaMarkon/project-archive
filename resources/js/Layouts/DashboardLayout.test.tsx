import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardLayout from './DashboardLayout';

// Mock Inertia
vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');
    return {
        ...actual,
        router: {
            post: vi.fn(),
        },
        usePage: () => ({
            props: {
                auth: {
                    user: {
                        id: 1,
                        name: 'Test User',
                        email: 'test@example.com',
                        is_admin: true,
                    },
                },
            },
        }),
        Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
            <a href={href}>{children}</a>
        ),
    };
});

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    Leaf: () => <span>LeafIcon</span>,
    LayoutDashboard: () => <span>DashboardIcon</span>,
    Plus: () => <span>PlusIcon</span>,
    List: () => <span>ListIcon</span>,
    LogOut: () => <span>LogOutIcon</span>,
    PenSquare: () => <span>PenSquareIcon</span>,
    BookText: () => <span>BookTextIcon</span>,
    Mail: () => <span>MailIcon</span>,
    GraduationCap: () => <span>GraduationCapIcon</span>,
}));

describe('DashboardLayout', () => {
    it('renders sidebar navigation', () => {
        render(
            <DashboardLayout>
                <div>Test Content</div>
            </DashboardLayout>
        );

        expect(screen.getByText('Project Archive')).toBeInTheDocument();
    });

    it('displays dashboard link', () => {
        render(
            <DashboardLayout>
                <div>Test Content</div>
            </DashboardLayout>
        );

        const dashboardLink = screen.getByText('Dashboard').closest('a');
        expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });

    it('displays project management links', () => {
        render(
            <DashboardLayout>
                <div>Test Content</div>
            </DashboardLayout>
        );

        const createProjectLink = screen.getByText('Create Project').closest('a');
        expect(createProjectLink).toHaveAttribute('href', '/admin/projects/create');

        const projectListLink = screen.getByText('Project List').closest('a');
        expect(projectListLink).toHaveAttribute('href', '/admin/projects');
    });

    it('displays writing/posts management links', () => {
        render(
            <DashboardLayout>
                <div>Test Content</div>
            </DashboardLayout>
        );

        const createWritingLink = screen.getByText('Create Writing').closest('a');
        expect(createWritingLink).toHaveAttribute('href', '/admin/posts/create');

        const writingListLink = screen.getByText('Writing List').closest('a');
        expect(writingListLink).toHaveAttribute('href', '/admin/posts');
    });

    it('displays newsletter link', () => {
        render(
            <DashboardLayout>
                <div>Test Content</div>
            </DashboardLayout>
        );

        const newsletterLink = screen.getByText('Newsletter').closest('a');
        expect(newsletterLink).toHaveAttribute('href', '/admin/newsletter-subscribers');
    });

    it('displays course management links', () => {
        render(
            <DashboardLayout>
                <div>Test Content</div>
            </DashboardLayout>
        );

        const createCourseLink = screen.getByText('Create Course').closest('a');
        expect(createCourseLink).toHaveAttribute('href', '/admin/courses/create');

        const coursesLink = screen.getByText('Courses').closest('a');
        expect(coursesLink).toHaveAttribute('href', '/admin/courses');
    });

    it('displays logout buttons', () => {
        render(
            <DashboardLayout>
                <div>Test Content</div>
            </DashboardLayout>
        );

        const logoutButtons = screen.getAllByText('Logout');
        expect(logoutButtons.length).toBe(2); // One in sidebar, one in header
    });

    it('renders children content', () => {
        render(
            <DashboardLayout>
                <div>Custom Content Here</div>
            </DashboardLayout>
        );

        expect(screen.getByText('Custom Content Here')).toBeInTheDocument();
    });

    it('displays admin area header', () => {
        render(
            <DashboardLayout>
                <div>Test Content</div>
            </DashboardLayout>
        );

        expect(screen.getByText('Admin Area')).toBeInTheDocument();
    });
});
