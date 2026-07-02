<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('');
        $this->command->info('━━━  SokoMoja Demo Seed  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        $this->call([
            PickupZoneSeeder::class,
            CategorySeeder::class,
            UserSeeder::class,
            ProductSeeder::class,
            OrderSeeder::class,
            WeeklySalesSeeder::class,
            ReviewSeeder::class,
        ]);

        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('✅  All seeders completed. Passwords: SokoMoja2026!');
        $this->command->info('');
    }
}
