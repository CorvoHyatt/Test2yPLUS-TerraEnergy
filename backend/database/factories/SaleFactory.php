<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SaleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'client' => 'Cliente ' . $this->faker->numberBetween(1, 10),
            'total_amount' => $this->faker->randomFloat(2, 100, 10000),
            'sale_date' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'user_id' => User::factory()
        ];
    }
}