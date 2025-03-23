<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Sale;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Crear usuario administrador
        User::create([
            'name' => 'Admin',
            'email' => 'admin@test.com',
            'password' => Hash::make('password123')
        ]);

        // Crear usuarios adicionales de prueba
        User::factory(4)->create();

        // Crear ventas de prueba
        $users = User::all();
        foreach ($users as $user) {
            Sale::factory()->count(5)->create([
                'user_id' => $user->id
            ]);
        }
    }
}
