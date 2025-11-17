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
        // Validate tag input
        $validated = request()->validate([
            'tag' => 'nullable|string|max:50',
        ]);

        $selectedTag = $validated['tag'] ?? null;

        // Build the query
        $query = Project::with('author')
            ->where('status', 'published');

        // Filter by tag if provided
        if ($selectedTag) {
            $query->whereJsonContains('tags', $selectedTag);
        }

        $projects = $query->inRandomOrder()->get();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'selectedTag' => $selectedTag,
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
