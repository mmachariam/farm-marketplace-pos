<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SellerProductController extends Controller
{
    // ── GET /api/seller/products ─────────────────────────────────────
    public function index()
    {
        $products = Product::with(['category', 'inventory'])
            ->where('seller_id', auth()->id())
            ->latest()
            ->get();

        return response()->json([
            'data' => $products->map(fn($p) => $this->formatProduct($p)),
        ]);
    }

    // ── POST /api/seller/products ────────────────────────────────────
    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user->is_verified) {
            return response()->json([
                'message' => 'Your account must be verified by an admin before you can list products.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name'                => 'required|string|max:150',
            'category_id'         => 'required|exists:categories,category_id',
            'description'         => 'required|string',
            'price'               => 'required|numeric|min:0.01',
            'unit'                => 'required|string|max:30',
            'initial_quantity'    => 'required|numeric|min:0',
            'low_stock_threshold' => 'nullable|numeric|min:0',
            'image_url'           => 'nullable|url|max:255',
            'status'              => 'nullable|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $product = Product::create([
            'seller_id'   => $user->user_id,
            'category_id' => $request->category_id,
            'zone_id'     => $user->zone_id,
            'name'        => $request->name,
            'description' => $request->description,
            'price'       => $request->price,
            'unit'        => $request->unit,
            'image_url'   => $request->image_url,
            'status'      => $request->get('status', 'active'),
        ]);

        Inventory::create([
            'product_id'          => $product->product_id,
            'quantity_available'  => $request->initial_quantity,
            'low_stock_threshold' => $request->get('low_stock_threshold', 10),
        ]);

        $product->load(['category', 'inventory']);

        return response()->json([
            'message' => 'Product listed successfully',
            'data'    => $this->formatProduct($product),
        ], 201);
    }

    // ── PATCH /api/seller/products/{id} ──────────────────────────────
    public function update(Request $request, $id)
    {
        $product = Product::where('product_id', $id)
            ->where('seller_id', auth()->id())
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'name'        => 'sometimes|string|max:150',
            'category_id' => 'sometimes|exists:categories,category_id',
            'description' => 'sometimes|string',
            'price'       => 'sometimes|numeric|min:0.01',
            'unit'        => 'sometimes|string|max:30',
            'image_url'   => 'nullable|url|max:255',
            'status'      => 'sometimes|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $product->fill($request->only(['name', 'category_id', 'description', 'price', 'unit', 'image_url', 'status']));
        $product->save();

        $product->load(['category', 'inventory']);

        return response()->json([
            'message' => 'Product updated successfully',
            'data'    => $this->formatProduct($product),
        ]);
    }

    // ── Helper ───────────────────────────────────────────────────────
    private function formatProduct(Product $p): array
    {
        return [
            'product_id'  => $p->product_id,
            'name'        => $p->name,
            'description' => $p->description,
            'price'       => (float) $p->price,
            'unit'        => $p->unit,
            'image_url'   => $p->image_url,
            'status'      => $p->status,
            'category'    => $p->category ? [
                'category_id' => $p->category->category_id,
                'name'        => $p->category->name,
            ] : null,
            'inventory'   => $p->inventory ? [
                'inventory_id'        => $p->inventory->inventory_id,
                'quantity_available'  => (float) $p->inventory->quantity_available,
                'low_stock_threshold' => (float) $p->inventory->low_stock_threshold,
            ] : null,
            'created_at'  => $p->created_at?->toDateTimeString(),
        ];
    }
}
