# AI Agent Instructions for Project Archive

## Project Overview
Project Archive is a Laravel 12 + React/TypeScript portfolio showcase application that uses Inertia.js for seamless frontend-backend integration. It manages and displays development projects with admin capabilities.

## Key Architecture Patterns

### 1. Inertia.js Integration
- No API endpoints - data flows through Inertia props
- Controllers return `Inertia::render()` with page props
- Forms use `useForm()` hook from `@inertiajs/react`
Example in `app/Http/Controllers/Admin/ProjectController.php`:
```php
return Inertia::render('Admin/Projects/Create', ['project' => $project]);
```

### 2. Project URL Pattern
- Projects use SEO-friendly slugs instead of IDs
- URLs follow: `/projects/{slug}` and `/admin/projects/{slug}`
- Slugs auto-generate from titles unless manually edited
- See `resources/js/utils/validation.ts` for slug formatting

### 3. Authorization Flow
- `app/Http/Middleware/AdminOnly.php` enforces admin access
- User model has `is_admin` boolean flag
- Protected routes use middleware group: `['auth', AdminOnly::class]`

### 4. Validation Pattern
- Shared constants between frontend/backend
- Form Request classes handle validation rules
- Character limits and patterns in `constants/validation.ts`

## Common Development Tasks

### Setting Up Local Dev
1. `composer install`
2. `npm install`
3. Copy `.env.example` to `.env` and configure DB
4. `php artisan migrate --seed`
5. `npm run dev`

### Running Tests
- PHPUnit: `php artisan test`
- Frontend: `npm run test`
- Use `RefreshDatabase` trait in tests

### Creating New Projects
1. Create migration in `database/migrations/`
2. Add Eloquent model in `app/Models/`
3. Create form request in `app/Http/Requests/`
4. Add controller in `app/Http/Controllers/`
5. Create React page in `resources/js/Pages/`
6. Add routes in `routes/web.php`

## File Organization
- Backend logic: `app/Http/Controllers/Admin/`
- Frontend pages: `resources/js/Pages/`
- Components: `resources/js/Components/`
- Database: `database/migrations/`
- Tests: `tests/Feature/` and `tests/Unit/`

## Current Limitations
- No file upload capability yet
- No project categories/tags
- Single admin role (no role hierarchy)
- Basic project attributes only