<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use App\Models\Review;

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
        'bunch_contains',
        'image_url',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    // Exposes image_url as a full URL so the frontend never needs to
    // know the backend's host/port. Controlled by APP_URL.
    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (!$value) {
                    return null;
                }

                if (str_starts_with($value, 'http')) {
                    return $value;
                }

                return url($value);
            }
        );
    }

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
        return $this->hasMany(Review::class, 'product_id', 'product_id');
    }
}
