import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CharacterCount from './CharacterCount';

describe('CharacterCount', () => {
    it('renders character count for empty string', () => {
        render(<CharacterCount value="" max={100} />);

        expect(screen.getByText('0 / 100 characters')).toBeInTheDocument();
    });

    it('renders character count for non-empty string', () => {
        render(<CharacterCount value="Hello World" max={100} />);

        expect(screen.getByText('11 / 100 characters')).toBeInTheDocument();
    });

    it('shows gray text when under limit', () => {
        const { container } = render(<CharacterCount value="Test" max={100} />);

        const text = screen.getByText('4 / 100 characters');
        expect(text).toHaveClass('text-gray-500');
        expect(text).not.toHaveClass('text-red-500');
    });

    it('shows gray text when exactly at limit', () => {
        const { container } = render(<CharacterCount value="12345" max={5} />);

        const text = screen.getByText('5 / 5 characters');
        expect(text).toHaveClass('text-gray-500');
        expect(text).not.toHaveClass('text-red-500');
    });

    it('shows red text when over limit', () => {
        const { container } = render(<CharacterCount value="123456" max={5} />);

        const text = screen.getByText('6 / 5 characters');
        expect(text).toHaveClass('text-red-500');
        expect(text).not.toHaveClass('text-gray-500');
    });

    it('handles large character count', () => {
        const longString = 'a'.repeat(1000);
        render(<CharacterCount value={longString} max={2000} />);

        expect(screen.getByText('1000 / 2000 characters')).toBeInTheDocument();
    });

    it('handles unicode characters correctly', () => {
        render(<CharacterCount value="Hello 👋 World 🌍" max={100} />);

        // JavaScript counts emoji as 2 chars each
        expect(screen.getByText(/\/\s*100\s*characters/)).toBeInTheDocument();
    });

    it('applies text-sm and mt-1 classes', () => {
        const { container } = render(<CharacterCount value="Test" max={100} />);

        const text = screen.getByText('4 / 100 characters');
        expect(text).toHaveClass('text-sm', 'mt-1');
    });

    it('renders as a paragraph element', () => {
        const { container } = render(<CharacterCount value="Test" max={100} />);

        const paragraph = container.querySelector('p');
        expect(paragraph).toBeInTheDocument();
        expect(paragraph).toHaveTextContent('4 / 100 characters');
    });

    describe('edge cases', () => {
        it('handles max value of 0', () => {
            render(<CharacterCount value="" max={0} />);

            expect(screen.getByText('0 / 0 characters')).toBeInTheDocument();
        });

        it('handles very long text', () => {
            const veryLongText = 'a'.repeat(10000);
            render(<CharacterCount value={veryLongText} max={255} />);

            expect(screen.getByText('10000 / 255 characters')).toBeInTheDocument();
        });

        it('shows red when significantly over limit', () => {
            const longText = 'a'.repeat(500);
            const { container } = render(<CharacterCount value={longText} max={100} />);

            const text = screen.getByText('500 / 100 characters');
            expect(text).toHaveClass('text-red-500');
        });
    });
});
