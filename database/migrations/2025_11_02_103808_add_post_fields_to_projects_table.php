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
            // Change excerpt from string to text for consistency with posts
            $table->text('excerpt')->nullable()->change();

            // Add format field (html, markdown, plaintext)
            $table->enum('format', ['html', 'markdown', 'plaintext'])->default('markdown')->after('description');

            // Add status field (draft, published, archived)
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->after('excerpt');

            // Add published_at timestamp
            $table->timestamp('published_at')->nullable()->after('status');

            // Add author_id foreign key
            $table->foreignId('author_id')->nullable()->constrained('users')->onDelete('cascade')->after('published_at');

            // Add cover_image
            $table->string('cover_image')->nullable()->after('author_id');

            // Add SEO meta fields
            $table->string('meta_title')->nullable()->after('tags');
            $table->string('meta_description')->nullable()->after('meta_title');

            // Add view_count
            $table->unsignedInteger('view_count')->default(0)->after('meta_description');

            // Add is_featured flag
            $table->boolean('is_featured')->default(false)->after('view_count');
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
