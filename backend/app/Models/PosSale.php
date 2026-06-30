<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosSale extends Model
{
    protected $table      = 'pos_sales';
    protected $primaryKey = 'sale_id';

    protected $fillable = [
        'seller_id',
        'buyer_name',
        'payment_method',
        'total_amount',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'sale_date'    => 'datetime',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id', 'user_id');
    }

    public function items()
    {
        return $this->hasMany(PosSaleItem::class, 'sale_id', 'sale_id');
    }
}
