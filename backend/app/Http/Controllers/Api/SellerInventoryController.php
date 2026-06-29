<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SellerInventoryController extends Controller
{
    // ── GET /api/seller/inventory ────────────────────────────────────
    public function index()
    {
        $items = Inventory::with(['product.category'])
            ->whereHas('product', fn($q) => $q->where('seller_id', auth()->id()))
            ->get();

        return response()->json([
            'data' => $items->map(fn($i) => $this->formatItem($i)),
        ]);
    }

    // ── PATCH /api/seller/inventory/{id} ─────────────────────────────
    public function update(Request $request, $id)
    {
        $item = Inventory::whereHas('product', fn($q) => $q->where('seller_id', auth()->id()))
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'quantity_available'  => 'required|numeric|min:0',
            'low_stock_threshold' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $item->quantity_available = $request->quantity_available;

        if ($request->filled('low_stock_threshold')) {
            $item->low_stock_threshold = $request->low_stock_threshold;
        }

        $item->save();
        $item->load(['product.category']);

        return response()->json([
            'message' => 'Inventory updated successfully',
            'data'    => $this->formatItem($item),
        ]);
    }

    // ── Helper ───────────────────────────────────────────────────────
    private function formatItem(Inventory $i): array
    {
        $qty       = (float) $i->quantity_available;
        $threshold = (float) $i->low_stock_threshold;

        if ($qty === 0.0) {
            $stockStatus = 'out_of_stock';
        } elseif ($qty <= $threshold) {
            $stockStatus = 'low_stock';
        } else {
            $stockStatus = 'in_stock';
        }

        return [
            'inventory_id'        => $i->inventory_id,
            'product_id'          => $i->product_id,
            'product_name'        => $i->product?->name,
            'category'            => $i->product?->category?->name,
            'unit'                => $i->product?->unit,
            'quantity_available'  => $qty,
            'low_stock_threshold' => $threshold,
            'stock_status'        => $stockStatus,
        ];
    }
}
