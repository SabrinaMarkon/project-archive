<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
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

        $projects = [
            [
                'title' => 'E-commerce Platform',
                'slug' => 'e-commerce-platform',
                'description' => 'A full-featured e-commerce platform built with Laravel and React. Features include product catalog, shopping cart, payment processing with Stripe, order management, and admin dashboard. Includes inventory tracking, customer reviews, and email notifications.',
                'tags' => ['Laravel', 'React', 'E-commerce', 'Stripe'],
            ],
            [
                'title' => 'Task Management System',
                'slug' => 'task-management-system',
                'description' => 'A collaborative task management application inspired by Trello and Asana. Built with Vue.js and Laravel, it features drag-and-drop boards, real-time updates using WebSockets, team collaboration, file attachments, and deadline tracking.',
                'tags' => ['Vue.js', 'Laravel', 'WebSockets', 'Collaboration'],
            ],
            [
                'title' => 'Blog CMS',
                'slug' => 'blog-cms',
                'description' => 'A modern content management system for bloggers and content creators. Features markdown editing, media management, SEO optimization, multi-author support, and custom themes. Built with Next.js and headless Laravel API.',
                'tags' => ['Next.js', 'Laravel', 'CMS', 'SEO'],
            ],
            [
                'title' => 'Real Estate Listings',
                'slug' => 'real-estate-listings',
                'description' => 'A comprehensive real estate listing platform with advanced search filters, interactive maps using Mapbox, virtual tours, agent profiles, and lead generation. Built with React, TypeScript, and Laravel backend.',
                'tags' => ['React', 'TypeScript', 'Laravel', 'Mapbox'],
            ],
            [
                'title' => 'Fitness Tracking App',
                'slug' => 'fitness-tracking-app',
                'description' => 'A mobile-responsive fitness tracking application that helps users log workouts, track nutrition, set goals, and view progress charts. Features social sharing, workout plans, and integration with fitness APIs. Built with React Native and Laravel.',
                'tags' => ['React Native', 'Laravel', 'Fitness', 'Charts'],
            ],
            [
                'title' => 'Invoice Management System',
                'slug' => 'invoice-management-system',
                'description' => 'A professional invoicing and billing system for freelancers and small businesses. Features include client management, recurring invoices, payment tracking, expense management, and financial reports with PDF generation.',
                'tags' => ['Laravel', 'Vue.js', 'PDF', 'Accounting'],
            ],
            [
                'title' => 'Social Media Dashboard',
                'slug' => 'social-media-dashboard',
                'description' => 'An analytics dashboard for social media managers to track metrics across multiple platforms. Integrates with Twitter, Facebook, Instagram APIs. Features sentiment analysis, scheduling posts, and custom reports.',
                'tags' => ['React', 'Laravel', 'Analytics', 'API Integration'],
            ],
            [
                'title' => 'Learning Management System',
                'slug' => 'learning-management-system',
                'description' => 'A comprehensive LMS for online education with course creation, video hosting, quizzes, assignments, progress tracking, and certificate generation. Includes student enrollment, payment processing, and discussion forums.',
                'tags' => ['Laravel', 'React', 'Education', 'Video'],
            ],
        ];

        foreach ($projects as $projectData) {
            Project::create(array_merge($projectData, [
                'author_id' => $admin->id,
                'status' => 'published',
                'published_at' => now(),
            ]));
        }
    }
}
