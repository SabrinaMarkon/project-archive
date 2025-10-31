<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Post>
 */
class PostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(),
            'slug' => $this->faker->unique()->slug(),
            'description' => $this->faker->paragraphs(3, true),
            'format' => $this->faker->randomElement(['html', 'markdown', 'plaintext']),
            'excerpt' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(['draft', 'published', 'archived']),
            'published_at' => $this->faker->optional()->dateTime(),
            'author_id' => \App\Models\User::factory(),
            'cover_image' => null,
            'tags' => $this->faker->optional()->randomElements(['Laravel', 'React', 'TypeScript', 'Vue', 'Tailwind', 'PHP'], $this->faker->numberBetween(0, 3)),
            'meta_title' => $this->faker->optional()->sentence(),
            'meta_description' => $this->faker->optional()->sentence(),
            'is_featured' => $this->faker->boolean(20),
        ];
    }
}
