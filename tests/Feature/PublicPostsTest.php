<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
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
            'is_featured' => false,
            'author_id' => $admin->id,
        ]);

        Post::factory()->create([
            'title' => 'Newer Post',
            'slug' => 'newer-post',
            'status' => 'published',
            'published_at' => now(),
            'is_featured' => false,
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

    public function test_posts_index_can_filter_by_tag(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        // Create posts with different tags
        $laravelPost = Post::factory()->create([
            'title' => 'Laravel Tips',
            'status' => 'published',
            'tags' => ['Laravel', 'PHP'],
            'author_id' => $admin->id,
        ]);

        $reactPost = Post::factory()->create([
            'title' => 'React Tutorial',
            'status' => 'published',
            'tags' => ['React', 'JavaScript'],
            'author_id' => $admin->id,
        ]);

        // Filter by 'Laravel' tag
        $response = $this->get('/posts?tag=Laravel');

        $response->assertOk();
        $response->assertSee('Laravel Tips');
        $response->assertDontSee('React Tutorial');
    }

    public function test_posts_index_tag_filter_is_case_sensitive(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        Post::factory()->create([
            'title' => 'Laravel Tips',
            'status' => 'published',
            'tags' => ['Laravel'],
            'author_id' => $admin->id,
        ]);

        // 'laravel' (lowercase) should not match 'Laravel'
        $response = $this->get('/posts?tag=laravel');

        $response->assertOk();
        $response->assertDontSee('Laravel Tips');
    }

    public function test_posts_index_with_nonexistent_tag_shows_no_results(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        Post::factory()->create([
            'title' => 'Laravel Tips',
            'status' => 'published',
            'tags' => ['Laravel'],
            'author_id' => $admin->id,
        ]);

        $response = $this->get('/posts?tag=NonExistentTag');

        $response->assertOk();
        $response->assertDontSee('Laravel Tips');
    }

    public function test_posts_index_passes_selected_tag_to_view(): void
    {
        $response = $this->get('/posts?tag=Laravel');

        $response->assertOk();
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Posts/Index')
                ->where('selectedTag', 'Laravel')
        );
    }

    public function test_posts_index_rejects_tag_longer_than_50_characters(): void
    {
        $longTag = str_repeat('a', 51);

        $response = $this->get('/posts?tag=' . $longTag);

        $response->assertStatus(302);
    }

    public function test_posts_index_rejects_array_tag_parameter(): void
    {
        $response = $this->get('/posts?tag[]=foo&tag[]=bar');

        $response->assertStatus(302);
    }

    public function test_posts_index_handles_special_characters_in_tag(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        Post::factory()->create([
            'title' => 'Test Post',
            'status' => 'published',
            'tags' => ['Laravel', '<script>alert("xss")</script>'],
            'author_id' => $admin->id,
        ]);

        $response = $this->get('/posts?tag=' . urlencode('<script>alert("xss")</script>'));

        $response->assertOk();
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Posts/Index')
                ->where('selectedTag', '<script>alert("xss")</script>')
        );
    }
}
