<?php

/**
 * COMPREHENSIVE PROJECT DESCRIPTION FORMATTER & EXCERPT GENERATOR
 *
 * Purpose: This script fixes text formatting issues that occur when importing
 * content from Word documents and generates short excerpts for card displays.
 *
 * Problems it solves:
 * 1. Word documents use different character encoding than web (Windows-1252 vs UTF-8)
 * 2. Copy-paste from Word can break hyphenated words across lines (e.g., "full-stack")
 * 3. Copy-paste from Word can break possessives across lines (e.g., "referrer's")
 * 4. Bullet points run together without spacing
 * 5. Section headings don't have proper spacing
 * 6. Descriptions are too long for card previews (need excerpts)
 *
 * Run with: php scripts/fix_project_formatting_comprehensive.php
 *
 * Author: Sabrina Markon using Claude.ai assistance.
 * Date: November 2025
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Project;

/**
 * Format project descriptions with proper spacing and structure
 *
 * This function applies multiple formatting techniques to clean up text:
 * - Fixes broken hyphenated words from Word imports
 * - Fixes broken possessives (e.g., "referrer\n\n's" -> "referrer's")
 * - Adds spacing around section headings
 * - Formats bullet lists with proper spacing
 * - Cleans up excessive line breaks
 *
 * @param string $description The raw description text
 * @return string The formatted description
 */
function formatDescription($description) {

    // ========================================================================
    // STEP 1: FIX BROKEN WORDS FROM WORD DOCUMENT IMPORTS
    // ========================================================================
    // Problem: When importing from Word, various patterns can break across lines:
    // - Hyphenated words: "full-stack" becomes "full\n\n-stack"
    // - Possessives: "user's" becomes "user\n\n's"
    // - Other fragments can also break

    // Fix 1A: Broken hyphenated words (newlines + hyphen + letter)
    // Pattern explanation: /\n+\s*-\s*([a-z])/
    // \n+        = One or more newlines
    // \s*        = Optional whitespace
    // -          = Literal hyphen
    // \s*        = Optional whitespace
    // ([a-z])    = Lowercase letter (captured to preserve it)
    //
    // Replacement: -$1 (hyphen + the captured letter)
    $description = preg_replace('/\n+\s*-\s*([a-z])/', '-$1', $description);

    // Fix 1B: Broken hyphenated words (letter + newlines + hyphen + letter)
    // Example: "session\n\n-based" -> "session-based"
    $description = preg_replace('/([a-z])\s*\n+\s*-\s*([a-z])/', '$1-$2', $description);

    // Fix 1C: Broken possessives (IMPORTANT!)
    // Pattern: word + newlines + 's
    // Example: "referrer\n\n's" -> "referrer's"
    // Example: "sponsor\n\n's" -> "sponsor's"
    //
    // Pattern explanation: /([a-z])\s*\n+\s*\'s/
    // ([a-z])    = Lowercase letter (end of word)
    // \s*        = Optional whitespace
    // \n+        = One or more newlines
    // \s*        = Optional whitespace
    // \'         = Literal apostrophe (escaped)
    // s          = Literal 's'
    //
    // Replacement: $1's (the letter + possessive marker)
    $description = preg_replace('/([a-z])\s*\n+\s*\'s/', "$1's", $description);


    // ========================================================================
    // STEP 2: FORMAT SECTION HEADINGS
    // ========================================================================
    // Define common section headings that appear in project descriptions
    // These need double line breaks before and after for visual separation

    $headings = [
        'Key Features',
        'Technologies Used',
        'Modernization Recommendation',
        'Tech Stack',
        'Why This Project',
        'Future Enhancements',
        'Status',
        'Features Included',
        'Core Features',
        'Technical Highlights',
        'Core Functionality',
        'What I Built',
        'Technologies',
        'Features'
    ];

    // Add proper spacing around each heading
    foreach ($headings as $heading) {

        // Pattern 1: Heading after a sentence (ending with . ! or ?)
        // Example: "...and more.Key Features" -> "...and more.\n\nKey Features"
        //
        // preg_quote() escapes special regex characters in the heading
        // This is important if heading contains characters like parentheses
        $description = preg_replace(
            '/([.!?])\s*' . preg_quote($heading, '/') . '/',
            "$1\n\n" . $heading,
            $description
        );

        // Pattern 2: Heading followed by bullets
        // Example: "Key Features• First item" -> "Key Features\n\n• First item"
        $description = preg_replace(
            '/' . preg_quote($heading, '/') . '\s*([•-])/',
            $heading . "\n\n$1",
            $description
        );
    }


    // ========================================================================
    // STEP 3: FORMAT BULLET LISTS (v2 improvement - stateful approach)
    // ========================================================================
    // Problem: Bullet points often run together without spacing
    // Solution: Process line-by-line, tracking whether we're in a list

    // Split the entire description into individual lines
    $lines = explode("\n", $description);

    // Array to hold our formatted output
    $formatted = [];

    // State variable: are we currently inside a bullet list?
    // This lets us add spacing BEFORE the first bullet and AFTER the last bullet
    $inBulletList = false;

    // Process each line
    foreach ($lines as $line) {
        $trimmed = trim($line);

        // Check if this line is a bullet point
        // Pattern: /^[•-]\s/
        // ^        = Start of string
        // [•-]     = Either bullet character (•) or hyphen (-)
        // \s       = Followed by whitespace
        if (preg_match('/^[•-]\s/', $trimmed)) {

            // This IS a bullet point

            // If we weren't previously in a list, we're starting a new list
            // Add a blank line before it (unless we're at the very start)
            if (!$inBulletList && count($formatted) > 0 && !empty(end($formatted))) {
                $formatted[] = '';  // Add blank line
            }

            // Add the bullet point line
            $formatted[] = $trimmed;

            // Update state: we're now in a bullet list
            $inBulletList = true;

        } else {
            // This is NOT a bullet point (it's regular text or blank line)

            // If we WERE in a list and this line has content, the list just ended
            // Add spacing after the list
            if ($inBulletList && !empty($trimmed)) {
                $formatted[] = '';  // Add blank line after list
            }

            // Add the current line (preserving original spacing)
            $formatted[] = $line;

            // Update state: we're only "in a list" if this is a blank line
            // (blank lines between bullets are allowed)
            $inBulletList = !empty($trimmed) ? false : $inBulletList;
        }
    }

    // Rejoin all the lines back into a single string
    $description = implode("\n", $formatted);


    // ========================================================================
    // STEP 4: CLEAN UP EXCESSIVE LINE BREAKS
    // ========================================================================
    // Sometimes the above steps create 3+ consecutive line breaks
    // Limit to maximum of 2 (which creates one visible blank line)

    // Pattern: /\n{3,}/
    // \n{3,}   = 3 or more consecutive newlines
    // Replace with exactly 2 newlines
    $description = preg_replace("/\n{3,}/", "\n\n", $description);


    // ========================================================================
    // STEP 5: FINAL CLEANUP
    // ========================================================================
    // Remove any leading or trailing whitespace from the entire description
    return trim($description);
}


/**
 * Generate short excerpts for project cards
 *
 * Card views can't show full descriptions - they need 1-2 sentence summaries.
 * This function provides hand-crafted excerpts for each project.
 *
 * Why hand-crafted instead of auto-generated?
 * - Auto-generation often cuts mid-sentence
 * - First sentences aren't always the most compelling
 * - We want to highlight the INTERESTING parts
 *
 * @param string $title The project title
 * @param string $description The full description (fallback if no excerpt defined)
 * @return string A short excerpt (typically 100-150 characters)
 */
function generateExcerpt($title, $description) {

    // Hand-crafted excerpts emphasizing the most interesting aspects
    // Format: Focus on the "what" and "wow factor", not implementation details
    $excerpts = [
        'The Affordable Dreams Solutions' => 'A custom PHP platform for virtual real estate investment with member management, payment processing, and MLM tracking.',
        'Next.js Airbnb Clone' => 'Full-stack booking platform with authentication, property listings, image uploads, and reviews built with Next.js and Express.',
        'Autoresponder with Multiple Lists' => 'PHP-based email marketing system with multiple list management, campaign scheduling, and subscriber tracking.',
        'Admin-Only Autoresponder' => 'Streamlined autoresponder for solo entrepreneurs with campaign management and subscriber handling.',
        'Basic Membership Site Script' => 'PHP membership platform with user authentication, content protection, and payment integration.',
        'Membership CMS + Real-Time Chatroom' => 'Multi-featured membership site with built-in real-time chat powered by Node.js and Socket.io.',
        'Google Books Finder App' => 'React application using Google Books API to search and display book information with interactive UI.',
        'Guess the Language Game' => 'Educational browser game challenging players to identify programming languages from code snippets.',
        'WHMCS + WordPress Hosting Business' => 'Complete web hosting business integration combining WHMCS billing, WordPress CMS, and custom theme.',
        'JuniorArtists Membership Platform' => 'Niche membership community for young artists with galleries, forums, and content management.',
        'Laravel Banner Maker Website' => 'SaaS banner creation tool with drag-and-drop editor, template library, and user dashboard built in Laravel.',
        'Laravel React Dropzone Image Gallery' => 'Modern image gallery with drag-and-drop uploads using Laravel backend and React frontend.',
        'Laravel Splash Page Rotator' => 'Marketing tool for rotating splash pages with tracking, analytics, and campaign management.',
        'Laravel Support Ticket System' => 'Complete helpdesk solution with ticket management, user authentication, and email notifications.',
        'MLM Multi-Phase Company-Forced Matrix' => 'Advanced MLM system with company-forced matrix placement, multi-phase progression, and commission tracking.',
        'MLM Doubler Matrix' => 'Matrix-based MLM platform with automated doubling mechanics and member genealogy tracking.',
        'MLM Multi-Phase Follow-the-Sponsor Matrix' => 'Sponsor-driven MLM system with phase advancement, spillover management, and commission calculations.',
        'MLM Tripler Matrix' => 'Three-tier matrix compensation plan with automated placement and real-time earnings dashboard.',
        'Multi-Site Email Bounce Script' => 'Enterprise email management tool handling bounce processing across multiple domains and lists.',
        'NASA Mars Photos React App' => 'Interactive React app displaying Mars rover photos from NASA API with modal zoom and hover effects.',
        'NASA Meteorite Explorer (React)' => 'Data visualization app exploring NASA meteorite landing data with filtering and geolocation features.',
        'OysterSubmitter' => 'Automated article directory submission tool for SEO and content marketing campaigns.',
        'PHPSiteScripts.com' => 'E-commerce platform selling PHP scripts with product catalogs, downloads, and customer management.',
        'PearlsOfWealth.com' => 'Enterprise safelist advertising network managing 31+ sites with solo ads, credit systems, and banner exchanges.',
        'Prelaunch Signup Capture Site' => 'Viral marketing platform with referral tracking, prize tiers, and gamified pre-launch campaigns.',
        'RandomBTCAds Platform' => 'Bitcoin-powered advertising platform with randomized ad display and cryptocurrency payment integration.',
        'RoadToWealth.net' => 'Marketing funnel site promoting wealth-building opportunities with email capture and lead nurturing.',
        'Sadie\'s Viral Banners Plus' => 'Banner advertising network with viral sharing mechanics and commission-based promotion system.',
        'Safelist & Viral Mailer Advertising Platform' => 'Dual-purpose advertising platform combining safelist and viral mailer functionality with credit management.',
        'JavaScript Splash Page Maker' => 'Client-side splash page generator with customizable templates, countdown timers, and export features.',
        'TAE & Surf Enhanced v8.1' => 'Traffic exchange and surf advertising system with credit tracking, banner rotation, and member rewards.',
        'Website Ranking Script' => 'Competitive ranking platform with voting system, traffic tracking, and leaderboard displays.',
    ];

    // Return the hand-crafted excerpt if it exists
    // Otherwise, fall back to first 150 characters of description
    // strip_tags() removes any HTML that might be in the description
    return $excerpts[$title] ?? substr(strip_tags($description), 0, 150) . '...';
}


// ========================================================================
// MAIN EXECUTION
// ========================================================================

echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║  Project Description Formatter & Excerpt Generator         ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

// Retrieve all projects from the database
$projects = Project::all();

echo "Found {$projects->count()} projects to process.\n\n";

// Process each project
foreach ($projects as $project) {
    echo "Processing: {$project->title}\n";

    // Apply formatting to the description
    $formattedDescription = formatDescription($project->description);

    // Generate a short excerpt for card displays
    $excerpt = generateExcerpt($project->title, $formattedDescription);

    // Update the project in the database
    $project->description = $formattedDescription;
    $project->excerpt = $excerpt;
    $project->save();

    // Show progress
    echo "  ✓ Formatted description (" . strlen($formattedDescription) . " chars)\n";
    echo "  ✓ Generated excerpt: " . substr($excerpt, 0, 60) . "...\n\n";
}

echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║  ✓ Success! Processed {$projects->count()} projects       ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n";

/**
 * KEY TECHNIQUES USED IN THIS SCRIPT:
 *
 * 1. REGULAR EXPRESSIONS (preg_replace, preg_match)
 *    - Pattern matching to find and replace text
 *    - Captures groups with parentheses: ([a-z])
 *    - Backreferences to use captured text: $1, $2
 *    - preg_quote() to escape special characters
 *
 * 2. STATEFUL PROCESSING
 *    - Track state across iterations ($inBulletList)
 *    - Make decisions based on previous context
 *    - More powerful than pure regex for complex logic
 *
 * 3. LINE-BY-LINE PROCESSING
 *    - explode() to split into lines
 *    - Process each line individually
 *    - implode() to rejoin
 *    - Gives precise control over formatting
 *
 * 4. ELOQUENT ORM
 *    - Project::all() retrieves all records
 *    - $project->save() persists changes
 *    - Clean, readable database operations
 *
 * 5. ARRAY LOOKUP WITH FALLBACK
 *    - $array[$key] ?? $default
 *    - Null coalescing operator (??)
 *    - Prevents errors if key doesn't exist
 *
 * LEARNING RESOURCES:
 * - Regex: https://regex101.com/ (test patterns interactively)
 * - PHP String Functions: https://www.php.net/manual/en/ref.strings.php
 * - Laravel Eloquent: https://laravel.com/docs/eloquent
 */
