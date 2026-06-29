<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductReview extends Model
{
    protected $table      = 'product_reviews';
    protected $primaryKey = 'review_id';

    protected $fillable = ['product_id', 'buyer_id', 'rating', 'comment'];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id', 'user_id');
    }
}
