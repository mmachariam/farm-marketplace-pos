<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SellerScheduleController extends Controller
{
    // ── GET /api/seller/schedule ─────────────────────────────────────
    public function index()
    {
        $sellerId = auth()->id();

        $schedules = Schedule::where('seller_id', $sellerId)
            ->with('zone')
            ->orderByRaw("FIELD(day, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')")
            ->get();

        return response()->json([
            'data' => $schedules->map(fn($s) => $this->formatSchedule($s)),
        ]);
    }

    // ── POST /api/seller/schedule ────────────────────────────────────
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'day'          => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'arrival_time' => 'required|date_format:H:i',
            'notes'        => 'nullable|string|max:255',
            'zone_id'      => 'nullable|integer|exists:pickup_zones,zone_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user   = auth()->user();
        $zoneId = $request->zone_id ?? $user->zone_id;

        $schedule = Schedule::create([
            'seller_id'    => $user->user_id,
            'day'          => $request->day,
            'arrival_time' => $request->arrival_time,
            'notes'        => $request->notes,
            'zone_id'      => $zoneId,
        ]);

        $schedule->load('zone');

        return response()->json([
            'data'    => $this->formatSchedule($schedule),
            'message' => 'Schedule entry added',
        ], 201);
    }

    // ── DELETE /api/seller/schedule/{id} ────────────────────────────
    public function destroy($id)
    {
        $schedule = Schedule::where('schedule_id', $id)
            ->where('seller_id', auth()->id())
            ->first();

        if (!$schedule) {
            return response()->json(['message' => 'Schedule entry not found.'], 403);
        }

        $schedule->delete();

        return response()->json(['message' => 'Schedule entry removed']);
    }

    // ── Helper ───────────────────────────────────────────────────────
    private function formatSchedule(Schedule $s): array
    {
        return [
            'id'           => $s->schedule_id,
            'day'          => $s->day,
            'arrival_time' => $s->arrival_time,
            'notes'        => $s->notes,
            'zone'         => $s->zone ? [
                'zone_id'   => $s->zone->zone_id,
                'zone_name' => $s->zone->zone_name,
            ] : null,
        ];
    }
}
