<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    protected $table      = 'deliveries';
    protected $primaryKey = 'delivery_id';

    protected $fillable = [
        'order_id',
        'zone_id',
        'delivery_address',
        'delivery_status',
        'delivery_date',
    ];

    protected $casts = [
        'delivery_date' => 'date',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }

    public function pickupZone()
    {
        return $this->belongsTo(PickupZone::class, 'zone_id', 'zone_id');
    }
}
