<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class SellerProductCreationTest extends TestCase
{
    use DatabaseTransactions;

    private function makeVerifiedSeller(): User
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

    // ── Product without a description still creates product + inventory ──
    public function test_product_can_be_created_without_a_description(): void
    {
        $seller   = $this->makeVerifiedSeller();
        $category = Category::firstOrCreate(['name' => 'Vegetables'], ['slug' => 'vegetables']);

        $response = $this->actingAs($seller, 'api')->postJson('/api/seller/products', [
            'name'             => 'Fresh Spinach',
            'category_id'      => $category->category_id,
            'price'            => 40,
            'unit'             => 'kg',
            'initial_quantity' => 25,
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.inventory.quantity_available', 25);

        $this->assertDatabaseHas('products', ['name' => 'Fresh Spinach', 'description' => null]);
        $this->assertDatabaseHas('inventory', ['quantity_available' => 25]);
    }
}
