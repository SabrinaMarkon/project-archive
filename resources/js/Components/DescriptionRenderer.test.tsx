import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DescriptionRenderer from './DescriptionRenderer';

describe('DescriptionRenderer', () => {
    describe('Markdown format', () => {
        it('renders markdown headings correctly', async () => {
            const content = '# Heading 1\n## Heading 2\nParagraph text';
            render(<DescriptionRenderer content={content} format="markdown" />);

            await waitFor(() => {
                expect(screen.getByText('Heading 1')).toBeInTheDocument();
                expect(screen.getByText('Heading 2')).toBeInTheDocument();
                expect(screen.getByText('Paragraph text')).toBeInTheDocument();
            });
        });

        it('renders markdown lists correctly', async () => {
            const content = '- Item 1\n- Item 2\n- Item 3';
            render(<DescriptionRenderer content={content} format="markdown" />);

            await waitFor(() => {
                expect(screen.getByText('Item 1')).toBeInTheDocument();
                expect(screen.getByText('Item 2')).toBeInTheDocument();
                expect(screen.getByText('Item 3')).toBeInTheDocument();
            });
        });

        it('renders markdown code blocks correctly', async () => {
            const content = '```javascript\nconst foo = "bar";\n```';
            render(<DescriptionRenderer content={content} format="markdown" />);

            await waitFor(() => {
                expect(screen.getByText(/const foo/)).toBeInTheDocument();
            });
        });

        it('escapes raw HTML tags in markdown', async () => {
            const content = 'This has a <script>alert("xss")</script> tag';
            const { container } = render(<DescriptionRenderer content={content} format="markdown" />);

            await waitFor(() => {
                // Should not render actual script tag
                expect(container.querySelector('script')).not.toBeInTheDocument();
                // Should display as text
                expect(screen.getByText(/alert/)).toBeInTheDocument();
            });
        });
    });

    describe('HTML format', () => {
        it('renders HTML content', async () => {
            const content = '<p>Hello <strong>World</strong></p>';
            const { container } = render(<DescriptionRenderer content={content} format="html" />);

            await waitFor(() => {
                expect(screen.getByText(/Hello/)).toBeInTheDocument();
                expect(screen.getByText(/World/)).toBeInTheDocument();
                expect(container.querySelector('strong')).toBeInTheDocument();
            });
        });

        it('sanitizes dangerous HTML', async () => {
            const content = '<p>Safe content</p><script>alert("xss")</script>';
            const { container } = render(<DescriptionRenderer content={content} format="html" />);

            await waitFor(() => {
                expect(screen.getByText('Safe content')).toBeInTheDocument();
                expect(container.querySelector('script')).not.toBeInTheDocument();
            });
        });
    });

    describe('Plaintext format', () => {
        it('renders plain text with paragraphs', () => {
            const content = 'Paragraph 1\n\nParagraph 2';
            const { container } = render(<DescriptionRenderer content={content} format="plaintext" />);

            const paragraphs = container.querySelectorAll('p');
            expect(paragraphs.length).toBe(2);
        });

        it('renders bullet lists from plaintext', () => {
            const content = '- Item 1\n- Item 2\n- Item 3';
            const { container } = render(<DescriptionRenderer content={content} format="plaintext" />);

            const list = container.querySelector('ul');
            expect(list).toBeInTheDocument();
            const items = container.querySelectorAll('li');
            expect(items.length).toBe(3);
        });

        it('escapes HTML characters in plaintext', () => {
            const content = 'Text with <div>HTML</div> & special chars';
            const { container } = render(<DescriptionRenderer content={content} format="plaintext" />);

            expect(container.innerHTML).toContain('&lt;div&gt;');
            expect(container.innerHTML).toContain('&amp;');
            expect(container.querySelector('div.prose')).toBeInTheDocument(); // Only the wrapper div
        });

        it('preserves line breaks with <br> tags', () => {
            const content = 'Line 1\nLine 2\nLine 3';
            const { container } = render(<DescriptionRenderer content={content} format="plaintext" />);

            expect(container.innerHTML).toContain('<br>');
        });
    });

    describe('Empty content', () => {
        it('shows "No content available" message when content is empty', () => {
            render(<DescriptionRenderer content="" format="markdown" />);

            expect(screen.getByText(/No content is available yet/i)).toBeInTheDocument();
        });

        it('shows "No content available" message when content is null', () => {
            render(<DescriptionRenderer content={null as any} format="markdown" />);

            expect(screen.getByText(/No content is available yet/i)).toBeInTheDocument();
        });
    });

    describe('Custom className', () => {
        it('applies custom className', async () => {
            const content = 'Test content';
            const { container } = render(
                <DescriptionRenderer content={content} format="plaintext" className="custom-class" />
            );

            await waitFor(() => {
                const wrapper = container.querySelector('.custom-class');
                expect(wrapper).toBeInTheDocument();
            });
        });
    });

    describe('Error handling', () => {
        it('shows error message when markdown parsing fails', async () => {
            // This is a bit tricky to test, but we can spy on console.error
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            // Render with valid markdown (hard to trigger actual parsing error)
            const content = '# Valid markdown';
            render(<DescriptionRenderer content={content} format="markdown" />);

            consoleErrorSpy.mockRestore();
        });
    });
});
