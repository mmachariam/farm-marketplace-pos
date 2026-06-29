<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\PickupZone;
use App\Models\Product;
use App\Models\User;

class OrderSeeder extends Seeder
{
    // Populated in run(), used by makeOrder()
    private array $buyers   = [];  // email => ['id', 'phone']
    private array $products = [];  // name  => ['id', 'price']
    private array $zones    = [];  // zone_name => zone_id

    public function run(): void
    {
        // ── Truncate in FK-safe order ──────────────────────────────────
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('deliveries')->truncate();
        DB::table('payments')->truncate();
        DB::table('order_items')->truncate();
        DB::table('orders')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // ── Load lookups ───────────────────────────────────────────────
        foreach (User::where('role', 'buyer')->get() as $b) {
            $this->buyers[$b->email] = ['id' => $b->user_id, 'phone' => $b->phone_number];
        }
        foreach (Product::all() as $p) {
            $this->products[$p->name] = ['id' => $p->product_id, 'price' => (float) $p->price];
        }
        foreach (PickupZone::all() as $z) {
            $this->zones[$z->zone_name] = $z->zone_id;
        }

        $now = Carbon::now();

        // ── Order 1 — Delivered, 25 days ago ──────────────────────────
        $this->makeOrder(
            buyer:     'brian.otieno@gmail.com',
            status:    'Delivered',
            date:      $now->copy()->subDays(25),
            items:     [['Tomatoes', 5], ['Kale (Sukuma Wiki)', 3]],
            zone:      'Kiambu Zone',
            payMethod: 'M-Pesa',
            payStatus: 'Completed',
            receipt:   'QJK2X3Y4Z5'
        );

        // ── Order 2 — Delivered, 22 days ago ──────────────────────────
        $this->makeOrder(
            buyer:     'faith.muthoni@gmail.com',
            status:    'Delivered',
            date:      $now->copy()->subDays(22),
            items:     [['Avocados', 4], ['Passion Fruits', 2]],
            zone:      'Nairobi CBD',
            payMethod: 'M-Pesa',
            payStatus: 'Completed',
            receipt:   'RKL3Y4Z5A6'
        );

        // ── Order 3 — Delivered, 20 days ago ──────────────────────────
        $this->makeOrder(
            buyer:     'kevin.njoroge@gmail.com',
            status:    'Delivered',
            date:      $now->copy()->subDays(20),
            items:     [['Irish Potatoes', 10], ['Carrots', 5]],
            zone:      'Kiambu Zone',
            payMethod: 'Cash',
            payStatus: 'Completed'
        );

        // ── Order 4 — Delivered, 18 days ago ──────────────────────────
        $this->makeOrder(
            buyer:     'mercy.akinyi@gmail.com',
            status:    'Delivered',
            date:      $now->copy()->subDays(18),
            items:     [['Fresh Milk', 10], ['Free Range Eggs', 30]],
            zone:      'Kisumu Zone',
            payMethod: 'M-Pesa',
            payStatus: 'Completed',
            receipt:   'SLM4Z5A6B7'
        );

        // ── Order 5 — Delivered, 15 days ago ──────────────────────────
        $this->makeOrder(
            buyer:     'james.mwenda@gmail.com',
            status:    'Delivered',
            date:      $now->copy()->subDays(15),
            items:     [['Dry Maize', 20], ['Sweet Potatoes', 10]],
            zone:      'Meru Zone',
            payMethod: 'M-Pesa',
            payStatus: 'Completed',
            receipt:   'TMN5A6B7C8'
        );

        // ── Order 6 — Delivered, 12 days ago ──────────────────────────
        $this->makeOrder(
            buyer:     'sandra.wanjiru@gmail.com',
            status:    'Delivered',
            date:      $now->copy()->subDays(12),
            items:     [['Wheat', 15], ['Red Kidney Beans', 5]],
            zone:      'Nakuru Zone',
            payMethod: 'M-Pesa',
            payStatus: 'Completed',
            receipt:   'UNO6B7C8D9'
        );

        // ── Order 7 — Confirmed, 8 days ago ───────────────────────────
        $this->makeOrder(
            buyer:     'brian.otieno@gmail.com',
            status:    'Confirmed',
            date:      $now->copy()->subDays(8),
            items:     [['Broccoli', 3], ['Spinach', 2], ['Tomatoes', 5]],
            zone:      'Kiambu Zone',
            payMethod: 'M-Pesa',
            payStatus: 'Completed',
            receipt:   'VOP7C8D9E0'
        );

        // ── Order 8 — Confirmed, 7 days ago ───────────────────────────
        $this->makeOrder(
            buyer:     'faith.muthoni@gmail.com',
            status:    'Confirmed',
            date:      $now->copy()->subDays(7),
            items:     [['Mangoes', 5], ['Bananas', 4]],
            zone:      'Nairobi CBD',
            payMethod: 'Cash',
            payStatus: 'Completed'
        );

        // ── Order 9 — Confirmed, 6 days ago ───────────────────────────
        $this->makeOrder(
            buyer:     'kevin.njoroge@gmail.com',
            status:    'Confirmed',
            date:      $now->copy()->subDays(6),
            items:     [['Green Grams (Ndengu)', 3], ['Groundnuts', 2]],
            zone:      'Kiambu Zone',
            payMethod: 'M-Pesa',
            payStatus: 'Completed',
            receipt:   'WPQ8D9E0F1'
        );

        // ── Order 10 — Pending, 4 days ago ────────────────────────────
        $this->makeOrder(
            buyer:     'mercy.akinyi@gmail.com',
            status:    'Pending',
            date:      $now->copy()->subDays(4),
            items:     [['Avocados', 6], ['Passion Fruits', 3]],
            zone:      'Kisumu Zone',
            payMethod: 'M-Pesa',
            payStatus: 'Pending'
        );

        // ── Order 11 — Pending, 3 days ago ────────────────────────────
        $this->makeOrder(
            buyer:     'james.mwenda@gmail.com',
            status:    'Pending',
            date:      $now->copy()->subDays(3),
            items:     [['Millet', 5], ['Dry Maize', 10]],
            zone:      'Meru Zone',
            payMethod: 'M-Pesa',
            payStatus: 'Pending'
        );

        // ── Order 12 — Pending, 2 days ago ────────────────────────────
        $this->makeOrder(
            buyer:     'sandra.wanjiru@gmail.com',
            status:    'Pending',
            date:      $now->copy()->subDays(2),
            items:     [['Fresh Milk', 5], ['Free Range Eggs', 20]],
            zone:      'Nakuru Zone',
            payMethod: 'Cash',
            payStatus: 'Pending'
        );

        // ── Order 13 — Pending, 1 day ago ─────────────────────────────
        $this->makeOrder(
            buyer:     'brian.otieno@gmail.com',
            status:    'Pending',
            date:      $now->copy()->subDays(1),
            items:     [['Sweet Potatoes', 8], ['Irish Potatoes', 10]],
            zone:      'Kiambu Zone',
            payMethod: 'M-Pesa',
            payStatus: 'Pending'
        );

        // ── Order 14 — Cancelled, 10 days ago ─────────────────────────
        $this->makeOrder(
            buyer:     'faith.muthoni@gmail.com',
            status:    'Cancelled',
            date:      $now->copy()->subDays(10),
            items:     [['Cabbage', 5], ['Carrots', 3]],
            zone:      'Nairobi CBD',
            payMethod: 'M-Pesa',
            payStatus: 'Failed'
        );

        // ── Order 15 — Cancelled, 9 days ago ──────────────────────────
        $this->makeOrder(
            buyer:     'kevin.njoroge@gmail.com',
            status:    'Cancelled',
            date:      $now->copy()->subDays(9),
            items:     [['Red Kidney Beans', 5]],
            zone:      'Kiambu Zone',
            payMethod: 'Cash',
            payStatus: 'Failed'
        );

        $this->command->info('  orders       : ' . DB::table('orders')->count());
        $this->command->info('  order_items  : ' . DB::table('order_items')->count());
        $this->command->info('  payments     : ' . DB::table('payments')->count());
        $this->command->info('  deliveries   : ' . DB::table('deliveries')->count());
    }

    /**
     * Insert one complete order: order + items + payment + delivery.
     *
     * Uses DB::table() directly to bypass $fillable restrictions on fields
     * like order_date and payment_date that are not in model fillable arrays.
     *
     * @param  array<array{0:string,1:int}> $items  [['product name', qty], ...]
     */
    private function makeOrder(
        string $buyer,
        string $status,
        Carbon $date,
        array  $items,
        string $zone,
        string $payMethod,
        string $payStatus,
        ?string $receipt = null
    ): void {
        $buyerData = $this->buyers[$buyer];
        $zoneId    = $this->zones[$zone];
        $dateStr   = $date->toDateTimeString();

        // Calculate total from product prices
        $total    = 0.0;
        $itemRows = [];
        foreach ($items as [$productName, $qty]) {
            $product  = $this->products[$productName];
            $subtotal = $product['price'] * $qty;
            $total   += $subtotal;
            $itemRows[] = [
                'product_id' => $product['id'],
                'qty'        => $qty,
                'price'      => $product['price'],
                'subtotal'   => $subtotal,
            ];
        }

        // ── orders ────────────────────────────────────────────────────
        $orderId = DB::table('orders')->insertGetId([
            'buyer_id'     => $buyerData['id'],
            'total_amount' => $total,
            'order_status' => $status,
            'order_date'   => $dateStr,
            'created_at'   => $dateStr,
            'updated_at'   => $dateStr,
        ]);

        // ── order_items (no timestamps) ───────────────────────────────
        foreach ($itemRows as $row) {
            DB::table('order_items')->insert([
                'order_id'   => $orderId,
                'product_id' => $row['product_id'],
                'quantity'   => $row['qty'],
                'unit_price' => $row['price'],
                'subtotal'   => $row['subtotal'],
            ]);
        }

        // ── payments ──────────────────────────────────────────────────
        DB::table('payments')->insert([
            'order_id'             => $orderId,
            'payment_method'       => $payMethod,
            'amount'               => $total,
            'payment_status'       => $payStatus,
            'phone_number'         => $payMethod === 'M-Pesa' ? $buyerData['phone'] : null,
            'mpesa_receipt_number' => $receipt,
            'payment_date'         => $dateStr,
            'created_at'           => $dateStr,
            'updated_at'           => $dateStr,
        ]);

        // ── deliveries ────────────────────────────────────────────────
        $deliveryStatus = match ($status) {
            'Delivered' => 'Delivered',
            'Confirmed' => 'In Transit',
            default     => 'Pending',
        };

        $deliveryDate = $status === 'Delivered'
            ? $date->copy()->addDays(2)->toDateString()
            : null;

        DB::table('deliveries')->insert([
            'order_id'        => $orderId,
            'zone_id'         => $zoneId,
            'delivery_status' => $deliveryStatus,
            'delivery_date'   => $deliveryDate,
            'created_at'      => $dateStr,
            'updated_at'      => $dateStr,
        ]);
    }
}
