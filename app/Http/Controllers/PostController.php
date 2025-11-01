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
        $posts = Post::where('status', 'published')
            ->orderBy('published_at', 'desc')
            ->get();

        return Inertia::render('Posts/Index', [
            'posts' => $posts,
        ]);
    }

    /**
     * Show the details for the selected post (only if published).
     */
    public function show(Post $post)
    {
        // Return 404 if the post is not published
        if ($post->status !== 'published') {
            abort(404);
        }

        return Inertia::render('Posts/Show', [
            'post' => $post,
        ]);
    }
}
