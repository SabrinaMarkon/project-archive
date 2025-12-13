<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->boolean('is_free')->default(false);
            $table->text('custom_description')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->unique(['course_id', 'post_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_modules');
    }
};
