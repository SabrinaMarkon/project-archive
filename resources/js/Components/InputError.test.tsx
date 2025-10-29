import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InputError from './InputError';

describe('InputError', () => {
    it('renders error message when provided', () => {
        render(<InputError message="This field is required" />);

        expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('does not render when message is undefined', () => {
        const { container } = render(<InputError />);

        expect(container.firstChild).toBeNull();
    });

    it('does not render when message is empty string', () => {
        const { container } = render(<InputError message="" />);

        expect(container.firstChild).toBeNull();
    });

    it('applies default classes', () => {
        render(<InputError message="Error" />);

        const error = screen.getByText('Error');
        expect(error).toHaveClass('text-sm', 'text-red-600');
    });

    it('merges custom className with defaults', () => {
        render(<InputError message="Error" className="custom-class" />);

        const error = screen.getByText('Error');
        expect(error).toHaveClass('text-sm', 'text-red-600', 'custom-class');
    });

    it('renders as paragraph element', () => {
        const { container } = render(<InputError message="Error" />);

        const paragraph = container.querySelector('p');
        expect(paragraph).toBeInTheDocument();
        expect(paragraph).toHaveTextContent('Error');
    });

    it('forwards additional props', () => {
        render(<InputError message="Error" id="error-id" />);

        const error = screen.getByText('Error');
        expect(error).toHaveAttribute('id', 'error-id');
    });

    it('handles long error messages', () => {
        const longMessage = 'This is a very long error message that explains in detail what went wrong';
        render(<InputError message={longMessage} />);

        expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
});
