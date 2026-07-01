<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AdminProfileController extends Controller
{
    // ── GET /api/admin/profile ───────────────────────────────────────
    public function show()
    {
        return response()->json([
            'data' => $this->formatAdmin(auth()->user()),
        ]);
    }

    // ── PATCH /api/admin/profile ─────────────────────────────────────
    public function update(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'name'         => 'sometimes|string|max:100',
            'email'        => 'sometimes|email|max:100|unique:users,email,' . $user->user_id . ',user_id',
            'phone_number' => 'sometimes|nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user->fill($request->only(['name', 'email', 'phone_number']));
        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'data'    => $this->formatAdmin($user->fresh()),
        ]);
    }

    // ── POST /api/admin/profile/avatar ───────────────────────────────
    public function uploadAvatar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,jpg,png,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = auth()->user();

        if ($user->avatar_url) {
            $oldPath = str_replace('/storage/', 'public/', $user->avatar_url);
            Storage::delete($oldPath);
        }

        $path = $request->file('avatar')->store('public/avatars');
        $url  = Storage::url($path);

        $user->avatar_url = $url;
        $user->save();

        return response()->json([
            'message'    => 'Avatar uploaded successfully',
            'avatar_url' => $url,
        ]);
    }

    // ── POST /api/admin/profile/password ─────────────────────────────
    public function updatePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password'         => 'required|string',
            'new_password'             => 'required|string|min:8|confirmed',
            'new_password_confirmation' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = auth()->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect',
                'errors'  => ['current_password' => ['Current password is incorrect']],
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully',
        ]);
    }

    // ── POST /api/admin/users/create ─────────────────────────────────
    public function createAdmin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|max:100|unique:users,email',
            'phone'    => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $admin = User::create([
            'name'         => $request->name,
            'email'        => $request->email,
            'phone_number' => $request->phone,
            'password'     => Hash::make($request->password),
            'role'         => 'admin',
            'is_verified'  => true,
            'status'       => 'active',
        ]);

        return response()->json([
            'message' => 'Administrator created successfully',
            'data'    => $this->formatAdmin($admin),
        ], 201);
    }

    // ── Helper ───────────────────────────────────────────────────────
    private function formatAdmin(User $user): array
    {
        return [
            'user_id'        => $user->user_id,
            'name'           => $user->name,
            'email'          => $user->email,
            'phone_number'   => $user->phone_number,
            'region'         => $user->region,
            'avatar_url'     => $user->avatar_url ? url($user->avatar_url) : null,
            'status'         => $user->status,
            'created_at'     => $user->created_at,
            'last_login_at'  => $user->updated_at,
        ];
    }
}
