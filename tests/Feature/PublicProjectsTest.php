<?php

namespace Tests\Feature;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class PublicProjectsTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_projects_index_displays_project_list(): void
    {
        $projects = Project::factory()->count(3)->create();

        $response = $this->get('/projects');

        $response->assertStatus(200);
        foreach ($projects as $project) {
            $response->assertSee($project->title);
        }
    }
}
