<?php

namespace App\Utils;

class ReadingTime
{
    /**
     * Calculate estimated reading time for text content.
     *
     * Standard calculation: ~200 words per minute
     * Industry research shows most adults read at 200-250 WPM for comprehension
     *
     * @param string $text The text content to analyze
     * @param int $wordsPerMinute Reading speed (default: 200)
     * @return string Human-readable string like "5 min read"
     */
    public static function calculate(string $text, int $wordsPerMinute = 200): string
    {
        // Strip HTML tags and trim
        $cleanText = trim(strip_tags($text));

        // Handle empty or whitespace-only text
        if (empty($cleanText)) {
            return '< 1 min read';
        }

        // Count words
        $wordCount = str_word_count($cleanText);

        // Calculate minutes (round up to ensure at least 1 minute for any content)
        $minutes = (int) ceil($wordCount / $wordsPerMinute);

        // Return human-readable format
        if ($minutes < 1) {
            return '< 1 min read';
        }

        return $minutes . ' min read';
    }

    /**
     * Get just the numeric reading time in minutes.
     *
     * @param string $text The text content to analyze
     * @param int $wordsPerMinute Reading speed (default: 200)
     * @return int Number of minutes (rounded up)
     */
    public static function getMinutes(string $text, int $wordsPerMinute = 200): int
    {
        $cleanText = trim(strip_tags($text));

        if (empty($cleanText)) {
            return 0;
        }

        $wordCount = str_word_count($cleanText);

        return (int) ceil($wordCount / $wordsPerMinute);
    }

    /**
     * Get detailed reading time statistics.
     *
     * @param string $text The text content to analyze
     * @param int $wordsPerMinute Reading speed (default: 200)
     * @return array Array with word count and reading time details
     */
    public static function getStats(string $text, int $wordsPerMinute = 200): array
    {
        $cleanText = trim(strip_tags($text));

        if (empty($cleanText)) {
            return [
                'word_count' => 0,
                'minutes' => 0,
                'formatted_time' => '< 1 min read',
            ];
        }

        $wordCount = str_word_count($cleanText);
        $minutes = (int) ceil($wordCount / $wordsPerMinute);

        return [
            'word_count' => $wordCount,
            'minutes' => $minutes,
            'formatted_time' => self::calculate($text, $wordsPerMinute),
        ];
    }
}
