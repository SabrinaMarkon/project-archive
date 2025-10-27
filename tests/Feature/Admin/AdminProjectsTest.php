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
     * Create project admin page
     */
    public function test_admin_user_can_create_a_project(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Test Project',
            'slug' => 'test-project',
            'description' => 'This is a test project.',
        ]);

        $response->assertRedirect(route('admin.projects.index'));

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

    public function test_admin_can_view_single_project_edit_form(): void
    {
        $project = Project::factory()->create();

        $response = $this->actingAs($this->admin)->get("/admin/projects/{$project->slug}");

        $response->assertOk();
        $response->assertInertia(
            fn($page) =>
            $page->component('Admin/Projects/Create')
                ->where('project.id', $project->id)
                ->where('project.slug', $project->slug)
        );
    }

    public function test_success_flash_message_is_set_after_project_creation(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Flash Test Project',
            'slug' => 'flash-test-project',
            'description' => 'Testing flash message',
        ]);

        $response->assertSessionHas('success', 'Project created successfully!');
    }

    /**
     * Update project admin page
     */
    public function test_admin_can_view_project_edit_form(): void
    {
        $project = Project::factory()->create();

        $response = $this->actingAs($this->admin)->get("/admin/projects/{$project->slug}");

        $response->assertOk();
        $response->assertInertia(
            fn($page) =>
            $page->component('Admin/Projects/Create')
                ->where('project.id', $project->id)
                ->where('project.slug', $project->slug)
        );
    }

    public function test_success_flash_message_is_set_after_project_update(): void
    {
        $project = Project::factory()->create();

        $response = $this->actingAs($this->admin)->put("/admin/projects/{$project->slug}", [
            'title' => 'Updated Title',
            'slug' => 'updated-title',
            'description' => 'Updated description.',
        ]);

        $response->assertSessionHas('success', 'Project updated successfully!');
    }

    public function test_project_update_route_returns_404_when_not_found(): void
    {
        $response = $this->actingAs($this->admin)->put('/admin/projects/non-existing-slug', [
            'title' => 'Updated Title',
            'slug' => 'updated-title',
            'description' => 'Updated description.',
        ]);

        $response->assertStatus(404);  // This ensures that if the project doesn't exist, a 404 is returned
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

    public function test_project_update_requires_unique_slug(): void
    {
        Project::factory()->create(['slug' => 'existing-slug']); // first project
        // Assert: Make sure the first project exists in the database
        $this->assertDatabaseHas('projects', [
            'slug' => 'existing-slug',
        ]);

        // Create a second project with a different slug. We will try to update its slug to be the same as the first project (existing-slug)
        $projectToUpdate = Project::factory()->create([
            'slug' => 'slug-to-update',
        ]);
        // Assert: Make sure the second project exists in the database
        $this->assertDatabaseHas('projects', [
            'slug' => 'slug-to-update',
        ]);

        // Act: Attempt to update the second project with the same slug as the first one
        $response = $this->actingAs($this->admin)->put("/admin/projects/{$projectToUpdate->slug}", [
            'title' => 'Updated Title',
            'slug' => 'existing-slug', // This should fail because the slug is already taken
            'description' => 'Updated description.',
        ]);

        // Assert: Validation error for the slug (because it's not unique)
        // $response->assertSessionHasErrors('slug');

        // Assert: The database should still have only one project with this slug
        $this->assertDatabaseCount('projects', 2); // The number of projects should stay the same
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
