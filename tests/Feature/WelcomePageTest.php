<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class WelcomePageTest extends TestCase
{
    use RefreshDatabase;

    public function test_welcome_page_displays_only_featured_published_projects(): void
    {
        $author = User::factory()->create(['name' => 'Sabrina Markon']);

        // Create 3 featured published projects
        Project::factory()->count(3)->create([
            'is_featured' => true,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        // Create non-featured published project (should not show when there are 3+ featured)
        Project::factory()->create([
            'title' => 'Non-Featured Project',
            'is_featured' => false,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        // Create featured draft project (should not show)
        Project::factory()->create([
            'title' => 'Featured Draft',
            'is_featured' => true,
            'status' => 'draft',
            'author_id' => $author->id,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Welcome')
                ->has('projects', 3)
                ->where('projects.0.isFeatured', true)
                ->where('projects.1.isFeatured', true)
                ->where('projects.2.isFeatured', true)
        );
    }

    public function test_welcome_page_displays_only_featured_published_posts(): void
    {
        $author = User::factory()->create(['name' => 'Sabrina Markon']);

        // Create 3 featured published posts
        Post::factory()->count(3)->create([
            'is_featured' => true,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        // Create non-featured published post (should not show when there are 3+ featured)
        Post::factory()->create([
            'title' => 'Non-Featured Post',
            'is_featured' => false,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        // Create featured draft post (should not show)
        Post::factory()->create([
            'title' => 'Featured Draft Post',
            'is_featured' => true,
            'status' => 'draft',
            'author_id' => $author->id,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Welcome')
                ->has('posts', 3)
                ->where('posts.0.isFeatured', true)
                ->where('posts.1.isFeatured', true)
                ->where('posts.2.isFeatured', true)
        );
    }

    public function test_welcome_page_limits_projects_to_three(): void
    {
        $author = User::factory()->create(['name' => 'Sabrina Markon']);

        // Create 5 featured published projects
        Project::factory()->count(5)->create([
            'is_featured' => true,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Welcome')
                ->has('projects', 3)
        );
    }

    public function test_welcome_page_limits_posts_to_three(): void
    {
        $author = User::factory()->create(['name' => 'Sabrina Markon']);

        // Create 5 featured published posts
        Post::factory()->count(5)->create([
            'is_featured' => true,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Welcome')
                ->has('posts', 3)
        );
    }

    public function test_welcome_page_includes_author_name_for_projects(): void
    {
        $author = User::factory()->create(['name' => 'Sabrina Markon']);

        Project::factory()->create([
            'title' => 'Test Project',
            'is_featured' => true,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Welcome')
                ->where('projects.0.authorName', 'Sabrina Markon')
        );
    }

    public function test_welcome_page_includes_author_name_for_posts(): void
    {
        $author = User::factory()->create(['name' => 'Sabrina Markon']);

        Post::factory()->create([
            'title' => 'Test Post',
            'is_featured' => true,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Welcome')
                ->where('posts.0.authorName', 'Sabrina Markon')
        );
    }

    public function test_welcome_page_shows_random_projects_when_no_featured_exist(): void
    {
        $author = User::factory()->create(['name' => 'Sabrina Markon']);

        // Create 5 non-featured published projects
        Project::factory()->count(5)->create([
            'is_featured' => false,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Welcome')
                ->has('projects', 3) // Should show 3 random projects
        );
    }

    public function test_welcome_page_shows_random_posts_when_no_featured_exist(): void
    {
        $author = User::factory()->create(['name' => 'Sabrina Markon']);

        // Create 5 non-featured published posts
        Post::factory()->count(5)->create([
            'is_featured' => false,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Welcome')
                ->has('posts', 3) // Should show 3 random posts
        );
    }

    public function test_welcome_page_fills_projects_with_random_when_only_one_featured(): void
    {
        $author = User::factory()->create(['name' => 'Sabrina Markon']);

        // Create 1 featured project
        $featured = Project::factory()->create([
            'title' => 'Featured Project',
            'is_featured' => true,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        // Create 5 non-featured published projects
        Project::factory()->count(5)->create([
            'is_featured' => false,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Welcome')
                ->has('projects', 3) // Should show 1 featured + 2 random
                ->where('projects.0.title', 'Featured Project') // Featured should be first
                ->where('projects.0.isFeatured', true)
        );
    }

    public function test_welcome_page_fills_posts_with_random_when_only_one_featured(): void
    {
        $author = User::factory()->create(['name' => 'Sabrina Markon']);

        // Create 1 featured post
        $featured = Post::factory()->create([
            'title' => 'Featured Post',
            'is_featured' => true,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        // Create 5 non-featured published posts
        Post::factory()->count(5)->create([
            'is_featured' => false,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Welcome')
                ->has('posts', 3) // Should show 1 featured + 2 random
                ->where('posts.0.title', 'Featured Post') // Featured should be first
                ->where('posts.0.isFeatured', true)
        );
    }

    public function test_welcome_page_fills_projects_with_random_when_two_featured(): void
    {
        $author = User::factory()->create(['name' => 'Sabrina Markon']);

        // Create 2 featured projects
        Project::factory()->count(2)->create([
            'is_featured' => true,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        // Create 3 non-featured published projects
        Project::factory()->count(3)->create([
            'is_featured' => false,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Welcome')
                ->has('projects', 3) // Should show 2 featured + 1 random
        );
    }

    public function test_welcome_page_fills_posts_with_random_when_two_featured(): void
    {
        $author = User::factory()->create(['name' => 'Sabrina Markon']);

        // Create 2 featured posts
        Post::factory()->count(2)->create([
            'is_featured' => true,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        // Create 3 non-featured published posts
        Post::factory()->count(3)->create([
            'is_featured' => false,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Welcome')
                ->has('posts', 3) // Should show 2 featured + 1 random
        );
    }

    public function test_welcome_page_shows_less_than_three_when_not_enough_published(): void
    {
        $author = User::factory()->create(['name' => 'Sabrina Markon']);

        // Create only 2 published projects total
        Project::factory()->count(2)->create([
            'is_featured' => false,
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Welcome')
                ->has('projects', 2) // Should show only 2 since that's all available
        );
    }
}
