<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class PublicProjectsTest extends TestCase
{
    use RefreshDatabase;

    public function test_projects_index_displays_project_list(): void
    {
        $projects = Project::factory()->count(3)->create([
            'status' => 'published',
        ]);

        $response = $this->get('/projects');

        $response->assertStatus(200);
        foreach ($projects as $project) {
            $response->assertSee($project->title);
        }
    }

    public function test_project_detail_page_displays_project_data(): void
    {
        $project = Project::factory()->create();

        $response = $this->get("/projects/{$project->slug}");

        $response->assertStatus(200);
        $response->assertSee($project->title);
        $response->assertSee($project->description);
    }

    public function test_project_index_includes_author_name(): void
    {
        $author = User::factory()->create(['name' => 'Test Author']);

        $project = Project::factory()->create([
            'author_id' => $author->id,
            'status' => 'published',
        ]);

        $response = $this->get('/projects');

        $response->assertOk();
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Projects/Index')
                ->where('projects.0.authorName', 'Test Author')
        );
    }

    public function test_project_show_includes_author_name(): void
    {
        $author = User::factory()->create(['name' => 'Test Author']);

        $project = Project::factory()->create([
            'author_id' => $author->id,
        ]);

        $response = $this->get("/projects/{$project->slug}");

        $response->assertOk();
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Projects/Show')
                ->where('project.authorName', 'Test Author')
        );
    }

    public function test_project_index_only_shows_published_projects(): void
    {
        $author = User::factory()->create();

        $publishedProject = Project::factory()->create([
            'title' => 'Published Project',
            'status' => 'published',
            'author_id' => $author->id,
        ]);

        $draftProject = Project::factory()->create([
            'title' => 'Draft Project',
            'status' => 'draft',
            'author_id' => $author->id,
        ]);

        $response = $this->get('/projects');

        $response->assertOk();
        $response->assertSee('Published Project');
        $response->assertDontSee('Draft Project');
    }
}
