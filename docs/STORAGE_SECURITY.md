# Storage Directory Security Guide

## Overview
The `/storage` directory in Laravel contains application-generated files, logs, cache, and user uploads. Understanding what should be public vs private is critical for security.

---

## Storage Structure & Security

### ✅ `/storage/app/` - **PRIVATE** (Never publicly accessible)
**Contents:**
- User uploaded files
- Application-generated files
- Private documents
- Temporary files

**Security:**
- ✅ Should be ignored in git (except structure)
- ✅ Should NOT be web-accessible
- ✅ Only accessible via `Storage` facade in code

**Example use:**
```php
// Store private file
Storage::disk('local')->put('invoices/invoice-123.pdf', $content);

// Only accessible via authenticated download
Route::get('/download/{file}', function($file) {
    if (!auth()->check()) abort(403);
    return Storage::download("invoices/{$file}");
});
```

### 🌐 `/storage/app/public/` - **PUBLIC** (Web accessible)
**Contents:**
- User avatars
- Public images
- Downloadable public files

**Setup:**
```bash
php artisan storage:link
```

This creates a symlink: `/public/storage` → `/storage/app/public`

**Security:**
- ✅ Should be ignored in git (except structure)
- ✅ Accessible via `/storage/` URL path
- ⚠️ Only put files here that are safe to be public

**Example use:**
```php
// Store public file
Storage::disk('public')->put('avatars/user-1.jpg', $image);

// Access in blade/React
<img src="/storage/avatars/user-1.jpg" />
```

### 🚫 `/storage/logs/` - **PRIVATE** (Contains sensitive info)
**Contents:**
- Application error logs
- Debug information
- Stack traces
- Potentially sensitive data

**Security:**
- ✅ Should be ignored in git
- ✅ NEVER publicly accessible
- ⚠️ Contains database queries, API keys, user data in errors

**Risks if exposed:**
- Hackers can see error messages revealing:
  - Database structure
  - File paths
  - Configuration details
  - Failed login attempts
  - API endpoints

### 🔧 `/storage/framework/` - **PRIVATE** (System files)
**Contents:**
- Compiled Blade views (`/views`)
- Session files (`/sessions`)
- Cache files (`/cache`)
- Testing files (`/testing`)

**Security:**
- ✅ Should be ignored in git (except structure)
- ✅ Not publicly accessible
- Contains session data, cached credentials, etc.

### 💾 `/storage/exports/` - **PRIVATE** (Database dumps)
**Contents:**
- SQL dump files from `scripts/generate_sql_dumps.php`
- Database backups

**Security:**
- ✅ Should be ignored in git
- ✅ NEVER publicly accessible
- ⚠️ Contains ALL your data (users, posts, projects, etc.)

**Risks if exposed:**
- Complete database dump = all user data
- Email addresses
- Passwords (even if hashed)
- Private content
- Business data

---

## Git Configuration

### What's Committed
✅ **Structure** - Empty directories with `.gitignore` files
```
/storage/app/.gitignore
/storage/framework/cache/.gitignore
/storage/framework/sessions/.gitignore
/storage/logs/.gitignore
/storage/exports/.gitignore
```

### What's Ignored
❌ **All actual files** in storage (except .gitignore)
```
/storage/app/*
/storage/framework/cache/*
/storage/framework/sessions/*
/storage/framework/views/*
/storage/logs/*
/storage/exports/*.sql
```

### Current .gitignore (Root)
```gitignore
# Storage - Keep structure but ignore contents
/storage/app/*
!/storage/app/.gitignore
!/storage/app/public/
/storage/app/public/*
!/storage/app/public/.gitignore
/storage/framework/cache/*
!/storage/framework/cache/.gitignore
/storage/framework/sessions/*
!/storage/framework/sessions/.gitignore
/storage/framework/testing/*
!/storage/framework/testing/.gitignore
/storage/framework/views/*
!/storage/framework/views/.gitignore
/storage/logs/*
!/storage/logs/.gitignore

# SQL Exports - NEVER commit database dumps
/storage/exports/*.sql
/storage/exports/*.dump
```

---

## Web Server Configuration

### What Should Be Web-Accessible
✅ **ONLY** `/public/` directory

Your web server (Nginx/Apache) should point to `/public` as the document root.

**Nginx Example:**
```nginx
server {
    root /path/to/project/public;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
}
```

### What Should NOT Be Accessible
❌ Anything outside `/public/`
- `/storage/` (except via `/public/storage` symlink)
- `/vendor/`
- `/config/`
- `/database/`
- `.env`

**If misconfigured, attackers could:**
```
https://yoursite.com/storage/logs/laravel.log  ← Should be 404
https://yoursite.com/.env                       ← Should be 404
https://yoursite.com/storage/exports/posts.sql  ← Should be 404
```

---

## Security Checklist

### Development Environment
- [ ] `/storage/exports/` added to `.gitignore`
- [ ] SQL dumps never committed to git
- [ ] `.env` file never committed
- [ ] Logs never committed

### Production Environment
- [ ] Web server points to `/public/` directory only
- [ ] `/storage/` is NOT directly web-accessible
- [ ] `php artisan storage:link` has been run
- [ ] File permissions set correctly:
  ```bash
  chmod -R 755 storage
  chmod -R 755 bootstrap/cache
  ```
- [ ] `/storage/logs/` is writable by web server
- [ ] `/storage/framework/` subdirectories are writable

### Deployment
- [ ] Never upload `.env` via FTP (use SSH/Forge)
- [ ] Never download production database to local `.sql` files that get committed
- [ ] Use environment variables for sensitive config
- [ ] Backup databases to private, encrypted storage

---

## Common Mistakes to Avoid

### ❌ DON'T: Commit database dumps
```bash
git add storage/exports/posts.sql  # NEVER DO THIS
```

### ✅ DO: Keep dumps local only
```bash
# Add to .gitignore
/storage/exports/*.sql

# Generate locally
php scripts/generate_sql_dumps.php

# Download from production via SSH
scp user@server:/path/exports/posts.sql ~/Downloads/
```

### ❌ DON'T: Make `/storage` web-accessible
```nginx
# WRONG - Don't do this
location /storage {
    alias /path/to/project/storage;
}
```

### ✅ DO: Use storage:link for public files
```bash
php artisan storage:link

# Now only /storage/app/public/ is accessible via /public/storage
```

### ❌ DON'T: Store credentials in version control
```php
// WRONG - .env in git
DB_PASSWORD=secret123
```

### ✅ DO: Use environment variables
```php
// .env (ignored by git)
DB_PASSWORD=secret123

// config/database.php
'password' => env('DB_PASSWORD'),
```

---

## For This Project

### Current Setup
- ✅ SQLite database: `database/database.sqlite` (NOT committed)
- ✅ SQL exports: `storage/exports/*.sql` (NOT committed)
- ✅ Documentation: `/docs/` (IS committed)
- ✅ Scripts: `/scripts/` (IS committed)

### Production Considerations
When deploying to Forge:

1. **Database Migration:**
   ```bash
   # Import SQL dumps via phpMyAdmin (not via git)
   # Upload posts.sql
   # Upload projects.sql
   ```

2. **Storage Setup:**
   ```bash
   php artisan storage:link
   chmod -R 755 storage
   chmod -R 755 bootstrap/cache
   ```

3. **Never Expose:**
   - `/storage/exports/` (database dumps)
   - `/storage/logs/` (error logs)
   - `.env` (environment config)

---

## Summary

### 🔒 Private (Never Public, Never Committed)
- `/storage/app/` (except public subdirectory)
- `/storage/logs/`
- `/storage/framework/cache/`
- `/storage/framework/sessions/`
- `/storage/exports/*.sql`
- `.env`

### 🌐 Public (Web Accessible)
- `/public/` (only this directory)
- `/public/storage/` (symlink to `/storage/app/public/`)

### 📦 Committed to Git
- Directory structure (with `.gitignore` files)
- `/docs/` (documentation)
- `/scripts/` (utility scripts)
- Public assets in `/public/`

---

**Remember:** When in doubt, keep it private! It's easier to make something public later than to recover from a security breach.
