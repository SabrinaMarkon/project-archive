#!/usr/bin/env php
<?php

/**
 * COMPREHENSIVE UTF-8 ENCODING FIXER
 *
 * Purpose: This script fixes UTF-8 encoding issues that occur when importing
 * content from Word documents into the database.
 *
 * The Problem:
 * Word documents use Windows-1252 encoding (Microsoft's character set) which
 * includes special characters that don't translate properly to UTF-8 (the
 * character encoding used by web applications and databases).
 *
 * When Laravel/Inertia tries to convert project data to JSON (to send to React),
 * it encounters these malformed UTF-8 characters and throws an error:
 * "Malformed UTF-8 characters, possibly incorrectly encoded"
 *
 * What This Script Fixes:
 * 1. Smart quotes (curly quotes: " " ' ')
 * 2. En/em dashes (longer dashes: – —)
 * 3. Non-breaking spaces (invisible!)
 * 4. Fancy bullets and ellipses
 * 5. Replacement characters (�)
 * 6. Other non-printable control characters
 *
 * Run with: php scripts/fix_utf8_encoding_comprehensive.php
 *
 * Author: Sabrina Markon
 * Date: November 2025
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Project;

/**
 * Clean and normalize UTF-8 text
 *
 * This function applies multiple cleaning strategies:
 * 1. Re-encode to remove invalid UTF-8 sequences
 * 2. Replace Windows-1252 special characters with web-safe equivalents
 * 3. Remove Unicode replacement characters (�)
 * 4. Remove non-printable control characters
 *
 * @param string|null $text The text to clean
 * @return string|null The cleaned text
 */
function cleanUtf8($text) {
    // Handle null or empty values
    if (empty($text)) {
        return $text;
    }

    // ========================================================================
    // STEP 1: RE-ENCODE TO REMOVE INVALID UTF-8 SEQUENCES
    // ========================================================================
    // mb_convert_encoding with same source and target encoding
    // has the effect of removing invalid byte sequences
    $text = mb_convert_encoding($text, 'UTF-8', 'UTF-8');


    // ========================================================================
    // STEP 2: REPLACE WINDOWS-1252 SPECIAL CHARACTERS
    // ========================================================================
    // These are the hex codes for special characters that Word uses
    // We replace them with web-safe ASCII equivalents

    $windowsCharacters = [
        "\xC2\xA0",      // Non-breaking space (invisible but causes issues)
        "\xE2\x80\x93",  // En dash (–)
        "\xE2\x80\x94",  // Em dash (—)
        "\xE2\x80\x98",  // Left single quote (')
        "\xE2\x80\x99",  // Right single quote (')
        "\xE2\x80\x9C",  // Left double quote (")
        "\xE2\x80\x9D",  // Right double quote (")
        "\xE2\x80\xA2",  // Bullet (•)
        "\xE2\x80\xA6",  // Ellipsis (…)
        "\xEF\xBF\xBD",  // Unicode replacement character (�)
    ];

    $replacements = [
        ' ',             // Regular space
        '-',             // Regular hyphen
        '-',             // Regular hyphen
        "'",             // Regular single quote
        "'",             // Regular single quote
        '"',             // Regular double quote
        '"',             // Regular double quote
        '•',             // Keep bullet (it's valid UTF-8)
        '...',           // Three dots
        '',              // Remove replacement character
    ];

    $text = str_replace($windowsCharacters, $replacements, $text);


    // ========================================================================
    // STEP 3: REMOVE NON-PRINTABLE CONTROL CHARACTERS
    // ========================================================================
    // Control characters (ASCII 0-31 and 127) can cause parsing issues
    // We keep: \n (10), \t (9), \r (13) because they're used for formatting
    //
    // Pattern explanation: /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u
    // [\x00-\x08]    = ASCII 0-8 (null, bell, backspace, etc.)
    // \x0B           = Vertical tab
    // \x0C           = Form feed
    // [\x0E-\x1F]    = ASCII 14-31 (shift out, escape, etc.)
    // \x7F           = Delete character
    // /u             = Unicode mode (important for UTF-8)
    //
    // Note: We SKIP \x09 (tab), \x0A (newline), \x0D (carriage return)
    $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $text);


    // ========================================================================
    // STEP 4: FINAL UTF-8 VALIDATION
    // ========================================================================
    // If the text is STILL not valid UTF-8 after all the above,
    // use iconv to force conversion and strip invalid characters
    if (!mb_check_encoding($text, 'UTF-8')) {
        // iconv with //IGNORE flag will skip invalid sequences
        $text = iconv('UTF-8', 'UTF-8//IGNORE', $text);
    }

    return $text;
}


/**
 * Test if data can be JSON encoded
 *
 * This is important because Inertia.js needs to JSON encode data
 * to send from Laravel (backend) to React (frontend).
 *
 * @param array $data The data to test
 * @return bool True if JSON encodable, false otherwise
 */
function canJsonEncode($data) {
    $result = json_encode($data);

    // json_encode returns false if encoding fails
    return $result !== false;
}


// ========================================================================
// MAIN EXECUTION
// ========================================================================

echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║  UTF-8 Encoding Cleaner                                    ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

// Retrieve all projects from the database
$projects = Project::all();

echo "Scanning {$projects->count()} projects for encoding issues...\n\n";

$fixed = 0;
$errors = [];

foreach ($projects as $project) {
    $needsUpdate = false;
    $originalTitle = $project->title;

    // ========================================================================
    // TEST 1: Check if data can be JSON encoded
    // ========================================================================
    // This is the ultimate test - if JSON encoding fails, we MUST fix it
    $testData = [
        'title' => $project->title,
        'description' => $project->description,
        'excerpt' => $project->excerpt,
        'slug' => $project->slug,
    ];

    if (!canJsonEncode($testData)) {
        echo "⚠  Found JSON encoding issue in: {$project->title}\n";
        echo "   Error: " . json_last_error_msg() . "\n";
        $needsUpdate = true;
    }

    // ========================================================================
    // TEST 2: Check for visible replacement characters (�)
    // ========================================================================
    // These show up when encoding fails - they're a red flag
    elseif (
        strpos($project->title, '�') !== false ||
        strpos($project->description ?? '', '�') !== false ||
        strpos($project->excerpt ?? '', '�') !== false
    ) {
        echo "⚠  Found replacement character (�) in: {$project->title}\n";
        $needsUpdate = true;
    }

    // ========================================================================
    // APPLY CLEANING IF NEEDED
    // ========================================================================
    if ($needsUpdate) {
        // Clean all text fields
        $project->title = cleanUtf8($project->title);
        $project->slug = cleanUtf8($project->slug);
        $project->description = cleanUtf8($project->description);
        $project->excerpt = cleanUtf8($project->excerpt);

        // Attempt to save
        try {
            $project->save();
            echo "   ✓ Fixed and saved: {$originalTitle}\n\n";
            $fixed++;
        } catch (\Exception $e) {
            echo "   ✗ Error saving: " . $e->getMessage() . "\n\n";
            $errors[] = "Project #{$project->id} ({$originalTitle}): " . $e->getMessage();
        }
    }
}

// ========================================================================
// SUMMARY REPORT
// ========================================================================

echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║  Cleanup Complete                                          ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

echo "Projects scanned: {$projects->count()}\n";
echo "Projects fixed: {$fixed}\n";

if (count($errors) > 0) {
    echo "\n⚠  Errors encountered:\n";
    foreach ($errors as $error) {
        echo "   - {$error}\n";
    }
} else {
    echo "\n✓ All projects can now be JSON encoded successfully!\n";
}

echo "\n";


/**
 * KEY TECHNIQUES USED IN THIS SCRIPT:
 *
 * 1. CHARACTER ENCODING
 *    - mb_convert_encoding() - Multi-byte safe encoding conversion
 *    - mb_check_encoding() - Verify string is valid UTF-8
 *    - iconv() - Character set conversion with error handling
 *
 * 2. HEX BYTE SEQUENCES
 *    - "\xC2\xA0" - Non-breaking space in UTF-8
 *    - "\xE2\x80\x93" - En dash in UTF-8
 *    - Each special character has a unique byte sequence
 *
 * 3. CONTROL CHARACTER REMOVAL
 *    - ASCII 0-31 are control characters (not printable)
 *    - We keep tabs, newlines, carriage returns
 *    - Remove everything else to prevent parsing issues
 *
 * 4. JSON ENCODING TEST
 *    - json_encode() returns false if data has encoding issues
 *    - json_last_error_msg() tells us what went wrong
 *    - Critical for Inertia.js data passing
 *
 * 5. ERROR HANDLING
 *    - Try/catch around database saves
 *    - Collect errors for summary report
 *    - Don't stop on first error (process all records)
 *
 * LEARNING RESOURCES:
 * - UTF-8 encoding: https://www.php.net/manual/en/book.mbstring.php
 * - Character codes: https://www.ascii-code.com/
 * - JSON encoding: https://www.php.net/manual/en/function.json-encode.php
 */
