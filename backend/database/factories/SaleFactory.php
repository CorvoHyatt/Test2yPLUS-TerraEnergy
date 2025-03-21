<?php

namespace Database\Factories;

use App\Models\Sale;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SaleFactory extends Factory
{
    protected $model = Sale::class;

    public function definition()
    {
        return [
            'client' => $this->faker->company(),
            'total_amount' => $this->faker->randomFloat(2, 100, 10000),
            'sale_date' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'user_id' => User::factory()
        ];
    }
}