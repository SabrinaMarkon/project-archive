<?php

namespace Tests\Feature\Admin;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminProjectsComprehensiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_project_and_verify_it_exists(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $projectData = [
            'title' => 'E-commerce Platform',
            'slug' => 'e-commerce-platform',
            'description' => 'Full-featured online store',
        ];

        $response = $this->actingAs($admin)->post('/admin/projects', $projectData);

        $response->assertRedirect('/admin/projects');
        $this->assertDatabaseHas('projects', $projectData);

        // Verify the project actually exists and is accessible
        $project = Project::where('slug', 'e-commerce-platform')->first();
        $this->assertNotNull($project);
        $this->assertEquals('E-commerce Platform', $project->title);
    }

    public function test_admin_can_update_project_and_changes_persist(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $project = Project::factory()->create([
            'title' => 'Old Title',
            'slug' => 'old-slug',
            'description' => 'Old description',
        ]);

        $response = $this->actingAs($admin)->put("/admin/projects/{$project->slug}", [
            'title' => 'New Title',
            'slug' => 'new-slug',
            'description' => 'New description',
        ]);

        $response->assertRedirect('/admin/projects');

        // Verify the update actually worked
        $updatedProject = Project::find($project->id);
        $this->assertEquals('New Title', $updatedProject->title);
        $this->assertEquals('new-slug', $updatedProject->slug);
        $this->assertEquals('New description', $updatedProject->description);
    }

    public function test_admin_can_delete_project_and_it_is_removed(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $project = Project::factory()->create();

        $projectId = $project->id;

        $response = $this->actingAs($admin)->delete("/admin/projects/{$project->slug}");

        $response->assertRedirect('/admin/projects');

        // Verify deletion worked
        $this->assertNull(Project::find($projectId));
        $this->assertEquals(0, Project::count());
    }

    public function test_project_list_shows_correct_count(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        Project::factory()->count(10)->create();

        $response = $this->actingAs($admin)->get('/admin/projects');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('projects', 10));

        // Verify count in database matches
        $this->assertEquals(10, Project::count());
    }

    public function test_non_admin_user_completely_blocked_from_admin_projects(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $project = Project::factory()->create();

        // Try all CRUD operations
        $this->actingAs($user)->get('/admin/projects')->assertStatus(403);
        $this->actingAs($user)->get('/admin/projects/create')->assertStatus(403);
        $this->actingAs($user)->post('/admin/projects', ['title' => 'Test'])->assertStatus(403);
        $this->actingAs($user)->get("/admin/projects/{$project->slug}")->assertStatus(403);
        $this->actingAs($user)->put("/admin/projects/{$project->slug}", ['title' => 'Test'])->assertStatus(403);
        $this->actingAs($user)->delete("/admin/projects/{$project->slug}")->assertStatus(403);

        // Verify no changes were made
        $this->assertEquals(1, Project::count());
    }

    public function test_guest_user_redirected_to_login(): void
    {
        $project = Project::factory()->create();

        $this->get('/admin/projects')->assertRedirect('/login');
        $this->post('/admin/projects', ['title' => 'Test'])->assertRedirect('/login');
        $this->delete("/admin/projects/{$project->slug}")->assertRedirect('/login');
    }
}
