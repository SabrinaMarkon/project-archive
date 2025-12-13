<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Post;
use App\Models\Purchase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CoursePurchaseAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_posts_are_freely_accessible_when_accessed_directly(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create();

        $post = Post::factory()->create([
            'status' => 'published',
            'author_id' => $admin->id,
        ]);

        // Guest can access
        $response = $this->get("/posts/{$post->slug}");
        $response->assertStatus(200);

        // Authenticated user can access
        $response = $this->actingAs($user)->get("/posts/{$post->slug}");
        $response->assertStatus(200);
    }

    public function test_free_course_modules_are_accessible_to_everyone(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $post = Post::factory()->create(['status' => 'published']);

        $module = CourseModule::create([
            'course_id' => $course->id,
            'post_id' => $post->id,
            'is_free' => true,
            'order' => 1,
        ]);

        // Anyone can access free modules in course view
        $response = $this->actingAs($user)->get("/courses/{$course->id}");
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('modules', 1)
            ->where('modules.0.isFree', true)
        );
    }

    public function test_paid_modules_show_purchase_required_for_non_purchasers(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['price' => 99.00]);
        $post = Post::factory()->create(['status' => 'published']);

        $module = CourseModule::create([
            'course_id' => $course->id,
            'post_id' => $post->id,
            'is_free' => false,
            'order' => 1,
        ]);

        $response = $this->actingAs($user)->get("/courses/{$course->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('modules', 1)
            ->where('modules.0.isFree', false)
            ->where('hasPurchased', false)
            ->has('course.price')
        );
    }

    public function test_purchasers_can_access_all_paid_modules(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['price' => 99.00]);
        $post = Post::factory()->create(['status' => 'published']);

        $module = CourseModule::create([
            'course_id' => $course->id,
            'post_id' => $post->id,
            'is_free' => false,
            'order' => 1,
        ]);

        // Create purchase
        Purchase::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'amount' => $course->price,
            'status' => 'completed',
            'purchased_at' => now(),
        ]);

        $response = $this->actingAs($user)->get("/courses/{$course->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('hasPurchased', true)
        );
    }

    public function test_course_with_mix_of_free_and_paid_modules(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['price' => 99.00]);

        $freePost = Post::factory()->create(['status' => 'published']);
        $paidPost = Post::factory()->create(['status' => 'published']);

        CourseModule::create([
            'course_id' => $course->id,
            'post_id' => $freePost->id,
            'is_free' => true,
            'order' => 1,
        ]);

        CourseModule::create([
            'course_id' => $course->id,
            'post_id' => $paidPost->id,
            'is_free' => false,
            'order' => 2,
        ]);

        $response = $this->actingAs($user)->get("/courses/{$course->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('modules', 2)
            ->where('modules.0.isFree', true)
            ->where('modules.1.isFree', false)
            ->where('hasPurchased', false)
        );
    }

    public function test_purchase_status_is_user_specific(): void
    {
        $purchaser = User::factory()->create();
        $nonPurchaser = User::factory()->create();
        $course = Course::factory()->create(['price' => 99.00]);

        // Only one user purchases
        Purchase::create([
            'user_id' => $purchaser->id,
            'course_id' => $course->id,
            'amount' => $course->price,
            'status' => 'completed',
            'purchased_at' => now(),
        ]);

        // Purchaser sees they have access
        $response = $this->actingAs($purchaser)->get("/courses/{$course->id}");
        $response->assertInertia(fn ($page) => $page
            ->where('hasPurchased', true)
        );

        // Non-purchaser does not
        $response = $this->actingAs($nonPurchaser)->get("/courses/{$course->id}");
        $response->assertInertia(fn ($page) => $page
            ->where('hasPurchased', false)
        );
    }
}
