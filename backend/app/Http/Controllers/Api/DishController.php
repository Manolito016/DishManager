<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dish;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DishController extends Controller
{
    public function index()
    {
        return Dish::with('ingredients')->latest()->get()->map(function ($dish) {
            if ($dish->video_path) {
                $dish->video_url = asset('storage/' . $dish->video_path);
            }
            if ($dish->photo_path) {
                $dish->photo_url = asset('storage/' . $dish->photo_path);
            }
            return $dish;
        });
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'style' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:10240', // max 10MB
            'video' => 'nullable|file|mimes:mp4,mov,ogg,qt|max:102400', // max 100MB
            'notes' => 'nullable|string',
            'ingredients' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $dishData = collect($validated)->except(['photo', 'video', 'ingredients'])->toArray();
            
            if ($request->hasFile('photo')) {
                $path = $request->file('photo')->store('photos', 'public');
                $dishData['photo_path'] = $path;
            }

            if ($request->hasFile('video')) {
                $path = $request->file('video')->store('videos', 'public');
                $dishData['video_path'] = $path;
            }

            $dish = Dish::create($dishData);

            if ($request->filled('ingredients')) {
                $ingredients = json_decode($request->ingredients, true);
                if (is_array($ingredients)) {
                    $dish->ingredients()->createMany($ingredients);
                }
            }

            return $dish->load('ingredients');
        });
    }

    public function show(Dish $dish)
    {
        $dish->load('ingredients');
        if ($dish->video_path) {
            $dish->video_url = asset('storage/' . $dish->video_path);
        }
        if ($dish->photo_path) {
            $dish->photo_url = asset('storage/' . $dish->photo_path);
        }
        return $dish;
    }

    public function update(Request $request, Dish $dish)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'style' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:10240',
            'video' => 'nullable|file|mimes:mp4,mov,ogg,qt|max:102400',
            'notes' => 'nullable|string',
            'ingredients' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $dish, $request) {
            $dishData = collect($validated)->except(['photo', 'video', 'ingredients'])->toArray();

            if ($request->hasFile('photo')) {
                if ($dish->photo_path) {
                    Storage::disk('public')->delete($dish->photo_path);
                }
                $path = $request->file('photo')->store('photos', 'public');
                $dishData['photo_path'] = $path;
            }

            if ($request->hasFile('video')) {
                if ($dish->video_path) {
                    Storage::disk('public')->delete($dish->video_path);
                }
                $path = $request->file('video')->store('videos', 'public');
                $dishData['video_path'] = $path;
            }

            $dish->update($dishData);

            if ($request->filled('ingredients')) {
                $ingredients = json_decode($request->ingredients, true);
                if (is_array($ingredients)) {
                    $dish->ingredients()->delete();
                    $dish->ingredients()->createMany($ingredients);
                }
            }

            return $dish->load('ingredients');
        });
    }

    public function destroy(Dish $dish)
    {
        if ($dish->photo_path) {
            Storage::disk('public')->delete($dish->photo_path);
        }
        if ($dish->video_path) {
            Storage::disk('public')->delete($dish->video_path);
        }
        $dish->delete();
        return response()->noContent();
    }
}
