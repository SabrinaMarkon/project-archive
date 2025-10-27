# Sabrina Markon · Project Archive - Architecture Guide

## Application Overview

**Sabrina Markon's Project Archive** is a content management and portfolio showcase application designed to display curated real-world development work across legacy systems, modern stacks, and various technology platforms. The archive allows Sabrina to share projects, insights, and interview-ready documentation about her development experience.

### Core Purpose
- Display portfolio projects to visitors (public `/projects` routes)
- Allow authenticated admins to create and manage projects (protected `/admin/projects` routes)
- Provide user authentication and role-based access control
- Enable project CRUD operations with validation and slug-based URLs

---

## High-Level Architecture

### Technology Stack

**Backend:**
- Laravel 12 - PHP web framework
- Laravel Inertia.js adapter - Server-side routing with client-side experience
- MySQL database (via Eloquent ORM)
- PHPUnit - Testing framework

**Frontend:**
- React 18 - UI component library
- TypeScript 5 - Type-safe JavaScript
- Inertia.js v2 - Props-based data sync between Laravel & React
- Tailwind CSS 3 - Utility-first CSS framework
- Vite 6 - Frontend build tool

**Testing:**
- PHPUnit (Feature/Unit tests)
- Vitest - JavaScript/TypeScript testing
- Laravel Testing utilities (RefreshDatabase, AssertableInertia)

---

## Architecture Patterns

### 1. **Inertia.js as the Bridge Layer**

This application uses **Inertia.js** to eliminate the traditional API boundary between backend and frontend:

```
Laravel Controller → Inertia::render() → React Component
        ↓
    Props passed directly to React (no JSON API)
        ↓
    Form submissions via Inertia helpers (useForm())
        ↓
    Server-side route handling with redirects
```

**Key Files:**
- Controllers return `Inertia::render('PageName', ['prop' => $value])`
- React pages import via `@inertiajs/react` helpers
- Frontend uses `useForm()` hook for form state and submission
- No separate API endpoints needed for CRUD operations

### 2. **Middleware-Based Authorization**

**Custom AdminOnly Middleware** (`app/Http/Middleware/AdminOnly.php`):
- Checks `auth::check()` AND `user->is_admin` flag
- Returns 403 Forbidden for unauthorized users
- Applied to protected admin routes via route groups

```php
Route::middleware(['auth', AdminOnly::class])->group(function () {
    // Admin routes
});
```

### 3. **Form Request Validation Pattern**

**StoreProjectRequest** handles both create and update scenarios:
- Dynamic unique validation (ignores own record on update)
- Validation rules loaded from JSON config for frontend/backend consistency
- Regex pattern for slug formatting: `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- Character limits for title, slug, and description

### 4. **Layout Composition Pattern**

Two distinct layouts for different contexts:

**AuthenticatedLayout** - Standard admin interface
- Top navigation bar with dropdown menu
- User info and logout options
- Responsive mobile navigation
- Used for profile/user management pages

**DashboardLayout** - Admin project management interface
- Sidebar navigation (dark theme)
- Quick links: Dashboard, Create Project, Project List, Logout
- Main content area with admin-specific features
- Applied via `Page.layout` assignment in React

### 5. **Slug-Based URL Pattern**

Projects are routed by unique slug (not ID):
- `/projects/{project:slug}` - Public project display
- `/admin/projects/{project:slug}` - Edit project form
- Slug generated from title (auto-formatted on frontend)
- Validated server-side with regex

---

## Domain Models & Database Schema

### User Model
```
Table: users
├── id (PK)
├── name
├── email (unique)
├── password (hashed)
├── is_admin (boolean, default: false)
├── email_verified_at (nullable)
├── remember_token
├── timestamps
```

**Eloquent Features:**
- Password auto-hashing via casts
- Authenticatable trait (built-in)
- Notifiable trait (for future email/notification features)
- Factory support for testing

### Project Model
```
Table: projects
├── id (PK)
├── title (string, max 255)
├── slug (string, unique, max 255)
├── description (text, nullable)
├── timestamps
```

**Eloquent Features:**
- HasFactory trait for test data generation
- Implicit route binding via slug on routes
- Fillable attributes: title, slug, description

**Relationships:**
- No explicit relationships defined yet (potential for future features)
- Could relate to User (project author/owner)
- Could relate to Tags, Categories, Technologies

---

## Route Structure

### Public Routes (No Authentication Required)
```
GET  /                           → Welcome page (Inertia::render('Welcome'))
GET  /projects                   → ProjectController@index
GET  /projects/{project:slug}    → ProjectController@show
```

### Authentication Routes (Built-in via auth.php)
```
GET  /login
POST /login
POST /logout
etc. (standard Laravel Breeze auth scaffolding)
```

### Protected Admin Routes (require auth + admin role)
```
GET  /dashboard                       → Dashboard page
GET  /admin                           → Admin page
GET  /admin/projects                  → AdminProjectController@index (list)
GET  /admin/projects/create           → Create form page
POST /admin/projects                  → AdminProjectController@store
GET  /admin/projects/{project:slug}   → Edit form (shows project in form)
PUT  /admin/projects/{project:slug}   → AdminProjectController@update
GET  /profile                         → ProfileController@edit
PATCH /profile                        → ProfileController@update
DELETE /profile                       → ProfileController@destroy
```

---

## Frontend Structure

### Directory Organization
```
resources/js/
├── Pages/
│   ├── Welcome.tsx                    (Public landing page)
│   ├── Dashboard.tsx                  (Admin dashboard)
│   ├── Profile/
│   │   ├── Edit.tsx                   (User profile edit)
│   │   └── Partials/
│   │       ├── UpdateProfileInformationForm.tsx
│   │       ├── UpdatePasswordForm.tsx
│   │       └── DeleteUserForm.tsx
│   ├── Projects/
│   │   ├── Index.tsx                  (Public project list)
│   │   └── Show.tsx                   (Public project detail)
│   └── Admin/Projects/
│       ├── Index.tsx                  (Admin project list)
│       └── Create.tsx                 (Admin create/edit form)
├── Layouts/
│   ├── GuestLayout.tsx                (For auth pages)
│   ├── AuthenticatedLayout.tsx        (Standard admin layout)
│   └── DashboardLayout.tsx            (Project management layout)
├── Components/
│   ├── ApplicationLogo.tsx
│   ├── TextInput.tsx                  (Form field component)
│   ├── InputLabel.tsx
│   ├── InputError.tsx
│   ├── CharacterCount.tsx             (Validation feedback)
│   ├── PrimaryButton.tsx
│   ├── DangerButton.tsx
│   ├── SecondaryButton.tsx
│   ├── Modal.tsx
│   ├── Dropdown.tsx                   (User menu)
│   ├── NavLink.tsx
│   ├── ResponsiveNavLink.tsx
│   └── Checkbox.tsx
├── types/
│   ├── project.ts                     (Project interface)
│   ├── global.d.ts
│   └── index.d.ts
├── constants/
│   └── validation.ts                  (Shared validation limits)
├── utils/
│   ├── validation.ts                  (formatSlug helper)
│   └── validation.test.ts             (Vitest tests)
└── bootstrap.ts                       (Vite entry point)
```

### Key Page Components

**Create.tsx** - Dual-purpose create/edit form:
- Detects edit mode if `project` prop passed
- Auto-generates slug from title (unless manually edited)
- Character count feedback for each field
- Form submission via `useForm()` hook
- PUT for updates, POST for creates
- Displays success flash messages after redirect

**Index.tsx (Admin)** - Project management:
- Uses DashboardLayout wrapper
- Lists all projects
- Click to navigate to edit form

**Index.tsx (Public)** - Project showcase:
- Simple list of projects
- Clickable links to detail pages
- No layout wrapper (guest view)

**Show.tsx** - Project detail display:
- Renders title and description
- Browser title set via `<Head>` component

---

## Validation & Form Handling

### Frontend Validation (constants/validation.ts)
```typescript
MAX_TITLE_LENGTH = 255
MAX_SLUG_LENGTH = 255
MAX_DESCRIPTION_LENGTH = 2000
```

Loaded from JSON config for frontend UI and character counting.

### Backend Validation (StoreProjectRequest.php)
```php
'title' => ['required', 'string', 'max:255', 'unique:projects,title,' . $projectId]
'slug' => ['required', 'string', 'max:255', 'unique:projects,slug,' . $projectId, 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/']
'description' => ['nullable', 'string', 'max:2000']
```

### Form Submission Flow
1. User fills form in React component
2. `useForm()` captures state changes
3. Submit handler determines POST vs PUT based on project ID
4. FormRequest validates on server
5. If valid: redirect to index with flash message
6. If invalid: redirect back with error bag (Inertia re-renders with errors)

---

## Key Features Implemented

### 1. **Public Project Archive**
- Browse all projects
- View individual project details
- No authentication required
- Simple, clean presentation

### 2. **Admin Project Management**
- Create new projects with form validation
- Edit existing projects
- Automatic slug generation from title
- Character count feedback during editing
- Success/error messages via flash session

### 3. **Authentication System**
- User registration and login
- Password reset functionality
- Profile editing
- Account deletion
- Logout

### 4. **Role-Based Access Control**
- `is_admin` boolean flag on users table
- AdminOnly middleware enforces access
- Non-admin users get 403 Forbidden
- Guests redirected to login

### 5. **Form Validation**
- Shared validation constants (frontend & backend)
- Frontend slug formatting and character counting
- Server-side validation with unique constraints
- Error messages displayed inline on forms

---

## Testing Structure

### Test Organization
```
tests/
├── Feature/
│   ├── Auth/
│   │   ├── AuthenticationTest.php
│   │   └── PasswordUpdateTest.php
│   ├── Admin/
│   │   ├── AdminAccessTest.php         (Authorization tests)
│   │   └── AdminProjectsTest.php       (CRUD tests)
│   ├── PublicProjectsTest.php          (Visitor tests)
│   ├── ProfileTest.php
│   └── DisabledAuthRoutesTest.php
├── Unit/
│   └── ValidationConstantsTest.php     (Constants sync)
└── TestCase.php                        (Base test class)
```

### Testing Patterns

**RefreshDatabase Trait:**
- Resets database between tests
- Uses transactions for speed
- Ensures test isolation

**Feature Tests with Inertia:**
```php
$response->assertInertia(
    fn(AssertableInertia $page) =>
    $page
        ->component('Admin/Projects/Create')
        ->has('auth')
        ->where('auth.user.id', $admin->id)
);
```

**Admin Access Tests:**
- Guest users redirected to login
- Non-admin users get 403 Forbidden
- Admin users can access protected routes

**Project CRUD Tests:**
- Create: form submission, database assertion, flash message
- Read: list display, detail display
- Update: form pre-population, unique validation with ignore
- Delete: (not yet implemented)

**Validation Tests:**
- Title/slug/description length limits
- Unique constraints (title and slug)
- Slug format regex validation
- Optional description field

### Test Utilities
- **UserFactory** - Create test users with admin flag
- **ProjectFactory** - Create test projects
- **actingAs()** - Authenticate user for request
- **assertSessionHas()** - Check flash messages
- **assertDatabaseHas()** - Verify database state

---

## Notable Architectural Decisions

### 1. **Slug-Based Routing Instead of ID**
- URLs are SEO-friendly and human-readable
- `/projects/pearls-of-wealth` vs `/projects/1`
- Requires unique slug constraint
- Implicit route binding via `{project:slug}`

### 2. **Shared Validation Constants**
- Single source of truth for character limits
- Loaded from `validation.json` in both PHP and TypeScript
- Ensures frontend preview matches backend rules

### 3. **Dual-Mode Create/Edit Form**
- Single React component handles both create and edit
- Detects mode by checking if `project` prop is null
- Uses form state to determine POST vs PUT
- Reduces component duplication

### 4. **Form Request Validation for Authorization**
- StoreProjectRequest handles validation only
- Authorization (admin check) done by middleware
- Separation of concerns: auth != validation

### 5. **No Explicit API Routes**
- All data passed via Inertia props
- No JSON API endpoints
- Reduces frontend/backend coupling
- Less boilerplate for simple CRUD

### 6. **Flash Messages for User Feedback**
- Server-side session flash for success/error
- Redirects after POST/PUT/DELETE
- Inertia re-renders with flash data
- Clean user experience without API polling

---

## Frontend-Backend Data Flow (Inertia Pattern)

### Initial Page Load
```
1. User navigates to /admin/projects/create
2. Laravel route handler calls Inertia::render('Admin/Projects/Create', ['project' => null])
3. Laravel serializes props to JSON
4. React mounts with props available immediately
5. Page component receives { project: null } as props
```

### Form Submission
```
1. User fills form in Create.tsx component
2. Click submit → useForm().post('/admin/projects')
3. Inertia sends multipart request to server
4. Laravel FormRequest validates
5. If valid: Create model, redirect with flash
6. Inertia intercepts redirect, sends GET to redirect target
7. React component re-renders with new props
8. Flash message displayed to user
```

### Edit Operation
```
1. Admin clicks edit link: /admin/projects/{slug}
2. Route loads project by slug: Route::get(..., function(Project $project) { ... })
3. Inertia::render('Admin/Projects/Create', ['project' => $project])
4. React component detects project prop is not null
5. Form pre-populated with existing data
6. Submit handler sends PUT request instead of POST
7. Server validates and updates model
8. Redirect and re-render
```

---

## Configuration & Setup

### Environment
- `.env` file contains database and application settings
- Database: MySQL (configured in `config/database.php`)
- Session driver: standard Laravel session (cookies)

### Build Tools
- **Vite** for frontend bundling (dev server and production build)
- **Laravel Vite Plugin** for asset manifest generation
- **Tailwind CSS** with Vite plugin for CSS preprocessing
- **PostCSS** with Tailwind and Autoprefixer

### Frontend Entry Point
- `resources/js/bootstrap.ts` - Initializes Inertia React app
- `resources/views/app.blade.php` - HTML shell for React mounting

### Middleware Stack
- `AuthenticatedLayout` - Navigation + auth context
- `DashboardLayout` - Admin sidebar navigation
- Custom `AdminOnly` - Authorization enforcement

---

## Unique Patterns & Conventions

### 1. **Page.layout Assignment Pattern**
```typescript
Create.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
```
Pages can specify their layout wrapper without render prop drilling.

### 2. **Inertia Type-Safe Props**
Pages typed with specific prop interfaces:
```typescript
export default function Create({ project }: { project: Project | null })
```

### 3. **Slug Formatting Utility**
Consistent slug generation across frontend:
```typescript
export const formatSlug = (value: string): string => {
    return value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
};
```

### 4. **Auto-Regenerating Slug UI**
- Title changes auto-update slug (unless manually edited)
- Manual slug editing sets flag to prevent auto-generation
- "Regenerate" button restores auto-generation mode
- Character count feedback prevents over-limit errors

### 5. **Form Error Display Pattern**
```typescript
{errors.title && <div className="text-red-600">{errors.title}</div>}
```
Inertia provides typed error bag with field validation messages.

---

## File Size & Complexity Notes

- **Models**: Minimal (User, Project) - single table entities
- **Controllers**: Small and focused (3-4 methods each)
- **Routes**: Single file (web.php) - manageable due to small app size
- **Components**: Mostly reusable form inputs and layout wrappers
- **Pages**: Medium complexity (Create.tsx most complex due to dual-mode)

---

## Future Enhancement Opportunities

1. **Project Relationships**: Author/owner relationship to User model
2. **Tags/Categories**: Categorize projects by technology or domain
3. **Search/Filter**: Filter projects by tag or technology
4. **Comments/Ratings**: Visitor feedback on projects
5. **API Endpoints**: RESTful API for external integrations
6. **File Attachments**: Upload project documents, images, code files
7. **Project Versions**: Track multiple versions of project data
8. **Activity Logging**: Audit trail of project changes
9. **Email Notifications**: Alert admin of new project data
10. **Dark Mode**: Tailwind dark mode toggle

---

## Summary for Claude Instances

This is a **Laravel + Inertia.js + React** portfolio archive application with:
- **Minimal domain models** (User with is_admin flag, Project with slug)
- **Middleware-based authorization** (AdminOnly custom middleware)
- **Form-driven CRUD** (StoreProjectRequest for validation)
- **Inertia.js for seamless frontend-backend integration** (no API endpoints)
- **Comprehensive feature tests** (RefreshDatabase, Inertia assertions)
- **Shared validation constants** (frontend UI + backend validation)
- **Slug-based SEO-friendly URLs** for projects
- **Responsive Tailwind layouts** with auth and dashboard variants

The codebase demonstrates **clean separation of concerns**, **type safety** (TypeScript), and **comprehensive test coverage** for a production-ready portfolio showcase application.

**Key Files to Understand the Architecture:**
- `routes/web.php` - Route definitions and middleware
- `app/Http/Controllers/Admin/ProjectController.php` - CRUD logic
- `resources/js/Pages/Admin/Projects/Create.tsx` - Main form component
- `app/Http/Requests/StoreProjectRequest.php` - Validation rules
- `tests/Feature/Admin/AdminProjectsTest.php` - Test patterns
