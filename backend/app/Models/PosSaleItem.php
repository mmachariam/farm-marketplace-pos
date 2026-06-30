<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosSaleItem extends Model
{
    protected $table      = 'pos_sale_items';
    protected $primaryKey = 'pos_item_id';
    public    $timestamps = false;

    protected $fillable = [
        'sale_id',
        'product_name',
        'quantity',
        'unit',
        'unit_price',
        'subtotal',
    ];

    protected $casts = [
        'quantity'   => 'decimal:2',
        'unit_price' => 'decimal:2',
        'subtotal'   => 'decimal:2',
    ];

    public function sale()
    {
        return $this->belongsTo(PosSale::class, 'sale_id', 'sale_id');
    }
}
