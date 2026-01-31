<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE posts MODIFY COLUMN format ENUM('html', 'markdown', 'plaintext', 'html_editor') NOT NULL DEFAULT 'markdown'");
        }

        // For SQLite, the column is already varchar and can accept any value
        // Validation happens at the application level (StorePostRequest)
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE posts MODIFY COLUMN format ENUM('html', 'markdown', 'plaintext') NOT NULL DEFAULT 'markdown'");
        }

        // For SQLite, no changes needed
    }
};
