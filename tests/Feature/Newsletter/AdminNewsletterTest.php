<?php

namespace Tests\Feature\Newsletter;

use App\Models\NewsletterSubscriber;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AdminNewsletterTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->user = User::factory()->create(['is_admin' => false]);
    }

    public function test_admin_can_view_newsletter_subscribers_page(): void
    {
        NewsletterSubscriber::factory()->count(5)->create();

        $response = $this->actingAs($this->admin)
            ->get('/admin/newsletter-subscribers');

        $response->assertStatus(200)
            ->assertInertia(
                fn (AssertableInertia $page) =>
                $page
                    ->component('Admin/Newsletter/Index')
                    ->has('subscribers', 5)
                    ->has('stats')
                    ->where('stats.total', 5)
                    ->where('stats.subscribed', 5)
                    ->where('stats.unsubscribed', 0)
            );
    }

    public function test_admin_can_see_correct_stats_with_unsubscribed_users(): void
    {
        NewsletterSubscriber::factory()->count(3)->create();
        NewsletterSubscriber::factory()->count(2)->create(['unsubscribed_at' => now()]);

        $response = $this->actingAs($this->admin)
            ->get('/admin/newsletter-subscribers');

        $response->assertStatus(200)
            ->assertInertia(
                fn (AssertableInertia $page) =>
                $page
                    ->component('Admin/Newsletter/Index')
                    ->has('subscribers', 5)
                    ->where('stats.total', 5)
                    ->where('stats.subscribed', 3)
                    ->where('stats.unsubscribed', 2)
            );
    }

    public function test_non_admin_cannot_view_newsletter_subscribers_page(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/admin/newsletter-subscribers');

        $response->assertStatus(403);
    }

    public function test_guest_cannot_view_newsletter_subscribers_page(): void
    {
        $response = $this->get('/admin/newsletter-subscribers');

        $response->assertRedirect('/login');
    }

    public function test_admin_can_unsubscribe_active_subscriber(): void
    {
        $subscriber = NewsletterSubscriber::factory()->create();

        $response = $this->actingAs($this->admin)
            ->delete("/admin/newsletter-subscribers/{$subscriber->id}");

        $response->assertRedirect(route('admin.newsletter.index'))
            ->assertSessionHas('success', 'Subscriber unsubscribed successfully.');

        $this->assertDatabaseHas('newsletter_subscribers', [
            'id' => $subscriber->id,
        ]);

        $subscriber->refresh();
        $this->assertNotNull($subscriber->unsubscribed_at);
    }

    public function test_admin_can_delete_unsubscribed_subscriber_permanently(): void
    {
        $subscriber = NewsletterSubscriber::factory()->create(['unsubscribed_at' => now()]);

        $response = $this->actingAs($this->admin)
            ->delete("/admin/newsletter-subscribers/{$subscriber->id}");

        $response->assertRedirect(route('admin.newsletter.index'))
            ->assertSessionHas('success', 'Subscriber deleted permanently.');

        $this->assertDatabaseMissing('newsletter_subscribers', [
            'id' => $subscriber->id,
        ]);
    }

    public function test_non_admin_cannot_delete_subscriber(): void
    {
        $subscriber = NewsletterSubscriber::factory()->create();

        $response = $this->actingAs($this->user)
            ->delete("/admin/newsletter-subscribers/{$subscriber->id}");

        $response->assertStatus(403);

        $this->assertDatabaseHas('newsletter_subscribers', [
            'id' => $subscriber->id,
        ]);
    }

    public function test_admin_can_export_subscribers_csv(): void
    {
        NewsletterSubscriber::factory()->count(3)->create();
        NewsletterSubscriber::factory()->create(['unsubscribed_at' => now()]);

        $response = $this->actingAs($this->admin)
            ->get('/admin/newsletter-subscribers/export');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $response->assertHeader('Content-Disposition');

        // Check that CSV contains only subscribed users (3)
        $content = $response->streamedContent();
        $lines = explode("\n", trim($content));

        // Header + 3 subscribed users = 4 lines
        $this->assertCount(4, $lines);
        $this->assertStringContainsString('Email', $lines[0]);
        $this->assertStringContainsString('Subscribed Date', $lines[0]);
    }

    public function test_non_admin_cannot_export_subscribers(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/admin/newsletter-subscribers/export');

        $response->assertStatus(403);
    }

    public function test_guest_cannot_export_subscribers(): void
    {
        $response = $this->get('/admin/newsletter-subscribers/export');

        $response->assertRedirect('/login');
    }
}
