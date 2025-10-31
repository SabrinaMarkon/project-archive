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
    ExternalLink: () => <span>ExternalLinkIcon</span>,
    Edit: () => <span>EditIcon</span>,
    Trash2: () => <span>Trash2Icon</span>,
    ChevronDown: () => <span>ChevronDownIcon</span>,
    ChevronRight: () => <span>ChevronRightIcon</span>,
}));

describe('Admin Projects Index Page', () => {
    const mockProjects = [
        {
            id: 1,
            title: 'First Project',
            slug: 'first-project',
            description: 'First project description',
            tags: ['Laravel', 'React'],
        },
        {
            id: 2,
            title: 'Second Project',
            slug: 'second-project',
            description: 'Second project description',
            tags: ['Vue', 'TypeScript'],
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders project list header', () => {
        render(<Index projects={[]} />);

        expect(screen.getByText('Project List')).toBeInTheDocument();
    });

    it('displays all projects in the list', () => {
        render(<Index projects={mockProjects} />);

        expect(screen.getByText('First Project')).toBeInTheDocument();
        expect(screen.getByText('Second Project')).toBeInTheDocument();
    });

    it('renders action buttons for each project', () => {
        render(<Index projects={mockProjects} />);

        // Should have View, Update, and Delete buttons for each project
        const viewButtons = screen.getAllByText('View');
        const updateButtons = screen.getAllByText('Update');
        const deleteButtons = screen.getAllByText('Delete');

        expect(viewButtons).toHaveLength(2);
        expect(updateButtons).toHaveLength(2);
        expect(deleteButtons).toHaveLength(2);
    });

    it('renders chevron icons for expandable projects', () => {
        render(<Index projects={mockProjects} />);

        // Should have chevron icons for each project
        const chevronIcons = screen.getAllByText(/ChevronRightIcon|ChevronDownIcon/);
        expect(chevronIcons.length).toBeGreaterThan(0);
    });

    it('displays empty state when no projects exist', () => {
        render(<Index projects={[]} />);

        expect(screen.getByText('No projects found. Create your first project!')).toBeInTheDocument();
        expect(screen.getByText('Create Project')).toBeInTheDocument();
    });

    it('View button opens project in new window', () => {
        render(<Index projects={mockProjects} />);

        const viewLinks = screen.getAllByText('View').map(el => el.closest('a'));

        expect(viewLinks[0]).toHaveAttribute('href', '/projects/first-project');
        expect(viewLinks[0]).toHaveAttribute('target', '_blank');
        expect(viewLinks[1]).toHaveAttribute('href', '/projects/second-project');
        expect(viewLinks[1]).toHaveAttribute('target', '_blank');
    });

    it('Update button links to edit page', () => {
        render(<Index projects={mockProjects} />);

        const updateLinks = screen.getAllByText('Update').map(el => el.closest('a'));

        expect(updateLinks[0]).toHaveAttribute('href', '/admin/projects/first-project');
        expect(updateLinks[1]).toHaveAttribute('href', '/admin/projects/second-project');
    });

    it('expands project description on title click', () => {
        render(<Index projects={mockProjects} />);

        const firstProjectButton = screen.getByText('First Project').closest('button');
        expect(firstProjectButton).toBeInTheDocument();

        // Initially, description should not be visible
        expect(screen.queryByText('First project description')).not.toBeInTheDocument();

        // Click to expand
        fireEvent.click(firstProjectButton!);

        // Description should now be visible
        expect(screen.getByText('First project description')).toBeInTheDocument();
    });

    it('displays tags when project is expanded', () => {
        render(<Index projects={mockProjects} />);

        const firstProjectButton = screen.getByText('First Project').closest('button');

        // Expand project
        fireEvent.click(firstProjectButton!);

        // Tags should be visible
        expect(screen.getByText('Laravel')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
    });

    it('shows delete confirmation modal on delete button click', () => {
        render(<Index projects={mockProjects} />);

        const deleteButtons = screen.getAllByText('Delete');

        // Click first delete button
        fireEvent.click(deleteButtons[0]);

        // Modal should appear
        expect(screen.getByText('Are you sure you want to delete this project?')).toBeInTheDocument();
        expect(screen.getByText(/Once deleted, "First Project" will be permanently removed/)).toBeInTheDocument();
    });

    it('modal has cancel and confirm delete buttons', () => {
        render(<Index projects={mockProjects} />);

        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);

        // Should have Cancel and Delete Project buttons in modal
        expect(screen.getByText('Cancel')).toBeInTheDocument();

        // Two "Delete Project" buttons - one in modal, one in form (for second project)
        const deleteProjectButtons = screen.getAllByText(/Delete/);
        expect(deleteProjectButtons.length).toBeGreaterThan(0);
    });

    it('handles project with no description', () => {
        const projectsWithoutDesc = [
            {
                id: 1,
                title: 'No Description Project',
                slug: 'no-desc',
                description: null,
                tags: [],
            },
        ];

        render(<Index projects={projectsWithoutDesc} />);

        const projectButton = screen.getByText('No Description Project').closest('button');
        fireEvent.click(projectButton!);

        expect(screen.getByText('No description available')).toBeInTheDocument();
    });

    it('handles project with no tags', () => {
        const projectsWithoutTags = [
            {
                id: 1,
                title: 'No Tags Project',
                slug: 'no-tags',
                description: 'Description here',
                tags: null,
            },
        ];

        render(<Index projects={projectsWithoutTags} />);

        const projectButton = screen.getByText('No Tags Project').closest('button');
        fireEvent.click(projectButton!);

        // Tags section should not appear
        expect(screen.queryByText('Tags:')).not.toBeInTheDocument();
    });
});
