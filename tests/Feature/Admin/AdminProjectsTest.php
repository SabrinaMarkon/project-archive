<?php

namespace Tests\Feature\Admin;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AdminProjectsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['is_admin' => true]);
    }

    public function test_admin_can_see_dashboard_layout()
    {
        $response = $this->actingAs($this->admin)->get('/admin/projects/create');

        $response->assertStatus(200);
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page
                ->component('Admin/Projects/Create')
                ->has('auth')
                ->where('auth.user.id', $this->admin->id)
        );
    }

    /**
     * Project list admin page
     */
    public function test_admin_can_see_project_list_page()
    {
        $response = $this->actingAs($this->admin)->get('/admin/projects');

        $response->assertStatus(200);
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page
                ->component('Admin/Projects/Index')
                ->has('auth')
                ->where('auth.user.id', $this->admin->id)
        );
    }

    public function test_projects_index_displays_project_list(): void
    {
        $projects = Project::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)->get('/admin/projects');

        $response->assertStatus(200);
        foreach ($projects as $project) {
            $response->assertSee($project->title);
        }
    }

    /**
     * Create/edit project admin page
     */
    public function test_admin_user_can_create_a_project(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Test Project',
            'slug' => 'test-project',
            'description' => 'This is a test project.',
        ]);

        $response->assertRedirect('/projects/test-project');

        $this->assertDatabaseHas('projects', [
            'title' => 'Test Project',
            'slug' => 'test-project',
            'description' => 'This is a test project.',
        ]);
    }

    public function test_admin_can_view_project_creation_form(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/projects/create');

        $response->assertOk();
        $response->assertInertia(
            fn($page) =>
            $page->component('Admin/Projects/Create')
        );
    }

    public function test_success_flash_message_is_set_after_project_creation(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Flash Test Project',
            'slug' => 'flash-test-project',
            'description' => 'Testing flash message',
        ]);
    
        $response->assertSessionHas('success', 'Project created');
    }

    /**
     * Form field validations: title
     */
    public function test_project_creation_requires_title(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => '',
            'slug' => 'test-project',
            'description' => 'Test project with no title',
        ]);

        $response->assertSessionHasErrors('title');
    }

    public function test_project_title_must_not_exceed_max_length(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => str_repeat('A', 256), // 256 characters
            'slug' => 'test-project',
            'description' => 'Too long title',
        ]);

        $response->assertSessionHasErrors('title');
    }

    public function test_project_title_must_be_unique(): void
    {
        // First project
        $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Duplicate Title',
            'slug' => 'first-slug',
            'description' => 'First project',
        ]);

        $this->assertDatabaseCount('projects', 1);

        // Second project with same title
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Duplicate Title',
            'slug' => 'second-slug',
            'description' => 'Second project',
        ]);

        $response->assertSessionHasErrors('title');
    }

    /**
     * Form field validations: slug
     */
    public function test_project_creation_requires_slug(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Test Project',
            'slug' => '',
            'description' => 'Test project with no slug',
        ]);

        $response->assertSessionHasErrors('slug');
    }

    public function test_project_slug_must_not_exceed_max_length(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Test Project',
            'slug' => str_repeat('A', 256),
            'description' => 'Too long slug',
        ]);

        $response->assertSessionHasErrors('slug');
    }

    public function test_project_slug_must_be_unique(): void
    {
        // First project
        $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'First Test Project',
            'slug' => 'duplicate-slug',
            'description' => 'First project',
        ]);

        $this->assertDatabaseCount('projects', 1);

        // Second project with same slug
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Second Test Project',
            'slug' => 'duplicate-slug',
            'description' => 'Second project',
        ]);

        $response->assertSessionHasErrors('slug');
    }

    public function test_project_slug_must_be_properly_formatted(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Test Project',
            'slug' => 'Invalid Slug!!!', // invalid because of spaces/special chars
            'description' => 'Test project with improperly formatted slug.',
        ]);

        $response->assertSessionHasErrors('slug');
    }

    /**
     * Form field validations: description
     */
    public function test_project_description_is_optional(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Project Without Description',
            'slug' => 'no-description',
            // no description field
        ]);

        $response->assertSessionDoesntHaveErrors('description');
    }

    public function test_project_description_must_not_exceed_max_length(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Test Project',
            'slug' => 'test-project',
            'description' => str_repeat('A', 2001),
        ]);

        $response->assertSessionHasErrors('description');
    }
}
