<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureAccountActive
{
    /**
     * Blocks a request as soon as a suspended user's JWT is presented, instead
     * of only checking status at login time. Runs globally on the api group;
     * a no-op for guests since auth('api')->user() resolves to null for them.
     */
    public function handle(Request $request, Closure $next): mixed
    {
        $user = auth('api')->user();

        if ($user && $user->status === 'suspended') {
            return response()->json([
                'message' => 'Your account has been suspended. Please contact the administrator.',
            ], 403);
        }

        return $next($request);
    }
}
