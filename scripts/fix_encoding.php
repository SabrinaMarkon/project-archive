#!/usr/bin/env php
<?php

/**
 * Fix UTF-8 encoding issues in projects table
 *
 * This script cleans up invalid UTF-8 characters that may have been
 * introduced during docx import, ensuring all data can be JSON encoded.
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Project;

function cleanUtf8($string) {
    if (!is_string($string)) {
        return $string;
    }

    // Remove any invalid UTF-8 sequences
    $string = mb_convert_encoding($string, 'UTF-8', 'UTF-8');

    // Remove Unicode replacement characters (�)
    $string = str_replace("\xEF\xBF\xBD", '', $string);

    // Remove any remaining non-printable characters except newlines/tabs
    $string = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $string);

    return $string;
}

echo "Scanning projects for encoding issues...\n\n";

$projects = Project::all();
$fixed = 0;
$errors = [];

foreach ($projects as $project) {
    $changed = false;
    $originalTitle = $project->title;

    // Test if current data can be JSON encoded
    $testData = [
        'title' => $project->title,
        'description' => $project->description,
        'excerpt' => $project->excerpt,
    ];

    if (json_encode($testData) === false) {
        echo "⚠ Found encoding issue in project #{$project->id}: {$project->title}\n";
        echo "  JSON Error: " . json_last_error_msg() . "\n";

        // Clean all text fields
        $project->title = cleanUtf8($project->title);
        $project->slug = cleanUtf8($project->slug);
        $project->description = cleanUtf8($project->description);
        $project->excerpt = cleanUtf8($project->excerpt);

        $changed = true;
    } else {
        // Also clean if we find replacement characters
        if (strpos($project->title, '�') !== false ||
            strpos($project->description, '�') !== false ||
            strpos($project->excerpt ?? '', '�') !== false) {

            echo "⚠ Found replacement character in project #{$project->id}: {$project->title}\n";

            $project->title = cleanUtf8($project->title);
            $project->slug = cleanUtf8($project->slug);
            $project->description = cleanUtf8($project->description);
            $project->excerpt = cleanUtf8($project->excerpt);

            $changed = true;
        }
    }

    if ($changed) {
        try {
            $project->save();
            echo "  ✓ Fixed: {$originalTitle} → {$project->title}\n\n";
            $fixed++;
        } catch (\Exception $e) {
            echo "  ✗ Error saving: " . $e->getMessage() . "\n\n";
            $errors[] = "Project #{$project->id}: " . $e->getMessage();
        }
    }
}

echo str_repeat('=', 50) . "\n";
echo "Cleanup complete!\n";
echo "Projects scanned: " . $projects->count() . "\n";
echo "Projects fixed: {$fixed}\n";

if (count($errors) > 0) {
    echo "\nErrors encountered:\n";
    foreach ($errors as $error) {
        echo "  - {$error}\n";
    }
}

echo str_repeat('=', 50) . "\n";
