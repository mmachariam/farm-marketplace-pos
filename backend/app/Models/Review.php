<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $table      = 'reviews';
    protected $primaryKey = 'review_id';
    public    $timestamps = false;
    const CREATED_AT      = 'created_at';

    protected $fillable = [
        'order_id',
        'buyer_id',
        'product_id',
        'rating',
        'comment',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id', 'user_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}
