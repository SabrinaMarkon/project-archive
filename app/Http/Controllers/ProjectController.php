<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Show all projects in the database.
     */
    public function index()
    {
        $projects = Project::with('author')
            ->where('status', 'published')
            ->inRandomOrder()
            ->get();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
        ]);
    }

    /**
     * Show the details for the selected project.
     */
    public function show(Project $project)
    {
        $project->load('author');

        return Inertia::render('Projects/Show', [
            'project' => $project,
        ]);
    }
}
