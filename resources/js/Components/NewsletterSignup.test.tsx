import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NewsletterSignup from './NewsletterSignup';

// Mock Inertia
const mockPost = vi.fn();
const mockSetData = vi.fn();

let mockFormData = { email: '' };
let mockFlash: { success?: string; error?: string } = {};
let mockProcessing = false;
let mockErrors: { email?: string } = {};

vi.mock('@inertiajs/react', () => ({
    useForm: () => ({
        get data() { return mockFormData; },
        setData: (key: string, value: string) => {
            mockFormData = { ...mockFormData, [key]: value };
            mockSetData(key, value);
        },
        post: mockPost,
        get processing() { return mockProcessing; },
        get errors() { return mockErrors; },
    }),
    usePage: () => ({
        props: {
            get flash() { return mockFlash; },
        },
    }),
}));

describe('NewsletterSignup', () => {
    beforeEach(() => {
        mockFormData = { email: '' };
        mockFlash = {};
        mockProcessing = false;
        mockErrors = {};
        mockPost.mockClear();
        mockSetData.mockClear();
    });

    describe('Footer variant', () => {
        it('renders footer variant with correct heading', () => {
            render(<NewsletterSignup variant="footer" />);

            expect(screen.getByText('Subscribe to My Newsletter')).toBeInTheDocument();
            expect(screen.getByText(/Get updates about new tutorials/i)).toBeInTheDocument();
        });

        it('renders email input and submit button', () => {
            render(<NewsletterSignup variant="footer" />);

            const input = screen.getByPlaceholderText('Enter your email');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('type', 'email');
            expect(input).toBeRequired();

            const button = screen.getByRole('button', { name: /subscrib/i });
            expect(button).toBeInTheDocument();
        });

        it('submits form with email', () => {
            render(<NewsletterSignup variant="footer" />);

            const input = screen.getByPlaceholderText('Enter your email');
            const form = input.closest('form')!;

            fireEvent.change(input, { target: { value: 'test@example.com' } });
            fireEvent.submit(form);

            expect(mockPost).toHaveBeenCalledWith('/newsletter/subscribe', {
                preserveScroll: true,
                onFinish: expect.any(Function),
                onSuccess: expect.any(Function),
            });
        });

        it('clears email field on successful submission', () => {
            render(<NewsletterSignup variant="footer" />);

            const input = screen.getByPlaceholderText('Enter your email');
            const form = input.closest('form')!;

            fireEvent.change(input, { target: { value: 'test@example.com' } });
            fireEvent.submit(form);

            // Get the onFinish callback and call it
            const onFinish = mockPost.mock.calls[0][1].onFinish;
            onFinish();

            expect(mockSetData).toHaveBeenCalledWith('email', '');
        });

        it('stores subscription in localStorage on success', () => {
            const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

            render(<NewsletterSignup variant="footer" />);

            const input = screen.getByPlaceholderText('Enter your email');
            const form = input.closest('form')!;

            fireEvent.submit(form);

            // Get the onSuccess callback and call it
            const onSuccess = mockPost.mock.calls[0][1].onSuccess;
            onSuccess();

            expect(setItemSpy).toHaveBeenCalledWith('newsletter_subscribed', 'true');
            expect(setItemSpy).toHaveBeenCalledWith('newsletter_subscribed_date', expect.any(String));

            setItemSpy.mockRestore();
        });

        it('displays success flash message', () => {
            mockFlash = { success: 'Successfully subscribed!' };

            render(<NewsletterSignup variant="footer" />);

            expect(screen.getByText('Successfully subscribed!')).toBeInTheDocument();
        });

        it('displays error flash message', () => {
            mockFlash = { error: 'You are already subscribed to the newsletter.' };

            render(<NewsletterSignup variant="footer" />);

            expect(screen.getByText('You are already subscribed to the newsletter.')).toBeInTheDocument();
        });

        it('has dark text color for visibility on dark background', () => {
            render(<NewsletterSignup variant="footer" />);

            const input = screen.getByPlaceholderText('Enter your email');
            expect(input).toHaveClass('text-gray-900');
        });
    });

    describe('Inline variant', () => {
        it('renders inline variant with correct heading', () => {
            render(<NewsletterSignup variant="inline" />);

            expect(screen.getByText('Subscribe for Updates')).toBeInTheDocument();
            expect(screen.getByText(/Get notified about new tutorials/i)).toBeInTheDocument();
        });

        it('renders with inline styling', () => {
            const { container } = render(<NewsletterSignup variant="inline" />);

            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper).toHaveClass('bg-gray-50', 'border', 'border-gray-200', 'rounded-lg');
        });

        it('submits form with email', () => {
            render(<NewsletterSignup variant="inline" />);

            const input = screen.getByPlaceholderText('Enter your email');
            const form = input.closest('form')!;

            fireEvent.change(input, { target: { value: 'inline@example.com' } });
            fireEvent.submit(form);

            expect(mockPost).toHaveBeenCalledWith('/newsletter/subscribe', {
                preserveScroll: true,
                onFinish: expect.any(Function),
                onSuccess: expect.any(Function),
            });
        });

        it('displays success message in green for inline variant', () => {
            mockFlash = { success: 'Successfully subscribed!' };

            render(<NewsletterSignup variant="inline" />);

            const successMessage = screen.getByText('Successfully subscribed!');
            expect(successMessage).toHaveClass('text-green-600');
        });

        it('displays error message in red for inline variant', () => {
            mockFlash = { error: 'Invalid email address.' };

            render(<NewsletterSignup variant="inline" />);

            const errorMessage = screen.getByText('Invalid email address.');
            expect(errorMessage).toHaveClass('text-red-600');
        });
    });

    describe('Form validation and states', () => {
        it('displays validation errors', () => {
            mockErrors = { email: 'The email field is required.' };

            render(<NewsletterSignup variant="footer" />);

            expect(screen.getByText('The email field is required.')).toBeInTheDocument();
        });

        it('disables submit button when processing', () => {
            mockProcessing = true;

            render(<NewsletterSignup variant="footer" />);

            const button = screen.getByRole('button', { name: /subscribing/i });
            expect(button).toBeDisabled();
            expect(button).toHaveTextContent('Subscribing...');
        });
    });
});
