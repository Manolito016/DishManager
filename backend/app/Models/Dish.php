<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dish extends Model
{
    protected $fillable = [
        'name',
        'category',
        'style',
        'photo_path',
        'video_path',
        'notes',
        'instructions',
    ];

    protected $casts = [
        'instructions' => 'array',
    ];

    public function ingredients()
    {
        return $this->hasMany(Ingredient::class);
    }

    public function mealDishes()
    {
        return $this->hasMany(MealDish::class);
    }
}
