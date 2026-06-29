<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    // ── GET /api/profile ─────────────────────────────────────────────
    // Returns the logged-in user's full profile
    public function show()
    {
        $user = auth()->user()->load('zone');

        return response()->json([
            'data' => $this->formatUser($user),
        ]);
    }

    // ── PATCH /api/profile ───────────────────────────────────────────
    // Update name, email, phone, region, zone_id
    public function update(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'name'         => 'sometimes|string|max:100',
            'email'        => 'sometimes|email|max:100|unique:users,email,' . $user->user_id . ',user_id',
            'phone_number' => 'sometimes|nullable|string|max:20',
            'region'       => 'sometimes|nullable|string|max:100',
            // zone_id only relevant for sellers
            'zone_id'      => 'sometimes|nullable|exists:pickup_zones,zone_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user->fill($request->only([
            'name', 'email', 'phone_number', 'region', 'zone_id',
        ]));

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'data'    => $this->formatUser($user->fresh('zone')),
        ]);
    }

    // ── POST /api/profile/avatar ──────────────────────────────────────
    // Upload a profile photo. Stores in storage/app/public/avatars/.
    // Returns the public URL stored in users.avatar_url.
    public function uploadAvatar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,jpg,png,webp|max:2048', // max 2 MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = auth()->user();

        // Delete old avatar file if there is one
        if ($user->avatar_url) {
            $oldPath = str_replace('/storage/', 'public/', $user->avatar_url);
            Storage::delete($oldPath);
        }

        // Store new file and build the public URL
        $path = $request->file('avatar')->store('public/avatars');
        $url  = Storage::url($path); // e.g. /storage/avatars/abc123.jpg

        $user->avatar_url = $url;
        $user->save();

        return response()->json([
            'message'    => 'Avatar uploaded successfully',
            'avatar_url' => $url,
        ]);
    }

    // ── DELETE /api/profile/avatar ────────────────────────────────────
    // Remove profile photo — falls back to initial letter on frontend
    public function removeAvatar()
    {
        $user = auth()->user();

        if ($user->avatar_url) {
            $path = str_replace('/storage/', 'public/', $user->avatar_url);
            Storage::delete($path);
            $user->avatar_url = null;
            $user->save();
        }

        return response()->json(['message' => 'Avatar removed']);
    }

    // ── Helper ───────────────────────────────────────────────────────
    private function formatUser($user): array
    {
        return [
            'user_id'      => $user->user_id,
            'name'         => $user->name,
            'email'        => $user->email,
            'phone_number' => $user->phone_number,
            'role'         => $user->role,
            'region'       => $user->region,
            'avatar_url'   => $user->avatar_url
                ? url($user->avatar_url)  // convert relative to absolute URL
                : null,
            'zone_id'      => $user->zone_id,
            'zone'         => $user->zone ? [
                'zone_id'        => $user->zone->zone_id,
                'zone_name'      => $user->zone->zone_name,
                'pickup_address' => $user->zone->pickup_address,
                'region'         => $user->zone->region,
            ] : null,
            'is_verified'  => $user->is_verified,
            'status'       => $user->status,
            'created_at'   => $user->created_at,
        ];
    }
}