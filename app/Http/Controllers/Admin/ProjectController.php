<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Models\Project;

class ProjectController extends Controller
{
    /**
     * Add a new project to the database with validation of form fields before the project is created.
     */
    public function store(StoreProjectRequest $request)
    {
        $project = Project::create($request->validated());

        return redirect("/projects/{$project->slug}");
    }
}
