<?php

use App\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Admin\NewsletterHistoryController;
use App\Http\Controllers\Admin\NewsletterSubscriberController;
use App\Http\Controllers\Admin\PostController as AdminPostController;
use App\Http\Controllers\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Admin\PurchaseController as AdminPurchaseController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Middleware\AdminOnly;
use App\Models\Post;
use App\Models\Project;
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

    // Add premium information to posts
    $posts = $posts->map(function ($post) {
        $isPremium = $post->isPremiumContent();
        $premiumCourse = $isPremium ? $post->getPremiumCourse() : null;

        return array_merge($post->toArray(), [
            'isPremium' => $isPremium,
            'premiumCourse' => $premiumCourse ? [
                'id' => $premiumCourse->id,
                'title' => $premiumCourse->title,
                'price' => $premiumCourse->price,
            ] : null,
        ]);
    });

    // Get latest courses
    $courses = \App\Models\Course::withCount('modules')
        ->latest()
        ->take(3)
        ->get();

    return Inertia::render('Welcome', [
        'projects' => $projects,
        'posts' => $posts,
        'courses' => $courses,
    ]);
});

// Project Routes
Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{project:slug}', [ProjectController::class, 'show'])->name('projects.show');

// Post Routes
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{post:slug}', [PostController::class, 'show'])->name('posts.show');

// Course Routes
Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
Route::get('/courses/{course}', [CourseController::class, 'show'])->name('courses.show');
Route::post('/courses/{course}/checkout', [\App\Http\Controllers\PaymentController::class, 'createCheckoutSession'])
    ->middleware('auth')
    ->name('courses.checkout');

// Stripe Webhook (no CSRF protection needed)
Route::post('/stripe/webhook', [\App\Http\Controllers\StripeWebhookController::class, 'handleWebhook'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

// CV Routes
Route::get('/resume', function () {
    return Inertia::render('Resume');
});

// Newsletter Routes
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe'])->name('newsletter.subscribe');
Route::get('/newsletter/confirm', [NewsletterController::class, 'confirm'])->name('newsletter.confirm');
Route::get('/newsletter/unsubscribe', [NewsletterController::class, 'unsubscribe'])->name('newsletter.unsubscribe');

Route::middleware(['auth', 'verified'])->group(function () {
    // User Dashboard Routes (non-admin) - require email verification
    Route::get('/dashboard/purchases', [DashboardController::class, 'purchases'])->name('dashboard.purchases');
});

Route::middleware('auth')->group(function () {
    // Profile Routes - available to all authenticated users
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', AdminOnly::class])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');
    Route::get('/admin', fn () => Inertia::render('Admin'))->name('admin');

    // Admin Projects Routes
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

    // Admin Newsletter Routes
    Route::get('/admin/newsletter-subscribers', [NewsletterSubscriberController::class, 'index'])->name('admin.newsletter.index');
    Route::get('/admin/newsletter-subscribers/export', [NewsletterSubscriberController::class, 'export'])->name('admin.newsletter.export');
    Route::patch('/admin/newsletter-subscribers/{subscriber}/unsubscribe', [NewsletterSubscriberController::class, 'unsubscribe'])->name('admin.newsletter.unsubscribe');
    Route::delete('/admin/newsletter-subscribers/{subscriber}', [NewsletterSubscriberController::class, 'destroy'])->name('admin.newsletter.destroy');
    Route::get('/admin/newsletter/compose', [NewsletterSubscriberController::class, 'compose'])->name('admin.newsletter.compose');
    Route::post('/admin/newsletter/send', [NewsletterSubscriberController::class, 'send'])->name('admin.newsletter.send');
    Route::get('/admin/newsletter/history', [NewsletterHistoryController::class, 'index'])->name('admin.newsletter.history');
    Route::get('/admin/newsletter/history/{newsletterSend}', [NewsletterHistoryController::class, 'show'])->name('admin.newsletter.history.show');
    Route::delete('/admin/newsletter/history/{newsletterSend}', [NewsletterHistoryController::class, 'destroy'])->name('admin.newsletter.history.destroy');

    // Admin Course Routes
    Route::get('/admin/courses', [AdminCourseController::class, 'index'])->name('admin.courses.index');
    Route::get('/admin/courses/create', [AdminCourseController::class, 'create'])->name('admin.courses.create');
    Route::post('/admin/courses', [AdminCourseController::class, 'store'])->name('admin.courses.store');
    Route::get('/admin/courses/{course}', [AdminCourseController::class, 'show'])->name('admin.courses.show');
    Route::put('/admin/courses/{course}', [AdminCourseController::class, 'update'])->name('admin.courses.update');
    Route::delete('/admin/courses/{course}', [AdminCourseController::class, 'destroy'])->name('admin.courses.destroy');
    Route::post('/admin/courses/{course}/modules', [AdminCourseController::class, 'addModule'])->name('admin.courses.modules.add');
    Route::patch('/admin/courses/{course}/modules/{module}', [AdminCourseController::class, 'updateModule'])->name('admin.courses.modules.update');
    Route::delete('/admin/courses/{course}/modules/{module}', [AdminCourseController::class, 'removeModule'])->name('admin.courses.modules.remove');

    // Admin User Routes
    Route::get('/admin/users', [AdminUserController::class, 'index'])->name('admin.users.index');
    Route::get('/admin/users/{user}', [AdminUserController::class, 'show'])->name('admin.users.show');
    Route::patch('/admin/users/{user}', [AdminUserController::class, 'update'])->name('admin.users.update');
    Route::delete('/admin/users/{user}', [AdminUserController::class, 'destroy'])->name('admin.users.destroy');
    Route::post('/admin/users/{user}/enrollments', [AdminUserController::class, 'addEnrollment'])->name('admin.users.enrollments.add');
    Route::delete('/admin/users/{user}/enrollments/{enrollment}', [AdminUserController::class, 'removeEnrollment'])->name('admin.users.enrollments.remove');

    // Admin Purchase Routes
    Route::get('/admin/purchases', [AdminPurchaseController::class, 'index'])->name('admin.purchases.index');

    // Admin Settings Routes
    Route::get('/admin/settings', [\App\Http\Controllers\Admin\SettingsController::class, 'index'])->name('admin.settings');
    Route::put('/admin/settings', [\App\Http\Controllers\Admin\SettingsController::class, 'update'])->name('admin.settings.update');
});

require __DIR__.'/auth.php';
