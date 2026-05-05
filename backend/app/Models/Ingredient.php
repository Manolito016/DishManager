<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    protected $fillable = [
        'dish_id',
        'name',
        'amount',
        'unit',
    ];

    public function dish()
    {
        return $this->belongsTo(Dish::class);
    }
}
