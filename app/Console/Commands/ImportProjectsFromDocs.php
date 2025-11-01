<?php

namespace App\Console\Commands;

use App\Models\Project;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ImportProjectsFromDocs extends Command
{
    protected $signature = 'projects:import-docs';
    protected $description = 'Import projects from ProjectSummary docx files in docs/projects';

    public function handle()
    {
        $docxFiles = glob(base_path('docs/projects/ProjectSummary_*.docx'));

        if (empty($docxFiles)) {
            $this->error('No ProjectSummary_*.docx files found in docs/projects/');
            return 1;
        }

        $this->info("Found " . count($docxFiles) . " project summary files.");

        $imported = 0;
        $skipped = 0;

        foreach ($docxFiles as $file) {
            try {
                $content = $this->extractTextFromDocx($file);

                if (empty($content)) {
                    $this->warn("Skipping empty file: " . basename($file));
                    $skipped++;
                    continue;
                }

                // Parse title and description
                $parsed = $this->parseContent($content);

                if (!$parsed) {
                    $this->warn("Could not parse: " . basename($file));
                    $skipped++;
                    continue;
                }

                // Generate slug
                $slug = Str::slug($parsed['title']);

                // Check if project already exists
                if (Project::where('slug', $slug)->exists()) {
                    $this->warn("Project already exists: {$parsed['title']} (slug: {$slug})");
                    $skipped++;
                    continue;
                }

                // Generate tags
                $tags = $this->generateTags($parsed['title'], $parsed['description']);

                // Create project
                Project::create([
                    'title' => $parsed['title'],
                    'slug' => $slug,
                    'description' => $parsed['description'],
                    'tags' => $tags,
                ]);

                $this->info("✓ Imported: {$parsed['title']}");
                $imported++;

            } catch (\Exception $e) {
                $this->error("Error processing " . basename($file) . ": " . $e->getMessage());
                $skipped++;
            }
        }

        $this->info("\n" . str_repeat('=', 50));
        $this->info("Import complete!");
        $this->info("Imported: {$imported}");
        $this->info("Skipped: {$skipped}");
        $this->info(str_repeat('=', 50));

        return 0;
    }

    private function extractTextFromDocx(string $filePath): string
    {
        // Extract text from docx (which is a zip archive)
        $xml = shell_exec("unzip -p " . escapeshellarg($filePath) . " word/document.xml 2>/dev/null");

        if (!$xml) {
            return '';
        }

        // Remove XML tags and decode entities
        $text = strip_tags($xml);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        // Clean up whitespace
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);

        return $text;
    }

    private function parseContent(string $content): ?array
    {
        // Pattern 1: "Project Summary: Title" followed by description starting with "This"
        if (preg_match('/^Project Summary:\s*(.+?)(This |The project|The |Key Features)/is', $content, $matches)) {
            $title = trim($matches[1]);
            // Find where the description actually starts (after the matched title)
            $titleEnd = strpos($content, $matches[2]);
            $description = trim(substr($content, $titleEnd));
        }
        // Pattern 2: "Title – Project Summary" followed by description
        elseif (preg_match('/^(.+?)\s*[–-]\s*Project Summary(.+)/is', $content, $matches)) {
            $title = trim($matches[1]);
            $description = trim($matches[2]);
        }
        // Fallback: split on common sentence starters
        else {
            if (preg_match('/^(.{10,150}?)(This project|This is|The .+ is|Key Features)/is', $content, $matches)) {
                $title = trim($matches[1]);
                $titleEnd = strpos($content, $matches[2]);
                $description = trim(substr($content, $titleEnd));
            } else {
                return null;
            }
        }

        // Clean up title
        $title = preg_replace('/^Project Summary:\s*/i', '', $title);
        $title = preg_replace('/\s*[–-]\s*Project Summary$/i', '', $title);

        // Remove any sentence fragments that leaked into the title
        $title = preg_replace('/(This |The project|is a |was |includes )/i', '', $title);
        $title = trim($title);

        // Clean up description
        $description = trim($description);

        if (empty($title) || empty($description) || strlen($title) < 3) {
            return null;
        }

        return [
            'title' => $title,
            'description' => $description,
        ];
    }

    private function generateTags(string $title, string $description): array
    {
        $tags = [];
        $text = strtolower($title . ' ' . $description);

        // Technology tags
        $techMap = [
            'Laravel' => ['laravel'],
            'React' => ['react'],
            'Next.js' => ['nextjs', 'next.js'],
            'PHP' => ['php'],
            'JavaScript' => ['javascript', 'js'],
            'TypeScript' => ['typescript'],
            'MySQL' => ['mysql'],
            'PostgreSQL' => ['postgres', 'postgresql'],
            'MongoDB' => ['mongodb'],
            'Vue' => ['vue', 'vue.js'],
            'Node.js' => ['node', 'node.js', 'nodejs'],
            'Express' => ['express'],
            'API' => ['api'],
            'REST' => ['rest', 'restful'],
            'WebSocket' => ['websocket'],
            'Bootstrap' => ['bootstrap'],
            'Tailwind' => ['tailwind'],
            'CSS' => ['css'],
            'HTML' => ['html'],
            'Docker' => ['docker'],
            'Redis' => ['redis'],
            'Cron' => ['cron'],
            'Composer' => ['composer'],
            'Vite' => ['vite'],
            'Webpack' => ['webpack'],
            'Axios' => ['axios'],
        ];

        foreach ($techMap as $tag => $keywords) {
            foreach ($keywords as $keyword) {
                if (stripos($text, $keyword) !== false) {
                    $tags[] = $tag;
                    break;
                }
            }
        }

        // Feature/Category tags
        $featureMap = [
            'Authentication' => ['auth', 'login', 'register', 'signup', 'sign up', 'password', 'session'],
            'Admin Panel' => ['admin', 'dashboard', 'control panel'],
            'E-commerce' => ['ecommerce', 'e-commerce', 'payment', 'checkout', 'shopping', 'cart'],
            'CMS' => ['cms', 'content management'],
            'Chat' => ['chat', 'messaging', 'real-time', 'websocket'],
            'API Integration' => ['api', 'integration', 'nasa', 'google'],
            'Email' => ['email', 'mail', 'autoresponder', 'newsletter'],
            'MLM' => ['mlm', 'matrix', 'referral', 'affiliate'],
            'Advertising' => ['advertising', 'ad', 'banner', 'campaign'],
            'SaaS' => ['saas', 'subscription', 'membership'],
            'Full-Stack' => ['full-stack', 'fullstack', 'frontend', 'backend'],
            'Legacy' => ['legacy'],
            'Image Upload' => ['image', 'upload', 'gallery', 'dropzone', 'photo'],
            'Forum' => ['forum', 'discussion', 'comment'],
            'Booking' => ['booking', 'reservation'],
            'Review' => ['review', 'rating'],
            'Search' => ['search', 'filter', 'query'],
            'Hosting' => ['hosting', 'whmcs', 'cpanel'],
            'Bitcoin' => ['bitcoin', 'btc', 'crypto', 'cryptocurrency'],
        ];

        foreach ($featureMap as $tag => $keywords) {
            foreach ($keywords as $keyword) {
                if (stripos($text, $keyword) !== false) {
                    $tags[] = $tag;
                    break;
                }
            }
        }

        // Remove duplicates and limit to reasonable number
        $tags = array_unique($tags);
        $tags = array_slice($tags, 0, 10);

        return array_values($tags);
    }
}
