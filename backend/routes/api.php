<?php

use App\Http\Controllers\Api\DishController;
use App\Http\Controllers\Api\WeeklyPlanController;
use Illuminate\Support\Facades\Route;

Route::apiResource('dishes', DishController::class);
Route::post('weekly-plans/reorder', [WeeklyPlanController::class, 'reorder']);
Route::apiResource('weekly-plans', WeeklyPlanController::class);
Route::post('weekly-plans/{weekly_plan}/days/{day}', [WeeklyPlanController::class, 'updateDay']);
