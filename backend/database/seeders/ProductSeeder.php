<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\PickupZone;
use App\Models\Product;
use App\Models\User;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // ── Look up seller IDs, category IDs, zone IDs ─────────────────
        $sellers    = User::where('role', 'seller')->pluck('user_id', 'email');
        $categories = Category::pluck('category_id', 'name');
        $zones      = PickupZone::pluck('zone_id', 'zone_name');

        // Stock values reflect remaining inventory AFTER deducting all
        // Delivered and Confirmed order quantities (see OrderSeeder).
        $products = [

            // ── VEGETABLES ─────────────────────────────────────────────
            [
                'seller'      => 'jane.wambui@sokomoja.co.ke',
                'category'    => 'Vegetables',
                'zone'        => 'Kiambu Zone',
                'name'        => 'Tomatoes',
                'description' => 'Fresh vine-ripened tomatoes from Kiambu highlands. Rich red colour, perfect for cooking and salads.',
                'price'       => 80.00,
                'unit'        => 'kg',
                'stock'       => 190,   // 200 initial - 10 (orders 1+7)
                'threshold'   => 20,
            ],
            [
                'seller'      => 'jane.wambui@sokomoja.co.ke',
                'category'    => 'Vegetables',
                'zone'        => 'Kiambu Zone',
                'name'        => 'Kale (Sukuma Wiki)',
                'description' => 'Freshly harvested kale, tender leaves. A Kenyan staple rich in iron and vitamins.',
                'price'       => 30.00,
                'unit'        => 'kg',
                'stock'       => 147,   // 150 initial - 3 (order 1)
                'threshold'   => 20,
            ],
            [
                'seller'      => 'grace.njeri@sokomoja.co.ke',
                'category'    => 'Vegetables',
                'zone'        => 'Kiambu Zone',
                'name'        => 'Spinach',
                'description' => 'Organic spinach grown without pesticides. Ideal for smoothies and cooking.',
                'price'       => 40.00,
                'unit'        => 'kg',
                'stock'       => 78,    // 80 initial - 2 (order 7)
                'threshold'   => 10,
            ],
            [
                'seller'      => 'grace.njeri@sokomoja.co.ke',
                'category'    => 'Vegetables',
                'zone'        => 'Kiambu Zone',
                'name'        => 'Carrots',
                'description' => 'Sweet and crunchy carrots from Kiambu. Perfect for juicing, cooking or eating raw.',
                'price'       => 60.00,
                'unit'        => 'kg',
                'stock'       => 115,   // 120 initial - 5 (order 3)
                'threshold'   => 15,
            ],
            [
                'seller'      => 'mary.wanjiku@sokomoja.co.ke',
                'category'    => 'Vegetables',
                'zone'        => 'Kiambu Zone',
                'name'        => 'Broccoli',
                'description' => 'Fresh green broccoli heads. Nutritious and versatile for stir-fry and soups.',
                'price'       => 120.00,
                'unit'        => 'kg',
                'stock'       => 57,    // 60 initial - 3 (order 7)
                'threshold'   => 10,
            ],
            [
                'seller'      => 'mary.wanjiku@sokomoja.co.ke',
                'category'    => 'Vegetables',
                'zone'        => 'Kiambu Zone',
                'name'        => 'Cabbage',
                'description' => 'Large fresh cabbages, great for coleslaw and stewing.',
                'price'       => 35.00,
                'unit'        => 'kg',
                'stock'       => 180,   // 180 initial (order 14 was cancelled)
                'threshold'   => 20,
            ],

            // ── FRUITS ─────────────────────────────────────────────────
            [
                'seller'      => 'lucy.achieng@sokomoja.co.ke',
                'category'    => 'Fruits',
                'zone'        => 'Kisumu Zone',
                'name'        => 'Avocados',
                'description' => 'Creamy Haas avocados from Kisumu region. Ready to eat, perfect for guacamole.',
                'price'       => 150.00,
                'unit'        => 'kg',
                'stock'       => 196,   // 200 initial - 4 (order 2)
                'threshold'   => 20,
            ],
            [
                'seller'      => 'lucy.achieng@sokomoja.co.ke',
                'category'    => 'Fruits',
                'zone'        => 'Kisumu Zone',
                'name'        => 'Passion Fruits',
                'description' => 'Sweet and tangy purple passion fruits. Excellent for juice and desserts.',
                'price'       => 200.00,
                'unit'        => 'kg',
                'stock'       => 78,    // 80 initial - 2 (order 2)
                'threshold'   => 10,
            ],
            [
                'seller'      => 'john.kamau@sokomoja.co.ke',
                'category'    => 'Fruits',
                'zone'        => 'Nyeri Zone',
                'name'        => 'Bananas',
                'description' => 'Sweet ripe bananas from Nyeri. Great for snacking, baking and smoothies.',
                'price'       => 50.00,
                'unit'        => 'kg',
                'stock'       => 296,   // 300 initial - 4 (order 8)
                'threshold'   => 30,
            ],
            [
                'seller'      => 'john.kamau@sokomoja.co.ke',
                'category'    => 'Fruits',
                'zone'        => 'Nyeri Zone',
                'name'        => 'Mangoes',
                'description' => 'Juicy Apple mangoes from Nyeri. Naturally sweet, no artificial ripening.',
                'price'       => 100.00,
                'unit'        => 'kg',
                'stock'       => 145,   // 150 initial - 5 (order 8)
                'threshold'   => 15,
            ],

            // ── GRAINS & CEREALS ───────────────────────────────────────
            [
                'seller'      => 'samuel.mwangi@sokomoja.co.ke',
                'category'    => 'Grains & Cereals',
                'zone'        => 'Meru Zone',
                'name'        => 'Dry Maize',
                'description' => 'Quality Grade 1 dry maize from Meru highlands. Suitable for ugali and animal feed.',
                'price'       => 45.00,
                'unit'        => 'kg',
                'stock'       => 980,   // 1000 initial - 20 (order 5)
                'threshold'   => 50,
            ],
            [
                'seller'      => 'samuel.mwangi@sokomoja.co.ke',
                'category'    => 'Grains & Cereals',
                'zone'        => 'Meru Zone',
                'name'        => 'Millet',
                'description' => 'Organic finger millet, perfect for porridge and traditional brew.',
                'price'       => 80.00,
                'unit'        => 'kg',
                'stock'       => 400,   // 400 initial (order 11 is Pending — not deducted)
                'threshold'   => 40,
            ],
            [
                'seller'      => 'peter.ochieng@sokomoja.co.ke',
                'category'    => 'Grains & Cereals',
                'zone'        => 'Nakuru Zone',
                'name'        => 'Wheat',
                'description' => 'Clean dry wheat from Nakuru. Ideal for flour milling and animal feed.',
                'price'       => 55.00,
                'unit'        => 'kg',
                'stock'       => 585,   // 600 initial - 15 (order 6)
                'threshold'   => 50,
            ],

            // ── DAIRY & EGGS ───────────────────────────────────────────
            [
                'seller'      => 'peter.ochieng@sokomoja.co.ke',
                'category'    => 'Dairy & Eggs',
                'zone'        => 'Nakuru Zone',
                'name'        => 'Fresh Milk',
                'description' => 'Fresh whole cow milk from grass-fed cows. Collected daily, pasteurized.',
                'price'       => 65.00,
                'unit'        => 'litre',
                'stock'       => 190,   // 200 initial - 10 (order 4)
                'threshold'   => 20,
            ],
            [
                'seller'      => 'david.kipchoge@sokomoja.co.ke',
                'category'    => 'Dairy & Eggs',
                'zone'        => 'Eldoret Zone',
                'name'        => 'Free Range Eggs',
                'description' => 'Farm-fresh eggs from free-range hens. Rich yolk, no hormones or antibiotics.',
                'price'       => 18.00,
                'unit'        => 'piece',
                'stock'       => 470,   // 500 initial - 30 (order 4)
                'threshold'   => 48,
            ],

            // ── ROOTS & TUBERS ─────────────────────────────────────────
            [
                'seller'      => 'samuel.mwangi@sokomoja.co.ke',
                'category'    => 'Roots & Tubers',
                'zone'        => 'Meru Zone',
                'name'        => 'Sweet Potatoes',
                'description' => 'Orange-fleshed sweet potatoes from Meru. Rich in vitamin A, naturally sweet.',
                'price'       => 50.00,
                'unit'        => 'kg',
                'stock'       => 390,   // 400 initial - 10 (order 5)
                'threshold'   => 40,
            ],
            [
                'seller'      => 'grace.njeri@sokomoja.co.ke',
                'category'    => 'Roots & Tubers',
                'zone'        => 'Kiambu Zone',
                'name'        => 'Irish Potatoes',
                'description' => 'Large clean Irish potatoes from Kiambu. Perfect for chips, mash and stews.',
                'price'       => 40.00,
                'unit'        => 'kg',
                'stock'       => 490,   // 500 initial - 10 (order 3)
                'threshold'   => 50,
            ],

            // ── LEGUMES ────────────────────────────────────────────────
            [
                'seller'      => 'mary.wanjiku@sokomoja.co.ke',
                'category'    => 'Legumes',
                'zone'        => 'Kiambu Zone',
                'name'        => 'Red Kidney Beans',
                'description' => 'Dry red kidney beans, locally grown. High protein, great for stews and salads.',
                'price'       => 120.00,
                'unit'        => 'kg',
                'stock'       => 295,   // 300 initial - 5 (order 6)
                'threshold'   => 30,
            ],
            [
                'seller'      => 'john.kamau@sokomoja.co.ke',
                'category'    => 'Legumes',
                'zone'        => 'Nyeri Zone',
                'name'        => 'Green Grams (Ndengu)',
                'description' => 'Clean dry green grams from Nyeri. Fast cooking, rich in protein and minerals.',
                'price'       => 130.00,
                'unit'        => 'kg',
                'stock'       => 197,   // 200 initial - 3 (order 9)
                'threshold'   => 20,
            ],
            [
                'seller'      => 'john.kamau@sokomoja.co.ke',
                'category'    => 'Legumes',
                'zone'        => 'Nyeri Zone',
                'name'        => 'Groundnuts',
                'description' => 'Raw groundnuts, freshly harvested. Great for cooking, roasting and peanut butter.',
                'price'       => 160.00,
                'unit'        => 'kg',
                'stock'       => 148,   // 150 initial - 2 (order 9)
                'threshold'   => 15,
            ],
        ];

        foreach ($products as $data) {
            $sellerId   = $sellers[$data['seller']];
            $categoryId = $categories[$data['category']];
            $zoneId     = $zones[$data['zone']];

            $product = Product::firstOrCreate(
                ['seller_id' => $sellerId, 'name' => $data['name']],
                [
                    'category_id' => $categoryId,
                    'zone_id'     => $zoneId,
                    'description' => $data['description'],
                    'price'       => $data['price'],
                    'unit'        => $data['unit'],
                    'image_url'   => null,
                    'status'      => 'active',
                ]
            );

            Inventory::updateOrCreate(
                ['product_id' => $product->product_id],
                [
                    'quantity_available'  => $data['stock'],
                    'low_stock_threshold' => $data['threshold'],
                ]
            );
        }

        $this->command->info('  products     : ' . Product::count());
        $this->command->info('  inventory    : ' . Inventory::count());
    }
}
