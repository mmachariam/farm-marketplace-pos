<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    // ── POST /api/reviews ────────────────────────────────────────────
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id'   => 'required|integer|exists:orders,order_id',
            'product_id' => 'required|integer|exists:products,product_id',
            'rating'     => 'required|integer|min:1|max:5',
            'comment'    => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $buyerId = auth()->id();
        $order   = Order::where('order_id', $request->order_id)
            ->where('buyer_id', $buyerId)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        if ($order->order_status !== 'Delivered') {
            return response()->json(['message' => 'Reviews can only be submitted for delivered orders.'], 422);
        }

        $inOrder = OrderItem::where('order_id', $request->order_id)
            ->where('product_id', $request->product_id)
            ->exists();

        if (!$inOrder) {
            return response()->json(['message' => 'Product is not part of this order.'], 422);
        }

        $alreadyReviewed = Review::where('order_id', $request->order_id)
            ->where('product_id', $request->product_id)
            ->exists();

        if ($alreadyReviewed) {
            return response()->json(['message' => 'You have already reviewed this product for this order.'], 422);
        }

        $review = Review::create([
            'order_id'   => $request->order_id,
            'buyer_id'   => $buyerId,
            'product_id' => $request->product_id,
            'rating'     => $request->rating,
            'comment'    => $request->comment,
        ]);

        return response()->json([
            'data'    => $this->formatReview($review),
            'message' => 'Review submitted successfully',
        ], 201);
    }

    // ── GET /api/products/{productId}/reviews ────────────────────────
    public function productReviews($productId)
    {
        $reviews = Review::where('product_id', $productId)
            ->with('buyer:user_id,name')
            ->orderByDesc('created_at')
            ->paginate(10);

        $avgRating    = Review::where('product_id', $productId)->avg('rating');
        $reviewCount  = Review::where('product_id', $productId)->count();

        return response()->json([
            'data' => [
                'avg_rating'   => $avgRating !== null ? round((float) $avgRating, 1) : null,
                'review_count' => $reviewCount,
                'reviews'      => $reviews->through(fn($r) => $this->formatReview($r)),
            ],
        ]);
    }

    // ── Helper ───────────────────────────────────────────────────────
    private function formatReview(Review $review): array
    {
        return [
            'review_id'  => $review->review_id,
            'order_id'   => $review->order_id,
            'product_id' => $review->product_id,
            'rating'     => $review->rating,
            'comment'    => $review->comment,
            'created_at' => $review->created_at,
            'buyer'      => $review->relationLoaded('buyer') && $review->buyer ? [
                'user_id' => $review->buyer->user_id,
                'name'    => $review->buyer->name,
            ] : null,
        ];
    }
}
