<?php
// Claude Code automated this fix:
/**
> Can you also explain what this means more (the problem with the import etc. that you just fixed) 

● Great! Let me explain the UTF-8 encoding issue and then verify the admin page works:

● What Was the UTF-8 Problem? 🔍

  The Issue:
  When you imported the projects from the Word documents, some special characters didn't translate properly to UTF-8 (the character encoding used by web applications and databases).

  What Happened:
  - Word documents often use Windows-1252 encoding (Microsoft's character set)
  - This includes special characters like:
    - Smart quotes: " " ' ' (curly quotes)
    - En/em dashes: – — (longer dashes)
    - Non-breaking spaces (invisible!)
    - Fancy bullets and ellipses

  The Error:
  When Laravel/Inertia tried to convert your project data to JSON (to send to React), it encountered these malformed UTF-8 characters and threw the error: Malformed UTF-8 characters, 
  possibly incorrectly encoded

  What I Fixed:
  The fix_utf8_encoding.php script:
  1. Detected invalid UTF-8 sequences
  2. Replaced fancy characters with web-safe equivalents:
    - Smart quotes → regular quotes " '
    - Em/en dashes → regular hyphens -
    - Non-breaking spaces → regular spaces
  3. Removed any non-printable characters
  4. Re-validated all text as proper UTF-8

  5 projects were affected:
  - MLM Doubler Matrix
  - MLM Multi-Phase Follow-the-Sponsor Matrix
  - NASA Mars Photos React App
  - NASA Meteorite Explorer (React)
  - JavaScript Splash Page Maker
*/

// This script fixes UTF-8 encoding issues in project data
// Run with: php scripts/fix_utf8_encoding.php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Project;

function cleanUtf8($text) {
    if (empty($text)) {
        return $text;
    }

    // Remove any invalid UTF-8 characters
    $text = mb_convert_encoding($text, 'UTF-8', 'UTF-8');

    // Replace common problematic characters
    $text = str_replace([
        "\xC2\xA0",  // Non-breaking space
        "\xE2\x80\x93", // En dash
        "\xE2\x80\x94", // Em dash
        "\xE2\x80\x98", // Left single quote
        "\xE2\x80\x99", // Right single quote
        "\xE2\x80\x9C", // Left double quote
        "\xE2\x80\x9D", // Right double quote
        "\xE2\x80\xA2", // Bullet
        "\xE2\x80\xA6", // Ellipsis
    ], [
        ' ',      // Regular space
        '-',      // Regular hyphen
        '-',      // Regular hyphen
        "'",      // Regular single quote
        "'",      // Regular single quote
        '"',      // Regular double quote
        '"',      // Regular double quote
        '•',      // Keep bullet as is (it's valid UTF-8)
        '...',    // Three dots
    ], $text);

    // Remove any remaining non-printable characters except newlines and tabs
    $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $text);

    // Ensure valid UTF-8
    if (!mb_check_encoding($text, 'UTF-8')) {
        // If still invalid, force conversion
        $text = iconv('UTF-8', 'UTF-8//IGNORE', $text);
    }

    return $text;
}

echo "Cleaning UTF-8 encoding issues in projects...\n\n";

$projects = Project::all();
$fixed = 0;

foreach ($projects as $project) {
    $needsUpdate = false;

    echo "Checking: {$project->title}\n";

    // Clean title
    $cleanTitle = cleanUtf8($project->title);
    if ($cleanTitle !== $project->title) {
        echo "  ✓ Fixed title encoding\n";
        $project->title = $cleanTitle;
        $needsUpdate = true;
    }

    // Clean slug
    $cleanSlug = cleanUtf8($project->slug);
    if ($cleanSlug !== $project->slug) {
        echo "  ✓ Fixed slug encoding\n";
        $project->slug = $cleanSlug;
        $needsUpdate = true;
    }

    // Clean description
    if ($project->description) {
        $cleanDescription = cleanUtf8($project->description);
        if ($cleanDescription !== $project->description) {
            echo "  ✓ Fixed description encoding\n";
            $project->description = $cleanDescription;
            $needsUpdate = true;
        }
    }

    // Clean excerpt
    if ($project->excerpt) {
        $cleanExcerpt = cleanUtf8($project->excerpt);
        if ($cleanExcerpt !== $project->excerpt) {
            echo "  ✓ Fixed excerpt encoding\n";
            $project->excerpt = $cleanExcerpt;
            $needsUpdate = true;
        }
    }

    if ($needsUpdate) {
        $project->save();
        $fixed++;
        echo "  → Updated project\n";
    } else {
        echo "  ✓ No encoding issues found\n";
    }

    echo "\n";
}

echo "\nDone! Fixed {$fixed} projects with encoding issues.\n";
