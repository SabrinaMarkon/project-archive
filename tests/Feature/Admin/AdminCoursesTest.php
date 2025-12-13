<?php

namespace Tests\Feature\Admin;

use App\Models\Course;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCoursesTest extends TestCase
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

    // ========================================
    // Authorization Tests
    // ========================================

    public function test_guest_cannot_access_course_list(): void
    {
        $response = $this->get('/admin/courses');
        $response->assertRedirect('/login');
    }

    public function test_non_admin_cannot_access_course_list(): void
    {
        $response = $this->actingAs($this->regularUser)
            ->get('/admin/courses');
        $response->assertStatus(403);
    }

    public function test_admin_can_view_course_list(): void
    {
        $response = $this->actingAs($this->admin)
            ->get('/admin/courses');
        $response->assertOk();
        $response->assertInertia(
            fn($page) => $page->component('Admin/Courses/Index')
        );
    }

    public function test_guest_cannot_access_create_course_form(): void
    {
        $response = $this->get('/admin/courses/create');
        $response->assertRedirect('/login');
    }

    public function test_non_admin_cannot_access_create_course_form(): void
    {
        $response = $this->actingAs($this->regularUser)
            ->get('/admin/courses/create');
        $response->assertStatus(403);
    }

    public function test_admin_can_view_create_course_form(): void
    {
        $response = $this->actingAs($this->admin)
            ->get('/admin/courses/create');
        $response->assertOk();
        $response->assertInertia(
            fn($page) => $page->component('Admin/Courses/Create')
        );
    }

    // ========================================
    // Course Creation Tests
    // ========================================

    public function test_admin_can_create_course(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/courses', [
            'title' => 'GraphQL Fundamentals',
            'description' => 'Learn GraphQL from scratch',
            'price' => 49.99,
            'payment_type' => 'one_time',
            'stripe_enabled' => true,
            'paypal_enabled' => false,
        ]);

        $response->assertRedirect('/admin/courses');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('courses', [
            'title' => 'GraphQL Fundamentals',
            'description' => 'Learn GraphQL from scratch',
            'price' => 49.99,
            'payment_type' => 'one_time',
            'stripe_enabled' => true,
            'paypal_enabled' => false,
        ]);
    }

    public function test_course_creation_requires_title(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/courses', [
            'title' => '',
            'description' => 'Test description',
            'price' => 49.99,
            'payment_type' => 'one_time',
        ]);

        $response->assertSessionHasErrors('title');
    }

    public function test_course_creation_requires_price(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/courses', [
            'title' => 'Test Course',
            'description' => 'Test description',
            'price' => '',
            'payment_type' => 'one_time',
        ]);

        $response->assertSessionHasErrors('price');
    }

    public function test_course_price_must_be_numeric(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/courses', [
            'title' => 'Test Course',
            'description' => 'Test description',
            'price' => 'not-a-number',
            'payment_type' => 'one_time',
        ]);

        $response->assertSessionHasErrors('price');
    }

    public function test_course_price_must_be_positive(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/courses', [
            'title' => 'Test Course',
            'description' => 'Test description',
            'price' => -10,
            'payment_type' => 'one_time',
        ]);

        $response->assertSessionHasErrors('price');
    }

    public function test_course_payment_type_must_be_valid(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/courses', [
            'title' => 'Test Course',
            'description' => 'Test description',
            'price' => 49.99,
            'payment_type' => 'invalid_type',
        ]);

        $response->assertSessionHasErrors('payment_type');
    }

    public function test_course_payment_type_accepts_one_time(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/courses', [
            'title' => 'Test Course',
            'description' => 'Test description',
            'price' => 49.99,
            'payment_type' => 'one_time',
        ]);

        $response->assertSessionDoesntHaveErrors('payment_type');
    }

    public function test_course_payment_type_accepts_monthly(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/courses', [
            'title' => 'Test Course',
            'description' => 'Test description',
            'price' => 9.99,
            'payment_type' => 'monthly',
        ]);

        $response->assertSessionDoesntHaveErrors('payment_type');
    }

    public function test_course_payment_type_accepts_annual(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/courses', [
            'title' => 'Test Course',
            'description' => 'Test description',
            'price' => 99.99,
            'payment_type' => 'annual',
        ]);

        $response->assertSessionDoesntHaveErrors('payment_type');
    }

    // ========================================
    // Course Update Tests
    // ========================================

    public function test_admin_can_update_course(): void
    {
        $course = Course::factory()->create([
            'title' => 'Original Title',
            'price' => 49.99,
        ]);

        $response = $this->actingAs($this->admin)
            ->put("/admin/courses/{$course->id}", [
                'title' => 'Updated Title',
                'description' => $course->description,
                'price' => 59.99,
                'payment_type' => $course->payment_type,
                'stripe_enabled' => $course->stripe_enabled,
                'paypal_enabled' => $course->paypal_enabled,
            ]);

        $response->assertRedirect('/admin/courses');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'title' => 'Updated Title',
            'price' => 59.99,
        ]);
    }

    public function test_admin_can_view_course_edit_form(): void
    {
        $course = Course::factory()->create();

        $response = $this->actingAs($this->admin)
            ->get("/admin/courses/{$course->id}");

        $response->assertOk();
        $response->assertInertia(
            fn($page) => $page
                ->component('Admin/Courses/Create')
                ->where('course.id', $course->id)
                ->where('course.title', $course->title)
        );
    }

    // ========================================
    // Course Deletion Tests
    // ========================================

    public function test_admin_can_delete_course(): void
    {
        $course = Course::factory()->create();

        $response = $this->actingAs($this->admin)
            ->delete("/admin/courses/{$course->id}");

        $response->assertRedirect('/admin/courses');
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('courses', [
            'id' => $course->id,
        ]);
    }

    public function test_deleting_course_does_not_delete_associated_posts(): void
    {
        $course = Course::factory()->create();
        $post = Post::factory()->create();

        $course->modules()->create([
            'post_id' => $post->id,
            'is_free' => true,
            'order' => 1,
        ]);

        $this->actingAs($this->admin)
            ->delete("/admin/courses/{$course->id}");

        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
        ]);
    }

    // ========================================
    // Course Module Management Tests
    // ========================================

    public function test_admin_can_add_module_to_course(): void
    {
        $course = Course::factory()->create();
        $post = Post::factory()->create();

        $response = $this->actingAs($this->admin)
            ->post("/admin/courses/{$course->id}/modules", [
                'post_id' => $post->id,
                'is_free' => true,
                'custom_description' => 'Introduction to GraphQL',
                'order' => 1,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('course_modules', [
            'course_id' => $course->id,
            'post_id' => $post->id,
            'is_free' => true,
            'custom_description' => 'Introduction to GraphQL',
            'order' => 1,
        ]);
    }

    public function test_admin_can_remove_module_from_course(): void
    {
        $course = Course::factory()->create();
        $post = Post::factory()->create();

        $module = $course->modules()->create([
            'post_id' => $post->id,
            'is_free' => true,
            'order' => 1,
        ]);

        $response = $this->actingAs($this->admin)
            ->delete("/admin/courses/{$course->id}/modules/{$module->id}");

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('course_modules', [
            'id' => $module->id,
        ]);

        // Post should still exist
        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
        ]);
    }

    public function test_admin_can_update_module_is_free_status(): void
    {
        $course = Course::factory()->create();
        $post = Post::factory()->create();

        $module = $course->modules()->create([
            'post_id' => $post->id,
            'is_free' => true,
            'order' => 1,
        ]);

        $response = $this->actingAs($this->admin)
            ->patch("/admin/courses/{$course->id}/modules/{$module->id}", [
                'is_free' => false,
                'custom_description' => $module->custom_description,
                'order' => $module->order,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('course_modules', [
            'id' => $module->id,
            'is_free' => false,
        ]);
    }

    public function test_admin_can_reorder_modules(): void
    {
        $course = Course::factory()->create();
        $post1 = Post::factory()->create();
        $post2 = Post::factory()->create();

        $module1 = $course->modules()->create([
            'post_id' => $post1->id,
            'is_free' => true,
            'order' => 1,
        ]);

        $module2 = $course->modules()->create([
            'post_id' => $post2->id,
            'is_free' => false,
            'order' => 2,
        ]);

        $response = $this->actingAs($this->admin)
            ->patch("/admin/courses/{$course->id}/modules/{$module1->id}", [
                'is_free' => $module1->is_free,
                'custom_description' => $module1->custom_description,
                'order' => 2,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('course_modules', [
            'id' => $module1->id,
            'order' => 2,
        ]);
    }

    // ========================================
    // Course Listing Tests
    // ========================================

    public function test_course_list_displays_all_courses(): void
    {
        $course1 = Course::factory()->create(['title' => 'Course A']);
        $course2 = Course::factory()->create(['title' => 'Course B']);

        $response = $this->actingAs($this->admin)
            ->get('/admin/courses');

        $response->assertOk();
        $response->assertSee('Course A');
        $response->assertSee('Course B');
    }

    public function test_course_list_shows_module_count(): void
    {
        $course = Course::factory()->create();
        $post1 = Post::factory()->create();
        $post2 = Post::factory()->create();

        $course->modules()->create(['post_id' => $post1->id, 'is_free' => true, 'order' => 1]);
        $course->modules()->create(['post_id' => $post2->id, 'is_free' => false, 'order' => 2]);

        $response = $this->actingAs($this->admin)
            ->get('/admin/courses');

        $response->assertOk();
        $response->assertSee('2');
    }
}
