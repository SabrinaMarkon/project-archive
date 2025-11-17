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

    public function test_projects_index_can_filter_by_tag(): void
    {
        $author = User::factory()->create();

        // Create projects with different tags
        $laravelProject = Project::factory()->create([
            'title' => 'Laravel Project',
            'status' => 'published',
            'tags' => ['Laravel', 'PHP'],
            'author_id' => $author->id,
        ]);

        $reactProject = Project::factory()->create([
            'title' => 'React Project',
            'status' => 'published',
            'tags' => ['React', 'JavaScript'],
            'author_id' => $author->id,
        ]);

        // Filter by 'Laravel' tag
        $response = $this->get('/projects?tag=Laravel');

        $response->assertOk();
        $response->assertSee('Laravel Project');
        $response->assertDontSee('React Project');
    }

    public function test_projects_index_tag_filter_is_case_sensitive(): void
    {
        $author = User::factory()->create();

        Project::factory()->create([
            'title' => 'Laravel Project',
            'status' => 'published',
            'tags' => ['Laravel'],
            'author_id' => $author->id,
        ]);

        // 'laravel' (lowercase) should not match 'Laravel'
        $response = $this->get('/projects?tag=laravel');

        $response->assertOk();
        $response->assertDontSee('Laravel Project');
    }

    public function test_projects_index_with_nonexistent_tag_shows_no_results(): void
    {
        $author = User::factory()->create();

        Project::factory()->create([
            'title' => 'Laravel Project',
            'status' => 'published',
            'tags' => ['Laravel'],
            'author_id' => $author->id,
        ]);

        $response = $this->get('/projects?tag=NonExistentTag');

        $response->assertOk();
        // Should not see any projects
        $response->assertDontSee('Laravel Project');
    }

    public function test_projects_index_passes_selected_tag_to_view(): void
    {
        $response = $this->get('/projects?tag=Laravel');

        $response->assertOk();
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Projects/Index')
                ->where('selectedTag', 'Laravel')
        );
    }

    public function test_projects_index_rejects_tag_longer_than_50_characters(): void
    {
        $longTag = str_repeat('a', 51); // 51 characters

        $response = $this->get('/projects?tag=' . $longTag);

        // Should return validation error (302 redirect)
        $response->assertStatus(302);
    }

    public function test_projects_index_rejects_array_tag_parameter(): void
    {
        $response = $this->get('/projects?tag[]=foo&tag[]=bar');

        // Should return validation error
        $response->assertStatus(302);
    }

    public function test_projects_index_handles_special_characters_in_tag(): void
    {
        $author = User::factory()->create();

        Project::factory()->create([
            'title' => 'Test Project',
            'status' => 'published',
            'tags' => ['Laravel', '<script>alert("xss")</script>'],
            'author_id' => $author->id,
        ]);

        // Try to filter by malicious tag
        $response = $this->get('/projects?tag=' . urlencode('<script>alert("xss")</script>'));

        $response->assertOk();
        // The tag is just a string - it won't execute
        $response->assertInertia(
            fn(AssertableInertia $page) =>
            $page->component('Projects/Index')
                ->where('selectedTag', '<script>alert("xss")</script>')
        );
    }
}
