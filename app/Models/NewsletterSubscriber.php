<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsletterSubscriber extends Model
{
    use HasFactory;
    protected $fillable = [
        'email',
        'unsubscribed_at',
    ];

    protected $casts = [
        'unsubscribed_at' => 'datetime',
    ];

    public function scopeSubscribed($query)
    {
        return $query->whereNull('unsubscribed_at');
    }

    public function scopeUnsubscribed($query)
    {
        return $query->whereNotNull('unsubscribed_at');
    }

    public function isSubscribed(): bool
    {
        return $this->unsubscribed_at === null;
    }

    public function unsubscribe(): void
    {
        $this->update(['unsubscribed_at' => now()]);
    }

    public function resubscribe(): void
    {
        $this->update(['unsubscribed_at' => null]);
    }
}
