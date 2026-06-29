<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $table      = 'inventory';
    protected $primaryKey = 'inventory_id';

    protected $fillable = [
        'product_id',
        'quantity_available',
        'low_stock_threshold',
    ];

    protected $casts = [
        'quantity_available'  => 'decimal:2',
        'low_stock_threshold' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}
