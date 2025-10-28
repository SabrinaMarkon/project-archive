<?php

use App\Http\Controllers\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Middleware\AdminOnly;
use App\Models\Project;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'projects' => Project::all(),
    ]);
});

Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{project:slug}', [ProjectController::class, 'show'])->name('projects.show');
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{post:slug}', [PostController::class, 'show'])->name('posts.show');

Route::middleware(['auth', AdminOnly::class])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');
    Route::get('/admin', fn () => Inertia::render('Admin'))->name('admin');
    Route::get('/admin/projects/create', function () {
        return Inertia::render('Admin/Projects/Create');
    });
    Route::get('/admin/projects', [AdminProjectController::class, 'index'])->name('admin.projects.index');
    Route::post('/admin/projects', [AdminProjectController::class, 'store'])->name('admin.projects.store');
    Route::put('/admin/projects/{project:slug}', [AdminProjectController::class, 'update'])->name('admin.projects.update');
    Route::get('/admin/projects/{project:slug}', function (Project $project) {
        return Inertia::render('Admin/Projects/Create', [
            'project' => $project,
        ]);
    });
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
