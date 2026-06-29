<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\PickupZone;
use App\Models\Product;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Pickup zones ─────────────────────────────────────────────
        $zones = [
            ['zone_name' => 'Kiambu Zone',  'pickup_address' => 'Kiambu Town Market, Gate 3', 'region' => 'Kiambu'  ],
            ['zone_name' => 'Nakuru Zone',  'pickup_address' => 'Nakuru Central Market',       'region' => 'Nakuru'  ],
            ['zone_name' => 'Meru Zone',    'pickup_address' => 'Meru Town Bus Stage',          'region' => 'Meru'    ],
            ['zone_name' => 'Nairobi CBD',  'pickup_address' => 'City Market, Muindi Mbingu St','region' => 'Nairobi' ],
            ['zone_name' => 'Eldoret Zone', 'pickup_address' => 'Eldoret Town Market',          'region' => 'Eldoret' ],
            ['zone_name' => 'Kisumu Zone',  'pickup_address' => 'Kisumu Main Market',           'region' => 'Kisumu'  ],
        ];

        foreach ($zones as $zone) {
            PickupZone::firstOrCreate(['zone_name' => $zone['zone_name']], $zone);
        }

        $kiambuZone  = PickupZone::where('zone_name', 'Kiambu Zone')->first();
        $nakuruZone  = PickupZone::where('zone_name', 'Nakuru Zone')->first();
        $eldoretZone = PickupZone::where('zone_name', 'Eldoret Zone')->first();

        // ── Test users ────────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@sokomoja.co.ke'],
            [
                'name'        => 'Admin User',
                'password'    => Hash::make('password123'),
                'role'        => 'admin',
                'is_verified' => true,
                'status'      => 'active',
            ]
        );

        $farmer = User::firstOrCreate(
            ['email' => 'farmer@sokomoja.co.ke'],
            [
                'name'        => 'Jane Wambui',
                'password'    => Hash::make('password123'),
                'role'        => 'seller',
                'region'      => 'Kiambu',
                'zone_id'     => $kiambuZone?->zone_id,
                'is_verified' => true,
                'status'      => 'active',
            ]
        );

        $farmer2 = User::firstOrCreate(
            ['email' => 'farmer2@sokomoja.co.ke'],
            [
                'name'        => 'John Kamau',
                'password'    => Hash::make('password123'),
                'role'        => 'seller',
                'region'      => 'Nakuru',
                'zone_id'     => $nakuruZone?->zone_id,
                'is_verified' => true,
                'status'      => 'active',
            ]
        );

        User::firstOrCreate(
            ['email' => 'buyer@sokomoja.co.ke'],
            [
                'name'        => 'Peter Otieno',
                'password'    => Hash::make('password123'),
                'role'        => 'buyer',
                'region'      => 'Nairobi',
                'is_verified' => true,
                'status'      => 'active',
            ]
        );

        // ── Categories ────────────────────────────────────────────────
        $categoryData = [
            ['name' => 'Vegetables',      'slug' => 'vegetables',      'description' => 'Fresh leafy greens, roots, and garden vegetables'],
            ['name' => 'Fruits',          'slug' => 'fruits',          'description' => 'Tropical and seasonal fresh fruits'],
            ['name' => 'Roots & Tubers',  'slug' => 'roots-tubers',    'description' => 'Potatoes, sweet potatoes, cassava, and yams'],
            ['name' => 'Dairy & Eggs',    'slug' => 'dairy-eggs',      'description' => 'Fresh milk, cheese, yoghurt, and farm eggs'],
            ['name' => 'Grains & Cereals','slug' => 'grains-cereals',  'description' => 'Maize, wheat, sorghum, and millet'],
            ['name' => 'Legumes',         'slug' => 'legumes',         'description' => 'Beans, lentils, peas, and chickpeas'],
            ['name' => 'Herbs & Spices',  'slug' => 'herbs-spices',    'description' => 'Fresh herbs and dried spices from the farm'],
        ];

        foreach ($categoryData as $cat) {
            Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }

        $vegCat     = Category::where('slug', 'vegetables')->first();
        $fruitCat   = Category::where('slug', 'fruits')->first();
        $rootCat    = Category::where('slug', 'roots-tubers')->first();
        $dairyCat   = Category::where('slug', 'dairy-eggs')->first();
        $grainCat   = Category::where('slug', 'grains-cereals')->first();
        $legumeCat  = Category::where('slug', 'legumes')->first();

        // ── Sample products ───────────────────────────────────────────
        $products = [
            // Jane Wambui's listings (Kiambu)
            [
                'seller_id'   => $farmer->user_id,
                'category_id' => $vegCat->category_id,
                'zone_id'     => $kiambuZone?->zone_id,
                'name'        => 'Fresh Tomatoes',
                'description' => 'Vine-ripened red tomatoes, perfect for salads and cooking. Picked fresh from the farm.',
                'price'       => 120.00,
                'unit'        => 'kg',
                'image_url'   => null,
                'status'      => 'active',
                'qty'         => 150,
                'threshold'   => 20,
            ],
            [
                'seller_id'   => $farmer->user_id,
                'category_id' => $vegCat->category_id,
                'zone_id'     => $kiambuZone?->zone_id,
                'name'        => 'Organic Spinach',
                'description' => 'Fresh leafy spinach, rich in iron and vitamins. Grown without pesticides.',
                'price'       => 80.00,
                'unit'        => 'kg',
                'image_url'   => null,
                'status'      => 'active',
                'qty'         => 5,   // low stock demo
                'threshold'   => 10,
            ],
            [
                'seller_id'   => $farmer->user_id,
                'category_id' => $dairyCat->category_id,
                'zone_id'     => $kiambuZone?->zone_id,
                'name'        => 'Fresh Milk',
                'description' => 'Farm-fresh cow milk from our free-range dairy cows. Collected daily.',
                'price'       => 70.00,
                'unit'        => 'litre',
                'image_url'   => null,
                'status'      => 'active',
                'qty'         => 100,
                'threshold'   => 15,
            ],
            [
                'seller_id'   => $farmer->user_id,
                'category_id' => $dairyCat->category_id,
                'zone_id'     => $kiambuZone?->zone_id,
                'name'        => 'Free Range Eggs',
                'description' => 'Farm-fresh eggs from free-range chickens. No antibiotics, no hormones.',
                'price'       => 15.00,
                'unit'        => 'piece',
                'image_url'   => null,
                'status'      => 'active',
                'qty'         => 0,   // out of stock demo
                'threshold'   => 24,
            ],

            // John Kamau's listings (Nakuru)
            [
                'seller_id'   => $farmer2->user_id,
                'category_id' => $fruitCat->category_id,
                'zone_id'     => $nakuruZone?->zone_id,
                'name'        => 'Fresh Avocados',
                'description' => 'Creamy Haas avocados from our orchard. Perfect for guacamole or toast.',
                'price'       => 180.00,
                'unit'        => 'kg',
                'image_url'   => null,
                'status'      => 'active',
                'qty'         => 120,
                'threshold'   => 15,
            ],
            [
                'seller_id'   => $farmer2->user_id,
                'category_id' => $grainCat->category_id,
                'zone_id'     => $nakuruZone?->zone_id,
                'name'        => 'Dry Maize',
                'description' => 'Quality dry maize from the Rift Valley. Sun-dried and ready for milling.',
                'price'       => 45.00,
                'unit'        => 'kg',
                'image_url'   => null,
                'status'      => 'active',
                'qty'         => 1000,
                'threshold'   => 50,
            ],
            [
                'seller_id'   => $farmer2->user_id,
                'category_id' => $legumeCat->category_id,
                'zone_id'     => $nakuruZone?->zone_id,
                'name'        => 'Red Kidney Beans',
                'description' => 'Protein-rich red kidney beans. Excellent source of fibre and minerals.',
                'price'       => 130.00,
                'unit'        => 'kg',
                'image_url'   => null,
                'status'      => 'active',
                'qty'         => 300,
                'threshold'   => 30,
            ],
            [
                'seller_id'   => $farmer2->user_id,
                'category_id' => $rootCat->category_id,
                'zone_id'     => $nakuruZone?->zone_id,
                'name'        => 'Sweet Potatoes',
                'description' => 'Orange-fleshed sweet potatoes, rich in vitamin A. Harvested this season.',
                'price'       => 90.00,
                'unit'        => 'kg',
                'image_url'   => null,
                'status'      => 'active',
                'qty'         => 200,
                'threshold'   => 20,
            ],
        ];

        foreach ($products as $productData) {
            $qty       = $productData['qty'];
            $threshold = $productData['threshold'];

            unset($productData['qty'], $productData['threshold']);

            $existing = Product::where('seller_id', $productData['seller_id'])
                ->where('name', $productData['name'])
                ->first();

            if (!$existing) {
                $product = Product::create($productData);

                Inventory::create([
                    'product_id'          => $product->product_id,
                    'quantity_available'  => $qty,
                    'low_stock_threshold' => $threshold,
                ]);
            }
        }

        $this->command->info('✅ Seeded: 6 pickup zones, 4 users (admin / 2 farmers / buyer)');
        $this->command->info('   7 categories, 8 sample products with inventory');
        $this->command->info('   Passwords: password123');
    }
}
