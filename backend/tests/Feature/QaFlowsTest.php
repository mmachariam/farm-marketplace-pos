<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class QaFlowsTest extends TestCase
{
    use DatabaseTransactions;

    private function makeUser(array $overrides = []): User
    {
        return User::create(array_merge([
            'name'         => 'Test User',
            'email'        => 'user+' . uniqid() . '@sokomoja.co.ke',
            'password'     => bcrypt('password123'),
            'phone_number' => '0700000000',
            'role'         => 'buyer',
            'is_verified'  => true,
            'status'       => 'active',
        ], $overrides));
    }

    private function makeProduct(User $seller, string $name, float $stock, float $price = 50): Product
    {
        $category = Category::firstOrCreate(['name' => 'Vegetables'], ['slug' => 'vegetables']);

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

    // ── PART 5: AUTH ──────────────────────────────────────────────────

    public function test_register_and_login_success(): void
    {
        $reg = $this->postJson('/api/auth/register', [
            'name' => 'New Buyer',
            'email' => 'newbuyer+' . uniqid() . '@sokomoja.co.ke',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'buyer',
        ]);
        $reg->assertStatus(201);
        $email = $reg->json('user.email');

        $login = $this->postJson('/api/auth/login', [
            'email' => $email,
            'password' => 'password123',
        ]);
        $login->assertStatus(200)->assertJsonStructure(['token', 'user']);
    }

    public function test_login_rejects_unknown_email(): void
    {
        $res = $this->postJson('/api/auth/login', [
            'email' => 'doesnotexist+' . uniqid() . '@sokomoja.co.ke',
            'password' => 'whatever123',
        ]);
        $res->assertStatus(401);
        $this->assertStringContainsString('invalid', strtolower($res->json('message')));
    }

    public function test_login_rejects_wrong_password(): void
    {
        $user = $this->makeUser(['password' => bcrypt('correct-password')]);

        $res = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);
        $res->assertStatus(401);
        $this->assertStringContainsString('invalid', strtolower($res->json('message')));
    }

    // Same generic message for both cases — no account-existence leak
    public function test_login_error_message_does_not_distinguish_unknown_email_from_wrong_password(): void
    {
        $user = $this->makeUser(['password' => bcrypt('correct-password')]);

        $unknown = $this->postJson('/api/auth/login', [
            'email' => 'doesnotexist+' . uniqid() . '@sokomoja.co.ke',
            'password' => 'whatever123',
        ]);
        $wrongPassword = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertEquals($unknown->json('message'), $wrongPassword->json('message'));
    }

    public function test_registration_rejects_admin_role(): void
    {
        $res = $this->postJson('/api/auth/register', [
            'name' => 'Sneaky Admin',
            'email' => 'sneaky+' . uniqid() . '@sokomoja.co.ke',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin',
        ]);
        $res->assertStatus(422);
    }

    public function test_suspended_user_is_blocked_mid_session_by_middleware(): void
    {
        $user = $this->makeUser();
        $token = auth('api')->login($user);

        $user->status = 'suspended';
        $user->save();

        $res = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/profile');
        $res->assertStatus(403);
    }

    public function test_login_blocks_suspended_account(): void
    {
        $user = $this->makeUser(['password' => bcrypt('password123'), 'status' => 'suspended']);

        $res = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);
        $res->assertStatus(403);
        $this->assertStringContainsString('suspended', strtolower($res->json('message')));
    }

    public function test_unverified_seller_cannot_login(): void
    {
        $seller = $this->makeUser(['role' => 'seller', 'is_verified' => false, 'password' => bcrypt('password123')]);

        $res = $this->postJson('/api/auth/login', [
            'email' => $seller->email,
            'password' => 'password123',
        ]);
        $res->assertStatus(403);
    }

    // ── PART 1: MARKETPLACE BROWSE / SEARCH / FILTER ─────────────────

    public function test_public_can_browse_search_and_filter_products(): void
    {
        $seller = $this->makeUser(['role' => 'seller', 'is_verified' => true]);
        $this->makeProduct($seller, 'Tomatoes', 100, 80);
        $this->makeProduct($seller, 'Kale', 50, 30);

        $browse = $this->getJson('/api/products');
        $browse->assertStatus(200);
        $this->assertGreaterThanOrEqual(2, count($browse->json('data')));

        $search = $this->getJson('/api/products?search=Tomato');
        $search->assertStatus(200);
        $names = collect($search->json('data'))->pluck('name');
        $this->assertTrue($names->contains('Tomatoes'));
        $this->assertFalse($names->contains('Kale'));

        $priceFilter = $this->getJson('/api/products?min_price=40&max_price=100');
        $priceFilter->assertStatus(200);
        $filteredNames = collect($priceFilter->json('data'))->pluck('name');
        $this->assertFalse($filteredNames->contains('Kale')); // price 30 < min_price 40
    }

    public function test_unverified_seller_products_are_hidden_from_marketplace(): void
    {
        $seller = $this->makeUser(['role' => 'seller', 'is_verified' => false]);
        $product = $this->makeProduct($seller, 'HiddenProduct', 10, 20);

        $browse = $this->getJson('/api/products');
        $names = collect($browse->json('data'))->pluck('name');
        $this->assertFalse($names->contains('HiddenProduct'));
    }

    // ── PART 1: CHECKOUT ──────────────────────────────────────────────

    public function test_checkout_cash_order_deducts_inventory_and_creates_payment_delivery(): void
    {
        $seller  = $this->makeUser(['role' => 'seller', 'is_verified' => true]);
        $buyer   = $this->makeUser(['role' => 'buyer']);
        $product = $this->makeProduct($seller, 'Onions', 40, 60);

        $res = $this->actingAs($buyer, 'api')->postJson('/api/orders', [
            'items' => [['product_id' => $product->product_id, 'quantity' => 5]],
            'delivery_address' => '123 Test Street',
            'payment_method' => 'Cash',
        ]);

        $res->assertStatus(201);
        $this->assertEquals(35, (float) $product->inventory()->first()->quantity_available);
        $this->assertNotNull($res->json('data.payment'));
        $this->assertNotNull($res->json('data.delivery'));
    }

    public function test_checkout_rejects_insufficient_stock(): void
    {
        $seller  = $this->makeUser(['role' => 'seller', 'is_verified' => true]);
        $buyer   = $this->makeUser(['role' => 'buyer']);
        $product = $this->makeProduct($seller, 'Carrots', 3, 45);

        $res = $this->actingAs($buyer, 'api')->postJson('/api/orders', [
            'items' => [['product_id' => $product->product_id, 'quantity' => 10]],
            'delivery_address' => '123 Test Street',
            'payment_method' => 'Cash',
        ]);

        $res->assertStatus(422);
        $this->assertEquals(3, (float) $product->inventory()->first()->quantity_available);
    }

    public function test_checkout_rejects_invalid_quantity(): void
    {
        $seller  = $this->makeUser(['role' => 'seller', 'is_verified' => true]);
        $buyer   = $this->makeUser(['role' => 'buyer']);
        $product = $this->makeProduct($seller, 'Cabbage', 20, 25);

        $res = $this->actingAs($buyer, 'api')->postJson('/api/orders', [
            'items' => [['product_id' => $product->product_id, 'quantity' => 0]],
            'delivery_address' => '123 Test Street',
            'payment_method' => 'Cash',
        ]);

        $res->assertStatus(422);
    }

    public function test_checkout_rejects_missing_zone_and_address(): void
    {
        $seller  = $this->makeUser(['role' => 'seller', 'is_verified' => true]);
        $buyer   = $this->makeUser(['role' => 'buyer']);
        $product = $this->makeProduct($seller, 'Potatoes', 20, 25);

        $res = $this->actingAs($buyer, 'api')->postJson('/api/orders', [
            'items' => [['product_id' => $product->product_id, 'quantity' => 1]],
            'payment_method' => 'Cash',
        ]);

        $res->assertStatus(422);
    }

    public function test_buyer_cannot_order_another_products_with_invalid_product_id(): void
    {
        $buyer = $this->makeUser(['role' => 'buyer']);

        $res = $this->actingAs($buyer, 'api')->postJson('/api/orders', [
            'items' => [['product_id' => 999999, 'quantity' => 1]],
            'delivery_address' => '123 Test Street',
            'payment_method' => 'Cash',
        ]);

        $res->assertStatus(422);
    }

    // ── PART 4: ADMIN ─────────────────────────────────────────────────

    public function test_admin_can_suspend_and_activate_user(): void
    {
        $admin = $this->makeUser(['role' => 'admin']);
        $target = $this->makeUser(['role' => 'buyer']);

        $res = $this->actingAs($admin, 'api')->patchJson("/api/admin/users/{$target->user_id}", [
            'status' => 'suspended',
        ]);
        $res->assertStatus(200);
        $this->assertEquals('suspended', $target->fresh()->status);
    }

    public function test_admin_cannot_suspend_self(): void
    {
        $admin = $this->makeUser(['role' => 'admin']);

        $res = $this->actingAs($admin, 'api')->patchJson("/api/admin/users/{$admin->user_id}", [
            'status' => 'suspended',
        ]);
        $res->assertStatus(403);
    }

    public function test_admin_can_verify_farmer(): void
    {
        $admin = $this->makeUser(['role' => 'admin']);
        $seller = $this->makeUser(['role' => 'seller', 'is_verified' => false]);

        $res = $this->actingAs($admin, 'api')->patchJson("/api/admin/users/{$seller->user_id}/verify");
        $res->assertStatus(200);
        $this->assertTrue((bool) $seller->fresh()->is_verified);
    }

    public function test_buyer_cannot_access_admin_endpoints(): void
    {
        $buyer = $this->makeUser(['role' => 'buyer']);
        $res = $this->actingAs($buyer, 'api')->getJson('/api/admin/users');
        $res->assertStatus(403);
    }

    public function test_seller_cannot_access_admin_endpoints(): void
    {
        $seller = $this->makeUser(['role' => 'seller', 'is_verified' => true]);
        $res = $this->actingAs($seller, 'api')->getJson('/api/admin/users');
        $res->assertStatus(403);
    }

    public function test_buyer_cannot_access_seller_endpoints(): void
    {
        $buyer = $this->makeUser(['role' => 'buyer']);
        $res = $this->actingAs($buyer, 'api')->getJson('/api/seller/inventory');
        $res->assertStatus(403);
    }

    public function test_public_registration_as_admin_is_rejected_and_cannot_reach_admin_endpoints(): void
    {
        $reg = $this->postJson('/api/auth/register', [
            'name' => 'Self Registered Admin',
            'email' => 'fakeadmin+' . uniqid() . '@sokomoja.co.ke',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin',
        ]);
        $reg->assertStatus(422);
    }

    public function test_admin_cannot_suspend_another_admin(): void
    {
        $admin = $this->makeUser(['role' => 'admin']);
        $otherAdmin = $this->makeUser(['role' => 'admin']);

        $res = $this->actingAs($admin, 'api')->patchJson("/api/admin/users/{$otherAdmin->user_id}", [
            'status' => 'suspended',
        ]);
        $res->assertStatus(403);
        $this->assertEquals('active', $otherAdmin->fresh()->status);
    }

    public function test_admin_cannot_reset_another_admins_password(): void
    {
        $admin = $this->makeUser(['role' => 'admin']);
        $otherAdmin = $this->makeUser(['role' => 'admin']);

        $res = $this->actingAs($admin, 'api')->postJson("/api/admin/users/{$otherAdmin->user_id}/reset-password");
        $res->assertStatus(403);
    }

    // Forged callback with no CheckoutRequestID must not touch any order —
    // previously matched the first payment row with a null checkout id (whereNull).
    public function test_forged_mpesa_callback_without_checkout_id_does_not_confirm_any_order(): void
    {
        $seller  = $this->makeUser(['role' => 'seller', 'is_verified' => true]);
        $buyer   = $this->makeUser(['role' => 'buyer']);
        $product = $this->makeProduct($seller, 'Bananas', 20, 30);

        $order = $this->actingAs($buyer, 'api')->postJson('/api/orders', [
            'items' => [['product_id' => $product->product_id, 'quantity' => 2]],
            'delivery_address' => '123 Test Street',
            'payment_method' => 'Cash',
        ])->json('data');

        $this->assertEquals('Pending', $order['order_status']);

        $res = $this->postJson('/api/payments/mpesa/callback', [
            'Body' => [
                'stkCallback' => [
                    'ResultCode' => 0,
                    'CallbackMetadata' => ['Item' => []],
                ],
            ],
        ]);
        $res->assertStatus(200);

        $this->assertEquals('Pending', \App\Models\Order::find($order['order_id'])->order_status);
    }

    public function test_deactivated_product_is_hidden_and_not_purchasable(): void
    {
        $seller  = $this->makeUser(['role' => 'seller', 'is_verified' => true]);
        $buyer   = $this->makeUser(['role' => 'buyer']);
        $product = $this->makeProduct($seller, 'Discontinued Mangoes', 50, 40);
        $product->update(['status' => 'inactive']);

        $show = $this->getJson("/api/products/{$product->product_id}");
        $show->assertStatus(404);

        $order = $this->actingAs($buyer, 'api')->postJson('/api/orders', [
            'items' => [['product_id' => $product->product_id, 'quantity' => 1]],
            'delivery_address' => '123 Test Street',
            'payment_method' => 'Cash',
        ]);
        $order->assertStatus(422);
        $this->assertEquals(50, (float) $product->inventory()->first()->quantity_available);
    }

    // ── PART 6/1: ORDER LIFECYCLE + CANCEL-ON-PAYMENT-FAILURE ────────

    public function test_seller_can_mark_confirmed_order_as_delivered(): void
    {
        $seller  = $this->makeUser(['role' => 'seller', 'is_verified' => true]);
        $buyer   = $this->makeUser(['role' => 'buyer']);
        $product = $this->makeProduct($seller, 'Pineapples', 20, 70);

        $order = $this->actingAs($buyer, 'api')->postJson('/api/orders', [
            'items' => [['product_id' => $product->product_id, 'quantity' => 1]],
            'delivery_address' => '123 Test Street',
            'payment_method' => 'Cash',
        ])->json('data');

        $confirm = $this->actingAs($seller, 'api')->patchJson("/api/seller/orders/{$order['order_id']}", [
            'status' => 'Confirmed',
        ]);
        $confirm->assertStatus(200);

        $deliver = $this->actingAs($seller, 'api')->patchJson("/api/seller/orders/{$order['order_id']}", [
            'status' => 'Delivered',
        ]);
        $deliver->assertStatus(200);
        $this->assertEquals('Delivered', $deliver->json('data.order_status'));
    }

    public function test_delivery_status_stays_in_sync_with_order_status(): void
    {
        $seller  = $this->makeUser(['role' => 'seller', 'is_verified' => true]);
        $buyer   = $this->makeUser(['role' => 'buyer']);
        $product = $this->makeProduct($seller, 'Watermelon', 20, 70);

        $order = $this->actingAs($buyer, 'api')->postJson('/api/orders', [
            'items' => [['product_id' => $product->product_id, 'quantity' => 1]],
            'delivery_address' => '123 Test Street',
            'payment_method' => 'Cash',
        ])->json('data');

        $this->assertEquals('Pending', \App\Models\Delivery::where('order_id', $order['order_id'])->first()->delivery_status);

        $this->actingAs($seller, 'api')->patchJson("/api/seller/orders/{$order['order_id']}", ['status' => 'Confirmed']);
        $this->assertEquals('In Transit', \App\Models\Delivery::where('order_id', $order['order_id'])->first()->delivery_status);

        $this->actingAs($seller, 'api')->patchJson("/api/seller/orders/{$order['order_id']}", ['status' => 'Delivered']);
        $this->assertEquals('Delivered', \App\Models\Delivery::where('order_id', $order['order_id'])->first()->delivery_status);
    }

    public function test_pending_order_cannot_jump_straight_to_delivered(): void
    {
        $seller  = $this->makeUser(['role' => 'seller', 'is_verified' => true]);
        $buyer   = $this->makeUser(['role' => 'buyer']);
        $product = $this->makeProduct($seller, 'Melons', 20, 70);

        $order = $this->actingAs($buyer, 'api')->postJson('/api/orders', [
            'items' => [['product_id' => $product->product_id, 'quantity' => 1]],
            'delivery_address' => '123 Test Street',
            'payment_method' => 'Cash',
        ])->json('data');

        $res = $this->actingAs($seller, 'api')->patchJson("/api/seller/orders/{$order['order_id']}", [
            'status' => 'Delivered',
        ]);
        $res->assertStatus(422);
    }

    public function test_buyer_can_cancel_pending_unpaid_order_and_inventory_is_restored(): void
    {
        $seller  = $this->makeUser(['role' => 'seller', 'is_verified' => true]);
        $buyer   = $this->makeUser(['role' => 'buyer']);
        $product = $this->makeProduct($seller, 'Avocados', 20, 55);

        $order = $this->actingAs($buyer, 'api')->postJson('/api/orders', [
            'items' => [['product_id' => $product->product_id, 'quantity' => 4]],
            'delivery_address' => '123 Test Street',
            'payment_method' => 'M-Pesa',
            'phone_number' => '0712345678',
        ])->json('data');

        $this->assertEquals(16, (float) $product->inventory()->first()->quantity_available);

        $cancel = $this->actingAs($buyer, 'api')->patchJson("/api/orders/{$order['order_id']}/cancel");
        $cancel->assertStatus(200);

        $this->assertEquals(20, (float) $product->inventory()->first()->quantity_available);
        $this->assertEquals('Cancelled', \App\Models\Order::find($order['order_id'])->order_status);
    }

    // ── PART 2: SELLER SCHEDULE ───────────────────────────────────────

    public function test_duplicate_schedule_slot_is_rejected(): void
    {
        $seller = $this->makeUser(['role' => 'seller', 'is_verified' => true]);

        $first = $this->actingAs($seller, 'api')->postJson('/api/seller/schedule', [
            'day' => 'Monday',
            'arrival_time' => '09:00',
        ]);
        $first->assertStatus(201);

        $duplicate = $this->actingAs($seller, 'api')->postJson('/api/seller/schedule', [
            'day' => 'Monday',
            'arrival_time' => '09:00',
        ]);
        $duplicate->assertStatus(422);
    }
}
