import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutSection from './AboutSection';

describe('AboutSection', () => {
    it('renders About Me heading', () => {
        render(<AboutSection />);

        expect(screen.getByText('About Me')).toBeInTheDocument();
    });

    it('renders bio paragraphs', () => {
        render(<AboutSection />);

        expect(screen.getByText(/I'm a developer with a passion/i)).toBeInTheDocument();
        expect(screen.getByText(/When I'm not coding/i)).toBeInTheDocument();
    });

    it('renders tagline', () => {
        render(<AboutSection />);

        expect(screen.getByText(/Building the web, one line at a time/i)).toBeInTheDocument();
    });

    it('has correct section id', () => {
        const { container } = render(<AboutSection />);

        const section = container.querySelector('#about');
        expect(section).toBeInTheDocument();
    });
});
