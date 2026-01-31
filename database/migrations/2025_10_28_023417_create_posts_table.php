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
        Schema::create(table: 'posts', callback: function (Blueprint $table): void {
            $table->id();
            $table->string(column: 'title');
            $table->string(column: 'slug')->unique();
            $table->longText(column: 'description')->nullable();
            $table->enum(column: 'format', allowed: ['html', 'markdown', 'plaintext', 'html_editor'])->default(value: 'markdown');
            $table->text(column: 'excerpt')->nullable();
            $table->enum(column: 'status', allowed: ['draft', 'published', 'archived']) ->default(value: 'draft');
            $table->timestamp(column: 'published_at')->nullable();
            $table->foreignId(column: 'author_id')->constrained(table: 'users')->onDelete(action: 'cascade');
            $table->string(column: 'cover_image')->nullable();
            $table->json(column: 'tags')->nullable();
            $table->string(column: 'meta_title')->nullable();
            $table->string(column: 'meta_description')->nullable();
            $table->unsignedInteger(column: 'view_count')->default(value: 0);
            $table->boolean(column: 'is_featured')->default(value: false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists(table: 'posts');
    }
};
