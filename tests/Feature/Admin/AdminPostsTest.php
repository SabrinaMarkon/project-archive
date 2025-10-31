<?php

namespace Tests\Feature\Admin;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AdminPostsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['is_admin' => true]);
    }

    public function test_admin_can_see_posts_list_page(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/posts');

        $response->assertStatus(200);
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Admin/Posts/Index')
                ->has('auth')
        );
    }

    public function test_admin_can_see_create_post_form(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/posts/create');

        $response->assertOk();
        $response->assertInertia(
            fn($page) => $page->component('Admin/Posts/Create')
        );
    }

    public function test_admin_can_create_post(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/posts', [
            'title' => 'Test Post',
            'slug' => 'test-post',
            'description' => 'This is a test post.',
            'format' => 'markdown',
            'excerpt' => 'Test excerpt',
            'status' => 'draft',
            'tags' => ['Laravel', 'Testing'],
            'is_featured' => false,
        ]);

        $response->assertRedirect(route('admin.posts.index'));

        $this->assertDatabaseHas('posts', [
            'title' => 'Test Post',
            'slug' => 'test-post',
            'status' => 'draft',
        ]);
    }

    public function test_admin_can_view_post_edit_form(): void
    {
        $post = Post::factory()->create(['author_id' => $this->admin->id]);

        $response = $this->actingAs($this->admin)->get("/admin/posts/{$post->slug}");

        $response->assertOk();
        $response->assertInertia(
            fn($page) =>
            $page->component('Admin/Posts/Create')
                ->where('post.slug', $post->slug)
        );
    }

    public function test_admin_can_update_post(): void
    {
        $post = Post::factory()->create(['author_id' => $this->admin->id]);

        $response = $this->actingAs($this->admin)->put("/admin/posts/{$post->slug}", [
            'title' => 'Updated Title',
            'slug' => $post->slug,
            'description' => 'Updated description',
            'format' => 'markdown',
            'excerpt' => 'Updated excerpt',
            'status' => 'published',
            'tags' => ['Updated'],
            'is_featured' => true,
        ]);

        $response->assertRedirect(route('admin.posts.index'));

        $this->assertDatabaseHas('posts', [
            'slug' => $post->slug,
            'title' => 'Updated Title',
            'status' => 'published',
        ]);
    }

    public function test_admin_can_delete_post(): void
    {
        $post = Post::factory()->create(['author_id' => $this->admin->id]);

        $this->assertDatabaseHas('posts', ['slug' => $post->slug]);

        $response = $this->actingAs($this->admin)->delete("/admin/posts/{$post->slug}");

        $response->assertRedirect(route('admin.posts.index'));
        $this->assertDatabaseMissing('posts', ['slug' => $post->slug]);
    }

    public function test_post_creation_requires_title(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/posts', [
            'title' => '',
            'slug' => 'test',
            'format' => 'markdown',
            'status' => 'draft',
            'is_featured' => false,
        ]);

        $response->assertSessionHasErrors('title');
    }

    public function test_post_creation_requires_slug(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/posts', [
            'title' => 'Test',
            'slug' => '',
            'format' => 'markdown',
            'status' => 'draft',
            'is_featured' => false,
        ]);

        $response->assertSessionHasErrors('slug');
    }

    public function test_post_title_must_be_unique(): void
    {
        Post::factory()->create([
            'title' => 'Duplicate Title',
            'slug' => 'first-slug',
            'author_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->post('/admin/posts', [
            'title' => 'Duplicate Title',
            'slug' => 'second-slug',
            'format' => 'markdown',
            'status' => 'draft',
            'is_featured' => false,
        ]);

        $response->assertSessionHasErrors('title');
    }

    public function test_post_slug_must_be_unique(): void
    {
        Post::factory()->create([
            'title' => 'First Post',
            'slug' => 'duplicate-slug',
            'author_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->post('/admin/posts', [
            'title' => 'Second Post',
            'slug' => 'duplicate-slug',
            'format' => 'markdown',
            'status' => 'draft',
            'is_featured' => false,
        ]);

        $response->assertSessionHasErrors('slug');
    }

    public function test_post_status_must_be_valid(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/posts', [
            'title' => 'Test',
            'slug' => 'test',
            'format' => 'markdown',
            'status' => 'invalid-status',
            'is_featured' => false,
        ]);

        $response->assertSessionHasErrors('status');
    }

    public function test_post_format_must_be_valid(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/posts', [
            'title' => 'Test',
            'slug' => 'test',
            'format' => 'invalid-format',
            'status' => 'draft',
            'is_featured' => false,
        ]);

        $response->assertSessionHasErrors('format');
    }

    public function test_admin_can_create_post_with_tags(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/posts', [
            'title' => 'Post with Tags',
            'slug' => 'post-with-tags',
            'format' => 'markdown',
            'status' => 'draft',
            'tags' => ['Laravel', 'React', 'TypeScript'],
            'is_featured' => false,
        ]);

        $response->assertRedirect(route('admin.posts.index'));

        $post = Post::where('slug', 'post-with-tags')->first();
        $this->assertEquals(['Laravel', 'React', 'TypeScript'], $post->tags);
    }

    public function test_admin_can_update_post_tags(): void
    {
        $post = Post::factory()->create([
            'author_id' => $this->admin->id,
            'tags' => ['Old', 'Tags'],
        ]);

        $response = $this->actingAs($this->admin)->put("/admin/posts/{$post->slug}", [
            'title' => $post->title,
            'slug' => $post->slug,
            'format' => 'markdown',
            'status' => 'draft',
            'tags' => ['New', 'Tags', 'Here'],
            'is_featured' => false,
        ]);

        $post->refresh();
        $this->assertEquals(['New', 'Tags', 'Here'], $post->tags);
    }

    public function test_post_sets_published_at_when_status_is_published(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/posts', [
            'title' => 'Published Post',
            'slug' => 'published-post',
            'format' => 'markdown',
            'status' => 'published',
            'is_featured' => false,
        ]);

        $post = Post::where('slug', 'published-post')->first();
        $this->assertNotNull($post->published_at);
    }

    public function test_author_id_is_set_to_current_user(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/posts', [
            'title' => 'Test Post',
            'slug' => 'test-post',
            'format' => 'markdown',
            'status' => 'draft',
            'is_featured' => false,
        ]);

        $post = Post::where('slug', 'test-post')->first();
        $this->assertEquals($this->admin->id, $post->author_id);
    }

    public function test_success_flash_message_is_set_after_post_creation(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/posts', [
            'title' => 'Flash Test Post',
            'slug' => 'flash-test-post',
            'format' => 'markdown',
            'status' => 'draft',
            'is_featured' => false,
        ]);

        $response->assertSessionHas('success', 'Post created successfully!');
    }

    public function test_success_flash_message_is_set_after_post_update(): void
    {
        $post = Post::factory()->create(['author_id' => $this->admin->id]);

        $response = $this->actingAs($this->admin)->put("/admin/posts/{$post->slug}", [
            'title' => 'Updated Title',
            'slug' => $post->slug,
            'format' => 'markdown',
            'status' => 'draft',
            'is_featured' => false,
        ]);

        $response->assertSessionHas('success', 'Post updated successfully!');
    }

    public function test_success_flash_message_is_set_after_post_deletion(): void
    {
        $post = Post::factory()->create(['author_id' => $this->admin->id]);

        $response = $this->actingAs($this->admin)->delete("/admin/posts/{$post->slug}");

        $response->assertSessionHas('success', 'Post deleted successfully!');
    }

    public function test_excerpt_can_be_optional(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/posts', [
            'title' => 'Post Without Excerpt',
            'slug' => 'no-excerpt',
            'format' => 'markdown',
            'status' => 'draft',
            'is_featured' => false,
        ]);

        $response->assertSessionDoesntHaveErrors('excerpt');
    }
}
