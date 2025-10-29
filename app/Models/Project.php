<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'slug', 'description', 'tags'];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'tags' => 'array',
        ];
    }
}
