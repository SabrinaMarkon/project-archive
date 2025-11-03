<?php
/**
 * Generate MySQL-compatible SQL dumps from SQLite database
 * Outputs SQL files to storage/exports/
 *
 * Usage:
 *   php scripts/generate_sql_dumps.php
 */

require dirname(__DIR__).'/vendor/autoload.php';

$app = require_once dirname(__DIR__).'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

function escapeValue($value) {
    if ($value === null) {
        return 'NULL';
    }
    if (is_int($value) || is_float($value)) {
        return $value;
    }
    return "'" . addslashes($value) . "'";
}

// Ensure export directory exists
$exportDir = dirname(__DIR__) . '/storage/exports';
if (!is_dir($exportDir)) {
    mkdir($exportDir, 0755, true);
}

// Generate POSTS SQL dump
$postsFile = $exportDir . '/posts.sql';
$posts = DB::table('posts')->get();

$postsSql = "-- Posts Table SQL Dump\n";
$postsSql .= "-- Generated: " . date('Y-m-d H:i:s') . "\n\n";

$postsSql .= "DROP TABLE IF EXISTS `posts`;\n";
$postsSql .= "CREATE TABLE `posts` (\n";
$postsSql .= "  `id` int(11) NOT NULL AUTO_INCREMENT,\n";
$postsSql .= "  `title` varchar(255) NOT NULL,\n";
$postsSql .= "  `slug` varchar(255) NOT NULL,\n";
$postsSql .= "  `description` text,\n";
$postsSql .= "  `format` enum('html','markdown','plaintext') NOT NULL DEFAULT 'markdown',\n";
$postsSql .= "  `excerpt` text,\n";
$postsSql .= "  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',\n";
$postsSql .= "  `published_at` datetime DEFAULT NULL,\n";
$postsSql .= "  `author_id` int(11) NOT NULL,\n";
$postsSql .= "  `cover_image` varchar(255) DEFAULT NULL,\n";
$postsSql .= "  `tags` text,\n";
$postsSql .= "  `meta_title` varchar(255) DEFAULT NULL,\n";
$postsSql .= "  `meta_description` varchar(255) DEFAULT NULL,\n";
$postsSql .= "  `view_count` int(11) NOT NULL DEFAULT 0,\n";
$postsSql .= "  `is_featured` tinyint(1) NOT NULL DEFAULT 0,\n";
$postsSql .= "  `created_at` datetime DEFAULT NULL,\n";
$postsSql .= "  `updated_at` datetime DEFAULT NULL,\n";
$postsSql .= "  PRIMARY KEY (`id`),\n";
$postsSql .= "  UNIQUE KEY `posts_slug_unique` (`slug`)\n";
$postsSql .= ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n";

if ($posts->count() > 0) {
    $postsSql .= "-- Dumping data for table `posts`\n\n";

    foreach ($posts as $post) {
        $columns = [];
        $values = [];

        foreach ($post as $key => $value) {
            $columns[] = "`$key`";
            $values[] = escapeValue($value);
        }

        $postsSql .= "INSERT INTO `posts` (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $values) . ");\n";
    }
}

file_put_contents($postsFile, $postsSql);
echo "Posts SQL dump created: $postsFile\n";

// Generate PROJECTS SQL dump
$projectsFile = $exportDir . '/projects.sql';
$projects = DB::table('projects')->get();

$projectsSql = "-- Projects Table SQL Dump\n";
$projectsSql .= "-- Generated: " . date('Y-m-d H:i:s') . "\n\n";

$projectsSql .= "DROP TABLE IF EXISTS `projects`;\n";
$projectsSql .= "CREATE TABLE `projects` (\n";
$projectsSql .= "  `id` int(11) NOT NULL AUTO_INCREMENT,\n";
$projectsSql .= "  `title` varchar(255) NOT NULL,\n";
$projectsSql .= "  `slug` varchar(255) NOT NULL,\n";
$projectsSql .= "  `description` text,\n";
$projectsSql .= "  `tags` text,\n";
$projectsSql .= "  `created_at` datetime DEFAULT NULL,\n";
$projectsSql .= "  `updated_at` datetime DEFAULT NULL,\n";
$projectsSql .= "  `excerpt` text,\n";
$projectsSql .= "  `format` enum('html','markdown','plaintext') NOT NULL DEFAULT 'markdown',\n";
$projectsSql .= "  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',\n";
$projectsSql .= "  `published_at` datetime DEFAULT NULL,\n";
$projectsSql .= "  `author_id` int(11) DEFAULT NULL,\n";
$projectsSql .= "  `cover_image` varchar(255) DEFAULT NULL,\n";
$projectsSql .= "  `meta_title` varchar(255) DEFAULT NULL,\n";
$projectsSql .= "  `meta_description` varchar(255) DEFAULT NULL,\n";
$projectsSql .= "  `view_count` int(11) NOT NULL DEFAULT 0,\n";
$projectsSql .= "  `is_featured` tinyint(1) NOT NULL DEFAULT 0,\n";
$projectsSql .= "  PRIMARY KEY (`id`),\n";
$projectsSql .= "  UNIQUE KEY `projects_slug_unique` (`slug`)\n";
$projectsSql .= ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n";

if ($projects->count() > 0) {
    $projectsSql .= "-- Dumping data for table `projects`\n\n";

    foreach ($projects as $project) {
        $columns = [];
        $values = [];

        foreach ($project as $key => $value) {
            $columns[] = "`$key`";
            $values[] = escapeValue($value);
        }

        $projectsSql .= "INSERT INTO `projects` (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $values) . ");\n";
    }
}

file_put_contents($projectsFile, $projectsSql);
echo "Projects SQL dump created: $projectsFile\n";

echo "\nDone! You can now import these files into phpMyAdmin on your production server.\n";
