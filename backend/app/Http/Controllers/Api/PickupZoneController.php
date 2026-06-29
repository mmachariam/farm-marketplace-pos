<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PickupZone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PickupZoneController extends Controller
{
    // ── GET /api/pickup-zones ────────────────────────────────────────
    // Public — used by Register page and Profile pages to populate zone dropdowns
    public function index(Request $request)
    {
        $query = PickupZone::query();

        // Optionally filter by region (useful for Register form zone filtering)
        if ($request->filled('region')) {
            $query->where('region', $request->region);
        }

        $zones = $query->orderBy('zone_name')->get();

        return response()->json([
            'data' => $zones->map(fn($z) => [
                'zone_id'        => $z->zone_id,
                'zone_name'      => $z->zone_name,
                'pickup_address' => $z->pickup_address,
                'region'         => $z->region,
            ]),
        ]);
    }

    // ── POST /api/admin/zones ────────────────────────────────────────
    // Admin only — create a new pickup zone
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'zone_name'      => 'required|string|max:100|unique:pickup_zones,zone_name',
            'pickup_address' => 'required|string|max:255',
            'region'         => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $zone = PickupZone::create($request->only([
            'zone_name', 'pickup_address', 'region',
        ]));

        return response()->json([
            'message' => 'Pickup zone created successfully',
            'data'    => [
                'zone_id'        => $zone->zone_id,
                'zone_name'      => $zone->zone_name,
                'pickup_address' => $zone->pickup_address,
                'region'         => $zone->region,
            ],
        ], 201);
    }

    // ── GET /api/admin/zones ─────────────────────────────────────────
    // Admin view with farmer count and active order count per zone
    public function adminIndex()
    {
        $zones = PickupZone::withCount([
            // Count farmers in this zone
            'farmers as farmer_count',
        ])->get();

        return response()->json([
            'data' => $zones->map(fn($z) => [
                'zone_id'        => $z->zone_id,
                'zone_name'      => $z->zone_name,
                'pickup_address' => $z->pickup_address,
                'region'         => $z->region,
                'farmer_count'   => $z->farmer_count,
            ]),
        ]);
    }
}