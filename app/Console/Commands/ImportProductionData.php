<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Models\Post;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportProductionData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:production-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import projects and posts from JSON export files to production database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('╔════════════════════════════════════════════════════════════╗');
        $this->info('║  Import Production Data from JSON Exports                ║');
        $this->info('╚════════════════════════════════════════════════════════════╝');
        $this->newLine();

        // Check if export files exist
        $projectsFile = storage_path('exports/projects.json');
        $postsFile = storage_path('exports/posts.json');

        if (!file_exists($projectsFile)) {
            $this->error("Projects export file not found: {$projectsFile}");
            $this->info("Please upload the export files to storage/exports/ directory.");
            return 1;
        }

        if (!file_exists($postsFile)) {
            $this->error("Posts export file not found: {$postsFile}");
            $this->info("Please upload the export files to storage/exports/ directory.");
            return 1;
        }

        // Import projects
        $this->info('Importing projects...');
        $projectsImported = $this->importProjects($projectsFile);
        $this->newLine();

        // Import posts
        $this->info('Importing posts...');
        $postsImported = $this->importPosts($postsFile);
        $this->newLine();

        // Summary
        $this->info('╔════════════════════════════════════════════════════════════╗');
        $this->info('║  ✓ Import Complete                                        ║');
        $this->info('╚════════════════════════════════════════════════════════════╝');
        $this->newLine();

        $this->info("Total imported:");
        $this->info("  Projects: {$projectsImported['created']} created, {$projectsImported['skipped']} skipped");
        $this->info("  Posts: {$postsImported['created']} created, {$postsImported['skipped']} skipped");
        $this->newLine();

        return 0;
    }

    /**
     * Import projects from JSON file
     */
    private function importProjects(string $filePath): array
    {
        $json = file_get_contents($filePath);
        $projects = json_decode($json, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error('Error decoding projects JSON: ' . json_last_error_msg());
            return ['created' => 0, 'skipped' => 0];
        }

        $created = 0;
        $skipped = 0;

        foreach ($projects as $projectData) {
            // Check if project already exists by slug
            if (Project::where('slug', $projectData['slug'])->exists()) {
                $this->warn("  Skipped (already exists): {$projectData['title']}");
                $skipped++;
                continue;
            }

            try {
                Project::create([
                    'title' => $projectData['title'],
                    'slug' => $projectData['slug'],
                    'description' => $projectData['description'],
                    'excerpt' => $projectData['excerpt'] ?? null,
                    'tags' => $projectData['tags'] ?? null,
                    'read_time' => $projectData['read_time'] ?? null,
                    'created_at' => $projectData['created_at'],
                    'updated_at' => $projectData['updated_at'],
                ]);

                $this->info("  ✓ Created: {$projectData['title']}");
                $created++;

            } catch (\Exception $e) {
                $this->error("  ✗ Error creating '{$projectData['title']}': {$e->getMessage()}");
                $skipped++;
            }
        }

        return ['created' => $created, 'skipped' => $skipped];
    }

    /**
     * Import posts from JSON file
     */
    private function importPosts(string $filePath): array
    {
        $json = file_get_contents($filePath);
        $posts = json_decode($json, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error('Error decoding posts JSON: ' . json_last_error_msg());
            return ['created' => 0, 'skipped' => 0];
        }

        $created = 0;
        $skipped = 0;

        foreach ($posts as $postData) {
            // Check if post already exists by slug
            if (Post::where('slug', $postData['slug'])->exists()) {
                $this->warn("  Skipped (already exists): {$postData['title']}");
                $skipped++;
                continue;
            }

            try {
                Post::create([
                    'title' => $postData['title'],
                    'slug' => $postData['slug'],
                    'description' => $postData['description'],
                    'format' => $postData['format'] ?? 'plaintext',
                    'excerpt' => $postData['excerpt'] ?? null,
                    'status' => $postData['status'] ?? 'published',
                    'published_at' => $postData['published_at'],
                    'author_id' => $postData['author_id'] ?? 1, // Default to user ID 1 on production
                    'cover_image' => $postData['cover_image'] ?? null,
                    'tags' => $postData['tags'] ?? null,
                    'meta_title' => $postData['meta_title'] ?? null,
                    'meta_description' => $postData['meta_description'] ?? null,
                    'is_featured' => $postData['is_featured'] ?? false,
                    'created_at' => $postData['created_at'],
                    'updated_at' => $postData['updated_at'],
                ]);

                $this->info("  ✓ Created: {$postData['title']}");
                $created++;

            } catch (\Exception $e) {
                $this->error("  ✗ Error creating '{$postData['title']}': {$e->getMessage()}");
                $skipped++;
            }
        }

        return ['created' => $created, 'skipped' => $skipped];
    }
}
