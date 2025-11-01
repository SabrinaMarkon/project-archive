import { useEffect, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface PostContentProps {
    content: string;
    format: 'html' | 'markdown' | 'plaintext';
    className?: string;
}

// Configure marked to escape raw HTML tags
// This prevents <title>, <script>, etc. from being rendered as HTML
// but still allows markdown syntax to work (code blocks, links, etc.)
marked.use({
    renderer: {
        html(token: any) {
            // Escape all raw HTML that appears in markdown
            // This makes tags like <title> display as text instead of being rendered
            const html = typeof token === 'string' ? token : token.text || '';
            return html
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
    }
});

export default function PostContent({ content, format, className = '' }: PostContentProps) {
    const [renderedContent, setRenderedContent] = useState<string>('');

    useEffect(() => {
        const renderContent = async () => {
            if (!content) {
                setRenderedContent('');
                return;
            }

            switch (format) {
                case 'markdown':
                    try {
                        const html = await marked.parse(content);
                        const sanitized = DOMPurify.sanitize(html);
                        setRenderedContent(sanitized);
                    } catch (error) {
                        console.error('Error parsing markdown:', error);
                        setRenderedContent('<p>Error rendering markdown content</p>');
                    }
                    break;

                case 'html':
                    const sanitized = DOMPurify.sanitize(content);
                    setRenderedContent(sanitized);
                    break;

                case 'plaintext':
                    // Convert line breaks to <br> tags for plaintext
                    const escaped = content
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/\n/g, '<br>');
                    setRenderedContent(escaped);
                    break;

                default:
                    setRenderedContent(content);
            }
        };

        renderContent();
    }, [content, format]);

    if (!content) {
        return (
            <div className={className}>
                <p className="text-lg leading-relaxed italic" style={{ color: '#7a7a7a' }}>
                    No content is available yet.
                </p>
            </div>
        );
    }

    return (
        <div
            className={`prose prose-lg max-w-none ${className}`}
            dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
    );
}
