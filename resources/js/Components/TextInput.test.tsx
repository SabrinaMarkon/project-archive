import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import TextInput from './TextInput';

describe('TextInput', () => {
    it('renders with default type="text"', () => {
        render(<TextInput />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('type', 'text');
    });

    it('renders with custom type', () => {
        render(<TextInput type="email" />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('type', 'email');
    });

    it('applies default className', () => {
        render(<TextInput />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveClass('rounded-md', 'border-gray-300', 'shadow-sm');
    });

    it('merges custom className with default', () => {
        render(<TextInput className="custom-class" />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveClass('rounded-md', 'custom-class');
    });

    it('forwards additional props to input', () => {
        render(<TextInput placeholder="Enter text" name="test-input" />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('placeholder', 'Enter text');
        expect(input).toHaveAttribute('name', 'test-input');
    });

    it('auto-focuses when isFocused is true', () => {
        render(<TextInput isFocused={true} />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveFocus();
    });

    it('does not auto-focus when isFocused is false', () => {
        render(<TextInput isFocused={false} />);

        const input = screen.getByRole('textbox');
        expect(input).not.toHaveFocus();
    });

    it('supports ref forwarding', () => {
        const ref = createRef<any>();
        render(<TextInput ref={ref} />);

        // TextInput uses useImperativeHandle, so ref.current is an object with focus method
        expect(ref.current).toHaveProperty('focus');
        expect(typeof ref.current.focus).toBe('function');
    });

    it('supports imperative focus via ref', () => {
        const ref = createRef<any>();
        render(<TextInput ref={ref} />);

        ref.current?.focus();
        const input = screen.getByRole('textbox');
        expect(input).toHaveFocus();
    });

    it('renders password input type', () => {
        const { container } = render(<TextInput type="password" />);

        const input = container.querySelector('input') as HTMLInputElement;
        expect(input.type).toBe('password');
    });

    it('handles value prop', () => {
        render(<TextInput value="test value" onChange={() => {}} />);

        const input = screen.getByRole('textbox') as HTMLInputElement;
        expect(input.value).toBe('test value');
    });

    it('handles disabled state', () => {
        render(<TextInput disabled />);

        const input = screen.getByRole('textbox');
        expect(input).toBeDisabled();
    });

    it('handles required attribute', () => {
        render(<TextInput required />);

        const input = screen.getByRole('textbox');
        expect(input).toBeRequired();
    });
});
