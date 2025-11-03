# Database Access Guide for Laravel Project

## Your Database Setup

Your project is using **SQLite** (not MySQL). This is why `mysqldump` didn't work!

Check your `.env` file:
```
DB_CONNECTION=sqlite
```

The database file is located at: `database/database.sqlite`

---

## How to Access the Database via Command Line

### Method 1: Laravel Artisan (Recommended)

Laravel provides a built-in command to access your database:

```bash
php artisan db
```

This opens an interactive SQLite session where you can run SQL queries directly.

**Example usage:**
```bash
# Start the database session
php artisan db

# Run SQL commands
sqlite> SELECT * FROM projects LIMIT 5;
sqlite> SELECT COUNT(*) FROM posts;
sqlite> .schema projects
sqlite> .quit  # Exit
```

### Method 2: Laravel Tinker (For PHP/Eloquent)

If you want to use Laravel's Eloquent ORM:

```bash
php artisan tinker
```

**Example usage:**
```php
// Get all projects
>>> DB::table('projects')->get();

// Get posts count
>>> DB::table('posts')->count();

// Get a specific project
>>> DB::table('projects')->where('slug', 'nextjs-airbnb-clone')->first();

// Exit
>>> exit
```

### Method 3: Direct SQLite Access (If sqlite3 is installed)

```bash
sqlite3 database/database.sqlite
```

**Common SQLite commands:**
```sql
-- List all tables
.tables

-- Show table structure
.schema projects
.schema posts

-- Run queries
SELECT * FROM projects WHERE status = 'published';
SELECT title, slug FROM posts ORDER BY created_at DESC LIMIT 10;

-- Exit
.quit
```

---

## Useful Laravel Database Commands

### Export Data (What we just did)

```bash
# Run our custom export script
php generate_sql_dumps.php
```

This creates:
- `posts.sql` - MySQL-compatible SQL dump
- `projects.sql` - MySQL-compatible SQL dump

### View Database Info

```bash
php artisan db:show
```

### Run Migrations

```bash
php artisan migrate
```

### Seed Database

```bash
php artisan db:seed
```

### Reset Database (⚠️ Destructive!)

```bash
php artisan migrate:fresh  # Drop all tables and re-migrate
php artisan migrate:fresh --seed  # + run seeders
```

---

## Importing SQL Files into Production (phpMyAdmin)

Since your production server likely uses **MySQL**, not SQLite:

1. **Login to phpMyAdmin** on your Forge server
2. **Select your database** from the left sidebar
3. Click **Import** tab at the top
4. Click **Choose File** and select `posts.sql` or `projects.sql`
5. Scroll down and click **Go**
6. Repeat for the other file

**Important Notes:**
- The SQL dumps include `DROP TABLE IF EXISTS` statements - this will delete existing data!
- Make sure to backup your production database first
- The `author_id` foreign keys reference the `users` table - make sure users exist first
- AUTO_INCREMENT will use the IDs from the dump files

---

## Checking Your .env Configuration

To see your database configuration:

```bash
# View database settings
cat .env | grep DB_

# Or view all environment variables
cat .env
```

For **local development (SQLite)**:
```env
DB_CONNECTION=sqlite
```

For **production (MySQL)**:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

---

## Why mysqldump Didn't Work

`mysqldump` is a MySQL-specific tool. Your local development environment uses **SQLite**, which:
- Stores the entire database in a single file (`database/database.sqlite`)
- Doesn't run as a server (no host/port)
- Doesn't have a `mysqldump` equivalent

To export from SQLite to MySQL-compatible SQL, you need:
1. Custom scripts (like the `generate_sql_dumps.php` we created)
2. Or third-party tools like `sqlite3` command with `.dump`

---

## Troubleshooting

### "command not found: sqlite3"

SQLite3 CLI tool is not installed. Use Laravel's `php artisan db` instead.

### "SQLSTATE[HY000]: General error: 1 no such table"

Your migrations haven't been run. Run:
```bash
php artisan migrate
```

### "Database file does not exist"

Create the SQLite file:
```bash
touch database/database.sqlite
php artisan migrate
```

### "Could not find driver (SQL: PRAGMA foreign_keys = ON;)"

SQLite PHP extension is not installed. Install it:
```bash
# Ubuntu/Debian
sudo apt-get install php-sqlite3

# After installing, restart your terminal
```

---

## Quick Reference

| Task | Command |
|------|---------|
| **Access database** | `php artisan db` |
| **Run PHP/Eloquent queries** | `php artisan tinker` |
| **Show database info** | `php artisan db:show` |
| **Export to MySQL dumps** | `php generate_sql_dumps.php` |
| **Run migrations** | `php artisan migrate` |
| **View .env settings** | `cat .env \| grep DB_` |
| **Count records** | `php artisan tinker --execute="echo DB::table('projects')->count();"` |

---

## Files Generated

✅ `posts.sql` - Ready to import into phpMyAdmin
✅ `projects.sql` - Ready to import into phpMyAdmin
✅ `generate_sql_dumps.php` - The generator script (keep this for future exports)

You can now upload these `.sql` files to your production server!
