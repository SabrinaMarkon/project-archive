# Production Data Deployment Guide

**Date:** November 2, 2025

This guide explains how to deploy your local database data (projects and posts) to the production Forge server.

---

## Overview

Your local development environment has 32 projects and 4 posts that don't exist on production yet. This guide will help you transfer that data to sabrinamarkon.com.

---

## Step 1: Verify Export Files Exist

On your **local machine**, verify the export files were created:

```bash
ls -lh storage/exports/
```

You should see:
- `projects.json` (~43 KB, 32 projects)
- `posts.json` (~82 KB, 4 posts)

If these files don't exist, run the export script:

```bash
php scripts/export_database_for_production.php
```

---

## Step 2: Upload Files to Forge Server

### Option A: Using Forge's File Manager (GUI)

1. Log into Laravel Forge
2. Navigate to your server
3. Click **Files** → **File Manager**
4. Navigate to `/home/forge/sabrinamarkon.com/storage/`
5. Create `exports` directory if it doesn't exist
6. Upload `projects.json` and `posts.json` to `storage/exports/`

### Option B: Using SCP (Command Line)

From your **local machine**:

```bash
# Upload both export files to production
scp storage/exports/projects.json forge@your-server-ip:/home/forge/sabrinamarkon.com/storage/exports/
scp storage/exports/posts.json forge@your-server-ip:/home/forge/sabrinamarkon.com/storage/exports/
```

Replace `your-server-ip` with your actual Forge server IP address.

### Option C: Using Git (if files are tracked)

If you committed the export files to git:

```bash
# On local machine
git add storage/exports/*.json
git commit -m "Add database export files for production import"
git push origin main
```

Then on Forge, the deployment will pull the files automatically.

**Note:** Generally you should **NOT** commit database exports to git for security reasons. Options A or B are preferred.

---

## Step 3: SSH into Forge Server

```bash
ssh forge@your-server-ip
```

Navigate to your application directory:

```bash
cd /home/forge/sabrinamarkon.com
```

---

## Step 4: Verify Export Files on Server

```bash
ls -lh storage/exports/
```

You should see both JSON files. If not, go back to Step 2.

---

## Step 5: Run the Import Command

```bash
php artisan import:production-data
```

You'll see output like:

```
╔════════════════════════════════════════════════════════════╗
║  Import Production Data from JSON Exports                ║
╚════════════════════════════════════════════════════════════╝

Importing projects...
  ✓ Created: Advanced Task Management System
  ✓ Created: AI-Powered Content Generator
  ✓ Created: Blockchain Voting Platform
  ... (32 total)

Importing posts...
  ✓ Created: What Git Rebase Means in Simple Terms
  ✓ Created: Understanding Laravel Inertia.js
  ... (4 total)

╔════════════════════════════════════════════════════════════╗
║  ✓ Import Complete                                        ║
╚════════════════════════════════════════════════════════════╝

Total imported:
  Projects: 32 created, 0 skipped
  Posts: 4 created, 0 skipped
```

---

## Step 6: Verify Data on Production

### Check the Database

```bash
php artisan tinker
```

Then in Tinker:

```php
// Check project count
Project::count(); // Should return 32

// Check posts count
Post::count(); // Should return 4

// View a sample project
Project::first();

// Exit Tinker
exit
```

### Check the Website

Visit https://sabrinamarkon.com/projects and verify you see all 32 projects.

Visit https://sabrinamarkon.com/posts (or /writing) and verify you see all 4 posts.

---

## Troubleshooting

### Error: "Projects export file not found"

**Cause:** Export files weren't uploaded correctly.

**Fix:** Go back to Step 2 and verify file upload.

### Error: "Skipped (already exists)"

**Cause:** Projects or posts with those slugs already exist in production.

**Fix:** This is safe! The import script skips duplicates to prevent data loss. If you want to re-import, you'll need to delete the existing records first:

```bash
php artisan tinker
```

```php
// Delete all projects (BE CAREFUL!)
Project::truncate();

// Delete all posts (BE CAREFUL!)
Post::truncate();

// Exit
exit
```

Then re-run the import command.

### Error: Database connection issues

**Cause:** Production database credentials might be misconfigured.

**Fix:** Check your `.env` file on production:

```bash
cat .env | grep DB_
```

Verify the database name, username, and password are correct.

---

## Re-importing Data (Updates)

If you make changes to projects/posts locally and want to update production:

1. **Export again** on local:
   ```bash
   php scripts/export_database_for_production.php
   ```

2. **Upload new files** to Forge (overwrite old ones)

3. **Delete old data** on production (in Tinker):
   ```php
   Project::truncate();
   Post::truncate();
   ```

4. **Re-import**:
   ```bash
   php artisan import:production-data
   ```

**Warning:** This will delete ALL existing projects and posts on production!

---

## Alternative: Manual Database Export/Import

If the JSON import doesn't work, you can use MySQL dump:

### Export from Local (SQLite to SQL)

```bash
# Export projects table
sqlite3 database/database.sqlite ".dump projects" > projects.sql

# Export posts table
sqlite3 database/database.sqlite ".dump posts" > posts.sql
```

### Import to Production (MySQL)

```bash
# SSH into Forge
ssh forge@your-server-ip

# Import projects
mysql -u your_db_user -p your_db_name < projects.sql

# Import posts
mysql -u your_db_user -p your_db_name < posts.sql
```

---

## Security Notes

1. **Never commit database exports to git** if they contain sensitive data (passwords, API keys, personal information)

2. **Delete export files after import** from production server:
   ```bash
   rm storage/exports/*.json
   ```

3. **Verify author_id** - Posts default to `author_id = 1`. Make sure user ID 1 exists on production:
   ```bash
   php artisan tinker
   ```
   ```php
   User::find(1); // Should return your admin user
   ```

---

## Summary Checklist

- [ ] Export data locally: `php scripts/export_database_for_production.php`
- [ ] Upload JSON files to Forge: `storage/exports/`
- [ ] SSH into Forge server
- [ ] Navigate to app directory: `cd /home/forge/sabrinamarkon.com`
- [ ] Run import: `php artisan import:production-data`
- [ ] Verify on website: https://sabrinamarkon.com/projects
- [ ] (Optional) Delete export files from server for security

---

## Next Steps

After successful import:

1. **Test the website** - Browse all projects and posts
2. **Test the admin** - Log in and verify you can edit projects/posts
3. **Clean up** - Delete temporary export files from production
4. **Document** - Keep this guide for future deployments

---

## Questions?

If you encounter issues:

1. Check Laravel logs: `tail -f storage/logs/laravel.log`
2. Check Forge deployment logs in the Forge dashboard
3. Verify database connection: `php artisan tinker` then `DB::connection()->getPdo();`

---

**Happy deploying!** 🚀
