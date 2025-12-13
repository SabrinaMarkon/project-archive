<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the enrollments table entirely
        Schema::dropIfExists('enrollments');

        // Remove is_paid column from posts table
        Schema::table('posts', function (Blueprint $table) {
            if (Schema::hasColumn('posts', 'is_paid')) {
                $table->dropColumn('is_paid');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate enrollments table
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->timestamp('enrolled_at');
            $table->timestamps();

            $table->unique(['user_id', 'post_id']);
        });

        // Add is_paid column back to posts table
        Schema::table('posts', function (Blueprint $table) {
            if (!Schema::hasColumn('posts', 'is_paid')) {
                $table->boolean('is_paid')->default(false)->after('is_featured');
            }
        });
    }
};
