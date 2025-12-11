<?php

namespace Tests\Feature\Admin;

use App\Models\NewsletterSubscriber;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AdminNewsletterTest extends TestCase
{
    use RefreshDatabase;

    // ========================================
    // Subscriber List & Stats Tests
    // ========================================

    public function test_admin_can_view_newsletter_subscribers_page(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->get('/admin/newsletter-subscribers');

        $response->assertOk();
        $response->assertInertia(
            fn($page) => $page
                ->component('Admin/Newsletter/Index')
                ->has('subscribers')
                ->has('stats')
        );
    }

    public function test_newsletter_subscribers_page_contains_history_link(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->get('/admin/newsletter-subscribers');

        $response->assertOk();
        $response->assertSee('History', false);
    }

    public function test_admin_sees_correct_subscriber_stats(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        // Create various subscriber states
        NewsletterSubscriber::factory()->count(10)->create([
            'confirmed_at' => now(),
            'unsubscribed_at' => null,
        ]); // 10 active

        NewsletterSubscriber::factory()->count(3)->create([
            'confirmed_at' => now(),
            'unsubscribed_at' => now(),
        ]); // 3 unsubscribed

        NewsletterSubscriber::factory()->count(2)->create([
            'confirmed_at' => null,
            'unsubscribed_at' => null,
        ]); // 2 pending confirmation

        $response = $this->actingAs($admin)->get('/admin/newsletter-subscribers');

        $response->assertInertia(
            fn($page) => $page
                ->where('stats.total', 15)
                ->where('stats.active', 10)
                ->where('stats.unsubscribed', 3)
                ->where('stats.pending', 2)
        );
    }

    public function test_subscriber_list_is_paginated(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        NewsletterSubscriber::factory()->count(25)->create([
            'confirmed_at' => now(),
        ]);

        $response = $this->actingAs($admin)->get('/admin/newsletter-subscribers');

        $response->assertInertia(
            fn($page) => $page
                ->has('subscribers.data', 15) // Default pagination is 15 per page
                ->has('subscribers.links')
        );
    }

    // ========================================
    // Authorization Tests
    // ========================================

    public function test_non_admin_cannot_view_newsletter_subscribers_page(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/admin/newsletter-subscribers');

        $response->assertForbidden();
    }

    public function test_guest_cannot_view_newsletter_subscribers_page(): void
    {
        $response = $this->get('/admin/newsletter-subscribers');

        $response->assertRedirect('/login');
    }

    public function test_non_admin_cannot_access_compose_page(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/admin/newsletter/compose');

        $response->assertForbidden();
    }

    public function test_guest_cannot_access_compose_page(): void
    {
        $response = $this->get('/admin/newsletter/compose');

        $response->assertRedirect('/login');
    }

    // ========================================
    // CSV Export Tests
    // ========================================

    public function test_admin_can_export_subscribers_csv(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        NewsletterSubscriber::factory()->count(5)->create([
            'confirmed_at' => now(),
            'unsubscribed_at' => null,
        ]);

        $response = $this->actingAs($admin)->get('/admin/newsletter-subscribers/export');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $response->assertHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');

        $content = $response->streamedContent();
        $this->assertStringContainsString('email', $content);
        $this->assertStringContainsString('confirmed_at', $content);
    }

    public function test_export_only_includes_active_subscribers(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $activeSubscriber = NewsletterSubscriber::factory()->create([
            'email' => 'active@example.com',
            'confirmed_at' => now(),
            'unsubscribed_at' => null,
        ]);

        $unsubscribedSubscriber = NewsletterSubscriber::factory()->create([
            'email' => 'unsubscribed@example.com',
            'confirmed_at' => now(),
            'unsubscribed_at' => now(),
        ]);

        $pendingSubscriber = NewsletterSubscriber::factory()->create([
            'email' => 'pending@example.com',
            'confirmed_at' => null,
            'unsubscribed_at' => null,
        ]);

        $response = $this->actingAs($admin)->get('/admin/newsletter-subscribers/export');

        $content = $response->streamedContent();
        $this->assertStringContainsString('active@example.com', $content);
        $this->assertStringNotContainsString('unsubscribed@example.com', $content);
        $this->assertStringNotContainsString('pending@example.com', $content);
    }

    public function test_non_admin_cannot_export_subscribers(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/admin/newsletter-subscribers/export');

        $response->assertForbidden();
    }

    public function test_guest_cannot_export_subscribers(): void
    {
        $response = $this->get('/admin/newsletter-subscribers/export');

        $response->assertRedirect('/login');
    }

    // ========================================
    // Delete Subscriber Tests
    // ========================================

    public function test_admin_can_delete_subscriber(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $subscriber = NewsletterSubscriber::factory()->create();

        $response = $this->actingAs($admin)
            ->delete("/admin/newsletter-subscribers/{$subscriber->id}");

        $response->assertRedirect('/admin/newsletter-subscribers');
        $this->assertDatabaseMissing('newsletter_subscribers', [
            'id' => $subscriber->id,
        ]);
    }

    public function test_non_admin_cannot_delete_subscriber(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $subscriber = NewsletterSubscriber::factory()->create();

        $response = $this->actingAs($user)
            ->delete("/admin/newsletter-subscribers/{$subscriber->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('newsletter_subscribers', [
            'id' => $subscriber->id,
        ]);
    }

    // ========================================
    // Unsubscribe Subscriber Tests
    // ========================================

    public function test_admin_can_unsubscribe_active_subscriber(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $subscriber = NewsletterSubscriber::factory()->create([
            'confirmed_at' => now(),
            'unsubscribed_at' => null,
        ]);

        $response = $this->actingAs($admin)
            ->patch("/admin/newsletter-subscribers/{$subscriber->id}/unsubscribe");

        $response->assertRedirect('/admin/newsletter-subscribers');
        $this->assertDatabaseHas('newsletter_subscribers', [
            'id' => $subscriber->id,
        ]);

        $subscriber->refresh();
        $this->assertNotNull($subscriber->unsubscribed_at);
    }

    public function test_non_admin_cannot_unsubscribe_subscriber(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $subscriber = NewsletterSubscriber::factory()->create([
            'confirmed_at' => now(),
            'unsubscribed_at' => null,
        ]);

        $response = $this->actingAs($user)
            ->patch("/admin/newsletter-subscribers/{$subscriber->id}/unsubscribe");

        $response->assertForbidden();

        $subscriber->refresh();
        $this->assertNull($subscriber->unsubscribed_at);
    }

    // ========================================
    // Compose Newsletter Tests
    // ========================================

    public function test_admin_can_view_compose_newsletter_page(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->get('/admin/newsletter/compose');

        $response->assertOk();
        $response->assertInertia(
            fn($page) => $page->component('Admin/Newsletter/Compose')
        );
    }

    public function test_admin_can_send_newsletter_with_markdown_format(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['is_admin' => true]);

        NewsletterSubscriber::factory()->count(3)->create([
            'confirmed_at' => now(),
            'unsubscribed_at' => null,
        ]);

        $response = $this->actingAs($admin)->post('/admin/newsletter/send', [
            'subject' => 'Test Newsletter',
            'body' => '# Hello\n\nThis is **markdown**.',
            'format' => 'markdown',
        ]);

        $response->assertRedirect('/admin/newsletter/compose');
        $response->assertSessionHas('success');

        Mail::assertSent(\App\Mail\Newsletter::class, 3);
    }

    public function test_admin_can_send_newsletter_with_html_format(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['is_admin' => true]);

        NewsletterSubscriber::factory()->count(2)->create([
            'confirmed_at' => now(),
            'unsubscribed_at' => null,
        ]);

        $response = $this->actingAs($admin)->post('/admin/newsletter/send', [
            'subject' => 'Test Newsletter',
            'body' => '<h1>Hello</h1><p>This is HTML.</p>',
            'format' => 'html',
        ]);

        $response->assertRedirect('/admin/newsletter/compose');

        Mail::assertSent(\App\Mail\Newsletter::class, 2);
    }

    public function test_admin_can_send_newsletter_with_html_editor_format(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['is_admin' => true]);

        NewsletterSubscriber::factory()->count(2)->create([
            'confirmed_at' => now(),
            'unsubscribed_at' => null,
        ]);

        $response = $this->actingAs($admin)->post('/admin/newsletter/send', [
            'subject' => 'Test Newsletter',
            'body' => '<h1>Rich Text</h1><p>From editor.</p>',
            'format' => 'html_editor',
        ]);

        $response->assertRedirect('/admin/newsletter/compose');

        Mail::assertSent(\App\Mail\Newsletter::class, 2);
    }

    public function test_admin_can_send_newsletter_with_plaintext_format(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['is_admin' => true]);

        NewsletterSubscriber::factory()->count(2)->create([
            'confirmed_at' => now(),
            'unsubscribed_at' => null,
        ]);

        $response = $this->actingAs($admin)->post('/admin/newsletter/send', [
            'subject' => 'Test Newsletter',
            'body' => 'Hello. This is plain text.',
            'format' => 'plaintext',
        ]);

        $response->assertRedirect('/admin/newsletter/compose');

        Mail::assertSent(\App\Mail\Newsletter::class, 2);
    }

    public function test_newsletter_only_sends_to_confirmed_subscribers(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['is_admin' => true]);

        // Active subscribers (should receive)
        NewsletterSubscriber::factory()->count(5)->create([
            'confirmed_at' => now(),
            'unsubscribed_at' => null,
        ]);

        // Unconfirmed (should NOT receive)
        NewsletterSubscriber::factory()->count(2)->create([
            'confirmed_at' => null,
            'unsubscribed_at' => null,
        ]);

        // Unsubscribed (should NOT receive)
        NewsletterSubscriber::factory()->count(3)->create([
            'confirmed_at' => now(),
            'unsubscribed_at' => now(),
        ]);

        $response = $this->actingAs($admin)->post('/admin/newsletter/send', [
            'subject' => 'Test Newsletter',
            'body' => 'Test body',
            'format' => 'plaintext',
        ]);

        // Should only send to 5 active subscribers
        Mail::assertSent(\App\Mail\Newsletter::class, 5);
    }

    public function test_send_newsletter_requires_subject(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->post('/admin/newsletter/send', [
            'subject' => '',
            'body' => 'Test body',
            'format' => 'plaintext',
        ]);

        $response->assertSessionHasErrors('subject');
    }

    public function test_send_newsletter_requires_body(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->post('/admin/newsletter/send', [
            'subject' => 'Test',
            'body' => '',
            'format' => 'plaintext',
        ]);

        $response->assertSessionHasErrors('body');
    }

    public function test_send_newsletter_requires_valid_format(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->post('/admin/newsletter/send', [
            'subject' => 'Test',
            'body' => 'Test body',
            'format' => 'invalid_format',
        ]);

        $response->assertSessionHasErrors('format');
    }

    public function test_non_admin_cannot_send_newsletter(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->post('/admin/newsletter/send', [
            'subject' => 'Test',
            'body' => 'Test body',
            'format' => 'plaintext',
        ]);

        $response->assertForbidden();
    }

    public function test_guest_cannot_send_newsletter(): void
    {
        $response = $this->post('/admin/newsletter/send', [
            'subject' => 'Test',
            'body' => 'Test body',
            'format' => 'plaintext',
        ]);

        $response->assertRedirect('/login');
    }

    public function test_sending_newsletter_with_no_active_subscribers_shows_message(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        // Only create unsubscribed subscribers
        NewsletterSubscriber::factory()->count(3)->create([
            'confirmed_at' => now(),
            'unsubscribed_at' => now(),
        ]);

        $response = $this->actingAs($admin)->post('/admin/newsletter/send', [
            'subject' => 'Test',
            'body' => 'Test body',
            'format' => 'plaintext',
        ]);

        $response->assertRedirect('/admin/newsletter/compose');
        $response->assertSessionHas('error');
    }
}
