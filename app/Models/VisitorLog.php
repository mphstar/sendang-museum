<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VisitorLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'ip_address',
        'user_agent',
        'page_url',
        'referrer',
        'museum_id',
    ];

    public function museum()
    {
        return $this->belongsTo(Museum::class);
    }
}
