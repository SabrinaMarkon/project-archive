<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index()
    {
        $courses = Course::withCount('modules')->latest()->get();

        return Inertia::render('Courses/Index', [
            'courses' => $courses,
        ]);
    }

    public function show(Course $course)
    {
        $course->load('modules.post');

        $hasPurchased = auth()->check() && auth()->user()->hasPurchased($course);

        return Inertia::render('Courses/Show', [
            'course' => $course,
            'hasPurchased' => $hasPurchased,
            'modules' => $course->modules,
        ]);
    }
}
