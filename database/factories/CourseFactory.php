<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'description' => fake()->paragraphs(2, true),
            'price' => fake()->randomFloat(2, 9.99, 199.99),
            'payment_type' => fake()->randomElement(['one_time', 'monthly', 'annual']),
            'stripe_enabled' => fake()->boolean(80),
            'paypal_enabled' => fake()->boolean(40),
        ];
    }
}
