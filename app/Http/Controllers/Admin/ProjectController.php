<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    /**
     * Add a new project to the database.
     */
    public function store(Request $request)
    {
        $project = Project::create([
            'title' => $request->input('title'),
            'slug' => $request->input('slug'),
            'description' => $request->input('description'),
        ]);
    
        return redirect("/projects/{$project->slug}");
    }
}
