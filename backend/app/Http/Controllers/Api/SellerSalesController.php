<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PosSale;
use App\Models\PosSaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class SellerSalesController extends Controller
{
    // ── GET /api/seller/sales ────────────────────────────────────────
    public function index()
    {
        $sellerId = auth()->id();
        $today    = Carbon::today();

        $sales = PosSale::where('seller_id', $sellerId)
            ->with('items')
            ->orderByDesc('sale_date')
            ->paginate(15);

        $allSales      = PosSale::where('seller_id', $sellerId)->get();
        $todaySales    = $allSales->filter(fn($s) => Carbon::parse($s->sale_date)->isToday());
        $todayRevenue  = $todaySales->sum('total_amount');
        $totalRevenue  = $allSales->sum('total_amount');

        return response()->json([
            'data'    => $sales->through(fn($s) => $this->formatSale($s)),
            'summary' => [
                'today_revenue' => (float) $todayRevenue,
                'total_revenue' => (float) $totalRevenue,
                'today_count'   => $todaySales->count(),
                'total_count'   => $allSales->count(),
            ],
        ]);
    }

    // ── POST /api/seller/sales ───────────────────────────────────────
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'buyer_name'              => 'nullable|string|max:100',
            'payment_method'          => 'required|in:Cash,M-Pesa',
            'items'                   => 'required|array|min:1',
            'items.*.product_name'    => 'required|string|max:100',
            'items.*.quantity'        => 'required|numeric|min:0.1',
            'items.*.unit_price'      => 'required|numeric|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $sale = DB::transaction(function () use ($request) {
            $items       = $request->items;
            $totalAmount = 0;

            foreach ($items as $item) {
                $totalAmount += (float) $item['quantity'] * (float) $item['unit_price'];
            }

            $sale = PosSale::create([
                'seller_id'      => auth()->id(),
                'buyer_name'     => $request->buyer_name,
                'payment_method' => $request->payment_method,
                'total_amount'   => $totalAmount,
            ]);

            foreach ($items as $item) {
                $qty      = (float) $item['quantity'];
                $price    = (float) $item['unit_price'];
                $subtotal = $qty * $price;

                PosSaleItem::create([
                    'sale_id'      => $sale->sale_id,
                    'product_name' => $item['product_name'],
                    'quantity'     => $qty,
                    'unit'         => $item['unit'] ?? 'kg',
                    'unit_price'   => $price,
                    'subtotal'     => $subtotal,
                ]);
            }

            return $sale;
        });

        $sale->load('items');

        return response()->json([
            'data'    => $this->formatSale($sale),
            'message' => 'Sale recorded successfully',
        ], 201);
    }

    // ── Helper ───────────────────────────────────────────────────────
    private function formatSale(PosSale $sale): array
    {
        return [
            'sale_id'        => $sale->sale_id,
            'buyer_name'     => $sale->buyer_name ?? 'Walk-in buyer',
            'payment_method' => $sale->payment_method,
            'total_amount'   => (float) $sale->total_amount,
            'sale_date'      => $sale->sale_date,
            'items'          => $sale->items->map(fn($i) => [
                'pos_item_id'  => $i->pos_item_id,
                'product_name' => $i->product_name,
                'quantity'     => (float) $i->quantity,
                'unit'         => $i->unit,
                'unit_price'   => (float) $i->unit_price,
                'subtotal'     => (float) $i->subtotal,
            ]),
        ];
    }
}
