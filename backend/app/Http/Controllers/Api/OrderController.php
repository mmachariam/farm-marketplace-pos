<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    // ── POST /api/orders ─────────────────────────────────────────────
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items'                => 'required|array|min:1',
            'items.*.product_id'   => 'required|integer|exists:products,product_id',
            'items.*.quantity'     => 'required|integer|min:1',
            'zone_id'              => 'nullable|integer|exists:pickup_zones,zone_id',
            'delivery_address'     => 'nullable|string|max:500',
            'payment_method'       => 'required|in:M-Pesa,Card,Cash',
            'phone_number'         => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        if (empty($request->zone_id) && empty($request->delivery_address)) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => ['zone_id' => ['Please select a pickup zone or provide a delivery address.']],
            ], 422);
        }

        try {
            $order = DB::transaction(function () use ($request) {
                $buyerId    = auth()->id();
                $itemInputs = $request->items;
                $total      = 0;
                $prepared   = [];

                // Validate stock and build item list inside the transaction
                foreach ($itemInputs as $input) {
                    $product = Product::with('seller')->find($input['product_id']);

                    if (!$product || $product->status !== 'active' || !$product->seller
                        || $product->seller->status !== 'active' || !$product->seller->is_verified) {
                        throw new \Exception('Product is no longer available: ' . ($product?->name ?? '#' . $input['product_id']));
                    }

                    $inventory = Inventory::where('product_id', $input['product_id'])
                        ->lockForUpdate()
                        ->first();

                    if (!$inventory || $inventory->quantity_available < $input['quantity']) {
                        throw new \Exception('Insufficient stock for: ' . $product->name);
                    }

                    $unitPrice = (float) $product->price;
                    $subtotal  = $unitPrice * $input['quantity'];
                    $total    += $subtotal;

                    $prepared[] = [
                        'product_id' => $input['product_id'],
                        'quantity'   => $input['quantity'],
                        'unit_price' => $unitPrice,
                        'subtotal'   => $subtotal,
                        'inventory'  => $inventory,
                    ];
                }

                // Create the order
                $order = Order::create([
                    'buyer_id'     => $buyerId,
                    'total_amount' => $total,
                    'order_status' => 'Pending',
                ]);

                // Create order items and decrement inventory
                foreach ($prepared as $item) {
                    OrderItem::create([
                        'order_id'   => $order->order_id,
                        'product_id' => $item['product_id'],
                        'quantity'   => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'subtotal'   => $item['subtotal'],
                    ]);

                    $item['inventory']->decrement('quantity_available', $item['quantity']);
                }

                // Create payment record
                Payment::create([
                    'order_id'       => $order->order_id,
                    'payment_method' => $request->payment_method,
                    'amount'         => $total,
                    'payment_status' => 'Pending',
                    'phone_number'   => $request->phone_number,
                ]);

                // Create delivery record
                Delivery::create([
                    'order_id'         => $order->order_id,
                    'zone_id'          => $request->zone_id ?: null,
                    'delivery_address' => $request->delivery_address ?: null,
                    'delivery_status'  => 'Pending',
                ]);

                return $order;
            });

            $order->load(['orderItems.product', 'payment', 'delivery.pickupZone']);

            return response()->json([
                'data'    => $this->formatOrder($order),
                'message' => 'Order placed successfully',
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    // ── GET /api/orders ──────────────────────────────────────────────
    public function index(Request $request)
    {
        $query = Order::where('buyer_id', auth()->id())
            ->with(['orderItems.product', 'payment', 'delivery.pickupZone'])
            ->orderByDesc('order_date');

        if ($request->filled('status')) {
            $query->where('order_status', $request->status);
        }

        $orders = $query->paginate(10);

        return response()->json([
            'data' => $orders->through(fn($o) => $this->formatOrder($o)),
        ]);
    }

    // ── GET /api/orders/{id} ─────────────────────────────────────────
    public function show($id)
    {
        $order = Order::where('buyer_id', auth()->id())
            ->with(['orderItems.product', 'payment', 'delivery.pickupZone'])
            ->findOrFail($id);

        return response()->json([
            'data' => $this->formatOrder($order),
        ]);
    }

    // ── PATCH /api/orders/{id}/cancel ────────────────────────────────
    // Lets a buyer release a still-pending, unpaid order — used when M-Pesa
    // initiation fails or the STK push itself fails/is cancelled, so the
    // reserved stock isn't left in limbo.
    public function cancelPending($id)
    {
        $order = Order::where('buyer_id', auth()->id())
            ->with('orderItems.product.inventory', 'payment')
            ->findOrFail($id);

        if ($order->order_status !== 'Pending') {
            return response()->json([
                'message' => 'Only pending orders can be cancelled this way.',
            ], 422);
        }

        if ($order->payment && $order->payment->payment_status === 'Completed') {
            return response()->json([
                'message' => 'A paid order cannot be cancelled this way.',
            ], 422);
        }

        DB::transaction(function () use ($order) {
            foreach ($order->orderItems as $item) {
                $item->product?->inventory?->increment('quantity_available', $item->quantity);
            }

            $order->order_status = 'Cancelled';
            $order->save();
        });

        return response()->json(['message' => 'Order cancelled.']);
    }

    // ── Helper ───────────────────────────────────────────────────────
    private function formatOrder(Order $order): array
    {
        return [
            'order_id'     => $order->order_id,
            'total_amount' => $order->total_amount,
            'order_status' => $order->order_status,
            'order_date'   => $order->order_date,
            'items'        => $order->orderItems->map(fn($i) => [
                'order_item_id' => $i->order_item_id,
                'product_id'    => $i->product_id,
                'product_name'  => $i->product?->name,
                'quantity'      => $i->quantity,
                'unit_price'    => $i->unit_price,
                'subtotal'      => $i->subtotal,
            ]),
            'payment' => $order->payment ? [
                'payment_id'     => $order->payment->payment_id,
                'payment_method' => $order->payment->payment_method,
                'amount'         => $order->payment->amount,
                'payment_status' => $order->payment->payment_status,
                'phone_number'   => $order->payment->phone_number,
            ] : null,
            'delivery' => $order->delivery ? [
                'delivery_id'      => $order->delivery->delivery_id,
                'delivery_status'  => $order->delivery->delivery_status,
                'delivery_address' => $order->delivery->delivery_address,
                'delivery_date'    => $order->delivery->delivery_date,
                'zone'             => $order->delivery->pickupZone ? [
                    'zone_id'        => $order->delivery->pickupZone->zone_id,
                    'zone_name'      => $order->delivery->pickupZone->zone_name,
                    'pickup_address' => $order->delivery->pickupZone->pickup_address,
                ] : null,
            ] : null,
        ];
    }
}
