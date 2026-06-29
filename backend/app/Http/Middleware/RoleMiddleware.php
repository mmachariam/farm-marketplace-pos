<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Restricts a route to users with specific roles.
     *
     * Usage in routes:
     *   Route::middleware('role:admin')         — admin only
     *   Route::middleware('role:seller')        — sellers only
     *   Route::middleware('role:admin,seller')  — either role
     */
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        $user = auth()->user();

        if (!$user || !in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Unauthorized. You do not have permission to access this resource.',
            ], 403);
        }

        return $next($request);
    }
}