<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // ── GET /api/products ────────────────────────────────────────────
    // Public: search, filter, sort, paginate active products from verified sellers.
    public function index(Request $request)
    {
        $query = Product::with(['seller', 'category', 'inventory', 'zone'])
            ->where('status', 'active')
            ->whereHas('seller', fn($q) => $q->where('status', 'active')->where('is_verified', true));

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('zone_id')) {
            $query->where('zone_id', $request->zone_id);
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        match ($request->get('sort', 'newest')) {
            'price_asc'  => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            default      => $query->latest(),
        };

        $perPage  = min((int) $request->get('per_page', 12), 50);
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->map(fn($p) => $this->formatProduct($p)),
            'meta' => [
                'total'        => $products->total(),
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
            ],
        ]);
    }

    // ── GET /api/products/{id} ───────────────────────────────────────
    // Public: single product detail with reviews.
    public function show($id)
    {
        $product = Product::with(['seller', 'category', 'inventory', 'zone', 'reviews.buyer'])
            ->where('status', 'active')
            ->whereHas('seller', fn($q) => $q->where('status', 'active')->where('is_verified', true))
            ->findOrFail($id);

        return response()->json([
            'data' => $this->formatProduct($product, withReviews: true),
        ]);
    }

    // ── GET /api/categories ──────────────────────────────────────────
    // Public: all categories with active-product count.
    public function categories()
    {
        $categories = Category::withCount([
            'products as products_count' => fn($q) => $q->where('status', 'active'),
        ])->orderBy('name')->get();

        return response()->json([
            'data' => $categories->map(fn($c) => [
                'category_id'    => $c->category_id,
                'name'           => $c->name,
                'slug'           => $c->slug,
                'description'    => $c->description,
                'products_count' => $c->products_count,
            ]),
        ]);
    }

    // ── Shared formatter ─────────────────────────────────────────────
    private function formatProduct(Product $p, bool $withReviews = false): array
    {
        $data = [
            'product_id'  => $p->product_id,
            'name'        => $p->name,
            'description' => $p->description,
            'price'       => (float) $p->price,
            'unit'        => $p->unit,
            'bunch_contains' => $p->bunch_contains,
            'image_url'   => $p->image_url,
            'status'      => $p->status,
            'category'    => $p->category ? [
                'category_id' => $p->category->category_id,
                'name'        => $p->category->name,
            ] : null,
            'seller'      => $p->seller ? [
                'user_id'     => $p->seller->user_id,
                'name'        => $p->seller->name,
                'is_verified' => $p->seller->is_verified,
            ] : null,
            'zone'        => $p->zone ? [
                'zone_id'   => $p->zone->zone_id,
                'zone_name' => $p->zone->zone_name,
                'region'    => $p->zone->region,
            ] : null,
            'inventory'   => $p->inventory ? [
                'quantity_available'  => (float) $p->inventory->quantity_available,
                'low_stock_threshold' => (float) $p->inventory->low_stock_threshold,
            ] : null,
            'created_at'  => $p->created_at?->toDateTimeString(),
        ];

        if ($withReviews) {
            $data['reviews'] = $p->reviews->map(fn($r) => [
                'review_id'  => $r->review_id,
                'rating'     => $r->rating,
                'comment'    => $r->comment,
                'buyer_name' => $r->buyer?->name,
                'created_at' => $r->created_at?->toDateString(),
            ]);
            $data['average_rating'] = $p->reviews->count() > 0
                ? round($p->reviews->avg('rating'), 1)
                : null;
            $data['reviews_count']  = $p->reviews->count();
        }

        return $data;
    }
}
