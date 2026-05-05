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
        Dish::query()->update(['photo_path' => null]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No way to reverse data clearing
    }
};
