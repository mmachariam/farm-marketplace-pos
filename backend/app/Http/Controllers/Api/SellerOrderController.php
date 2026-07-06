<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SellerOrderController extends Controller
{
    // ── GET /api/seller/orders ───────────────────────────────────────
    public function index()
    {
        $sellerId = auth()->id();

        $orderIds = OrderItem::whereHas('product', fn($q) => $q->where('seller_id', $sellerId))
            ->pluck('order_id')
            ->unique()
            ->values();

        $orders = Order::whereIn('order_id', $orderIds)
            ->with([
                'orderItems' => fn($q) => $q->whereHas('product', fn($q2) => $q2->where('seller_id', $sellerId)),
                'orderItems.product',
                'buyer',
                'payment',
                'delivery.pickupZone',
            ])
            ->orderByDesc('order_date')
            ->paginate(10);

        return response()->json([
            'data' => $orders->through(fn($o) => $this->formatSellerOrder($o)),
        ]);
    }

    // ── PATCH /api/seller/orders/{id} ────────────────────────────────
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:Confirmed,Cancelled,Delivered',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $sellerId = auth()->id();

        $hasItems = OrderItem::where('order_id', $id)
            ->whereHas('product', fn($q) => $q->where('seller_id', $sellerId))
            ->exists();

        if (!$hasItems) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        $order = Order::findOrFail($id);

        // Pending -> Confirmed/Cancelled, Confirmed -> Delivered. No other transition is valid.
        $allowedTransitions = [
            'Pending'   => ['Confirmed', 'Cancelled'],
            'Confirmed' => ['Delivered'],
        ];

        if (!in_array($request->status, $allowedTransitions[$order->order_status] ?? [], true)) {
            return response()->json([
                'message' => "Order cannot be changed from {$order->order_status} to {$request->status}.",
            ], 422);
        }

        if ($request->status === 'Cancelled') {
            $items = OrderItem::where('order_id', $id)
                ->whereHas('product', fn($q) => $q->where('seller_id', $sellerId))
                ->with('product.inventory')
                ->get();

            foreach ($items as $item) {
                $item->product?->inventory?->increment('quantity_available', $item->quantity);
            }
        }

        $order->order_status = $request->status;
        $order->save();

        $order->load(['orderItems.product', 'buyer', 'payment', 'delivery.pickupZone']);

        return response()->json([
            'message' => 'Order updated successfully',
            'data'    => $this->formatSellerOrder($order),
        ]);
    }

    // ── Helper ───────────────────────────────────────────────────────
    private function formatSellerOrder(Order $order): array
    {
        return [
            'order_id'     => $order->order_id,
            'order_status' => $order->order_status,
            'order_date'   => $order->order_date,
            'total_amount' => $order->total_amount,
            'buyer'        => $order->buyer ? [
                'user_id' => $order->buyer->user_id,
                'name'    => $order->buyer->name,
            ] : null,
            'items' => $order->orderItems->map(fn($i) => [
                'order_item_id' => $i->order_item_id,
                'product_name'  => $i->product?->name,
                'quantity'      => $i->quantity,
                'unit_price'    => $i->unit_price,
                'subtotal'      => $i->subtotal,
            ]),
            'payment' => $order->payment ? [
                'payment_method' => $order->payment->payment_method,
                'payment_status' => $order->payment->payment_status,
            ] : null,
            'zone' => $order->delivery?->pickupZone ? [
                'zone_name' => $order->delivery->pickupZone->zone_name,
            ] : null,
        ];
    }
}
