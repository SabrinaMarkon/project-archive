<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'format',
        'excerpt',
        'status',
        'published_at',
        'author_id',
        'cover_image',
        'tags',
        'meta_title',
        'meta_description',
        'is_featured',
    ];
}
