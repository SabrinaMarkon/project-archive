import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Compose from './Compose';

// Mock useForm hook with reactive data
const mockPost = vi.fn();
const mockSetData = vi.fn();
const mockUsePage = vi.fn();

let mockFormData = {
    subject: '',
    body: '',
    format: 'markdown' as 'markdown' | 'html' | 'html_editor' | 'plaintext',
};

vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual('@inertiajs/react');
    return {
        ...actual,
        useForm: () => ({
            get data() {
                return mockFormData;
            },
            setData: (key: string, value: any) => {
                mockFormData = { ...mockFormData, [key]: value };
                mockSetData(key, value);
            },
            post: mockPost,
            processing: false,
            errors: {},
        }),
        usePage: () => mockUsePage(),
        Head: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
    Eye: () => <span>EyeIcon</span>,
    CheckCircle: () => <span>CheckCircleIcon</span>,
    XCircle: () => <span>XCircleIcon</span>,
}));

// Mock components
vi.mock('@/Components/InputLabel', () => ({
    default: ({ value, htmlFor }: { value: string; htmlFor?: string }) => (
        <label htmlFor={htmlFor}>{value}</label>
    ),
}));

vi.mock('@/Components/TextInput', () => ({
    default: ({ value, onChange, ...props }: any) => (
        <input {...props} value={value} onChange={onChange} />
    ),
}));

vi.mock('@/Components/InputError', () => ({
    default: ({ message }: { message?: string }) => (
        message ? <div data-testid="input-error">{message}</div> : null
    ),
}));

vi.mock('@/Components/PrimaryButton', () => ({
    default: ({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) => (
        <button type="submit" disabled={disabled}>{children}</button>
    ),
}));

vi.mock('@/Components/SecondaryButton', () => ({
    default: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
        <button onClick={onClick}>{children}</button>
    ),
}));

vi.mock('@/Components/Modal', () => ({
    default: ({ show, children, onClose }: { show: boolean; children: React.ReactNode; onClose: () => void }) => (
        show ? <div data-testid="preview-modal" onClick={onClose}>{children}</div> : null
    ),
}));

vi.mock('@/Components/TipTapEditor', () => ({
    default: ({ value, onChange, className }: { value: string; onChange: (value: string) => void; className?: string }) => (
        <div data-testid="tiptap-editor" className={className}>
            <textarea value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
    ),
}));

describe('Admin Newsletter Compose Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset form data
        mockFormData = {
            subject: '',
            body: '',
            format: 'markdown',
        };
        mockUsePage.mockReturnValue({
            props: { flash: {} },
        });
    });

    it('renders compose newsletter header', () => {
        render(<Compose />);

        expect(screen.getByText('Compose Newsletter')).toBeInTheDocument();
    });

    it('renders subject input field', () => {
        render(<Compose />);

        expect(screen.getByLabelText('Subject')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /subject/i })).toBeInTheDocument();
    });

    it('renders format selector with all options', () => {
        render(<Compose />);

        expect(screen.getByLabelText('Format')).toBeInTheDocument();

        const formatSelect = screen.getByRole('combobox');
        expect(formatSelect).toBeInTheDocument();

        // Check for all format options
        expect(screen.getByText('Markdown')).toBeInTheDocument();
        expect(screen.getByText('HTML')).toBeInTheDocument();
        expect(screen.getByText('HTML Editor')).toBeInTheDocument();
        expect(screen.getByText('Plain Text')).toBeInTheDocument();
    });

    it('renders body textarea field', () => {
        render(<Compose />);

        expect(screen.getByLabelText('Body')).toBeInTheDocument();

        const bodyTextarea = screen.getByRole('textbox', { name: /body/i });
        expect(bodyTextarea).toBeInTheDocument();
        expect(bodyTextarea.tagName).toBe('TEXTAREA');
    });

    it('renders send newsletter button', () => {
        render(<Compose />);

        expect(screen.getByRole('button', { name: /send newsletter/i })).toBeInTheDocument();
    });

    it('calls setData when subject input changes', () => {
        render(<Compose />);

        const subjectInput = screen.getByRole('textbox', { name: /subject/i });
        fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });

        expect(mockSetData).toHaveBeenCalledWith('subject', 'Test Subject');
    });

    it('calls setData when format selector changes', () => {
        render(<Compose />);

        const formatSelect = screen.getByRole('combobox');
        fireEvent.change(formatSelect, { target: { value: 'html' } });

        expect(mockSetData).toHaveBeenCalledWith('format', 'html');
    });

    it('calls setData when body textarea changes', () => {
        render(<Compose />);

        const bodyTextarea = screen.getByRole('textbox', { name: /body/i });
        fireEvent.change(bodyTextarea, { target: { value: 'Newsletter content' } });

        expect(mockSetData).toHaveBeenCalledWith('body', 'Newsletter content');
    });

    it('calls post when form is submitted', () => {
        render(<Compose />);

        const form = screen.getByRole('button', { name: /send newsletter/i }).closest('form');
        expect(form).toBeInTheDocument();

        fireEvent.submit(form!);

        expect(mockPost).toHaveBeenCalledWith('/admin/newsletter/send');
    });

    it('textarea has 15 rows by default', () => {
        render(<Compose />);

        const bodyTextarea = screen.getByRole('textbox', { name: /body/i });
        expect(bodyTextarea).toHaveAttribute('rows', '15');
    });

    it('renders preview button', () => {
        render(<Compose />);

        expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('opens preview modal when clicking preview button', () => {
        render(<Compose />);

        const previewButton = screen.getByText('Preview');
        fireEvent.click(previewButton);

        expect(screen.getByTestId('preview-modal')).toBeInTheDocument();
    });

    it('preview modal displays subject', () => {
        // Set subject in mock data
        mockFormData.subject = 'Test Newsletter Subject';

        render(<Compose />);

        // Open preview
        const previewButton = screen.getByText('Preview');
        fireEvent.click(previewButton);

        // Check subject is displayed
        expect(screen.getByText('Test Newsletter Subject')).toBeInTheDocument();
    });

    it('preview modal shows format indicator', () => {
        render(<Compose />);

        const previewButton = screen.getByText('Preview');
        fireEvent.click(previewButton);

        expect(screen.getByText(/Format:/)).toBeInTheDocument();
    });

    it('preview modal renders body with DescriptionRenderer', () => {
        render(<Compose />);

        const previewButton = screen.getByText('Preview');
        fireEvent.click(previewButton);

        expect(screen.getByTestId('description-renderer')).toBeInTheDocument();
    });

    it('closes preview modal when close button is clicked', () => {
        render(<Compose />);

        // Open preview
        const previewButton = screen.getByText('Preview');
        fireEvent.click(previewButton);

        expect(screen.getByTestId('preview-modal')).toBeInTheDocument();

        // Close preview
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(screen.queryByTestId('preview-modal')).not.toBeInTheDocument();
    });

    it('displays success flash message when present', () => {
        mockUsePage.mockReturnValue({
            props: { flash: { success: 'Newsletter sent successfully!' } },
        });

        render(<Compose />);

        expect(screen.getByText('Newsletter sent successfully!')).toBeInTheDocument();
    });

    it('displays error flash message when present', () => {
        mockUsePage.mockReturnValue({
            props: { flash: { error: 'No active subscribers to send to.' } },
        });

        render(<Compose />);

        expect(screen.getByText('No active subscribers to send to.')).toBeInTheDocument();
    });

    it('shows rich text editor when format is html_editor', () => {
        // Start with html_editor format
        mockFormData.format = 'html_editor';

        render(<Compose />);

        // Should show TipTap editor instead of textarea
        expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument();
    });

    it('shows regular textarea when format is not html_editor', () => {
        render(<Compose />);

        // Default format is markdown
        const bodyTextarea = screen.getByRole('textbox', { name: /body/i });
        expect(bodyTextarea.tagName).toBe('TEXTAREA');
    });
});

