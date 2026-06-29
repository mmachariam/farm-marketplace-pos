<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name'        => 'Vegetables',
                'description' => 'Fresh vegetables directly from the farm',
            ],
            [
                'name'        => 'Fruits',
                'description' => 'Seasonal and tropical fruits',
            ],
            [
                'name'        => 'Grains & Cereals',
                'description' => 'Dry grains, maize, wheat, rice',
            ],
            [
                'name'        => 'Dairy & Eggs',
                'description' => 'Fresh milk, eggs and dairy products',
            ],
            [
                'name'        => 'Roots & Tubers',
                'description' => 'Potatoes, sweet potatoes, arrow roots, cassava',
            ],
            [
                'name'        => 'Legumes',
                'description' => 'Beans, lentils, peas, groundnuts',
            ],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(
                ['name' => $cat['name']],
                [
                    'slug'        => Str::slug($cat['name']),
                    'description' => $cat['description'],
                ]
            );
        }

        $this->command->info('  categories   : ' . Category::count());
    }
}
