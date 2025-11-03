import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ApplicationLogo from './ApplicationLogo';

describe('ApplicationLogo', () => {
    it('renders an SVG element', () => {
        const { container } = render(<ApplicationLogo />);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('applies correct dimensions', () => {
        const { container } = render(<ApplicationLogo />);
        const svg = container.querySelector('svg');

        expect(svg).toHaveAttribute('viewBox', '0 0 316 316');
    });

    it('merges custom className with default classes', () => {
        const { container } = render(<ApplicationLogo className="custom-class" />);
        const svg = container.querySelector('svg');

        expect(svg).toHaveClass('custom-class');
    });

    it('forwards additional SVG attributes', () => {
        const { container } = render(
            <ApplicationLogo data-testid="app-logo" aria-label="Application Logo" />
        );

        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('data-testid', 'app-logo');
        expect(svg).toHaveAttribute('aria-label', 'Application Logo');
    });
});
