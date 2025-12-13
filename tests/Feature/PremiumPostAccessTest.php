<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Post;
use App\Models\Purchase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PremiumPostAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_premium_posts_are_fully_accessible_to_everyone(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $post = Post::factory()->create([
            'title' => 'Free Post',
            'slug' => 'free-post',
            'status' => 'published',
            'author_id' => $admin->id,
        ]);

        // No course modules exist for this post

        $response = $this->get("/posts/{$post->slug}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('isPremium', false)
            ->where('canAccess', true)
        );
    }

    public function test_premium_post_shows_purchase_prompt_to_guests(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $course = Course::factory()->create(['title' => 'Premium Course', 'price' => 99.00]);

        $post = Post::factory()->create([
            'title' => 'Premium Post',
            'slug' => 'premium-post',
            'status' => 'published',
            'author_id' => $admin->id,
        ]);

        // Add post as paid module to course
        CourseModule::create([
            'course_id' => $course->id,
            'post_id' => $post->id,
            'is_free' => false,
            'order' => 1,
        ]);

        $response = $this->get("/posts/{$post->slug}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('isPremium', true)
            ->where('canAccess', false)
            ->has('premiumCourse')
            ->where('premiumCourse.id', $course->id)
            ->where('premiumCourse.title', 'Premium Course')
        );
    }

    public function test_premium_post_accessible_to_purchasers(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create();
        $course = Course::factory()->create(['price' => 99.00]);

        $post = Post::factory()->create([
            'title' => 'Premium Post',
            'slug' => 'premium-post',
            'status' => 'published',
            'author_id' => $admin->id,
        ]);

        // Add post as paid module
        CourseModule::create([
            'course_id' => $course->id,
            'post_id' => $post->id,
            'is_free' => false,
            'order' => 1,
        ]);

        // User purchases course
        Purchase::factory()->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($user)->get("/posts/{$post->slug}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('isPremium', true)
            ->where('canAccess', true)
        );
    }

    public function test_premium_post_always_accessible_to_admin(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $course = Course::factory()->create(['price' => 99.00]);

        $post = Post::factory()->create([
            'title' => 'Premium Post',
            'slug' => 'premium-post',
            'status' => 'published',
            'author_id' => $admin->id,
        ]);

        // Add post as paid module
        CourseModule::create([
            'course_id' => $course->id,
            'post_id' => $post->id,
            'is_free' => false,
            'order' => 1,
        ]);

        // Admin hasn't purchased but can still access
        $response = $this->actingAs($admin)->get("/posts/{$post->slug}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('isPremium', true)
            ->where('canAccess', true)
        );
    }

    public function test_post_with_free_module_is_not_premium(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $course = Course::factory()->create();

        $post = Post::factory()->create([
            'title' => 'Free Module Post',
            'slug' => 'free-module-post',
            'status' => 'published',
            'author_id' => $admin->id,
        ]);

        // Add post as FREE module
        CourseModule::create([
            'course_id' => $course->id,
            'post_id' => $post->id,
            'is_free' => true,
            'order' => 1,
        ]);

        $response = $this->get("/posts/{$post->slug}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('isPremium', false)
            ->where('canAccess', true)
        );
    }

    public function test_post_in_multiple_courses_shows_first_paid_course(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $course1 = Course::factory()->create(['title' => 'Course A', 'price' => 99.00]);
        $course2 = Course::factory()->create(['title' => 'Course B', 'price' => 149.00]);

        $post = Post::factory()->create([
            'title' => 'Multi-Course Post',
            'slug' => 'multi-course-post',
            'status' => 'published',
            'author_id' => $admin->id,
        ]);

        // Add to both courses as paid modules
        CourseModule::create([
            'course_id' => $course1->id,
            'post_id' => $post->id,
            'is_free' => false,
            'order' => 1,
        ]);

        CourseModule::create([
            'course_id' => $course2->id,
            'post_id' => $post->id,
            'is_free' => false,
            'order' => 1,
        ]);

        $response = $this->get("/posts/{$post->slug}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('isPremium', true)
            ->has('premiumCourse')
            ->has('premiumCourse.id')
            ->has('premiumCourse.title')
        );

        // Verify it's one of the two courses
        $responseData = $response->viewData('page')['props'];
        $this->assertContains($responseData['premiumCourse']['id'], [$course1->id, $course2->id]);
    }
}
