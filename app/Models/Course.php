<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'price',
        'payment_type',
        'stripe_enabled',
        'paypal_enabled',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stripe_enabled' => 'boolean',
        'paypal_enabled' => 'boolean',
    ];

    public function modules(): HasMany
    {
        return $this->hasMany(CourseModule::class)->orderBy('order');
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }
}
