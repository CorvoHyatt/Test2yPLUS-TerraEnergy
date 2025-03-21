<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Sale;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Crear usuarios de prueba
        User::factory(5)->create();

        // Crear ventas de prueba
        $users = User::all();
        foreach ($users as $user) {
            Sale::factory()->count(5)->create([
                'user_id' => $user->id
            ]);
        }
    }
}
