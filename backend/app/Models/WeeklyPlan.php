<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeeklyPlan extends Model
{
    protected $fillable = ['name', 'sort_order'];

    public function dailyPlans()
    {
        return $this->hasMany(DailyPlan::class);
    }
}
