<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class InventoryFlowTest extends TestCase
{
    use DatabaseTransactions;

    private function makeSeller(): User
    {
        return User::create([
            'name'        => 'Jane Farmer',
            'email'       => 'jane+' . uniqid() . '@sokomoja.co.ke',
            'password'    => bcrypt('password'),
            'phone_number'=> '0700000000',
            'role'        => 'seller',
            'is_verified' => true,
            'status'      => 'active',
        ]);
    }

    private function makeBuyer(): User
    {
        return User::create([
            'name'        => 'Bob Buyer',
            'email'       => 'bob+' . uniqid() . '@sokomoja.co.ke',
            'password'    => bcrypt('password'),
            'phone_number'=> '0711111111',
            'role'        => 'buyer',
            'is_verified' => true,
            'status'      => 'active',
        ]);
    }

    private function makeProduct(User $seller, string $name, float $stock, float $price = 50): Product
    {
        $category = Category::firstOrCreate(
            ['name' => 'Vegetables'],
            ['slug' => 'vegetables']
        );

        $product = Product::create([
            'seller_id'   => $seller->user_id,
            'category_id' => $category->category_id,
            'name'        => $name,
            'description' => 'Test product',
            'price'       => $price,
            'unit'        => 'kg',
            'status'      => 'active',
        ]);

        Inventory::create([
            'product_id'          => $product->product_id,
            'quantity_available'  => $stock,
            'low_stock_threshold' => 10,
        ]);

        return $product;
    }

    // ── Offline sale deducts inventory ───────────────────────────────
    public function test_offline_sale_deducts_matching_inventory(): void
    {
        $seller  = $this->makeSeller();
        $product = $this->makeProduct($seller, 'Tomatoes', 100);

        $response = $this->actingAs($seller, 'api')->postJson('/api/seller/sales', [
            'payment_method' => 'Cash',
            'items' => [
                ['product_name' => 'Tomatoes', 'quantity' => 10, 'unit_price' => 50],
            ],
        ]);

        $response->assertStatus(201);
        $response->assertJson(['inventory_updated' => true]);

        $this->assertEquals(90, (float) $product->inventory()->first()->quantity_available);
    }

    // ── Case-insensitive / trimmed matching ──────────────────────────
    public function test_offline_sale_matches_product_case_insensitively_and_trims_whitespace(): void
    {
        $seller  = $this->makeSeller();
        $product = $this->makeProduct($seller, 'Tomatoes', 100);

        $response = $this->actingAs($seller, 'api')->postJson('/api/seller/sales', [
            'payment_method' => 'Cash',
            'items' => [
                ['product_name' => '  tomatoes  ', 'quantity' => 5, 'unit_price' => 50],
            ],
        ]);

        $response->assertStatus(201);
        $this->assertEquals(95, (float) $product->inventory()->first()->quantity_available);
    }

    // ── Unlisted product is skipped silently ─────────────────────────
    public function test_offline_sale_with_unlisted_product_is_recorded_without_error(): void
    {
        $seller = $this->makeSeller();

        $response = $this->actingAs($seller, 'api')->postJson('/api/seller/sales', [
            'payment_method' => 'Cash',
            'items' => [
                ['product_name' => 'Random Unlisted Herb', 'quantity' => 2, 'unit_price' => 20],
            ],
        ]);

        $response->assertStatus(201);
        $response->assertJsonMissing(['inventory_updated' => true]);
        $this->assertDatabaseHas('pos_sale_items', ['product_name' => 'Random Unlisted Herb']);
    }

    // ── Inventory never drops below zero ─────────────────────────────
    public function test_offline_sale_never_drops_inventory_below_zero(): void
    {
        $seller  = $this->makeSeller();
        $product = $this->makeProduct($seller, 'Kale', 5);

        $response = $this->actingAs($seller, 'api')->postJson('/api/seller/sales', [
            'payment_method' => 'Cash',
            'items' => [
                ['product_name' => 'Kale', 'quantity' => 20, 'unit_price' => 30],
            ],
        ]);

        $response->assertStatus(201);
        $this->assertEquals(0, (float) $product->inventory()->first()->quantity_available);
    }

    // ── Multiple items deduct correctly ──────────────────────────────
    public function test_offline_sale_deducts_multiple_products_correctly(): void
    {
        $seller = $this->makeSeller();
        $tomatoes = $this->makeProduct($seller, 'Tomatoes', 100);
        $kale     = $this->makeProduct($seller, 'Kale', 50);

        $response = $this->actingAs($seller, 'api')->postJson('/api/seller/sales', [
            'payment_method' => 'Cash',
            'items' => [
                ['product_name' => 'Tomatoes', 'quantity' => 10, 'unit_price' => 50],
                ['product_name' => 'Kale', 'quantity' => 5, 'unit_price' => 30],
            ],
        ]);

        $response->assertStatus(201);
        $this->assertEquals(90, (float) $tomatoes->inventory()->first()->quantity_available);
        $this->assertEquals(45, (float) $kale->inventory()->first()->quantity_available);
    }

    // ── Product from a different seller is not matched ───────────────
    public function test_offline_sale_does_not_match_another_sellers_product(): void
    {
        $sellerA = $this->makeSeller();
        $sellerB = $this->makeSeller();
        $product = $this->makeProduct($sellerB, 'Tomatoes', 100);

        $response = $this->actingAs($sellerA, 'api')->postJson('/api/seller/sales', [
            'payment_method' => 'Cash',
            'items' => [
                ['product_name' => 'Tomatoes', 'quantity' => 10, 'unit_price' => 50],
            ],
        ]);

        $response->assertStatus(201);
        $response->assertJsonMissing(['inventory_updated' => true]);
        $this->assertEquals(100, (float) $product->inventory()->first()->quantity_available);
    }

    // ── Marketplace checkout still deducts inventory (regression) ────
    public function test_marketplace_checkout_deducts_inventory(): void
    {
        $seller  = $this->makeSeller();
        $buyer   = $this->makeBuyer();
        $product = $this->makeProduct($seller, 'Onions', 40, 60);

        $response = $this->actingAs($buyer, 'api')->postJson('/api/orders', [
            'items' => [
                ['product_id' => $product->product_id, 'quantity' => 5],
            ],
            'delivery_address' => '123 Test Street',
            'payment_method'   => 'Cash',
        ]);

        $response->assertStatus(201);
        $this->assertEquals(35, (float) $product->inventory()->first()->quantity_available);
    }

    // ── Seller order cancellation restores only that seller's stock ──
    public function test_seller_cancellation_restores_inventory(): void
    {
        $seller  = $this->makeSeller();
        $buyer   = $this->makeBuyer();
        $product = $this->makeProduct($seller, 'Carrots', 40, 45);

        $order = Order::create([
            'buyer_id'     => $buyer->user_id,
            'total_amount' => 225,
            'order_status' => 'Pending',
        ]);

        OrderItem::create([
            'order_id'   => $order->order_id,
            'product_id' => $product->product_id,
            'quantity'   => 5,
            'unit_price' => 45,
            'subtotal'   => 225,
        ]);

        $product->inventory()->first()->update(['quantity_available' => 35]);

        $response = $this->actingAs($seller, 'api')->patchJson("/api/seller/orders/{$order->order_id}", [
            'status' => 'Cancelled',
        ]);

        $response->assertStatus(200);
        $this->assertEquals(40, (float) $product->inventory()->first()->quantity_available);
    }
}
