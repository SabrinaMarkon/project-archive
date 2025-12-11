<?php

namespace Database\Factories;

use App\Models\NewsletterSend;
use Illuminate\Database\Eloquent\Factories\Factory;

class NewsletterSendFactory extends Factory
{
    protected $model = NewsletterSend::class;

    public function definition(): array
    {
        return [
            'subject' => fake()->sentence(),
            'body' => fake()->paragraphs(3, true),
            'format' => fake()->randomElement(['markdown', 'html', 'html_editor', 'plaintext']),
            'recipient_count' => fake()->numberBetween(1, 100),
            'sent_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
