#!/usr/bin/env php
<?php

/**
 * Update Git Rebase Post in Database
 *
 * This script updates the "What Git Rebase Means in Simple Terms" post
 * in the database with the latest content from the local markdown file.
 *
 * Run with: php scripts/update_git_rebase_post.php
 *
 * Author: Sabrina Markon
 * Date: November 2025
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Post;

echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║  Update Git Rebase Post from Markdown File                ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

// Find the post
$post = Post::where('slug', 'what-git-rebase-means-in-simple-terms')->first();

if (!$post) {
    echo "❌ Post not found: 'what-git-rebase-means-in-simple-terms'\n";
    echo "   Create the post first in the admin interface.\n";
    exit(1);
}

echo "Found post: {$post->title}\n\n";

// Read the updated content from the markdown file
$markdownPath = __DIR__ . '/../docs/git-rebase-explanation.md';

if (!file_exists($markdownPath)) {
    echo "❌ Markdown file not found: {$markdownPath}\n";
    exit(1);
}

$content = file_get_contents($markdownPath);

echo "Reading content from: docs/git-rebase-explanation.md\n";
echo "Content length: " . strlen($content) . " characters\n";
echo "Word count: " . str_word_count(strip_tags($content)) . " words\n\n";

// Update the post
$post->description = $content;
$post->format = 'markdown';
$post->excerpt = 'A practical guide to understanding git rebase with real-world examples of fixing divergent branches, including actual error messages and solutions.';

try {
    $post->save();

    echo "╔════════════════════════════════════════════════════════════╗\n";
    echo "║  ✓ Successfully Updated Post                              ║\n";
    echo "╚════════════════════════════════════════════════════════════╝\n\n";

    echo "Post Details:\n";
    echo "  Title: {$post->title}\n";
    echo "  Slug: {$post->slug}\n";
    echo "  Format: {$post->format}\n";
    echo "  Status: {$post->status}\n";
    echo "  Excerpt: {$post->excerpt}\n";
    echo "  Content length: " . strlen($post->description) . " characters\n";

} catch (\Exception $e) {
    echo "❌ Error updating post: " . $e->getMessage() . "\n";
    exit(1);
}
