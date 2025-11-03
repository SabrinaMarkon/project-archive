# Testing & Deployment Issues - Lessons Learned

**Date:** November 2, 2025

---

## Issue 1: TypeScript Errors Not Caught by Tests

### What Happened

Deployment to Forge failed with:
```
resources/js/Pages/Projects/Show.tsx(32,38): error TS2339: Property 'readTime' does not exist on type 'Project'.
```

But our local tests (`npm test`) didn't catch this!

### Why This Happened

**Root Cause:** Different build processes

| Environment | Command | TypeScript Checking |
|-------------|---------|---------------------|
| Local tests | `vitest` | ❌ No strict TypeScript checking |
| Production build | `tsc && vite build` | ✅ Full TypeScript compilation |

**What this means:**
- Vitest runs tests in a dev environment where TypeScript is transpiled by esbuild
- esbuild is fast but doesn't do full type checking
- Production runs `tsc` first, which does strict type checking
- Result: Tests pass locally, production fails!

### How to Prevent This

**Add TypeScript checking to CI/testing workflow:**

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:types": "tsc --noEmit",  // <-- Add this
    "test:all": "npm run test:types && npm run test"  // <-- Run both
  }
}
```

**Before pushing to GitHub, run:**
```bash
npm run test:types  # Check TypeScript
npm run test        # Run functional tests
npm run build       # Verify build works
```

**Better yet, add to Git pre-push hook:**
```bash
#!/bin/sh
npm run test:types || exit 1
npm run test || exit 1
```

### The Fix

Added `readTime?: string;` to the Project interface in `resources/js/types/project.ts`

---

## Issue 2: Test Failures After Terminology Changes

### What Happened

After changing "Posts" to "Writing" throughout the app, tests started failing:

```
Found multiple elements with the text: Writing List
```

### Why This Happened

Tests were using `getByText('Writing List')` but:
- The page has `<h2>Writing List</h2>`
- **AND** `<title>Writing List</title>`
- Both match the query, causing ambiguity

### How to Fix

**Option 1: Use getAllByText when multiple matches are expected**
```typescript
const headings = screen.getAllByText('Writing List');
expect(headings).toHaveLength(2); // title + h2
```

**Option 2: Use more specific queries**
```typescript
const heading = screen.getByRole('heading', { name: 'Writing List' });
expect(heading).toBeInTheDocument();
```

**Option 3: Use data-testid for unique identification**
```typescript
// In component:
<h2 data-testid="page-heading">Writing List</h2>

// In test:
const heading = screen.getByTestId('page-heading');
```

### Tests That Need Fixing

Run `npm test` and look for:
- `resources/js/Pages/Admin/Posts/Index.test.tsx` - Multiple failures

---

## Issue 3: Missing Production Database Data

### What Happened

Deployment succeeded, but **sabrinamarkon.com has no projects or posts!**

All the data (32 projects, 4 posts) only exists in the **local database**.

### Why This Happened

**Local vs Production databases are separate:**

```
Local Development (your computer):
├── SQLite database: database/database.sqlite
├── 32 projects imported from docx files
└── 4 posts created in admin

Production (Forge server):
├── MySQL database: Empty!
├── No projects
└── No posts
```

### How to Fix: Deploy Database Data to Production

**Option 1: Export/Import SQL (Quick but manual)**

1. **Export local data:**
```bash
# Export projects
php artisan tinker --execute="
\$projects = \App\Models\Project::all();
file_put_contents('projects-export.json', \$projects->toJson());
"

# Export posts
php artisan tinker --execute="
\$posts = \App\Models\Post::all();
file_put_contents('posts-export.json', \$posts->toJson());
"
```

2. **Upload to production server via Forge SSH**

3. **Import on production:**
```bash
php artisan tinker --execute="
\$data = json_decode(file_get_contents('projects-export.json'), true);
foreach (\$data as \$project) {
    \App\Models\Project::create(\$project);
}
"
```

**Option 2: Run Import Scripts on Production (Better)**

1. **Upload the docx files to production:**
```bash
# Via Forge SSH or SFTP
scp storage/app/projects/* forge@server:/path/to/storage/app/projects/
```

2. **Run the import command on production:**
```bash
# SSH into Forge server
ssh forge@sabrinamarkon.com

cd /home/forge/sabrinamarkon.com
php artisan import:projects storage/app/projects
```

**Option 3: Database Seeders (Most Professional)**

Create a seeder that can be run on any environment:

```php
// database/seeders/ProjectSeeder.php
php artisan make:seeder ProjectSeeder

// Then run on production:
php artisan db:seed --class=ProjectSeeder
```

**Option 4: Forge Database Backup/Restore**

1. In Forge, create a backup of local database
2. Download it
3. Restore to production database
4. ⚠️ **This will overwrite ALL production data!**

### Recommended Approach

**For this project (personal portfolio):**

1. Keep the docx files in version control OR on production server
2. Run the import script on production:
   ```bash
   php artisan import:projects storage/app/projects
   ```
3. Manually create the 4 posts in the admin interface on production
   (Or export/import the posts JSON)

**For future projects:**
- Use database seeders for sample/initial data
- Keep production database migrations in version control
- Never rely on local-only data

---

## Summary: Full Testing Checklist

Before pushing to GitHub → Forge deployment:

```bash
# 1. Type checking
npm run test:types

# 2. Functional tests
npm test

# 3. Production build
npm run build

# 4. Backend tests
php artisan test

# 5. Check for uncommitted database changes
git status
# If you added/changed data, document how to replicate on production!
```

---

## Action Items

- [ ] Add `test:types` script to package.json
- [ ] Fix failing Admin Posts tests (use getAllByText or data-testid)
- [ ] Deploy projects and posts data to production
- [ ] Consider adding database seeders for reproducible data
- [ ] Add Git pre-push hook to run TypeScript checking
- [ ] Document production deployment process

---

## Lessons Learned

1. **Tests aren't enough** - You need type checking too!
2. **Local != Production** - Database changes need deployment plan
3. **Vitest is fast but not strict** - Use `tsc --noEmit` for type safety
4. **Test failures are warnings** - Fix them before they bite you in deployment
5. **Data is part of the deploy** - Plan for it like you plan for code

