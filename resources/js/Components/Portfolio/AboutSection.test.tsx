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

        expect(screen.getByText(/I'm a full-stack developer specializing in Laravel and React/i)).toBeInTheDocument();
        expect(screen.getByText(/My experience spans both greenfield projects/i)).toBeInTheDocument();
    });

    it('renders technology checkmarks', () => {
        render(<AboutSection />);

        expect(screen.getByText(/Full-Stack Development/i)).toBeInTheDocument();
        expect(screen.getByText(/Laravel & React/i)).toBeInTheDocument();
    });

    it('has correct section id', () => {
        const { container } = render(<AboutSection />);

        const section = container.querySelector('#about');
        expect(section).toBeInTheDocument();
    });
});
