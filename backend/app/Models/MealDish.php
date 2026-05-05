<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MealDish extends Model
{
    protected $fillable = ['meal_id', 'dish_id', 'role'];

    public function meal()
    {
        return $this->belongsTo(Meal::class);
    }

    public function dish()
    {
        return $this->belongsTo(Dish::class);
    }
}
