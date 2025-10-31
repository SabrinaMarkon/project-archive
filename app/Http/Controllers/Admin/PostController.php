<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostRequest;
use App\Models\Post;
use Inertia\Inertia;

class PostController extends Controller
{
    /**
     * Show all posts in the database.
     */
    public function index()
    {
        $posts = Post::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Posts/Index', [
            'posts' => $posts,
        ]);
    }

    /**
     * Show the create post form.
     */
    public function create()
    {
        return Inertia::render('Admin/Posts/Create', [
            'post' => null,
        ]);
    }

    /**
     * Show the details for the selected post in the create post form so it can be edited.
     */
    public function show(Post $post)
    {
        return Inertia::render('Admin/Posts/Create', [
            'post' => $post,
        ]);
    }

    /**
     * Add a new post to the database with validation of form fields before the post is created.
     */
    public function store(StorePostRequest $request)
    {
        $data = $request->validated();

        // Set author_id to current user
        $data['author_id'] = auth()->id();

        // Handle published_at based on status
        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $post = Post::create($data);

        return redirect()->route('admin.posts.index')->with('success', 'Post created successfully!');
    }

    /**
     * Update an existing post.
     */
    public function update(StorePostRequest $request, Post $post)
    {
        $data = $request->validated();

        // Handle published_at based on status
        if ($data['status'] === 'published' && empty($post->published_at)) {
            $data['published_at'] = now();
        } elseif ($data['status'] !== 'published') {
            $data['published_at'] = null;
        }

        $post->update($data);

        return redirect()->route('admin.posts.index')->with('success', 'Post updated successfully!');
    }

    /**
     * Delete an existing post.
     */
    public function destroy(Post $post)
    {
        $post->delete();

        return redirect()->route('admin.posts.index')->with('success', 'Post deleted successfully!');
    }
}
