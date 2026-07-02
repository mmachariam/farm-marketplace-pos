<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        // Each entry: buyer email (has exactly one Delivered order, from
        // OrderSeeder) => reviews for the products in that order.
        $reviews = [
            'brian.otieno@gmail.com' => [
                ['product' => 'Tomatoes', 'rating' => 5, 'comment' => 'Very fresh tomatoes, arrived in perfect condition. Will order again!'],
                ['product' => 'Kale (Sukuma Wiki)', 'rating' => 4, 'comment' => 'Good quality sukuma wiki, tender leaves.'],
            ],
            'faith.muthoni@gmail.com' => [
                ['product' => 'Avocados', 'rating' => 5, 'comment' => 'Best avocados I have had. Creamy and ripe. Highly recommend Jane\'s farm.'],
                ['product' => 'Passion Fruits', 'rating' => 5, 'comment' => 'So sweet and fresh. Perfect for juice.'],
            ],
            'kevin.njoroge@gmail.com' => [
                ['product' => 'Irish Potatoes', 'rating' => 4, 'comment' => 'Good potatoes, clean and well sized.'],
                ['product' => 'Carrots', 'rating' => 4, 'comment' => 'Fresh and crunchy. Good value for money.'],
            ],
            'mercy.akinyi@gmail.com' => [
                ['product' => 'Fresh Milk', 'rating' => 5, 'comment' => 'Milk is very fresh, you can taste the quality. Same day delivery to zone.'],
                ['product' => 'Free Range Eggs', 'rating' => 5, 'comment' => 'Eggs are large and fresh. The yolk colour shows these are truly free range.'],
            ],
            'james.mwenda@gmail.com' => [
                ['product' => 'Dry Maize', 'rating' => 4, 'comment' => 'Clean Grade 1 maize. Good for milling. Fair price.'],
                ['product' => 'Sweet Potatoes', 'rating' => 5, 'comment' => 'Very sweet and fresh. Children loved them.'],
            ],
            'sandra.wanjiru@gmail.com' => [
                ['product' => 'Wheat', 'rating' => 3, 'comment' => 'Decent quality wheat but had some small stones. Otherwise ok.'],
                ['product' => 'Red Kidney Beans', 'rating' => 4, 'comment' => 'Clean beans, cooked well. Good quantity for the price.'],
            ],
        ];

        $created = 0;
        foreach ($reviews as $email => $productReviews) {
            $buyer = User::where('email', $email)->first();
            if (!$buyer) {
                continue;
            }

            // Each of these buyers has exactly one Delivered order (Order 1-6 in OrderSeeder)
            $order = Order::where('buyer_id', $buyer->user_id)
                ->where('order_status', 'Delivered')
                ->first();
            if (!$order) {
                continue;
            }

            foreach ($productReviews as $r) {
                $product = Product::where('name', $r['product'])->first();
                if (!$product) {
                    continue;
                }

                $review = Review::firstOrCreate(
                    ['order_id' => $order->order_id, 'product_id' => $product->product_id],
                    [
                        'buyer_id' => $buyer->user_id,
                        'rating'   => $r['rating'],
                        'comment'  => $r['comment'],
                    ]
                );

                if ($review->wasRecentlyCreated) {
                    $created++;
                }
            }
        }

        $this->command->info("  reviews : {$created} new reviews created");
    }
}
