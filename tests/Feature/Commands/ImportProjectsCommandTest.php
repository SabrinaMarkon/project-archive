<?php

namespace Tests\Feature\Commands;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImportProjectsCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    public function test_import_command_imports_projects_from_default_file(): void
    {
        $jsonData = [
            [
                'title' => 'First Project',
                'slug' => 'first-project',
                'description' => 'This is the first project description.',
                'tags' => ['Laravel', 'PHP'],
            ],
            [
                'title' => 'Second Project',
                'slug' => 'second-project',
                'description' => 'This is the second project description.',
                'tags' => ['React', 'TypeScript'],
            ],
        ];

        $filePath = storage_path('app/projects-import.json');
        file_put_contents($filePath, json_encode($jsonData));

        $this->artisan('import:projects')
            ->expectsOutput('Importing 2 projects...')
            ->expectsOutput('✓ Imported: 2 projects')
            ->assertExitCode(0);

        $this->assertDatabaseHas('projects', [
            'title' => 'First Project',
            'slug' => 'first-project',
        ]);

        $this->assertDatabaseHas('projects', [
            'title' => 'Second Project',
            'slug' => 'second-project',
        ]);

        // Cleanup
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }

    public function test_import_command_imports_from_custom_file(): void
    {
        $jsonData = [
            [
                'title' => 'Custom Project',
                'slug' => 'custom-project',
                'description' => 'Custom project description.',
                'tags' => ['Vue'],
            ],
        ];

        $filePath = storage_path('app/custom-import.json');
        file_put_contents($filePath, json_encode($jsonData));

        $this->artisan('import:projects', ['file' => $filePath])
            ->expectsOutput('Importing 1 projects...')
            ->expectsOutput('✓ Imported: 1 projects')
            ->assertExitCode(0);

        $this->assertDatabaseHas('projects', [
            'title' => 'Custom Project',
            'slug' => 'custom-project',
        ]);

        // Cleanup
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }

    public function test_import_command_auto_generates_slug_when_missing(): void
    {
        $jsonData = [
            [
                'title' => 'Project Without Slug',
                'description' => 'This project has no slug.',
                'tags' => [],
            ],
        ];

        $filePath = storage_path('app/projects-import.json');
        file_put_contents($filePath, json_encode($jsonData));

        $this->artisan('import:projects')
            ->assertExitCode(0);

        $this->assertDatabaseHas('projects', [
            'title' => 'Project Without Slug',
            'slug' => 'project-without-slug',
        ]);

        // Cleanup
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }

    public function test_import_command_skips_duplicate_slugs(): void
    {
        // Create existing project
        Project::create([
            'title' => 'Existing Project',
            'slug' => 'duplicate-slug',
            'description' => 'Already exists',
            'tags' => [],
        ]);

        $jsonData = [
            [
                'title' => 'New Project',
                'slug' => 'new-slug',
                'description' => 'This should be imported.',
                'tags' => [],
            ],
            [
                'title' => 'Duplicate Project',
                'slug' => 'duplicate-slug',
                'description' => 'This should be skipped.',
                'tags' => [],
            ],
        ];

        $filePath = storage_path('app/projects-import.json');
        file_put_contents($filePath, json_encode($jsonData));

        $this->artisan('import:projects')
            ->expectsOutput('Importing 2 projects...')
            ->expectsOutput('✓ Imported: 1 projects')
            ->expectsOutput('⊗ Skipped: 1 projects (already exist)')
            ->assertExitCode(0);

        $this->assertDatabaseHas('projects', [
            'slug' => 'new-slug',
        ]);

        // Verify the duplicate wasn't overwritten
        $this->assertDatabaseHas('projects', [
            'slug' => 'duplicate-slug',
            'description' => 'Already exists',
        ]);

        // Verify only one project with duplicate-slug exists
        $this->assertEquals(1, Project::where('slug', 'duplicate-slug')->count());

        // Cleanup
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }

    public function test_import_command_handles_tags_correctly(): void
    {
        $jsonData = [
            [
                'title' => 'Project with Tags',
                'slug' => 'project-with-tags',
                'description' => 'Has multiple tags.',
                'tags' => ['Laravel', 'React', 'TypeScript'],
            ],
        ];

        $filePath = storage_path('app/projects-import.json');
        file_put_contents($filePath, json_encode($jsonData));

        $this->artisan('import:projects')
            ->assertExitCode(0);

        $project = Project::where('slug', 'project-with-tags')->first();
        $this->assertNotNull($project);
        $this->assertEquals(['Laravel', 'React', 'TypeScript'], $project->tags);

        // Cleanup
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }

    public function test_import_command_handles_project_without_tags(): void
    {
        $jsonData = [
            [
                'title' => 'Project without Tags',
                'slug' => 'project-no-tags',
                'description' => 'No tags provided.',
            ],
        ];

        $filePath = storage_path('app/projects-import.json');
        file_put_contents($filePath, json_encode($jsonData));

        $this->artisan('import:projects')
            ->assertExitCode(0);

        $project = Project::where('slug', 'project-no-tags')->first();
        $this->assertNotNull($project);
        $this->assertEquals([], $project->tags);

        // Cleanup
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }

    public function test_import_command_fails_when_file_not_found(): void
    {
        $this->artisan('import:projects', ['file' => storage_path('app/nonexistent.json')])
            ->expectsOutput('File not found: ' . storage_path('app/nonexistent.json'))
            ->assertExitCode(1);
    }

    public function test_import_command_fails_with_invalid_json(): void
    {
        $filePath = storage_path('app/invalid.json');
        file_put_contents($filePath, 'invalid json content {]');

        $this->artisan('import:projects', ['file' => $filePath])
            ->assertExitCode(1);

        // Cleanup
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }

    public function test_import_command_displays_progress(): void
    {
        $jsonData = [
            ['title' => 'Project 1', 'slug' => 'project-1'],
            ['title' => 'Project 2', 'slug' => 'project-2'],
            ['title' => 'Project 3', 'slug' => 'project-3'],
        ];

        $filePath = storage_path('app/projects-import.json');
        file_put_contents($filePath, json_encode($jsonData));

        $this->artisan('import:projects')
            ->expectsOutput('Importing 3 projects...')
            ->expectsOutput('✓ Imported: 3 projects')
            ->assertExitCode(0);

        // Cleanup
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }
}
