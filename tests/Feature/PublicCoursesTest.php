<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicCoursesTest extends TestCase
{
    use RefreshDatabase;

    public function test_anyone_can_view_courses_list(): void
    {
        $response = $this->get('/courses');

        $response->assertStatus(200);
    }

    public function test_courses_list_displays_all_courses(): void
    {
        Course::factory()->count(3)->create();

        $response = $this->get('/courses');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Courses/Index')
                ->has('courses', 3)
        );
    }

    public function test_courses_list_shows_course_details(): void
    {
        Course::factory()->create([
            'title' => 'Laravel Mastery',
            'description' => 'Learn Laravel from scratch',
            'price' => '99.99',
            'payment_type' => 'one_time',
        ]);

        $response = $this->get('/courses');

        $response->assertInertia(
            fn ($page) => $page
                ->where('courses.0.title', 'Laravel Mastery')
                ->where('courses.0.description', 'Learn Laravel from scratch')
                ->where('courses.0.price', '99.99')
                ->where('courses.0.payment_type', 'one_time')
        );
    }

    public function test_anyone_can_view_course_detail(): void
    {
        $course = Course::factory()->create();

        $response = $this->get("/courses/{$course->id}");

        $response->assertStatus(200);
    }

    public function test_course_detail_shows_course_information(): void
    {
        $course = Course::factory()->create([
            'title' => 'React Advanced',
            'description' => 'Advanced React patterns',
            'price' => '149.99',
            'payment_type' => 'monthly',
        ]);

        $response = $this->get("/courses/{$course->id}");

        $response->assertInertia(
            fn ($page) => $page
                ->component('Courses/Show')
                ->where('course.title', 'React Advanced')
                ->where('course.description', 'Advanced React patterns')
                ->where('course.price', '149.99')
                ->where('course.payment_type', 'monthly')
        );
    }

    public function test_course_detail_shows_modules(): void
    {
        $course = Course::factory()->create();

        $post1 = Post::factory()->create(['title' => 'Module 1', 'status' => 'published']);
        $post2 = Post::factory()->create(['title' => 'Module 2', 'status' => 'published']);

        CourseModule::create([
            'course_id' => $course->id,
            'post_id' => $post1->id,
            'is_free' => true,
            'order' => 0,
        ]);

        CourseModule::create([
            'course_id' => $course->id,
            'post_id' => $post2->id,
            'is_free' => false,
            'order' => 1,
        ]);

        $response = $this->get("/courses/{$course->id}");

        $response->assertInertia(
            fn ($page) => $page
                ->has('course.modules', 2)
                ->where('course.modules.0.post.title', 'Module 1')
                ->where('course.modules.0.is_free', true)
                ->where('course.modules.1.post.title', 'Module 2')
                ->where('course.modules.1.is_free', false)
        );
    }

    public function test_course_detail_shows_module_count(): void
    {
        $course = Course::factory()->create();

        $post1 = Post::factory()->create(['status' => 'published']);
        $post2 = Post::factory()->create(['status' => 'published']);
        $post3 = Post::factory()->create(['status' => 'published']);

        CourseModule::create(['course_id' => $course->id, 'post_id' => $post1->id, 'is_free' => true, 'order' => 0]);
        CourseModule::create(['course_id' => $course->id, 'post_id' => $post2->id, 'is_free' => false, 'order' => 1]);
        CourseModule::create(['course_id' => $course->id, 'post_id' => $post3->id, 'is_free' => false, 'order' => 2]);

        $response = $this->get("/courses/{$course->id}");

        $response->assertInertia(
            fn ($page) => $page
                ->has('course.modules', 3)
        );
    }

    public function test_nonexistent_course_returns_404(): void
    {
        $response = $this->get('/courses/99999');

        $response->assertStatus(404);
    }

    public function test_courses_list_includes_module_count(): void
    {
        $course = Course::factory()->create();

        $post1 = Post::factory()->create(['status' => 'published']);
        $post2 = Post::factory()->create(['status' => 'published']);

        CourseModule::create(['course_id' => $course->id, 'post_id' => $post1->id, 'is_free' => true, 'order' => 0]);
        CourseModule::create(['course_id' => $course->id, 'post_id' => $post2->id, 'is_free' => false, 'order' => 1]);

        $response = $this->get('/courses');

        $response->assertInertia(
            fn ($page) => $page
                ->where('courses.0.modules_count', 2)
        );
    }
}
