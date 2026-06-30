<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $table      = 'schedules';
    protected $primaryKey = 'schedule_id';

    protected $fillable = [
        'seller_id',
        'day',
        'arrival_time',
        'notes',
        'zone_id',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id', 'user_id');
    }

    public function zone()
    {
        return $this->belongsTo(PickupZone::class, 'zone_id', 'zone_id');
    }
}
