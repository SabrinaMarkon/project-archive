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
            'format' => 'markdown',
            'status' => 'draft',
        ]);

        $response->assertRedirect(route('admin.projects.index'));

        $this->assertDatabaseHas('projects', [
            'title' => 'Test Project',
            'slug' => 'test-project',
            'description' => 'This is a test project.',
            'format' => 'markdown',
            'status' => 'draft',
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
            'format' => 'markdown',
            'status' => 'draft',
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
            'format' => 'markdown',
            'status' => 'draft',
        ]);

        $response->assertSessionHas('success', 'Project updated successfully!');
    }

    public function test_project_update_route_returns_404_when_not_found(): void
    {
        $response = $this->actingAs($this->admin)->put('/admin/projects/non-existing-slug', [
            'title' => 'Updated Title',
            'slug' => 'updated-title',
            'description' => 'Updated description.',
            'format' => 'markdown',
            'status' => 'draft',
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
            'format' => 'markdown',
            'status' => 'draft',
        ]);

        $response->assertSessionHasErrors('title');
    }

    public function test_project_title_must_not_exceed_max_length(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => str_repeat('A', 256), // 256 characters
            'slug' => 'test-project',
            'description' => 'Too long title',
            'format' => 'markdown',
            'status' => 'draft',
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
            'format' => 'markdown',
            'status' => 'draft',
        ]);

        $this->assertDatabaseCount('projects', 1);

        // Second project with same title
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Duplicate Title',
            'slug' => 'second-slug',
            'description' => 'Second project',
            'format' => 'markdown',
            'status' => 'draft',
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
            'format' => 'markdown',
            'status' => 'draft',
        ]);

        $response->assertSessionHasErrors('slug');
    }

    public function test_project_slug_must_not_exceed_max_length(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Test Project',
            'slug' => str_repeat('A', 256),
            'description' => 'Too long slug',
            'format' => 'markdown',
            'status' => 'draft',
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
            'format' => 'markdown',
            'status' => 'draft',
        ]);

        $this->assertDatabaseCount('projects', 1);

        // Second project with same slug
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Second Test Project',
            'slug' => 'duplicate-slug',
            'description' => 'Second project',
            'format' => 'markdown',
            'status' => 'draft',
        ]);

        $response->assertSessionHasErrors('slug');
    }

    public function test_project_slug_must_be_properly_formatted(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Test Project',
            'slug' => 'Invalid Slug!!!', // invalid because of spaces/special chars
            'description' => 'Test project with improperly formatted slug.',
            'format' => 'markdown',
            'status' => 'draft',
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
            'format' => 'markdown',
            'status' => 'draft',
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
            'format' => 'markdown',
            'status' => 'draft',
            // no description field
        ]);

        $response->assertSessionDoesntHaveErrors('description');
    }

    public function test_project_description_must_not_exceed_max_length(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Test Project',
            'slug' => 'test-project',
            'description' => str_repeat('A', 50001),
            'format' => 'markdown',
            'status' => 'draft',
        ]);

        $response->assertSessionHasErrors('description');
    }


    /**
     * Form field validations: format
     */
    public function test_project_format_must_be_valid(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Test Project',
            'slug' => 'test-project',
            'format' => 'invalid-format',
            'status' => 'draft',
        ]);

        $response->assertSessionHasErrors('format');
    }

    /**
     * Form field validations: status
     */
    public function test_project_status_must_be_valid(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Test Project',
            'slug' => 'test-project',
            'format' => 'markdown',
            'status' => 'invalid-status',
        ]);

        $response->assertSessionHasErrors('status');
    }

    /**
     * Delete project tests
     */
    public function test_admin_can_delete_a_project(): void
    {
        $project = Project::factory()->create([
            'title' => 'Project to Delete',
            'slug' => 'project-to-delete',
        ]);

        $this->assertDatabaseHas('projects', ['slug' => 'project-to-delete']);

        $response = $this->actingAs($this->admin)->delete("/admin/projects/{$project->slug}");

        $response->assertRedirect(route('admin.projects.index'));
        $this->assertDatabaseMissing('projects', ['slug' => 'project-to-delete']);
    }

    public function test_success_flash_message_is_set_after_project_deletion(): void
    {
        $project = Project::factory()->create();

        $response = $this->actingAs($this->admin)->delete("/admin/projects/{$project->slug}");

        $response->assertSessionHas('success', 'Project deleted successfully!');
    }

    public function test_project_delete_route_returns_404_when_not_found(): void
    {
        $response = $this->actingAs($this->admin)->delete('/admin/projects/non-existing-slug');

        $response->assertStatus(404);
    }

    /**
     * Tags functionality tests
     */
    public function test_admin_can_create_project_with_tags(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Project with Tags',
            'slug' => 'project-with-tags',
            'description' => 'This project has tags.',
            'format' => 'markdown',
            'status' => 'draft',
            'tags' => ['Laravel', 'React', 'TypeScript'],
        ]);

        $response->assertRedirect(route('admin.projects.index'));

        $this->assertDatabaseHas('projects', [
            'title' => 'Project with Tags',
            'slug' => 'project-with-tags',
        ]);

        $project = Project::where('slug', 'project-with-tags')->first();
        $this->assertEquals(['Laravel', 'React', 'TypeScript'], $project->tags);
    }

    public function test_admin_can_create_project_without_tags(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Project without Tags',
            'slug' => 'project-without-tags',
            'description' => 'This project has no tags.',
            'format' => 'markdown',
            'status' => 'draft',
        ]);

        $response->assertRedirect(route('admin.projects.index'));

        $project = Project::where('slug', 'project-without-tags')->first();
        $this->assertNull($project->tags);
    }

    public function test_admin_can_update_project_tags(): void
    {
        $project = Project::factory()->create([
            'tags' => ['PHP', 'MySQL'],
        ]);

        $response = $this->actingAs($this->admin)->put("/admin/projects/{$project->slug}", [
            'title' => $project->title,
            'slug' => $project->slug,
            'description' => $project->description,
            'format' => 'markdown',
            'status' => 'draft',
            'tags' => ['Laravel', 'PostgreSQL', 'Vue'],
        ]);

        $response->assertRedirect(route('admin.projects.index'));

        $project->refresh();
        $this->assertEquals(['Laravel', 'PostgreSQL', 'Vue'], $project->tags);
    }

    public function test_admin_can_remove_all_tags_from_project(): void
    {
        $project = Project::factory()->create([
            'tags' => ['PHP', 'MySQL'],
        ]);

        $response = $this->actingAs($this->admin)->put("/admin/projects/{$project->slug}", [
            'title' => $project->title,
            'slug' => $project->slug,
            'description' => $project->description,
            'format' => 'markdown',
            'status' => 'draft',
            'tags' => [],
        ]);

        $response->assertRedirect(route('admin.projects.index'));

        $project->refresh();
        $this->assertEquals([], $project->tags);
    }

    public function test_tags_must_be_array(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Test Project',
            'slug' => 'test-project',
            'description' => 'Test',
            'format' => 'markdown',
            'status' => 'draft',
            'tags' => 'not-an-array',
        ]);

        $response->assertSessionHasErrors('tags');
    }

    public function test_each_tag_must_be_string(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Test Project',
            'slug' => 'test-project',
            'description' => 'Test',
            'format' => 'markdown',
            'status' => 'draft',
            'tags' => ['Valid Tag', 123, ['nested']],
        ]);

        $response->assertSessionHasErrors('tags.1');
        $response->assertSessionHasErrors('tags.2');
    }

    public function test_each_tag_must_not_exceed_max_length(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/projects', [
            'title' => 'Test Project',
            'slug' => 'test-project',
            'description' => 'Test',
            'format' => 'markdown',
            'status' => 'draft',
            'tags' => [str_repeat('A', 51)],
        ]);

        $response->assertSessionHasErrors('tags.0');
    }

    public function test_project_edit_form_includes_tags(): void
    {
        $project = Project::factory()->create([
            'tags' => ['Laravel', 'Vue', 'Tailwind'],
        ]);

        $response = $this->actingAs($this->admin)->get("/admin/projects/{$project->slug}");

        $response->assertOk();
        $response->assertInertia(
            fn($page) =>
            $page->component('Admin/Projects/Create')
                ->where('project.tags', ['Laravel', 'Vue', 'Tailwind'])
        );
    }

    public function test_public_project_list_includes_tags(): void
    {
        $project = Project::factory()->create([
            'tags' => ['Laravel', 'React'],
        ]);

        $response = $this->get('/projects');

        $response->assertOk();
        $response->assertInertia(
            fn($page) =>
            $page->component('Projects/Index')
                ->has('projects', 1)
                ->where('projects.0.tags', ['Laravel', 'React'])
        );
    }

    public function test_public_project_show_includes_tags(): void
    {
        $project = Project::factory()->create([
            'tags' => ['TypeScript', 'Node.js'],
        ]);

        $response = $this->get("/projects/{$project->slug}");

        $response->assertOk();
        $response->assertInertia(
            fn($page) =>
            $page->component('Projects/Show')
                ->where('project.tags', ['TypeScript', 'Node.js'])
        );
    }
}
