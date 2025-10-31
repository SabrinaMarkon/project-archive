<?php

namespace App\Console\Commands;

use App\Models\Project;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ImportProjectsCommand extends Command
{
    protected $signature = 'import:projects {file?}';
    protected $description = 'Import projects from a JSON file';

    public function handle()
    {
        $filePath = $this->argument('file') ?? storage_path('app/projects-import.json');

        if (!file_exists($filePath)) {
            $this->error("File not found: {$filePath}");
            $this->info("Please create a JSON file at: {$filePath}");
            $this->info("Format: [{\"title\": \"Project Name\", \"description\": \"...\", \"tags\": [\"tag1\", \"tag2\"]}]");
            return 1;
        }

        $data = json_decode(file_get_contents($filePath), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error('Invalid JSON format: ' . json_last_error_msg());
            return 1;
        }

        $this->info('Importing ' . count($data) . ' projects...');
        $bar = $this->output->createProgressBar(count($data));

        $imported = 0;
        $skipped = 0;

        foreach ($data as $item) {
            $slug = isset($item['slug']) ? $item['slug'] : Str::slug($item['title']);

            // Check if project already exists
            if (Project::where('slug', $slug)->exists()) {
                $skipped++;
                $bar->advance();
                continue;
            }

            Project::create([
                'title' => $item['title'],
                'slug' => $slug,
                'description' => $item['description'] ?? null,
                'tags' => $item['tags'] ?? [],
            ]);

            $imported++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("✓ Imported: {$imported} projects");
        if ($skipped > 0) {
            $this->warn("⊗ Skipped: {$skipped} projects (already exist)");
        }

        return 0;
    }
}
