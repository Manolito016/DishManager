<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WeeklyPlan;
use App\Models\DailyPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WeeklyPlanController extends Controller
{
    public function index()
    {
        return WeeklyPlan::orderBy('sort_order')->oldest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $maxSortOrder = WeeklyPlan::max('sort_order') ?? -1;
        $validated['sort_order'] = $maxSortOrder + 1;

        return WeeklyPlan::create($validated);
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:weekly_plans,id',
        ]);

        foreach ($validated['ids'] as $index => $id) {
            WeeklyPlan::where('id', $id)->update(['sort_order' => $index]);
        }

        return response()->json(['message' => 'Order updated successfully']);
    }

    public function show($id)
    {
        return WeeklyPlan::with(['dailyPlans.meals.dishes', 'dailyPlans.meals.mealDishes.dish'])
            ->findOrFail($id);
    }

    public function update(Request $request, WeeklyPlan $weeklyPlan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $weeklyPlan->update($validated);
        return $weeklyPlan;
    }

    public function destroy(WeeklyPlan $weeklyPlan)
    {
        $weeklyPlan->delete();
        return response()->noContent();
    }

    public function updateDay(Request $request, $weeklyPlanId, $dayOfWeek)
    {
        $validated = $request->validate([
            'lunch' => 'nullable|array',
            'dinner' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($validated, $weeklyPlanId, $dayOfWeek) {
            $dailyPlan = DailyPlan::firstOrCreate([
                'weekly_plan_id' => $weeklyPlanId,
                'day_of_week' => $dayOfWeek
            ]);
            
            $this->syncMeal($dailyPlan, 'lunch', $validated['lunch'] ?? []);
            $this->syncMeal($dailyPlan, 'dinner', $validated['dinner'] ?? []);

            return $dailyPlan->load(['meals.dishes', 'meals.mealDishes.dish']);
        });
    }

    private function syncMeal($dailyPlan, $type, $mealData)
    {
        $meal = $dailyPlan->meals()->updateOrCreate(['type' => $type]);
        $meal->mealDishes()->delete();

        foreach ($mealData as $role => $dishIds) {
            if (!is_array($dishIds)) $dishIds = [$dishIds];
            
            foreach ($dishIds as $dishId) {
                if ($dishId) {
                    $meal->mealDishes()->create([
                        'dish_id' => $dishId,
                        'role' => $role
                    ]);
                }
            }
        }
    }
}
