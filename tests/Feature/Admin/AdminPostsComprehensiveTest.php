<?php

namespace Tests\Feature\Admin;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPostsComprehensiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_posts_list_with_all_data(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $posts = Post::factory()->count(5)->create();

        $response = $this->actingAs($admin)->get('/admin/posts');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Posts/Index')
            ->has('posts', 5)
            ->has('posts.0', fn ($post) => $post
                ->has('id')
                ->has('title')
                ->has('slug')
                ->has('status')
                ->has('publishedAt')
                ->etc()
            )
        );
    }

    public function test_admin_can_create_new_post_with_all_fields(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $postData = [
            'title' => 'Test Blog Post',
            'slug' => 'test-blog-post',
            'description' => 'This is test content for the blog post.',
            'format' => 'markdown',
            'excerpt' => 'Short excerpt',
            'status' => 'published',
            'published_at' => now()->toDateTimeString(),
            'author_id' => $admin->id,
            'is_featured' => true,
        ];

        $response = $this->actingAs($admin)->post('/admin/posts', $postData);

        $response->assertRedirect('/admin/posts');
        $this->assertDatabaseHas('posts', [
            'title' => 'Test Blog Post',
            'slug' => 'test-blog-post',
            'status' => 'published',
            'is_featured' => true,
        ]);
    }

    public function test_admin_can_update_existing_post(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $post = Post::factory()->create([
            'title' => 'Original Title',
            'slug' => 'original-title',
            'author_id' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->put("/admin/posts/{$post->slug}", [
            'title' => 'Updated Title',
            'slug' => 'updated-title',
            'description' => 'Updated content',
            'format' => 'html',
            'excerpt' => 'Updated excerpt',
            'status' => 'draft',
            'published_at' => null,
            'author_id' => $admin->id,
            'is_featured' => false,
        ]);

        $response->assertRedirect('/admin/posts');
        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'title' => 'Updated Title',
            'slug' => 'updated-title',
            'status' => 'draft',
        ]);
    }

    public function test_admin_can_delete_post(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $post = Post::factory()->create();

        $response = $this->actingAs($admin)->delete("/admin/posts/{$post->slug}");

        $response->assertRedirect('/admin/posts');
        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
    }

    public function test_non_admin_cannot_access_admin_posts(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $post = Post::factory()->create();

        $response = $this->actingAs($user)->get('/admin/posts');
        $response->assertStatus(403);

        $response = $this->actingAs($user)->post('/admin/posts', ['title' => 'Test']);
        $response->assertStatus(403);

        $response = $this->actingAs($user)->put("/admin/posts/{$post->slug}", ['title' => 'Test']);
        $response->assertStatus(403);

        $response = $this->actingAs($user)->delete("/admin/posts/{$post->slug}");
        $response->assertStatus(403);
    }

    public function test_post_slug_must_be_unique(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        Post::factory()->create(['slug' => 'duplicate-slug', 'author_id' => $admin->id]);

        $response = $this->actingAs($admin)->post('/admin/posts', [
            'title' => 'Another Post',
            'slug' => 'duplicate-slug',
            'description' => 'Content',
            'format' => 'markdown',
            'excerpt' => 'Excerpt',
            'status' => 'draft',
            'author_id' => $admin->id,
        ]);

        $response->assertSessionHasErrors('slug');
    }

    public function test_post_validation_requires_necessary_fields(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->post('/admin/posts', []);

        $response->assertSessionHasErrors(['title', 'slug']);
    }

    public function test_admin_can_toggle_post_featured_status(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $post = Post::factory()->create(['is_featured' => false, 'author_id' => $admin->id]);

        $this->actingAs($admin)->put("/admin/posts/{$post->slug}", [
            'title' => $post->title,
            'slug' => $post->slug,
            'description' => $post->description,
            'format' => $post->format,
            'excerpt' => $post->excerpt,
            'status' => $post->status,
            'published_at' => $post->published_at,
            'author_id' => $post->author_id,
            'is_featured' => true,
        ]);

        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'is_featured' => true,
        ]);
    }

}
