<?php

use App\Http\Controllers\Admin\PostController as AdminPostController;
use App\Http\Controllers\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Middleware\AdminOnly;
use App\Models\Post;
use App\Models\Project;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // Get featured projects first
    $featuredProjects = Project::with('author')
        ->where('is_featured', true)
        ->where('status', 'published')
        ->orderBy('published_at', 'desc')
        ->take(3)
        ->get();

    // If we have less than 3 featured, fill with random published projects
    if ($featuredProjects->count() < 3) {
        $needed = 3 - $featuredProjects->count();
        $randomProjects = Project::with('author')
            ->where('status', 'published')
            ->where('is_featured', false)
            ->inRandomOrder()
            ->take($needed)
            ->get();
        $projects = $featuredProjects->merge($randomProjects);
    } else {
        $projects = $featuredProjects;
    }

    // Get featured posts first
    $featuredPosts = Post::with('author')
        ->where('is_featured', true)
        ->where('status', 'published')
        ->orderBy('published_at', 'desc')
        ->take(3)
        ->get();

    // If we have less than 3 featured, fill with random published posts
    if ($featuredPosts->count() < 3) {
        $needed = 3 - $featuredPosts->count();
        $randomPosts = Post::with('author')
            ->where('status', 'published')
            ->where('is_featured', false)
            ->inRandomOrder()
            ->take($needed)
            ->get();
        $posts = $featuredPosts->merge($randomPosts);
    } else {
        $posts = $featuredPosts;
    }

    return Inertia::render('Welcome', [
        'projects' => $projects,
        'posts' => $posts,
    ]);
});

Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{project:slug}', [ProjectController::class, 'show'])->name('projects.show');
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{post:slug}', [PostController::class, 'show'])->name('posts.show');
Route::get('/resume', function () {
    return Inertia::render('Resume');
});

Route::middleware(['auth', AdminOnly::class])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');
    Route::get('/admin', fn () => Inertia::render('Admin'))->name('admin');
    Route::get('/admin/projects/create', function () {
        return Inertia::render('Admin/Projects/Create');
    });
    Route::get('/admin/projects', [AdminProjectController::class, 'index'])->name('admin.projects.index');
    Route::post('/admin/projects', [AdminProjectController::class, 'store'])->name('admin.projects.store');
    Route::put('/admin/projects/{project:slug}', [AdminProjectController::class, 'update'])->name('admin.projects.update');
    Route::delete('/admin/projects/{project:slug}', [AdminProjectController::class, 'destroy'])->name('admin.projects.destroy');
    Route::get('/admin/projects/{project:slug}', function (Project $project) {
        return Inertia::render('Admin/Projects/Create', [
            'project' => $project,
        ]);
    });

    // Admin Posts Routes
    Route::get('/admin/posts', [AdminPostController::class, 'index'])->name('admin.posts.index');
    Route::get('/admin/posts/create', [AdminPostController::class, 'create'])->name('admin.posts.create');
    Route::post('/admin/posts', [AdminPostController::class, 'store'])->name('admin.posts.store');
    Route::get('/admin/posts/{post:slug}', [AdminPostController::class, 'show'])->name('admin.posts.show');
    Route::put('/admin/posts/{post:slug}', [AdminPostController::class, 'update'])->name('admin.posts.update');
    Route::delete('/admin/posts/{post:slug}', [AdminPostController::class, 'destroy'])->name('admin.posts.destroy');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
