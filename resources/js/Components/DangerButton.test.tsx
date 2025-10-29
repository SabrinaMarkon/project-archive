import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DangerButton from './DangerButton';

describe('DangerButton', () => {
    it('renders with children text', () => {
        render(<DangerButton>Delete</DangerButton>);

        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('applies default classes with red background', () => {
        render(<DangerButton>Button</DangerButton>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('inline-flex', 'items-center', 'bg-red-600', 'text-white');
    });

    it('merges custom className with defaults', () => {
        render(<DangerButton className="custom-class">Button</DangerButton>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-red-600', 'custom-class');
    });

    it('handles click events', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(<DangerButton onClick={handleClick}>Button</DangerButton>);

        const button = screen.getByRole('button');
        await user.click(button);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles disabled state', () => {
        render(<DangerButton disabled>Button</DangerButton>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('applies opacity-25 when disabled', () => {
        render(<DangerButton disabled>Button</DangerButton>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('opacity-25');
    });

    it('does not trigger click when disabled', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(<DangerButton disabled onClick={handleClick}>Button</DangerButton>);

        const button = screen.getByRole('button');
        await user.click(button);

        expect(handleClick).not.toHaveBeenCalled();
    });

    it('forwards additional props', () => {
        render(<DangerButton type="button" id="danger-btn">Delete</DangerButton>);

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'button');
        expect(button).toHaveAttribute('id', 'danger-btn');
    });

    it('renders as button element', () => {
        const { container } = render(<DangerButton>Button</DangerButton>);

        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
    });
});
