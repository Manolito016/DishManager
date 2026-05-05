<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyPlan extends Model
{
    protected $fillable = ['weekly_plan_id', 'day_of_week'];

    public function weeklyPlan()
    {
        return $this->belongsTo(WeeklyPlan::class);
    }

    public function meals()
    {
        return $this->hasMany(Meal::class);
    }
}
