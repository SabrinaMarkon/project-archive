<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminProjectsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_user_can_create_a_project(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->post('/admin/projects', [
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
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->get('/admin/projects/create');
    
        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Projects/Create')
        );
    }
}
