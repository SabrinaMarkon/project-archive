<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Inertia\Inertia;

class PostController extends Controller
{
    /**
     * Show only published posts to visitors.
     */
    public function index()
    {
        // Validate tag input
        $validated = request()->validate([
            'tag' => 'nullable|string|max:50',
        ]);

        $selectedTag = $validated['tag'] ?? null;

        // Build the query
        $query = Post::with('author')
            ->where('status', 'published');

        // Filter by tag if provided
        if ($selectedTag) {
            $query->whereJsonContains('tags', $selectedTag);
        }

        $posts = $query->orderBy('published_at', 'desc')->get();

        return Inertia::render('Posts/Index', [
            'posts' => $posts,
            'selectedTag' => $selectedTag,
        ]);
    }

    /**
     * Show the details for the selected post (only if published, unless user is admin).
     */
    public function show(Post $post)
    {
        // Return 404 if the post is not published and user is not an admin
        if ($post->status !== 'published' && (!auth()->check() || !auth()->user()->is_admin)) {
            abort(404);
        }

        $post->load('author');

        return Inertia::render('Posts/Show', [
            'post' => $post,
        ]);
    }
}
