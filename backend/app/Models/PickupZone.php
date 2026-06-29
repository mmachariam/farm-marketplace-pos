<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PickupZone extends Model
{
    protected $table      = 'pickup_zones';
    protected $primaryKey = 'zone_id';
    public    $timestamps = false; // no created_at/updated_at on zones

    protected $fillable = [
        'zone_name',
        'pickup_address',
        'region',
    ];

    // ── Relationships ────────────────────────────────────────────────

    // Farmers who belong to this zone
    public function farmers()
    {
        return $this->hasMany(User::class, 'zone_id', 'zone_id')
                    ->where('role', 'seller');
    }

    // Orders being delivered/collected via this zone
    public function deliveries()
    {
        return $this->hasMany(Delivery::class, 'zone_id', 'zone_id');
    }
}