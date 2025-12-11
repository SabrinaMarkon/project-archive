import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import View from './View';

// Mock usePage
const mockUsePage = vi.fn();

vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');
    return {
        ...actual,
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

// Mock DescriptionRenderer
vi.mock('@/Components/DescriptionRenderer', () => ({
    default: ({ content, format }: { content: string; format: string }) => (
        <div data-testid="description-renderer">
            <span data-format={format}>{content}</span>
        </div>
    ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    ArrowLeft: () => <span>ArrowLeftIcon</span>,
    Calendar: () => <span>CalendarIcon</span>,
    Users: () => <span>UsersIcon</span>,
    FileText: () => <span>FileTextIcon</span>,
}));

describe('Admin Newsletter View Page', () => {
    const mockNewsletter = {
        id: 1,
        subject: 'Test Newsletter Subject',
        body: 'This is the test newsletter body content with some **markdown** formatting.',
        format: 'markdown',
        recipient_count: 15,
        sent_at: '2025-12-01 10:30:00',
        created_at: '2025-12-01 10:30:00',
        updated_at: '2025-12-01 10:30:00',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUsePage.mockReturnValue({
            props: { flash: {} },
        });
    });

    it('renders newsletter view header', () => {
        render(<View newsletter={mockNewsletter} />);

        expect(screen.getByText('Newsletter Details')).toBeInTheDocument();
    });

    it('displays newsletter subject', () => {
        render(<View newsletter={mockNewsletter} />);

        expect(screen.getByText('Test Newsletter Subject')).toBeInTheDocument();
    });

    it('displays newsletter body with DescriptionRenderer', () => {
        render(<View newsletter={mockNewsletter} />);

        const renderer = screen.getByTestId('description-renderer');
        expect(renderer).toBeInTheDocument();
        expect(renderer).toHaveTextContent('This is the test newsletter body content');
    });

    it('uses correct format for DescriptionRenderer', () => {
        render(<View newsletter={mockNewsletter} />);

        const renderer = screen.getByTestId('description-renderer');
        const formatSpan = renderer.querySelector('[data-format]');
        expect(formatSpan).toHaveAttribute('data-format', 'markdown');
    });

    it('displays format information', () => {
        render(<View newsletter={mockNewsletter} />);

        expect(screen.getByText(/Format:/i)).toBeInTheDocument();
        // "markdown" appears as both badge and as formatted text
        const markdownTexts = screen.getAllByText(/markdown/i);
        expect(markdownTexts.length).toBeGreaterThanOrEqual(1);
    });

    it('displays recipient count', () => {
        render(<View newsletter={mockNewsletter} />);

        expect(screen.getByText(/Recipients:/i)).toBeInTheDocument();
        expect(screen.getByText(/15/)).toBeInTheDocument();
    });

    it('displays sent date', () => {
        render(<View newsletter={mockNewsletter} />);

        expect(screen.getByText(/Sent:/i)).toBeInTheDocument();
        // Date is formatted as "Dec 1, 2025 10:30 AM"
        expect(screen.getByText(/Dec 1, 2025/)).toBeInTheDocument();
    });

    it('renders back to history link', () => {
        render(<View newsletter={mockNewsletter} />);

        const backLink = screen.getByText('Back to History');
        expect(backLink.closest('a')).toHaveAttribute('href', '/admin/newsletter/history');
    });

    it('displays html format correctly', () => {
        const htmlNewsletter = {
            ...mockNewsletter,
            body: '<h1>HTML Newsletter</h1><p>Content here</p>',
            format: 'html',
        };

        render(<View newsletter={htmlNewsletter} />);

        const renderer = screen.getByTestId('description-renderer');
        const formatSpan = renderer.querySelector('[data-format]');
        expect(formatSpan).toHaveAttribute('data-format', 'html');
    });

    it('displays html_editor format as HTML', () => {
        const htmlEditorNewsletter = {
            ...mockNewsletter,
            body: '<h1>Rich Text</h1><p>Editor content</p>',
            format: 'html_editor',
        };

        render(<View newsletter={htmlEditorNewsletter} />);

        // html_editor should be converted to 'html' for rendering
        expect(screen.getByText(/Format:/i)).toBeInTheDocument();
        expect(screen.getByText(/HTML Editor/i)).toBeInTheDocument();
    });

    it('displays plaintext format correctly', () => {
        const plaintextNewsletter = {
            ...mockNewsletter,
            body: 'Plain text newsletter content without any formatting.',
            format: 'plaintext',
        };

        render(<View newsletter={plaintextNewsletter} />);

        const renderer = screen.getByTestId('description-renderer');
        const formatSpan = renderer.querySelector('[data-format]');
        expect(formatSpan).toHaveAttribute('data-format', 'plaintext');
    });

    it('displays correct icon for sent date', () => {
        render(<View newsletter={mockNewsletter} />);

        expect(screen.getByText('CalendarIcon')).toBeInTheDocument();
    });

    it('displays correct icon for recipient count', () => {
        render(<View newsletter={mockNewsletter} />);

        expect(screen.getByText('UsersIcon')).toBeInTheDocument();
    });

    it('displays correct icon for format', () => {
        render(<View newsletter={mockNewsletter} />);

        expect(screen.getByText('FileTextIcon')).toBeInTheDocument();
    });

    it('displays back arrow icon', () => {
        render(<View newsletter={mockNewsletter} />);

        expect(screen.getByText('ArrowLeftIcon')).toBeInTheDocument();
    });
});
