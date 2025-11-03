import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SecondaryButton from './SecondaryButton';

describe('SecondaryButton', () => {
    it('renders button with text', () => {
        render(<SecondaryButton>Click me</SecondaryButton>);
        expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders as button type by default', () => {
        render(<SecondaryButton>Test</SecondaryButton>);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'button');
    });

    it('accepts custom type attribute', () => {
        render(<SecondaryButton type="submit">Submit</SecondaryButton>);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'submit');
    });

    it('applies correct CSS classes', () => {
        render(<SecondaryButton>Test</SecondaryButton>);
        const button = screen.getByRole('button');

        expect(button).toHaveClass('inline-flex');
        expect(button).toHaveClass('items-center');
        expect(button).toHaveClass('rounded-md');
        expect(button).toHaveClass('border');
        expect(button).toHaveClass('bg-white');
    });

    it('merges custom className with default classes', () => {
        render(<SecondaryButton className="custom-class">Test</SecondaryButton>);
        const button = screen.getByRole('button');

        expect(button).toHaveClass('custom-class');
        expect(button).toHaveClass('inline-flex'); // Still has default classes
    });

    it('can be disabled', () => {
        render(<SecondaryButton disabled>Disabled</SecondaryButton>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('applies disabled styles when disabled', () => {
        render(<SecondaryButton disabled>Disabled</SecondaryButton>);
        const button = screen.getByRole('button');

        expect(button).toHaveClass('opacity-25');
    });

    it('forwards additional HTML attributes', () => {
        render(
            <SecondaryButton data-testid="secondary-btn" aria-label="Custom label">
                Test
            </SecondaryButton>
        );

        const button = screen.getByTestId('secondary-btn');
        expect(button).toHaveAttribute('aria-label', 'Custom label');
    });

    it('renders children correctly', () => {
        render(
            <SecondaryButton>
                <span>Icon</span>
                <span>Text</span>
            </SecondaryButton>
        );

        expect(screen.getByText('Icon')).toBeInTheDocument();
        expect(screen.getByText('Text')).toBeInTheDocument();
    });
});
