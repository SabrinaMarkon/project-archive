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
        $posts = Post::with('author')
            ->where('status', 'published')
            ->orderBy('published_at', 'desc')
            ->get();

        return Inertia::render('Posts/Index', [
            'posts' => $posts,
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
