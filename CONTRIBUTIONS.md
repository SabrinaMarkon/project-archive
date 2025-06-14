
# Conventional Commit Scopes – Laravel Project Archive Site

This file provides a reference list of recommended **commit scopes** to use with [Conventional Commits](https://www.conventionalcommits.org/) for this Laravel + Inertia + TDD project archive site.

---

## 🔧 Backend Scopes

| Scope     | Use when working on...                          |
|-----------|--------------------------------------------------|
| `projects`| Anything related to project CRUD logic           |
| `admin`   | Admin-only routes, middleware, permissions       |
| `routes`  | Route definitions or restructuring               |
| `auth`    | Login logic, user checks, middleware             |
| `tests`   | Test logic or test files                         |
| `db`      | Migrations, seeders, or schema changes           |

---

## 🎨 Frontend Scopes

| Scope     | Use when working on...                           |
|-----------|--------------------------------------------------|
| `ui`      | General frontend layout or styles                |
| `form`    | A specific form (like the project creation form) |
| `react`   | React component changes not tied to one feature  |
| `tsx`     | TypeScript-specific changes to Inertia pages     |

---

## 🛠️ Meta/Setup Scopes

| Scope     | Use when working on...                         |
|-----------|------------------------------------------------|
| `config`  | Config files, `.env`, Breeze, etc.             |
| `deps`    | Composer/npm packages                          |
| `chore`   | Cleanup, formatting, minor internal tweaks     |

---

## 📚 Documentation Scopes

| Scope         | Use when working on...                              |
|---------------|-----------------------------------------------------|
| `docs`        | Any markdown file, README, code comments, etc.      |
| `docs(readme)`| Specifically updating or improving the README       |

---

## ✅ Examples

```
feat(projects): add slug field to create form
test(admin): assert unauthorized user can't create project
refactor(form): extract Create form into reusable component
docs: add Conventional Commit scopes reference
docs(readme): update setup instructions
```

---

Use these scopes to keep the commit history readable, searchable, and professional.
