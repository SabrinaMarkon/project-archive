<?php

// This script fixes project descriptions and generates excerpts
// Run with: php scripts/fix_project_formatting.php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Project;

function formatDescription($description) {
    // Add line breaks before common section headings (only if not already preceded by newline)
    $headings = ['Key Features', 'Technologies Used', 'Modernization Recommendation',
                 'Tech Stack', 'Why This Project', 'Future Enhancements', 'Status',
                 'Features Included', 'Core Features', 'Technical Highlights'];

    foreach ($headings as $heading) {
        // Add spacing before heading if it's preceded by text
        $description = preg_replace('/([a-z0-9)])(' . preg_quote($heading, '/') . ')/', "$1\n\n$2\n\n", $description);
        // If heading is at start or after period, just add spacing after
        $description = preg_replace('/(^|[.!?]\s+)(' . preg_quote($heading, '/') . ')(?!\n)/', "$1$2\n\n", $description);
    }

    // Fix bullet points - add line break before first bullet if preceded by lowercase letter or closing paren
    // But NOT if preceded by a hyphen (to avoid breaking hyphenated words like "full-stack")
    $description = preg_replace('/([a-z)])([•-])\s/', "$1\n\n$2 ", $description);

    // Add line breaks between consecutive bullet points
    $description = preg_replace('/([•-]\s+[^\n]+?)([•-]\s)/', "$1\n$2", $description);

    // Clean up multiple consecutive line breaks (max 2)
    $description = preg_replace("/\n{3,}/", "\n\n", $description);

    // Clean up any leading/trailing whitespace on lines
    $lines = explode("\n", $description);
    $lines = array_map('trim', $lines);
    $description = implode("\n", $lines);

    // Trim overall whitespace
    return trim($description);
}

function generateExcerpt($title, $description) {
    // Extract first sentence or two for excerpt
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

    return $excerpts[$title] ?? substr($description, 0, 150) . '...';
}

echo "Processing projects...\n\n";

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
