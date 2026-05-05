<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Dish;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $dishes = [
            [
                'name' => 'Honey Garlic Chicken',
                'category' => 'Starter Dish',
                'style' => 'Fried & Crispy Chicken',
                'ingredients' => [
                    ['name' => 'chicken thighs (boneless)', 'amount' => '6', 'unit' => 'kg'],
                    ['name' => 'honey', 'amount' => '200', 'unit' => 'ml'],
                    ['name' => 'soy sauce', 'amount' => '150', 'unit' => 'ml'],
                    ['name' => 'garlic (minced)', 'amount' => '2', 'unit' => 'heads'],
                    ['name' => 'rice vinegar', 'amount' => '50', 'unit' => 'ml'],
                    ['name' => 'cooking oil', 'amount' => '100', 'unit' => 'ml'],
                    ['name' => 'red chili flakes', 'amount' => '1', 'unit' => 'tsp'],
                    ['name' => 'Salt and pepper to taste', 'amount' => '', 'unit' => ''],
                    ['name' => 'Sesame seeds and green onions for garnish', 'amount' => '', 'unit' => ''],
                ]
            ],
            [
                'name' => 'Honey BBQ Chicken',
                'category' => 'Starter Dish',
                'style' => 'Grilled & Roasted Chicken',
                'ingredients' => [
                    ['name' => 'chicken (cut into pieces)', 'amount' => '6', 'unit' => 'kg'],
                    ['name' => 'BBQ sauce', 'amount' => '400', 'unit' => 'ml'],
                    ['name' => 'honey', 'amount' => '300', 'unit' => 'ml'],
                    ['name' => 'soy sauce', 'amount' => '100', 'unit' => 'ml'],
                    ['name' => 'garlic (minced)', 'amount' => '1', 'unit' => 'head'],
                    ['name' => 'apple cider vinegar', 'amount' => '2', 'unit' => 'tbsp'],
                    ['name' => 'smoked paprika', 'amount' => '1', 'unit' => 'tbsp'],
                    ['name' => 'Salt and pepper to taste', 'amount' => '', 'unit' => ''],
                ]
            ],
            [
                'name' => 'Chicken Stuffed Peppers',
                'category' => 'Starter Dish',
                'style' => 'Baked & Slow-Cooked Chicken',
                'ingredients' => [
                    ['name' => 'chicken (cooked and minced)', 'amount' => '3', 'unit' => 'kg'],
                    ['name' => 'large bell peppers (tops cut off, seeds removed)', 'amount' => '30', 'unit' => ''],
                    ['name' => 'cooked rice', 'amount' => '2', 'unit' => 'kg'],
                    ['name' => 'diced tomatoes', 'amount' => '800', 'unit' => 'g'],
                    ['name' => 'corn kernels', 'amount' => '400', 'unit' => 'g'],
                    ['name' => 'black beans', 'amount' => '300', 'unit' => 'g'],
                    ['name' => 'cheddar cheese (shredded)', 'amount' => '300', 'unit' => 'g'],
                    ['name' => 'onions (diced)', 'amount' => '3', 'unit' => 'medium'],
                    ['name' => 'garlic (minced)', 'amount' => '1', 'unit' => 'head'],
                    ['name' => 'Chili powder, cumin, and salt', 'amount' => '', 'unit' => ''],
                ]
            ]
        ];

        foreach ($dishes as $dishData) {
            $dish = Dish::create([
                'name' => $dishData['name'],
                'category' => $dishData['category'],
                'style' => $dishData['style'],
            ]);

            foreach ($dishData['ingredients'] as $ing) {
                $dish->ingredients()->create($ing);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Dish::whereIn('name', ['Honey Garlic Chicken', 'Honey BBQ Chicken', 'Chicken Stuffed Peppers'])->delete();
    }
};
