<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index()
    {
        $courses = Course::withCount('modules')->latest()->get();

        return Inertia::render('Admin/Courses/Index', [
            'courses' => $courses,
        ]);
    }

    public function create()
    {
        $posts = Post::where('status', 'published')
            ->orderBy('title')
            ->get(['id', 'title']);

        return Inertia::render('Admin/Courses/Create', [
            'course' => null,
            'availablePosts' => $posts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'payment_type' => 'required|in:one_time,monthly,annual',
            'stripe_enabled' => 'boolean',
            'paypal_enabled' => 'boolean',
        ]);

        Course::create($validated);

        return redirect('/admin/courses')
            ->with('success', 'Course created successfully.');
    }

    public function show(Course $course)
    {
        $course->load('modules.post');

        $posts = Post::where('status', 'published')
            ->orderBy('title')
            ->get(['id', 'title']);

        return Inertia::render('Admin/Courses/Create', [
            'course' => $course,
            'availablePosts' => $posts,
        ]);
    }

    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'payment_type' => 'required|in:one_time,monthly,annual',
            'stripe_enabled' => 'boolean',
            'paypal_enabled' => 'boolean',
        ]);

        $course->update($validated);

        return redirect('/admin/courses')
            ->with('success', 'Course updated successfully.');
    }

    public function destroy(Course $course)
    {
        $course->delete();

        return redirect('/admin/courses')
            ->with('success', 'Course deleted successfully.');
    }

    public function addModule(Request $request, Course $course)
    {
        $validated = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'is_free' => 'required|boolean',
            'custom_description' => 'nullable|string',
            'order' => 'required|integer|min:0',
        ]);

        $course->modules()->create($validated);

        return back()->with('success', 'Module added successfully.');
    }

    public function updateModule(Request $request, Course $course, $moduleId)
    {
        $module = $course->modules()->findOrFail($moduleId);

        $validated = $request->validate([
            'is_free' => 'required|boolean',
            'custom_description' => 'nullable|string',
            'order' => 'required|integer|min:0',
        ]);

        $module->update($validated);

        return back()->with('success', 'Module updated successfully.');
    }

    public function removeModule(Course $course, $moduleId)
    {
        $module = $course->modules()->findOrFail($moduleId);
        $module->delete();

        return back()->with('success', 'Module removed successfully.');
    }
}
