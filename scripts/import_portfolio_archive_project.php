#!/usr/bin/env php
<?php

/**
 * Import Portfolio Archive Project
 *
 * This script imports the portfolio archive project itself into the database.
 * This is the "meta" project - documenting the very system that displays projects.
 *
 * Run with: php scripts/import_portfolio_archive_project.php
 *
 * Author: Sabrina Markon
 * Date: November 2025
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Project;

echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║  Import Portfolio Archive Project                         ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

// Read the project summary
$summaryFile = storage_path('app/ProjectSummary_PortfolioArchive.md');

if (!file_exists($summaryFile)) {
    echo "❌ Project summary file not found: {$summaryFile}\n";
    exit(1);
}

$content = file_get_contents($summaryFile);

echo "Reading project summary from: storage/app/ProjectSummary_PortfolioArchive.md\n";
echo "Content length: " . strlen($content) . " characters\n\n";

// Parse the markdown to extract title, excerpt, description, and tags
preg_match('/# Project Summary: (.+)/', $content, $titleMatch);
preg_match('/## Excerpt\s+(.+?)(?=\n##)/s', $content, $excerptMatch);
preg_match('/## Tags\s+(.+?)(?=\n##|\n---|$)/s', $content, $tagsMatch);

$title = $titleMatch[1] ?? 'Sabrina Markon - Portfolio & Project Archive';
$excerpt = trim($excerptMatch[1] ?? '');
$tagsString = $tagsMatch[1] ?? '';

// Parse tags from comma-separated string
$tags = array_map('trim', explode(',', $tagsString));
$tags = array_filter($tags); // Remove empty values

// Generate slug
$slug = 'portfolio-archive';

// Use everything after the excerpt as the description
preg_match('/## Excerpt.+?## About This Project(.+)/s', $content, $descMatch);
$description = "## About This Project" . ($descMatch[1] ?? '');

// Check if project already exists
$existing = Project::where('slug', $slug)->first();

if ($existing) {
    echo "⚠️  Project already exists with slug: {$slug}\n";
    echo "   Updating existing project...\n\n";

    $existing->update([
        'title' => $title,
        'description' => trim($description),
        'excerpt' => $excerpt,
        'tags' => $tags,
        'read_time' => '15 min read',
    ]);

    echo "╔════════════════════════════════════════════════════════════╗\n";
    echo "║  ✓ Successfully Updated Project                           ║\n";
    echo "╚════════════════════════════════════════════════════════════╝\n\n";
} else {
    // Create new project
    Project::create([
        'title' => $title,
        'slug' => $slug,
        'description' => trim($description),
        'excerpt' => $excerpt,
        'tags' => $tags,
        'read_time' => '15 min read',
    ]);

    echo "╔════════════════════════════════════════════════════════════╗\n";
    echo "║  ✓ Successfully Created Project                           ║\n";
    echo "╚════════════════════════════════════════════════════════════╝\n\n";
}

echo "Project Details:\n";
echo "  Title: {$title}\n";
echo "  Slug: {$slug}\n";
echo "  Excerpt: " . substr($excerpt, 0, 100) . "...\n";
echo "  Tags: " . count($tags) . " tags\n";
echo "  Description length: " . strlen($description) . " characters\n\n";

echo "View at: http://localhost:8000/projects/{$slug}\n\n";
