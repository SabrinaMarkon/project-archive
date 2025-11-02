<?php

// This script fixes project descriptions and generates excerpts
// Version 2: Fixes broken hyphenated words and applies better formatting
// Run with: php scripts/fix_project_formatting_v2.php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Project;

function formatDescription($description) {
    // First, fix broken hyphenated words (e.g., "full\n\n-stack" -> "full-stack")
    $description = preg_replace('/\n+\s*-\s*([a-z])/', '-$1', $description);

    // Remove extra line breaks around hyphens in compound words
    $description = preg_replace('/([a-z])\s*\n+\s*-\s*([a-z])/', '$1-$2', $description);

    // Define section headings to format
    $headings = [
        'Key Features', 'Technologies Used', 'Modernization Recommendation',
        'Tech Stack', 'Why This Project', 'Future Enhancements', 'Status',
        'Features Included', 'Core Features', 'Technical Highlights',
        'Core Functionality', 'What I Built', 'Technologies', 'Features'
    ];

    // Ensure headings have proper spacing
    foreach ($headings as $heading) {
        // If heading is preceded by a sentence, add double line break
        $description = preg_replace('/([.!?])\s*' . preg_quote($heading, '/') . '/', "$1\n\n" . $heading, $description);
        // If heading is followed by bullets or text, add line break after
        $description = preg_replace('/' . preg_quote($heading, '/') . '\s*([•-])/', $heading . "\n\n$1", $description);
    }

    // Ensure bullet points are properly formatted
    // Split into lines for processing
    $lines = explode("\n", $description);
    $formatted = [];
    $inBulletList = false;

    foreach ($lines as $line) {
        $trimmed = trim($line);

        // Check if this line is a bullet point
        if (preg_match('/^[•-]\s/', $trimmed)) {
            // If we weren't in a list, add spacing before
            if (!$inBulletList && count($formatted) > 0 && !empty(end($formatted))) {
                $formatted[] = '';
            }
            $formatted[] = $trimmed;
            $inBulletList = true;
        } else {
            // Not a bullet
            if ($inBulletList && !empty($trimmed)) {
                // Add spacing after bullet list
                $formatted[] = '';
            }
            $formatted[] = $line;
            $inBulletList = !empty($trimmed);
        }
    }

    // Join lines back together
    $description = implode("\n", $formatted);

    // Clean up multiple consecutive line breaks (max 2)
    $description = preg_replace("/\n{3,}/", "\n\n", $description);

    // Trim overall whitespace
    return trim($description);
}

function generateExcerpt($title, $description) {
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

    return $excerpts[$title] ?? substr(strip_tags($description), 0, 150) . '...';
}

echo "Processing projects (v2 - fixing hyphenated words)...\n\n";

$projects = Project::all();

foreach ($projects as $project) {
    echo "Processing: {$project->title}\n";

    // Format description
    $formattedDescription = formatDescription($project->description);

    // Generate excerpt
    $excerpt = generateExcerpt($project->title, $formattedDescription);

    // Update project
    $project->description = $formattedDescription;
    $project->excerpt = $excerpt;
    $project->save();

    echo "  ✓ Formatted description\n";
    echo "  ✓ Generated excerpt: " . substr($excerpt, 0, 80) . "...\n\n";
}

echo "\nDone! Processed {$projects->count()} projects.\n";
