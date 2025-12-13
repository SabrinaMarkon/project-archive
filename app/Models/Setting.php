<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'is_encrypted'];

    protected $casts = [
        'is_encrypted' => 'boolean',
    ];

    /**
     * Get a setting value by key
     */
    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();

        if (!$setting) {
            return $default;
        }

        if ($setting->is_encrypted) {
            try {
                return Crypt::decryptString($setting->value);
            } catch (\Exception $e) {
                return $default;
            }
        }

        return $setting->value;
    }

    /**
     * Set a setting value
     */
    public static function set(string $key, $value, bool $encrypted = false): void
    {
        $storedValue = $encrypted ? Crypt::encryptString($value) : $value;

        self::updateOrCreate(
            ['key' => $key],
            ['value' => $storedValue, 'is_encrypted' => $encrypted]
        );
    }
}
