<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Review;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminFarmerController extends Controller
{
    // ── GET /api/admin/farmers/{id} ──────────────────────────────────
    public function show($id)
    {
        $farmer = User::with('zone')->where('role', 'seller')->find($id);

        if (!$farmer) {
            return response()->json([
                'message' => 'Farmer not found',
            ], 404);
        }

        $productIds = $farmer->products()->pluck('product_id');

        $totalProducts  = $productIds->count();
        $activeProducts = $farmer->products()->where('status', 'active')->count();

        $ordersFulfilled = Order::where('order_status', 'Delivered')
            ->whereHas('orderItems', function ($q) use ($productIds) {
                $q->whereIn('product_id', $productIds);
            })
            ->count();

        $averageRating = Review::whereIn('product_id', $productIds)->avg('rating');
        $totalReviews  = Review::whereIn('product_id', $productIds)->count();

        $latestProducts = $farmer->products()
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'product_id' => $p->product_id,
                'name'       => $p->name,
                'price'      => (float) $p->price,
                'unit'       => $p->unit,
                'status'     => $p->status,
                'image_url'  => $p->image_url,
                'created_at' => $p->created_at,
            ]);

        $latestReviews = Review::with(['buyer:user_id,name', 'product:product_id,name'])
            ->whereIn('product_id', $productIds)
            ->orderByDesc('created_at')
            ->limit(8)
            ->get()
            ->map(fn($r) => [
                'review_id'    => $r->review_id,
                'rating'       => $r->rating,
                'comment'      => $r->comment,
                'created_at'   => $r->created_at,
                'buyer_name'   => $r->buyer?->name ?? 'Buyer',
                'product_name' => $r->product?->name ?? 'Product',
            ]);

        return response()->json([
            'data' => [
                'user_id'      => $farmer->user_id,
                'name'         => $farmer->name,
                'email'        => $farmer->email,
                'phone_number' => $farmer->phone_number,
                'region'       => $farmer->region,
                'avatar_url'   => $farmer->avatar_url ? url($farmer->avatar_url) : null,
                'is_verified'  => $farmer->is_verified,
                'status'       => $farmer->status,
                'created_at'   => $farmer->created_at,
                'zone'         => $farmer->zone ? [
                    'zone_id'        => $farmer->zone->zone_id,
                    'zone_name'      => $farmer->zone->zone_name,
                    'pickup_address' => $farmer->zone->pickup_address,
                    'region'         => $farmer->zone->region,
                ] : null,
                'stats' => [
                    'total_products'    => $totalProducts,
                    'active_products'   => $activeProducts,
                    'orders_fulfilled'  => $ordersFulfilled,
                    'average_rating'    => $averageRating ? round((float) $averageRating, 1) : null,
                    'total_reviews'     => $totalReviews,
                ],
                'products' => $latestProducts,
                'reviews'  => $latestReviews,
            ],
        ]);
    }

    // ── PATCH /api/admin/farmers/{id}/unverify ───────────────────────
    public function unverify($id)
    {
        $farmer = User::where('role', 'seller')->find($id);

        if (!$farmer) {
            return response()->json([
                'message' => 'Farmer not found',
            ], 404);
        }

        if (!$farmer->is_verified) {
            return response()->json([
                'message' => 'Farmer is already unverified',
            ], 422);
        }

        $farmer->is_verified = false;
        $farmer->save();

        return response()->json([
            'message' => "{$farmer->name}'s verification has been revoked",
            'data'    => [
                'user_id'     => $farmer->user_id,
                'is_verified' => $farmer->is_verified,
            ],
        ]);
    }
}
