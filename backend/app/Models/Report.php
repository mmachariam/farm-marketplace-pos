<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $table      = 'reports';
    protected $primaryKey = 'report_id';

    protected $fillable = [
        'admin_id',
        'report_type',
        'parameters',
    ];

    protected $casts = [
        'parameters'     => 'array',
        'generated_date' => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id', 'user_id');
    }
}
