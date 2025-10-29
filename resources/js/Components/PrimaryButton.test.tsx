import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrimaryButton from './PrimaryButton';

describe('PrimaryButton', () => {
    it('renders with children text', () => {
        render(<PrimaryButton>Click Me</PrimaryButton>);

        expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
    });

    it('applies default classes', () => {
        render(<PrimaryButton>Button</PrimaryButton>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('inline-flex', 'items-center', 'bg-gray-800', 'text-white');
    });

    it('merges custom className with defaults', () => {
        render(<PrimaryButton className="custom-class">Button</PrimaryButton>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-gray-800', 'custom-class');
    });

    it('handles click events', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(<PrimaryButton onClick={handleClick}>Button</PrimaryButton>);

        const button = screen.getByRole('button');
        await user.click(button);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles disabled state', () => {
        render(<PrimaryButton disabled>Button</PrimaryButton>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('applies opacity-25 when disabled', () => {
        render(<PrimaryButton disabled>Button</PrimaryButton>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('opacity-25');
    });

    it('does not trigger click when disabled', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(<PrimaryButton disabled onClick={handleClick}>Button</PrimaryButton>);

        const button = screen.getByRole('button');
        await user.click(button);

        expect(handleClick).not.toHaveBeenCalled();
    });

    it('forwards additional props', () => {
        render(<PrimaryButton type="submit" name="submit-btn">Submit</PrimaryButton>);

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'submit');
        expect(button).toHaveAttribute('name', 'submit-btn');
    });

    it('renders as button element', () => {
        const { container } = render(<PrimaryButton>Button</PrimaryButton>);

        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
    });

    it('supports form attribute', () => {
        render(<PrimaryButton form="my-form">Button</PrimaryButton>);

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('form', 'my-form');
    });
});
