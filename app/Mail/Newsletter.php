<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;
use Highlight\Highlighter;

class Newsletter extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $emailSubject,
        public string $body,
        public string $format,
        public string $unsubscribeUrl
    ) {}

    public function envelope(): Envelope
    {
        $envelope = new Envelope(
            subject: $this->emailSubject,
        );

        if ($replyTo = config('mail.reply_to.address')) {
            $envelope->replyTo($replyTo);
        }

        return $envelope;
    }

    public function content(): Content
    {
        $htmlBody = match($this->format) {
            'markdown' => Str::markdown($this->body),
            'html', 'html_editor' => $this->body,
            'plaintext' => nl2br(e($this->body)),
            default => nl2br(e($this->body)),
        };

        // Apply syntax highlighting to code blocks for html and html_editor formats
        if (in_array($this->format, ['html', 'html_editor'])) {
            $htmlBody = $this->applySyntaxHighlighting($htmlBody);
        }

        return new Content(
            html: 'emails.newsletter',
            with: [
                'htmlBody' => $htmlBody,
                'unsubscribeUrl' => $this->unsubscribeUrl,
            ],
        );
    }

    private function applySyntaxHighlighting(string $html): string
    {
        $highlighter = new Highlighter();

        // Find all code blocks with regex pattern
        $pattern = '/<pre[^>]*>.*?<code[^>]*>(.*?)<\/code>.*?<\/pre>/s';

        $html = preg_replace_callback($pattern, function($matches) use ($highlighter) {
            $fullMatch = $matches[0];
            $codeContent = $matches[1];

            // Decode HTML entities to get actual code
            $code = html_entity_decode($codeContent, ENT_QUOTES | ENT_HTML5);

            // Extract language from data-language attribute or class
            $language = null;
            if (preg_match('/data-language="([^"]+)"/', $fullMatch, $langMatch)) {
                $language = $langMatch[1];
            } elseif (preg_match('/class="[^"]*language-(\w+)/', $fullMatch, $langMatch)) {
                $language = $langMatch[1];
            }

            try {
                if ($language && $language !== 'plaintext') {
                    $highlighted = $highlighter->highlight($language, $code);
                } else {
                    $highlighted = $highlighter->highlightAuto($code);
                }

                return $this->convertHighlightToInlineStyles($highlighted->value);

            } catch (\Exception $e) {
                // If highlighting fails, return original with basic styling
                return '<pre style="background-color: #1e1e1e; color: #d4d4d4; padding: 1em; border-radius: 6px; overflow-x: auto; font-family: Consolas, Monaco, Courier New, monospace; font-size: 14px; line-height: 1.6; margin: 1em 0;"><code>' . htmlspecialchars($code) . '</code></pre>';
            }
        }, $html);

        return $html;
    }

    private function convertHighlightToInlineStyles(string $highlightedHtml): string
    {
        // Map hljs classes to inline styles (VS Code Dark theme for emails)
        $styleMap = [
            'hljs-comment' => 'color: #6a9955; font-style: italic;',
            'hljs-quote' => 'color: #6a9955; font-style: italic;',
            'hljs-keyword' => 'color: #569cd6;',
            'hljs-selector-tag' => 'color: #569cd6;',
            'hljs-literal' => 'color: #569cd6;',
            'hljs-section' => 'color: #569cd6;',
            'hljs-link' => 'color: #569cd6;',
            'hljs-string' => 'color: #ce9178;',
            'hljs-number' => 'color: #b5cea8;',
            'hljs-regexp' => 'color: #b5cea8;',
            'hljs-title' => 'color: #4ec9b0;',
            'hljs-name' => 'color: #4ec9b0;',
            'hljs-selector-id' => 'color: #4ec9b0;',
            'hljs-selector-class' => 'color: #4ec9b0;',
            'hljs-attribute' => 'color: #9cdcfe;',
            'hljs-variable' => 'color: #9cdcfe;',
            'hljs-template-variable' => 'color: #9cdcfe;',
            'hljs-built_in' => 'color: #4ec9b0;',
            'hljs-builtin-name' => 'color: #4ec9b0;',
            'hljs-type' => 'color: #4ec9b0;',
            'hljs-class' => 'color: #4ec9b0;',
            'hljs-function' => 'color: #dcdcaa;',
            'hljs-tag' => 'color: #569cd6;',
            'hljs-attr' => 'color: #9cdcfe;',
            'hljs-meta' => 'color: #d4d4d4;',
            'hljs-deletion' => 'color: #f14c4c;',
            'hljs-addition' => 'color: #89d185;',
        ];

        // Replace class-based spans with inline-styled spans
        foreach ($styleMap as $class => $style) {
            $highlightedHtml = str_replace(
                '<span class="' . $class . '">',
                '<span style="' . $style . '">',
                $highlightedHtml
            );
        }

        // Wrap in pre/code with email-compatible inline styles
        return '<pre style="background-color: #1e1e1e; color: #d4d4d4; padding: 1em; border-radius: 6px; overflow-x: auto; font-family: Consolas, Monaco, Courier New, monospace; font-size: 14px; line-height: 1.6; margin: 1em 0;"><code style="background: none; color: inherit; padding: 0;">' . $highlightedHtml . '</code></pre>';
    }
}
