<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

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

        return new Content(
            html: 'emails.newsletter',
            with: [
                'htmlBody' => $htmlBody,
                'unsubscribeUrl' => $this->unsubscribeUrl,
            ],
        );
    }
}
