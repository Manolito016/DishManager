<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Meal extends Model
{
    protected $fillable = ['daily_plan_id', 'type'];

    public function dailyPlan()
    {
        return $this->belongsTo(DailyPlan::class);
    }

    public function mealDishes()
    {
        return $this->hasMany(MealDish::class);
    }

    public function dishes()
    {
        return $this->belongsToMany(Dish::class, 'meal_dishes')->withPivot('role');
    }
}
