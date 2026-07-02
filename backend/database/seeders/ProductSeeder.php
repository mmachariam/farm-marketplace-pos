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
                'zone'        => 'Kiambu',
                'name'        => 'Tomatoes',
                'description' => 'Fresh vine-ripened tomatoes from Kiambu highlands. Rich red colour, perfect for cooking and salads.',
                'price'       => 80.00,
                'unit'        => 'kg',
                'stock'       => 190,   // 200 initial - 10 (orders 1+7)
                'threshold'   => 20,
                'image'       => 'tomatoes.jpg',
            ],
            [
                'seller'      => 'jane.wambui@sokomoja.co.ke',
                'category'    => 'Vegetables',
                'zone'        => 'Kiambu',
                'name'        => 'Kale (Sukuma Wiki)',
                'description' => 'Freshly harvested kale, tender leaves. A Kenyan staple rich in iron and vitamins.',
                'price'       => 30.00,
                'unit'        => 'bunch',
                'bunch_contains' => 'Approx 500g',
                'stock'       => 147,   // 150 initial - 3 (order 1)
                'threshold'   => 20,
                'image'       => 'kale.jpg',
            ],
            [
                'seller'      => 'grace.njeri@sokomoja.co.ke',
                'category'    => 'Vegetables',
                'zone'        => 'Kiambu',
                'name'        => 'Spinach',
                'description' => 'Organic spinach grown without pesticides. Ideal for smoothies and cooking.',
                'price'       => 40.00,
                'unit'        => 'bunch',
                'bunch_contains' => 'Approx 300g',
                'stock'       => 78,    // 80 initial - 2 (order 7)
                'threshold'   => 10,
                'image'       => 'spinach.jpg',
            ],
            [
                'seller'      => 'grace.njeri@sokomoja.co.ke',
                'category'    => 'Vegetables',
                'zone'        => 'Kiambu',
                'name'        => 'Carrots',
                'description' => 'Sweet and crunchy carrots from Kiambu. Perfect for juicing, cooking or eating raw.',
                'price'       => 60.00,
                'unit'        => 'kg',
                'stock'       => 115,   // 120 initial - 5 (order 3)
                'threshold'   => 15,
                'image'       => 'carrots.jpg',
            ],
            [
                'seller'      => 'mary.wanjiku@sokomoja.co.ke',
                'category'    => 'Vegetables',
                'zone'        => 'Kiambu',
                'name'        => 'Broccoli',
                'description' => 'Fresh green broccoli heads. Nutritious and versatile for stir-fry and soups.',
                'price'       => 120.00,
                'unit'        => 'piece',
                'bunch_contains' => '1 head, approx 400g',
                'stock'       => 57,    // 60 initial - 3 (order 7)
                'threshold'   => 10,
                'image'       => 'broccoli.jpg',
            ],
            [
                'seller'      => 'mary.wanjiku@sokomoja.co.ke',
                'category'    => 'Vegetables',
                'zone'        => 'Kiambu',
                'name'        => 'Cabbage',
                'description' => 'Large fresh cabbages, great for coleslaw and stewing.',
                'price'       => 35.00,
                'unit'        => 'piece',
                'bunch_contains' => '1 head, approx 1kg',
                'stock'       => 180,   // 180 initial (order 14 was cancelled)
                'threshold'   => 20,
                'image'       => 'cabbage.jpg',
            ],

            // ── FRUITS ─────────────────────────────────────────────────
            [
                'seller'      => 'lucy.achieng@sokomoja.co.ke',
                'category'    => 'Fruits',
                'zone'        => 'Kisumu',
                'name'        => 'Avocados',
                'description' => 'Creamy Haas avocados from Kisumu region. Ready to eat, perfect for guacamole.',
                'price'       => 150.00,
                'unit'        => 'kg',
                'stock'       => 196,   // 200 initial - 4 (order 2)
                'threshold'   => 20,
                'image'       => 'avocados.jpg',
            ],
            [
                'seller'      => 'lucy.achieng@sokomoja.co.ke',
                'category'    => 'Fruits',
                'zone'        => 'Kisumu',
                'name'        => 'Passion Fruits',
                'description' => 'Sweet and tangy purple passion fruits. Excellent for juice and desserts.',
                'price'       => 200.00,
                'unit'        => 'kg',
                'stock'       => 78,    // 80 initial - 2 (order 2)
                'threshold'   => 10,
                'image'       => 'passion-fruits.jpg',
            ],
            [
                'seller'      => 'john.kamau@sokomoja.co.ke',
                'category'    => 'Fruits',
                'zone'        => 'Nyeri',
                'name'        => 'Bananas',
                'description' => 'Sweet ripe bananas from Nyeri. Great for snacking, baking and smoothies.',
                'price'       => 50.00,
                'unit'        => 'bunch',
                'bunch_contains' => 'Approx 1kg, 8-10 fingers',
                'stock'       => 296,   // 300 initial - 4 (order 8)
                'threshold'   => 30,
                'image'       => 'bananas.jpg',
            ],
            [
                'seller'      => 'john.kamau@sokomoja.co.ke',
                'category'    => 'Fruits',
                'zone'        => 'Nyeri',
                'name'        => 'Mangoes',
                'description' => 'Juicy Apple mangoes from Nyeri. Naturally sweet, no artificial ripening.',
                'price'       => 100.00,
                'unit'        => 'kg',
                'stock'       => 145,   // 150 initial - 5 (order 8)
                'threshold'   => 15,
                'image'       => 'mangoes.jpg',
            ],

            // ── GRAINS & CEREALS ───────────────────────────────────────
            [
                'seller'      => 'samuel.mwangi@sokomoja.co.ke',
                'category'    => 'Grains & Cereals',
                'zone'        => 'Meru',
                'name'        => 'Dry Maize',
                'description' => 'Quality Grade 1 dry maize from Meru highlands. Suitable for ugali and animal feed.',
                'price'       => 45.00,
                'unit'        => 'kg',
                'stock'       => 980,   // 1000 initial - 20 (order 5)
                'threshold'   => 50,
                'image'       => 'dry-maize.jpg',
            ],
            [
                'seller'      => 'samuel.mwangi@sokomoja.co.ke',
                'category'    => 'Grains & Cereals',
                'zone'        => 'Meru',
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
                'zone'        => 'Nakuru',
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
                'zone'        => 'Nakuru',
                'name'        => 'Fresh Milk',
                'description' => 'Fresh whole cow milk from grass-fed cows. Collected daily, pasteurized.',
                'price'       => 65.00,
                'unit'        => 'litre',
                'stock'       => 190,   // 200 initial - 10 (order 4)
                'threshold'   => 20,
                'image'       => 'fresh-milk.jpg',
            ],
            [
                'seller'      => 'david.kipchoge@sokomoja.co.ke',
                'category'    => 'Dairy & Eggs',
                'zone'        => 'Eldoret',
                'name'        => 'Free Range Eggs',
                'description' => 'Farm-fresh eggs from free-range hens. Rich yolk, no hormones or antibiotics.',
                'price'       => 18.00,
                'unit'        => 'piece',
                'stock'       => 470,   // 500 initial - 30 (order 4)
                'threshold'   => 48,
                'image'       => 'eggs.jpg',
            ],

            // ── ROOTS & TUBERS ─────────────────────────────────────────
            [
                'seller'      => 'samuel.mwangi@sokomoja.co.ke',
                'category'    => 'Roots & Tubers',
                'zone'        => 'Meru',
                'name'        => 'Sweet Potatoes',
                'description' => 'Orange-fleshed sweet potatoes from Meru. Rich in vitamin A, naturally sweet.',
                'price'       => 50.00,
                'unit'        => 'kg',
                'stock'       => 390,   // 400 initial - 10 (order 5)
                'threshold'   => 40,
                'image'       => 'sweet-potatoes.jpg',
            ],
            [
                'seller'      => 'grace.njeri@sokomoja.co.ke',
                'category'    => 'Roots & Tubers',
                'zone'        => 'Kiambu',
                'name'        => 'Irish Potatoes',
                'description' => 'Large clean Irish potatoes from Kiambu. Perfect for chips, mash and stews.',
                'price'       => 40.00,
                'unit'        => 'kg',
                'stock'       => 490,   // 500 initial - 10 (order 3)
                'threshold'   => 50,
                'image'       => 'irish-potatoes.jpg',
            ],

            // ── LEGUMES ────────────────────────────────────────────────
            [
                'seller'      => 'mary.wanjiku@sokomoja.co.ke',
                'category'    => 'Legumes',
                'zone'        => 'Kiambu',
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
                'zone'        => 'Nyeri',
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
                'zone'        => 'Nyeri',
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

            $product = Product::updateOrCreate(
                ['seller_id' => $sellerId, 'name' => $data['name']],
                [
                    'category_id' => $categoryId,
                    'zone_id'     => $zoneId,
                    'description' => $data['description'],
                    'price'       => $data['price'],
                    'unit'        => $data['unit'],
                    'bunch_contains' => $data['bunch_contains'] ?? null,
                    'image_url'   => isset($data['image']) ? '/images/products/' . $data['image'] : null,
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
