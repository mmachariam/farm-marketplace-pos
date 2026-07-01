<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminUserController extends Controller
{
    // ── GET /api/admin/users ─────────────────────────────────────────
    // List all users with optional search + role filter
    public function index(Request $request)
    {
        $query = User::with('zone');

        // Search by name or email
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'data' => $users->map(fn($u) => $this->formatUser($u)),
            'meta' => [
                'total'        => $users->total(),
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
            ],
        ]);
    }

    // ── PATCH /api/admin/users/{id} ──────────────────────────────────
    // Suspend or activate a user account
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = User::findOrFail($id);

        // Prevent admin from suspending themselves
        if ($user->user_id === auth()->id()) {
            return response()->json([
                'message' => 'You cannot change your own account status',
            ], 403);
        }

        $user->status = $request->status;
        $user->save();

        $action = $request->status === 'active' ? 'activated' : 'suspended';

        return response()->json([
            'message' => "User {$action} successfully",
            'data'    => $this->formatUser($user),
        ]);
    }

    // ── PATCH /api/admin/users/{id}/verify ───────────────────────────
    // Verify a farmer — they can now list products
    public function verify($id)
    {
        $user = User::findOrFail($id);

        if ($user->role !== 'seller') {
            return response()->json([
                'message' => 'Only farmers can be verified',
            ], 422);
        }

        if ($user->is_verified) {
            return response()->json([
                'message' => 'Farmer is already verified',
            ], 422);
        }

        $user->is_verified = true;
        $user->save();

        return response()->json([
            'message' => "{$user->name} has been verified as a farmer",
            'data'    => $this->formatUser($user),
        ]);
    }

    // ── POST /api/admin/users/{id}/reset-password ────────────────────
    // Reset a user's password back to the system default
    public function resetPassword($id)
    {
        $user = User::findOrFail($id);

        $defaultPassword = config('sokomoja.default_user_password');

        $user->password = Hash::make($defaultPassword);
        $user->save();

        return response()->json([
            'message' => 'Password has been reset successfully.',
            'data'    => [
                'default_password' => $defaultPassword,
            ],
        ]);
    }

    // ── Helper ───────────────────────────────────────────────────────
    private function formatUser(User $user): array
    {
        return [
            'user_id'     => $user->user_id,
            'name'        => $user->name,
            'email'       => $user->email,
            'phone_number'=> $user->phone_number,
            'role'        => $user->role,
            'region'      => $user->region,
            'avatar_url'  => $user->avatar_url ? url($user->avatar_url) : null,
            'zone'        => $user->zone ? [
                'zone_id'   => $user->zone->zone_id,
                'zone_name' => $user->zone->zone_name,
                'region'    => $user->zone->region,
            ] : null,
            'is_verified' => $user->is_verified,
            'status'      => $user->status,
            'joined'      => $user->created_at?->toDateString(),
        ];
    }
}