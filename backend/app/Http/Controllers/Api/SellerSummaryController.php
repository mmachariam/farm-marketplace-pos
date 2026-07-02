<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\PosSale;
use App\Models\Review;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SellerSummaryController extends Controller
{
    // ── GET /api/seller/summary ──────────────────────────────────────
    public function index()
    {
        $sellerId = auth()->id();

        // Total sales: completed payments on orders containing this seller's products
        $sellerOrderIds = OrderItem::whereHas('product', fn($q) => $q->where('seller_id', $sellerId))
            ->pluck('order_id')
            ->unique();

        $totalSales = Payment::whereIn('order_id', $sellerOrderIds)
            ->where('payment_status', 'Completed')
            ->sum('amount');

        // Active listings: products with stock > 0
        $activeListings = DB::table('products')
            ->join('inventory', 'products.product_id', '=', 'inventory.product_id')
            ->where('products.seller_id', $sellerId)
            ->where('inventory.quantity_available', '>', 0)
            ->count();

        // Pending orders
        $pendingOrders = Order::whereIn('order_id', $sellerOrderIds)
            ->where('order_status', 'Pending')
            ->count();

        // Average rating on this seller's products
        $averageRating = Review::whereHas('product', fn($q) => $q->where('seller_id', $sellerId))
            ->avg('rating');

        // Weekly sales: Mon–Sun of current week
        $weekStart = Carbon::now()->startOfWeek(Carbon::MONDAY);
        $days      = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        $weeklySales = [];
        for ($i = 0; $i < 7; $i++) {
            $day      = $weekStart->copy()->addDays($i);
            $dayStart = $day->copy()->startOfDay();
            $dayEnd   = $day->copy()->endOfDay();

            $onlineAmount = Payment::whereIn('order_id', function ($sub) use ($sellerId, $dayStart, $dayEnd) {
                    $sub->select('orders.order_id')
                        ->from('orders')
                        ->join('order_items', 'orders.order_id', '=', 'order_items.order_id')
                        ->join('products', 'order_items.product_id', '=', 'products.product_id')
                        ->where('products.seller_id', $sellerId)
                        ->whereIn('orders.order_status', ['Confirmed', 'Delivered'])
                        ->whereBetween('orders.order_date', [$dayStart, $dayEnd]);
                })
                ->where('payment_status', 'Completed')
                ->sum('amount');

            // Offline (farm-gate / POS) sales recorded directly by the farmer
            $offlineAmount = PosSale::where('seller_id', $sellerId)
                ->whereBetween('sale_date', [$dayStart, $dayEnd])
                ->sum('total_amount');

            $weeklySales[] = [
                'day'    => $days[$i],
                'amount' => (float) $onlineAmount + (float) $offlineAmount,
            ];
        }

        return response()->json([
            'data' => [
                'total_sales'     => (float) $totalSales,
                'active_listings' => (int) $activeListings,
                'pending_orders'  => (int) $pendingOrders,
                'average_rating'  => $averageRating !== null ? round((float) $averageRating, 1) : null,
                'weekly_sales'    => $weeklySales,
            ],
        ]);
    }
}
