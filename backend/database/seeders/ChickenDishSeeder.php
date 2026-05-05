<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Dish;
use App\Models\Ingredient;
use Illuminate\Support\Facades\File;

class ChickenDishSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = base_path('../chicken_dishes.json');
        if (!File::exists($jsonPath)) {
            $this->command->error("JSON file not found at: {$jsonPath}");
            return;
        }

        $dishes = json_decode(File::get($jsonPath), true);
        
        foreach ($dishes as $dishData) {
            // Skip entries that look like misidentified ingredients
            if (count($dishData['ingredients']) < 2) {
                continue;
            }

            $dish = Dish::create([
                'name' => $dishData['name'],
                'category' => 'Starter Dish', // As requested by user
                'style' => $dishData['style'],
                'notes' => $dishData['notes'] ?? null,
            ]);

            foreach ($dishData['ingredients'] as $ingData) {
                $dish->ingredients()->create([
                    'name' => $ingData['name'],
                    'amount' => $ingData['amount'] ?: '',
                    'unit' => $ingData['unit'] ?: '',
                ]);
            }
        }
    }
}
