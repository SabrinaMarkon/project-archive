<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PurchaseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'course_id' => Course::factory(),
            'stripe_payment_intent_id' => 'pi_' . fake()->uuid(),
            'stripe_subscription_id' => null,
            'amount' => fake()->randomFloat(2, 10, 500),
            'currency' => 'usd',
            'status' => 'completed',
            'payment_type' => 'one_time',
            'purchased_at' => now(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'purchased_at' => null,
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
        ]);
    }

    public function subscription(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_type' => 'subscription',
            'stripe_subscription_id' => 'sub_' . fake()->uuid(),
            'stripe_payment_intent_id' => null,
        ]);
    }
}
