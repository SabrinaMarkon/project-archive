import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContactSection from './ContactSection';

describe('ContactSection', () => {
    it('renders heading', () => {
        render(<ContactSection />);

        expect(screen.getByText("Let's Work Together")).toBeInTheDocument();
    });

    it('renders description', () => {
        render(<ContactSection />);

        expect(screen.getByText(/I'm always interested in hearing about new projects/i)).toBeInTheDocument();
    });

    it('renders email link', () => {
        const { container } = render(<ContactSection />);

        const emailLinks = container.querySelectorAll('a[href^="mailto:"]');
        expect(emailLinks.length).toBeGreaterThan(0);
        expect(emailLinks[0]).toHaveAttribute('href', 'mailto:sabrina@sabrinamarkon.com');
    });

    it('renders GitHub link', () => {
        const { container } = render(<ContactSection />);

        const githubLink = container.querySelector('a[href*="github"]');
        expect(githubLink).toHaveAttribute('href', 'https://github.com/sabrinamarkon');
    });

    it('renders LinkedIn link', () => {
        const { container } = render(<ContactSection />);

        const linkedinLink = container.querySelector('a[href*="linkedin"]');
        expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/sabrinamarkon/');
    });

    it('renders Get In Touch button', () => {
        render(<ContactSection />);

        const button = screen.getByRole('link', { name: /Get In Touch/i });
        expect(button).toHaveAttribute('href', 'mailto:sabrina@sabrinamarkon.com');
    });

    it('has correct section id', () => {
        const { container } = render(<ContactSection />);

        const section = container.querySelector('#contact');
        expect(section).toBeInTheDocument();
    });
});
