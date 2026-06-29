<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table      = 'products';
    protected $primaryKey = 'product_id';

    protected $fillable = [
        'seller_id',
        'category_id',
        'zone_id',
        'name',
        'description',
        'price',
        'unit',
        'image_url',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id', 'user_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }

    public function zone()
    {
        return $this->belongsTo(PickupZone::class, 'zone_id', 'zone_id');
    }

    public function inventory()
    {
        return $this->hasOne(Inventory::class, 'product_id', 'product_id');
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class, 'product_id', 'product_id');
    }
}
