<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    // ── Table config ─────────────────────────────────────────────────
    protected $table      = 'users';
    protected $primaryKey = 'user_id';

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone_number',
        'role',
        'region',
        'avatar_url',
        'zone_id',
        'is_verified',
        'status',
    ];

    protected $hidden = [
        'password', // never returned in API responses
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'created_at'  => 'datetime',
        'updated_at'  => 'datetime',
    ];

    // ── JWT required methods ─────────────────────────────────────────

    /**
     * The identifier stored inside the JWT token.
     * We use user_id so any route can do auth()->user()->user_id.
     */
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /**
     * Extra claims embedded in the token payload.
     * Including role means the frontend can read it from the token
     * without an extra /me call (optional convenience).
     */
    public function getJWTCustomClaims(): array
    {
        return [
            'role'  => $this->role,
            'name'  => $this->name,
        ];
    }

    // ── Relationships ────────────────────────────────────────────────

    public function zone()
    {
        return $this->belongsTo(PickupZone::class, 'zone_id', 'zone_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'seller_id', 'user_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'buyer_id', 'user_id');
    }

    // ── Scopes (for admin filtering) ─────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeVerifiedFarmers($query)
    {
        return $query->where('role', 'seller')->where('is_verified', true);
    }
}