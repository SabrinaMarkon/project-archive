<?php

namespace App\Models;

use App\Utils\ReadingTime;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

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

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'published_at' => 'datetime',
            'view_count' => 'integer',
            'is_featured' => 'boolean',
        ];
    }

    /**
     * Automatically append computed attributes to JSON.
     */
    protected $appends = ['read_time'];

    /**
     * Calculate reading time based on description content.
     */
    protected function readTime(): Attribute
    {
        return Attribute::make(
            get: fn () => ReadingTime::calculate($this->description ?? '')
        );
    }

    /**
     * Get the author of the post.
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Get course modules this post belongs to.
     */
    public function courseModules()
    {
        return $this->hasMany(CourseModule::class);
    }

    /**
     * Check if this post is premium content (paid module in a course).
     */
    public function isPremiumContent(): bool
    {
        return $this->courseModules()->where('is_free', false)->exists();
    }

    /**
     * Get the first course where this post is a paid module.
     */
    public function getPremiumCourse()
    {
        $module = $this->courseModules()->where('is_free', false)->with('course')->first();
        return $module ? $module->course : null;
    }

    /**
     * Check if a user can access this premium content.
     */
    public function canUserAccess($user): bool
    {
        // Admins can access everything
        if ($user && $user->is_admin) {
            return true;
        }

        // Non-premium posts are accessible to everyone
        if (!$this->isPremiumContent()) {
            return true;
        }

        // For premium posts, check if user has purchased any course containing this post
        if (!$user) {
            return false;
        }

        $paidModuleCourseIds = $this->courseModules()
            ->where('is_free', false)
            ->pluck('course_id');

        foreach ($paidModuleCourseIds as $courseId) {
            if ($user->hasPurchased(\App\Models\Course::find($courseId))) {
                return true;
            }
        }

        return false;
    }


    /**
     * Convert model to array with camelCase keys for frontend consistency.
     */
    public function toArray(): array
    {
        $array = parent::toArray();
        $camelCased = [];

        foreach ($array as $key => $value) {
            $camelCased[Str::camel($key)] = $value;
        }

        // Add author name if relationship is loaded
        if ($this->relationLoaded('author') && $this->author) {
            $camelCased['authorName'] = $this->author->name;
        }

        return $camelCased;
    }
}
