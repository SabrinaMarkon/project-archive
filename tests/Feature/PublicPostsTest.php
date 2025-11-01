<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPostsTest extends TestCase
{
    use RefreshDatabase;

    public function test_visitors_can_view_published_posts_list(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        Post::factory()->create([
            'title' => 'Published Post',
            'slug' => 'published-post',
            'status' => 'published',
            'published_at' => now(),
            'author_id' => $admin->id,
        ]);

        Post::factory()->create([
            'title' => 'Draft Post',
            'slug' => 'draft-post',
            'status' => 'draft',
            'author_id' => $admin->id,
        ]);

        $response = $this->get('/posts');

        $response->assertStatus(200);
        $response->assertSee('Published Post');
        $response->assertDontSee('Draft Post');
    }

    public function test_visitors_can_view_individual_published_post(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $post = Post::factory()->create([
            'title' => 'Test Post',
            'slug' => 'test-post',
            'status' => 'published',
            'published_at' => now(),
            'author_id' => $admin->id,
        ]);

        $response = $this->get("/posts/{$post->slug}");

        $response->assertStatus(200);
        $response->assertSee('Test Post');
    }

    public function test_visitors_cannot_view_draft_posts(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $post = Post::factory()->create([
            'title' => 'Draft Post',
            'slug' => 'draft-post',
            'status' => 'draft',
            'author_id' => $admin->id,
        ]);

        $response = $this->get("/posts/{$post->slug}");

        $response->assertStatus(404);
    }

    public function test_visitors_cannot_view_archived_posts(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $post = Post::factory()->create([
            'title' => 'Archived Post',
            'slug' => 'archived-post',
            'status' => 'archived',
            'author_id' => $admin->id,
        ]);

        $response = $this->get("/posts/{$post->slug}");

        $response->assertStatus(404);
    }

    public function test_admins_can_view_draft_posts(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $post = Post::factory()->create([
            'title' => 'Draft Post',
            'slug' => 'draft-post',
            'status' => 'draft',
            'author_id' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->get("/posts/{$post->slug}");

        $response->assertStatus(200);
        $response->assertSee('Draft Post');
    }

    public function test_admins_can_view_archived_posts(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $post = Post::factory()->create([
            'title' => 'Archived Post',
            'slug' => 'archived-post',
            'status' => 'archived',
            'author_id' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->get("/posts/{$post->slug}");

        $response->assertStatus(200);
        $response->assertSee('Archived Post');
    }

    public function test_admins_can_view_published_posts(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $post = Post::factory()->create([
            'title' => 'Published Post',
            'slug' => 'published-post',
            'status' => 'published',
            'published_at' => now(),
            'author_id' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->get("/posts/{$post->slug}");

        $response->assertStatus(200);
        $response->assertSee('Published Post');
    }

    public function test_non_admin_authenticated_users_cannot_view_draft_posts(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create(['is_admin' => false]);

        $post = Post::factory()->create([
            'title' => 'Draft Post',
            'slug' => 'draft-post',
            'status' => 'draft',
            'author_id' => $admin->id,
        ]);

        $response = $this->actingAs($user)->get("/posts/{$post->slug}");

        $response->assertStatus(404);
    }

    public function test_public_posts_list_only_shows_published_posts(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        Post::factory()->create([
            'title' => 'Published Post 1',
            'slug' => 'published-post-1',
            'status' => 'published',
            'published_at' => now()->subDay(),
            'author_id' => $admin->id,
        ]);

        Post::factory()->create([
            'title' => 'Published Post 2',
            'slug' => 'published-post-2',
            'status' => 'published',
            'published_at' => now(),
            'author_id' => $admin->id,
        ]);

        Post::factory()->create([
            'title' => 'Draft Post',
            'slug' => 'draft-post',
            'status' => 'draft',
            'author_id' => $admin->id,
        ]);

        Post::factory()->create([
            'title' => 'Archived Post',
            'slug' => 'archived-post',
            'status' => 'archived',
            'author_id' => $admin->id,
        ]);

        $response = $this->get('/posts');

        $response->assertStatus(200);
        $response->assertSee('Published Post 1');
        $response->assertSee('Published Post 2');
        $response->assertDontSee('Draft Post');
        $response->assertDontSee('Archived Post');
    }

    public function test_public_posts_list_ordered_by_published_date_descending(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        Post::factory()->create([
            'title' => 'Older Post',
            'slug' => 'older-post',
            'status' => 'published',
            'published_at' => now()->subWeek(),
            'author_id' => $admin->id,
        ]);

        Post::factory()->create([
            'title' => 'Newer Post',
            'slug' => 'newer-post',
            'status' => 'published',
            'published_at' => now(),
            'author_id' => $admin->id,
        ]);

        $response = $this->get('/posts');

        $response->assertStatus(200);

        // Verify the order by checking that 'Newer Post' appears before 'Older Post' in the HTML
        $content = $response->getContent();
        $newerPos = strpos($content, 'Newer Post');
        $olderPos = strpos($content, 'Older Post');

        $this->assertNotFalse($newerPos, 'Newer Post should be in the response');
        $this->assertNotFalse($olderPos, 'Older Post should be in the response');
        $this->assertLessThan($olderPos, $newerPos, 'Newer Post should appear before Older Post');
    }
}
