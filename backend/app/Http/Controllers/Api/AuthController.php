<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    // ── POST /api/auth/register ──────────────────────────────────────
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'         => 'required|string|max:100',
            'email'        => 'required|email|max:100|unique:users,email',
            'password'     => 'required|string|min:8|confirmed', // requires password_confirmation field
            // Admin accounts are seeded/created by existing admins only (AdminProfileController@createAdmin) — never self-registered.
            'role'         => 'required|in:buyer,seller',
            'phone_number' => 'nullable|string|max:20',
            'region'       => 'nullable|string|max:100',
            'zone_id'      => 'nullable|exists:pickup_zones,zone_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name'         => $request->name,
            'email'        => $request->email,
            'password'     => Hash::make($request->password),
            'role'         => $request->role,
            'phone_number' => $request->phone_number,
            'region'       => $request->region,
            'zone_id'      => $request->zone_id,
            // Sellers start unverified — admin must verify them
            'is_verified'  => $request->role === 'seller' ? false : true,
            'status'       => 'active',
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Registration successful',
            'token'   => $token,
            'user'    => $this->formatUser($user),
        ], 201);
    }

    // ── POST /api/auth/login ─────────────────────────────────────────
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        // Deliberately generic — distinguishing "unknown email" from "wrong
        // password" lets an attacker enumerate registered accounts.
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password.',
            ], 401);
        }

        // Block suspended accounts
        if ($user->status === 'suspended') {
            return response()->json([
                'message' => 'Your account has been suspended. Please contact the administrator.',
            ], 403);
        }

        // Farmers must be verified by an admin before they can sign in
        if ($user->role === 'seller' && !$user->is_verified) {
            return response()->json([
                'message' => 'Your farmer account is awaiting administrator verification.',
            ], 403);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Login successful',
            'token'   => $token,
            'user'    => $this->formatUser($user),
        ]);
    }

    // ── POST /api/auth/logout ────────────────────────────────────────
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (\Exception $e) {
            // Token already invalid or expired — safe to ignore
        }

        return response()->json(['message' => 'Logged out successfully']);
    }

    // ── GET /api/auth/me ─────────────────────────────────────────────
    public function me()
    {
        $user = auth()->user()->load('zone');

        return response()->json([
            'data' => $this->formatUser($user),
        ]);
    }

    // ── POST /api/auth/refresh ───────────────────────────────────────
    // Exchanges a nearly-expired token for a fresh one
    public function refresh()
    {
        try {
            $token = JWTAuth::refresh(JWTAuth::getToken());
        } catch (\Exception $e) {
            return response()->json(['message' => 'Token cannot be refreshed'], 401);
        }

        return response()->json(['token' => $token]);
    }

    // ── Helper: consistent user shape returned to frontend ───────────
    private function formatUser(User $user): array
    {
        return [
            'user_id'     => $user->user_id,
            'name'        => $user->name,
            'email'       => $user->email,
            'phone_number'=> $user->phone_number,
            'role'        => $user->role,
            'region'      => $user->region,
            'avatar_url'  => $user->avatar_url,
            'zone_id'     => $user->zone_id,
            'zone'        => $user->zone ? [
                'zone_id'        => $user->zone->zone_id,
                'zone_name'      => $user->zone->zone_name,
                'pickup_address' => $user->zone->pickup_address,
                'region'         => $user->zone->region,
            ] : null,
            'is_verified' => $user->is_verified,
            'status'      => $user->status,
            'created_at'  => $user->created_at,
        ];
    }
}