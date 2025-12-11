<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\NewsletterSend;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia;

class AdminNewsletterHistoryTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->regularUser = User::factory()->create(['is_admin' => false]);
    }

    #[Test]
    public function guest_cannot_access_newsletter_history_index()
    {
        $response = $this->get('/admin/newsletter/history');
        $response->assertRedirect('/login');
    }

    #[Test]
    public function non_admin_cannot_access_newsletter_history_index()
    {
        $response = $this->actingAs($this->regularUser)
            ->get('/admin/newsletter/history');
        $response->assertStatus(403);
    }

    #[Test]
    public function admin_can_view_newsletter_history_index()
    {
        $newsletter = NewsletterSend::factory()->create([
            'subject' => 'Test Newsletter',
            'body' => 'Test content',
            'format' => 'markdown',
            'recipient_count' => 5,
            'sent_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->get('/admin/newsletter/history');

        $response->assertStatus(200);
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page
                ->component('Admin/Newsletter/History')
                ->has('newsletters.data', 1)
                ->where('newsletters.data.0.id', $newsletter->id)
                ->where('newsletters.data.0.subject', 'Test Newsletter')
                ->where('newsletters.data.0.recipient_count', 5)
        );
    }

    #[Test]
    public function newsletter_history_index_displays_newsletters_in_descending_order()
    {
        $older = NewsletterSend::factory()->create([
            'subject' => 'Older Newsletter',
            'sent_at' => now()->subDays(2),
        ]);
        $newer = NewsletterSend::factory()->create([
            'subject' => 'Newer Newsletter',
            'sent_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($this->admin)
            ->get('/admin/newsletter/history');

        $response->assertStatus(200);
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page
                ->has('newsletters.data', 2)
                ->where('newsletters.data.0.subject', 'Newer Newsletter')
                ->where('newsletters.data.1.subject', 'Older Newsletter')
        );
    }

    #[Test]
    public function newsletter_history_index_paginates_results()
    {
        NewsletterSend::factory()->count(20)->create();

        $response = $this->actingAs($this->admin)
            ->get('/admin/newsletter/history');

        $response->assertStatus(200);
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page
                ->component('Admin/Newsletter/History')
                ->has('newsletters.data', 15)
                ->has('newsletters.links')
                ->where('newsletters.per_page', 15)
                ->where('newsletters.total', 20)
        );
    }

    #[Test]
    public function guest_cannot_view_individual_newsletter()
    {
        $newsletter = NewsletterSend::factory()->create();

        $response = $this->get("/admin/newsletter/history/{$newsletter->id}");
        $response->assertRedirect('/login');
    }

    #[Test]
    public function non_admin_cannot_view_individual_newsletter()
    {
        $newsletter = NewsletterSend::factory()->create();

        $response = $this->actingAs($this->regularUser)
            ->get("/admin/newsletter/history/{$newsletter->id}");
        $response->assertStatus(403);
    }

    #[Test]
    public function admin_can_view_individual_newsletter()
    {
        $newsletter = NewsletterSend::factory()->create([
            'subject' => 'Test Newsletter',
            'body' => 'This is the newsletter body content.',
            'format' => 'markdown',
            'recipient_count' => 10,
            'sent_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->get("/admin/newsletter/history/{$newsletter->id}");

        $response->assertStatus(200);
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page
                ->component('Admin/Newsletter/View')
                ->where('newsletter.id', $newsletter->id)
                ->where('newsletter.subject', 'Test Newsletter')
                ->where('newsletter.body', 'This is the newsletter body content.')
                ->where('newsletter.format', 'markdown')
                ->where('newsletter.recipient_count', 10)
        );
    }

    #[Test]
    public function viewing_nonexistent_newsletter_returns_404()
    {
        $response = $this->actingAs($this->admin)
            ->get('/admin/newsletter/history/99999');

        $response->assertStatus(404);
    }

    #[Test]
    public function guest_cannot_delete_newsletter()
    {
        $newsletter = NewsletterSend::factory()->create();

        $response = $this->delete("/admin/newsletter/history/{$newsletter->id}");
        $response->assertRedirect('/login');
        $this->assertDatabaseHas('newsletter_sends', ['id' => $newsletter->id]);
    }

    #[Test]
    public function non_admin_cannot_delete_newsletter()
    {
        $newsletter = NewsletterSend::factory()->create();

        $response = $this->actingAs($this->regularUser)
            ->delete("/admin/newsletter/history/{$newsletter->id}");
        $response->assertStatus(403);
        $this->assertDatabaseHas('newsletter_sends', ['id' => $newsletter->id]);
    }

    #[Test]
    public function admin_can_delete_newsletter()
    {
        $newsletter = NewsletterSend::factory()->create([
            'subject' => 'Newsletter to Delete',
        ]);

        $response = $this->actingAs($this->admin)
            ->delete("/admin/newsletter/history/{$newsletter->id}");

        $response->assertRedirect('/admin/newsletter/history');
        $response->assertSessionHas('success', 'Newsletter deleted successfully.');
        $this->assertDatabaseMissing('newsletter_sends', ['id' => $newsletter->id]);
    }

    #[Test]
    public function deleting_nonexistent_newsletter_returns_404()
    {
        $response = $this->actingAs($this->admin)
            ->delete('/admin/newsletter/history/99999');

        $response->assertStatus(404);
    }

    #[Test]
    public function newsletter_is_saved_when_sent()
    {
        $this->actingAs($this->admin);

        // Create some active subscribers
        \App\Models\NewsletterSubscriber::factory()->count(3)->create([
            'confirmed_at' => now(),
            'unsubscribed_at' => null,
        ]);

        $response = $this->post('/admin/newsletter/send', [
            'subject' => 'New Newsletter',
            'body' => 'Newsletter content here',
            'format' => 'markdown',
        ]);

        $response->assertRedirect('/admin/newsletter/compose');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('newsletter_sends', [
            'subject' => 'New Newsletter',
            'body' => 'Newsletter content here',
            'format' => 'markdown',
            'recipient_count' => 3,
        ]);

        $send = NewsletterSend::where('subject', 'New Newsletter')->first();
        $this->assertNotNull($send->sent_at);
    }

    #[Test]
    public function newsletter_history_displays_empty_state_when_no_newsletters_sent()
    {
        $response = $this->actingAs($this->admin)
            ->get('/admin/newsletter/history');

        $response->assertStatus(200);
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page
                ->component('Admin/Newsletter/History')
                ->has('newsletters.data', 0)
                ->where('newsletters.total', 0)
        );
    }
}
