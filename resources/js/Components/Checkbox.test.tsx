import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checkbox from './Checkbox';

describe('Checkbox', () => {
    it('renders as checkbox input', () => {
        render(<Checkbox />);

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('applies default classes', () => {
        render(<Checkbox />);

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toHaveClass('rounded', 'border-gray-300', 'text-indigo-600', 'shadow-sm');
    });

    it('merges custom className with defaults', () => {
        render(<Checkbox className="custom-class" />);

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toHaveClass('rounded', 'custom-class');
    });

    it('forwards additional props', () => {
        render(<Checkbox name="terms" id="terms-checkbox" />);

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toHaveAttribute('name', 'terms');
        expect(checkbox).toHaveAttribute('id', 'terms-checkbox');
    });

    it('handles checked state', () => {
        render(<Checkbox checked onChange={() => {}} />);

        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(true);
    });

    it('handles unchecked state', () => {
        render(<Checkbox checked={false} onChange={() => {}} />);

        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(false);
    });

    it('handles disabled state', () => {
        render(<Checkbox disabled />);

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeDisabled();
    });

    it('handles required attribute', () => {
        render(<Checkbox required />);

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeRequired();
    });

    it('can be toggled when not controlled', async () => {
        const user = userEvent.setup();
        render(<Checkbox />);

        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(false);

        await user.click(checkbox);
        expect(checkbox.checked).toBe(true);

        await user.click(checkbox);
        expect(checkbox.checked).toBe(false);
    });

    it('handles defaultChecked', () => {
        render(<Checkbox defaultChecked />);

        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(true);
    });
});
