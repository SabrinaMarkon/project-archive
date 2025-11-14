<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Models\Project;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Show all projects in the database.
     */
    public function index()
    {
        $projects = Project::orderBy('title', 'asc')->get();

        return Inertia::render('Admin/Projects/Index', [
            'projects' => $projects,
        ]);
    }

    /**
     * Show the details for the selected project in the create project form so it can be edited.
     */
    public function show(Project $project)
    {
        return Inertia::render(
                'Admin/Projects/Create',
                [
                    'project' => $project,
                ]
            );
    }

    /**
     * Add a new project to the database with validation of form fields before the project is created.
     */
    public function store(StoreProjectRequest $request)
    {
        $project = Project::create($request->validated());

        return redirect()->route('admin.projects.index')->with('success', 'Project created successfully!');
    }

    /**
     * Update an existing project.
     */
    public function update(StoreProjectRequest $request, Project $project) // Validation is done automatically by StoreProjectRequest
    {
        // Use validated data to update the project record
        $project->update($request->validated());

        return redirect()->route('admin.projects.index')->with('success', 'Project updated successfully!');
    }

    /**
     * Delete an existing project.
     */
    public function destroy(Project $project)
    {
        $project->delete();

        return redirect()->route('admin.projects.index')->with('success', 'Project deleted successfully!');
    }
}
