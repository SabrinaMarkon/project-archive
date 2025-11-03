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
        Schema::table('projects', function (Blueprint $table) {
            // Only add columns if they don't already exist
            if (!Schema::hasColumn('projects', 'format')) {
                $table->enum('format', ['html', 'markdown', 'plaintext'])->default('markdown')->after('description');
            }
            if (!Schema::hasColumn('projects', 'status')) {
                $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->after('excerpt');
            }
            if (!Schema::hasColumn('projects', 'published_at')) {
                $table->timestamp('published_at')->nullable()->after('status');
            }
            if (!Schema::hasColumn('projects', 'author_id')) {
                $table->foreignId('author_id')->nullable()->constrained('users')->onDelete('cascade')->after('published_at');
            }
            if (!Schema::hasColumn('projects', 'cover_image')) {
                $table->string('cover_image')->nullable()->after('author_id');
            }
            if (!Schema::hasColumn('projects', 'meta_title')) {
                $table->string('meta_title')->nullable()->after('tags');
            }
            if (!Schema::hasColumn('projects', 'meta_description')) {
                $table->string('meta_description')->nullable()->after('meta_title');
            }
            if (!Schema::hasColumn('projects', 'view_count')) {
                $table->unsignedInteger('view_count')->default(0)->after('meta_description');
            }
            if (!Schema::hasColumn('projects', 'is_featured')) {
                $table->boolean('is_featured')->default(false)->after('view_count');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn([
                'format',
                'status',
                'published_at',
                'author_id',
                'cover_image',
                'meta_title',
                'meta_description',
                'view_count',
                'is_featured',
            ]);

            // Revert excerpt back to string(500)
            $table->string('excerpt', 500)->nullable()->change();
        });
    }
};
