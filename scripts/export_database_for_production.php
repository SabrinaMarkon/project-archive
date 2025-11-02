#!/usr/bin/env php
<?php

/**
 * Export Database Data for Production Deployment
 *
 * This script exports projects and posts from the local database
 * to JSON files that can be imported on the production server.
 *
 * Run with: php scripts/export_database_for_production.php
 *
 * Author: Sabrina Markon
 * Date: November 2025
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Project;
use App\Models\Post;

echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║  Export Database Data for Production                      ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

// Create exports directory if it doesn't exist
$exportDir = __DIR__ . '/../storage/exports';
if (!file_exists($exportDir)) {
    mkdir($exportDir, 0755, true);
    echo "Created exports directory: storage/exports\n\n";
}

// ========================================================================
// EXPORT PROJECTS
// ========================================================================

echo "Exporting projects...\n";

$projects = Project::all();
$projectsData = $projects->map(function ($project) {
    return [
        'title' => $project->title,
        'slug' => $project->slug,
        'description' => $project->description,
        'excerpt' => $project->excerpt,
        'tags' => $project->tags,
        'read_time' => $project->read_time ?? null,
        'created_at' => $project->created_at->toDateTimeString(),
        'updated_at' => $project->updated_at->toDateTimeString(),
    ];
})->toArray();

$projectsFile = $exportDir . '/projects.json';
file_put_contents($projectsFile, json_encode($projectsData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo "  ✓ Exported {$projects->count()} projects\n";
echo "  → File: storage/exports/projects.json\n\n";


// ========================================================================
// EXPORT POSTS
// ========================================================================

echo "Exporting posts...\n";

$posts = Post::all();
$postsData = $posts->map(function ($post) {
    return [
        'title' => $post->title,
        'slug' => $post->slug,
        'description' => $post->description,
        'format' => $post->format,
        'excerpt' => $post->excerpt,
        'status' => $post->status,
        'published_at' => $post->published_at ? $post->published_at->toDateTimeString() : null,
        'author_id' => $post->author_id ?? 1, // Default to user ID 1 on production
        'cover_image' => $post->cover_image,
        'tags' => $post->tags,
        'meta_title' => $post->meta_title,
        'meta_description' => $post->meta_description,
        'is_featured' => $post->is_featured,
        'created_at' => $post->created_at->toDateTimeString(),
        'updated_at' => $post->updated_at->toDateTimeString(),
    ];
})->toArray();

$postsFile = $exportDir . '/posts.json';
file_put_contents($postsFile, json_encode($postsData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo "  ✓ Exported {$posts->count()} posts\n";
echo "  → File: storage/exports/posts.json\n\n";


// ========================================================================
// SUMMARY
// ========================================================================

echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║  ✓ Export Complete                                        ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

echo "Exported Files:\n";
echo "  1. storage/exports/projects.json ({$projects->count()} projects)\n";
echo "  2. storage/exports/posts.json ({$posts->count()} posts)\n\n";

echo "Next Steps:\n";
echo "  1. Upload these files to your Forge server\n";
echo "  2. Run the import script on production:\n";
echo "     php artisan import:production-data\n\n";

echo "File sizes:\n";
echo "  Projects: " . round(filesize($projectsFile) / 1024, 2) . " KB\n";
echo "  Posts: " . round(filesize($postsFile) / 1024, 2) . " KB\n\n";
