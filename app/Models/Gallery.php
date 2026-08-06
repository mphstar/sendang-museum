<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    use HasFactory;

    protected $table = 'galleries';

    protected $fillable = [
        'museum_id',
        'title',
        'description',
        'media_type',
        'media_url',
        'thumbnail_url',
        'order',
    ];

    public function museum()
    {
        return $this->belongsTo(Museum::class, 'museum_id');
    }
}
