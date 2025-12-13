<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create an admin user
        $admin = User::where('is_admin', true)->first();

        if (!$admin) {
            $admin = User::factory()->create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'is_admin' => true,
                'email_verified_at' => now(),
            ]);
        }

        // Create sample posts
        $posts = [
            [
                'title' => 'Getting Started with Laravel',
                'slug' => 'getting-started-with-laravel',
                'description' => "Laravel is a powerful PHP framework that makes web development elegant and enjoyable. In this comprehensive guide, we'll explore the fundamentals of Laravel and help you build your first application.\n\nYou'll learn about routing, controllers, views, and the MVC architecture. We'll also cover Laravel's powerful ORM, Eloquent, and how to interact with databases efficiently.",
                'format' => 'markdown',
                'excerpt' => 'Learn the fundamentals of Laravel and build your first web application with this comprehensive guide.',
                'status' => 'published',
                'published_at' => now()->subDays(10),
                'is_featured' => true,
                'tags' => ['Laravel', 'PHP', 'Web Development'],
            ],
            [
                'title' => 'Advanced React Patterns',
                'slug' => 'advanced-react-patterns',
                'description' => "Take your React skills to the next level with advanced patterns and best practices. This course covers render props, higher-order components, hooks, context API, and performance optimization.\n\nYou'll build real-world examples and learn when to apply each pattern for maximum code reusability and maintainability.",
                'format' => 'markdown',
                'excerpt' => 'Master advanced React patterns including hooks, context, and performance optimization techniques.',
                'status' => 'published',
                'published_at' => now()->subDays(8),
                'is_featured' => true,
                'tags' => ['React', 'JavaScript', 'Frontend'],
            ],
            [
                'title' => 'Building RESTful APIs',
                'slug' => 'building-restful-apis',
                'description' => "Learn how to design and build production-ready RESTful APIs using modern best practices. We'll cover authentication, rate limiting, versioning, error handling, and documentation.\n\nThis course uses Laravel as the backend framework, but the principles apply to any technology stack.",
                'format' => 'markdown',
                'excerpt' => 'Design and build production-ready RESTful APIs with authentication, rate limiting, and proper error handling.',
                'status' => 'published',
                'published_at' => now()->subDays(5),
                'is_featured' => false,
                'tags' => ['API', 'Laravel', 'Backend'],
            ],
            [
                'title' => 'TypeScript for JavaScript Developers',
                'slug' => 'typescript-for-javascript-developers',
                'description' => "Make the transition from JavaScript to TypeScript smoothly with this practical guide. Learn about type annotations, interfaces, generics, and how TypeScript can catch bugs before runtime.\n\nWe'll refactor a JavaScript project to TypeScript step by step, showing you the benefits along the way.",
                'format' => 'markdown',
                'excerpt' => 'Transition from JavaScript to TypeScript and learn how type safety improves code quality.',
                'status' => 'published',
                'published_at' => now()->subDays(3),
                'is_featured' => false,
                'tags' => ['TypeScript', 'JavaScript'],
            ],
            [
                'title' => 'Database Design Fundamentals',
                'slug' => 'database-design-fundamentals',
                'description' => "Master the art of database design with this comprehensive course. Learn about normalization, relationships, indexing, and query optimization.\n\nWe'll design real-world database schemas for e-commerce, social media, and SaaS applications, discussing trade-offs and best practices.",
                'format' => 'markdown',
                'excerpt' => 'Learn database design principles, normalization, and optimization for real-world applications.',
                'status' => 'published',
                'published_at' => now()->subDays(1),
                'is_featured' => false,
                'tags' => ['Database', 'SQL', 'MySQL'],
            ],
            [
                'title' => 'Introduction to Git and GitHub',
                'slug' => 'introduction-to-git-and-github',
                'description' => "Version control is essential for modern development. This beginner-friendly course teaches you Git fundamentals, branching strategies, and how to collaborate using GitHub.\n\nYou'll learn basic commands, how to resolve merge conflicts, and best practices for commit messages.",
                'format' => 'markdown',
                'excerpt' => 'Master Git and GitHub for version control and team collaboration.',
                'status' => 'published',
                'published_at' => now()->subHours(12),
                'is_featured' => false,
                'tags' => ['Git', 'GitHub', 'Version Control'],
            ],
        ];

        foreach ($posts as $postData) {
            Post::create(array_merge($postData, ['author_id' => $admin->id]));
        }
    }
}
