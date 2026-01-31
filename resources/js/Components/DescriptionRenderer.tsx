import { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);

interface DescriptionRendererProps {
    content: string;
    format: 'html' | 'markdown' | 'plaintext' | 'html_editor';
    className?: string;
}

// Configure marked to escape raw HTML tags and generate heading IDs
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
        },
        heading(token: any) {
            const text = token.text;
            const level = token.depth;
            // Generate ID from heading text (lowercase, replace spaces with hyphens, remove special chars)
            const id = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

            return `<h${level} id="${id}">${text}</h${level}>`;
        }
    }
});

export default function DescriptionRenderer({ content, format, className = '' }: DescriptionRendererProps) {
    const [renderedContent, setRenderedContent] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);

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
                case 'html_editor':
                    const sanitized = DOMPurify.sanitize(content);
                    setRenderedContent(sanitized);
                    break;

                case 'plaintext':
                    // Convert plaintext with proper paragraph and list formatting
                    const escaped = content
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');

                    // Split into paragraphs (double line breaks)
                    const paragraphs = escaped.split(/\n\n+/);

                    // Process each paragraph
                    const formattedParagraphs = paragraphs.map(para => {
                        // Handle bullet points (lines starting with -, *, or •)
                        if (/^[-*•]/.test(para.trim())) {
                            const items = para.split('\n')
                                .map(line => line.trim())
                                .filter(line => line.length > 0)
                                .map(line => {
                                    // Remove bullet character and trim
                                    const cleaned = line.replace(/^[-*•]\s*/, '');
                                    return `<li>${cleaned}</li>`;
                                })
                                .join('');
                            return `<ul class="list-disc pl-6 mb-4 space-y-2">${items}</ul>`;
                        }

                        // Regular paragraph with line breaks preserved
                        const withBreaks = para.replace(/\n/g, '<br>');
                        return `<p class="mb-4 leading-relaxed">${withBreaks}</p>`;
                    });

                    setRenderedContent(formattedParagraphs.join(''));
                    break;

                default:
                    setRenderedContent(content);
            }
        };

        renderContent();
    }, [content, format]);

    // Apply syntax highlighting to code blocks after content is rendered
    useEffect(() => {
        if (!contentRef.current || !renderedContent) return;

        const codeBlocks = contentRef.current.querySelectorAll('pre code');
        codeBlocks.forEach((block) => {
            const codeElement = block as HTMLElement;
            const preElement = codeElement.parentElement as HTMLElement;

            // Try to get language from various sources
            let language = 'plaintext';

            // Check code element class (e.g., language-php)
            if (codeElement.className) {
                const match = codeElement.className.match(/language-(\w+)/);
                if (match) {
                    language = match[1];
                }
            }

            // Check pre element data-language attribute (TipTap CodeBlockLowlight)
            if (preElement && preElement.getAttribute('data-language')) {
                language = preElement.getAttribute('data-language') || 'plaintext';
            }

            const code = codeElement.textContent || '';

            try {
                const result = lowlight.highlight(language, code);

                // Convert hast tree to HTML string with rainbow brackets
                const renderNode = (node: any): string => {
                    if (node.type === 'text') {
                        // Apply rainbow bracket coloring to curly braces
                        return applyRainbowBrackets(node.value);
                    }
                    if (node.type === 'element') {
                        const classes = node.properties?.className
                            ? node.properties.className.join(' ')
                            : '';
                        const children = node.children
                            ? node.children.map((child: any) => renderNode(child)).join('')
                            : '';
                        return `<span class="${classes}">${children}</span>`;
                    }
                    return '';
                };

                const html = result.children
                    .map((node: any) => renderNode(node))
                    .join('');
                codeElement.innerHTML = html;
            } catch (error) {
                // If language not found, leave as-is
                console.warn(`Syntax highlighting failed for language: ${language}`);
            }
        });
    }, [renderedContent]);

    // Helper function to add rainbow bracket coloring
    const applyRainbowBrackets = (text: string): string => {
        let result = '';
        let bracketLevel = 0;
        const levelStack: number[] = [];

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if (char === '{') {
                const level = bracketLevel % 6;
                result += `<span class="bracket-level-${level}">{</span>`;
                levelStack.push(bracketLevel);
                bracketLevel++;
            } else if (char === '}') {
                bracketLevel = Math.max(0, bracketLevel - 1);
                const level = (levelStack.pop() || 0) % 6;
                result += `<span class="bracket-level-${level}">}</span>`;
            } else {
                result += char;
            }
        }

        return result;
    };

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
        <>
            <div
                ref={contentRef}
                className={`prose prose-lg max-w-none ${className}`}
                dangerouslySetInnerHTML={{ __html: renderedContent }}
            />

            {/* Syntax Highlighting Styles */}
            <style>{`
                /* Code Block with Syntax Highlighting - VS Code Dark Theme */
                .prose pre {
                    background-color: #1e1e1e !important;
                    color: #d4d4d4 !important;
                    padding: 1em;
                    border-radius: 6px;
                    overflow-x: auto;
                    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                    font-size: 14px;
                    line-height: 1.6;
                    margin: 1em 0;
                }

                .prose pre code {
                    background: none !important;
                    color: inherit !important;
                    padding: 0;
                    font-size: inherit;
                }

                /* Inline code */
                .prose code {
                    background-color: #f4f4f4;
                    color: #d63384;
                    padding: 0.2em 0.4em;
                    border-radius: 3px;
                    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                    font-size: 0.9em;
                }

                /* Syntax Highlighting Colors - VS Code Dark */
                .prose .hljs-comment,
                .prose .hljs-quote {
                    color: #6a9955;
                    font-style: italic;
                }

                .prose .hljs-keyword,
                .prose .hljs-selector-tag,
                .prose .hljs-literal,
                .prose .hljs-section,
                .prose .hljs-link {
                    color: #569cd6;
                }

                .prose .hljs-string {
                    color: #ce9178;
                }

                .prose .hljs-number,
                .prose .hljs-regexp {
                    color: #b5cea8;
                }

                .prose .hljs-title,
                .prose .hljs-name,
                .prose .hljs-selector-id,
                .prose .hljs-selector-class {
                    color: #4ec9b0;
                }

                .prose .hljs-attribute,
                .prose .hljs-variable,
                .prose .hljs-template-variable {
                    color: #9cdcfe;
                }

                .prose .hljs-built_in,
                .prose .hljs-builtin-name,
                .prose .hljs-type,
                .prose .hljs-class {
                    color: #4ec9b0;
                }

                .prose .hljs-function {
                    color: #dcdcaa;
                }

                .prose .hljs-tag {
                    color: #569cd6;
                }

                .prose .hljs-attr {
                    color: #9cdcfe;
                }

                .prose .hljs-meta {
                    color: #d4d4d4;
                }

                .prose .hljs-deletion {
                    color: #f14c4c;
                }

                .prose .hljs-addition {
                    color: #89d185;
                }

                .prose .hljs-emphasis {
                    font-style: italic;
                }

                .prose .hljs-strong {
                    font-weight: bold;
                }

                /* Rainbow Brackets - Curly braces color-coded by nesting level */
                .prose .bracket-level-0 { color: #ffd700 !important; font-weight: bold; } /* Gold */
                .prose .bracket-level-1 { color: #da70d6 !important; font-weight: bold; } /* Orchid */
                .prose .bracket-level-2 { color: #87ceeb !important; font-weight: bold; } /* Sky Blue */
                .prose .bracket-level-3 { color: #98fb98 !important; font-weight: bold; } /* Pale Green */
                .prose .bracket-level-4 { color: #f08080 !important; font-weight: bold; } /* Light Coral */
                .prose .bracket-level-5 { color: #dda0dd !important; font-weight: bold; } /* Plum */
            `}</style>
        </>
    );
}
