import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InputLabel from './InputLabel';

describe('InputLabel', () => {
    it('renders with value prop', () => {
        render(<InputLabel value="Username" />);

        expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('renders with children instead of value', () => {
        render(<InputLabel>Email Address</InputLabel>);

        expect(screen.getByText('Email Address')).toBeInTheDocument();
    });

    it('prefers value over children when both provided', () => {
        render(<InputLabel value="Value Text">Children Text</InputLabel>);

        expect(screen.getByText('Value Text')).toBeInTheDocument();
        expect(screen.queryByText('Children Text')).not.toBeInTheDocument();
    });

    it('applies default classes', () => {
        render(<InputLabel value="Test" />);

        const label = screen.getByText('Test');
        expect(label).toHaveClass('block', 'text-sm', 'font-medium', 'text-gray-700');
    });

    it('merges custom className with defaults', () => {
        render(<InputLabel value="Test" className="custom-class" />);

        const label = screen.getByText('Test');
        expect(label).toHaveClass('block', 'text-sm', 'custom-class');
    });

    it('forwards additional props', () => {
        render(<InputLabel value="Test" htmlFor="input-id" />);

        const label = screen.getByText('Test');
        expect(label).toHaveAttribute('for', 'input-id');
    });

    it('renders as label element', () => {
        const { container } = render(<InputLabel value="Test" />);

        const label = container.querySelector('label');
        expect(label).toBeInTheDocument();
    });

    it('handles empty children', () => {
        render(<InputLabel />);

        const { container } = render(<InputLabel />);
        const label = container.querySelector('label');
        expect(label).toBeInTheDocument();
        expect(label?.textContent).toBe('');
    });
});
