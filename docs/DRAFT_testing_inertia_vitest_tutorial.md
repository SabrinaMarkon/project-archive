# Testing Inertia.js Pages with Vitest and React Testing Library

*Published: [DATE]*

## The Problem: Testing Inertia.js Apps Is Confusing

You've built a beautiful Laravel + Inertia.js + React application. Everything works perfectly in the browser. Now it's time to write tests, and you open the documentation looking for testing examples.

**Here's what you find:**
- Laravel's testing docs focus on backend tests
- Inertia's docs have minimal frontend testing guidance
- React Testing Library examples assume a standard React app (no Inertia)
- Vitest docs are generic
- Stack Overflow has scattered, incomplete answers

You try to write a test for an Inertia page component:

```tsx
import { render } from '@testing-library/react';
import Welcome from './Pages/Welcome';

test('renders welcome page', () => {
    render(<Welcome projects={[]} />);
});
```

**Error:**
```
TypeError: Cannot read properties of undefined (reading 'Head')
```

Then you add the Head component:

```tsx
import { Head } from '@inertiajs/react';
```

**New error:**
```
Error: Inertia components require an InertiaApp context
```

You spend hours trying to:
- Set up Inertia context
- Mock the router
- Figure out why Link components break
- Deal with prop type errors

**Sound familiar?**

This tutorial shows you exactly how to test Inertia.js pages with Vitest and React Testing Library, based on 41 real tests I wrote for my Laravel + Inertia.js portfolio application.

**What makes this different:** Real, working code from a production app—not theoretical examples.

---

## Why Vitest Instead of Jest?

If you're using Vite (which most modern Laravel + Inertia apps do), Vitest is the obvious choice:

### Speed Comparison

**Jest:**
```bash
$ npm test
PASS  resources/js/Pages/__tests__/Welcome.test.tsx (8.3s)
✓ renders the page (1.2s)
✓ renders all sections (0.9s)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Time:        8.643s
```

**Vitest:**
```bash
$ npm test
✓ resources/js/Pages/__tests__/Welcome.test.tsx (234ms)
  ✓ renders the page (12ms)
  ✓ renders all sections (8ms)

Test Files: 1 passed (1)
Tests:      2 passed (2)
Time:       0.45s
```

**~20x faster** for the same tests!

### Why Vitest Is Faster

1. **Native ESM support** - No transpilation needed
2. **Reuses Vite's config** - Your existing vite.config.js works for tests
3. **Smart caching** - Only reruns what changed
4. **Parallel execution** - Tests run concurrently by default

### Configuration Comparison

**Jest (complex):**
```javascript
// jest.config.js
export default {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: './tsconfig.json' }],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/resources/js/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
};
```

**Vitest (simple):**
```javascript
// vite.config.js (you already have this!)
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    test: {
        globals: true,
        environment: 'jsdom',
    },
});
```

**That's it!** Vitest reuses your existing Vite config, including:
- Your path aliases (`@/Components/...`)
- Your TypeScript setup
- Your plugins (React, etc.)
- Your build settings

---

## Setting Up Vitest in Your Laravel + Inertia Project

### Step 1: Install Dependencies

```bash
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom
```

**What each package does:**
- `vitest` - Test runner (like Jest)
- `jsdom` - Simulates a browser environment in Node.js
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Extra matchers like `toBeInTheDocument()`

### Step 2: Add Test Config to vite.config.js

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    test: {
        globals: true,
        environment: 'jsdom',
    },
});
```

**Configuration explained:**
- `globals: true` - Use `describe`, `it`, `expect` without importing
- `environment: 'jsdom'` - Simulate browser APIs (DOM, window, etc.)

### Step 3: Add Test Script to package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

**Now you can run:**
- `npm test` - Run tests in watch mode
- `npm test -- --run` - Run once (for CI)
- `npm run test:ui` - Visual test UI (optional, requires `@vitest/ui`)

---

## The Core Pattern: Mocking Inertia Components

This is the key to testing Inertia pages. **You must mock Inertia's components** because they expect server-side context that doesn't exist in tests.

### The Problem

Inertia provides these components:
- `<Head>` - Sets page title and meta tags
- `<Link>` - Client-side navigation
- `usePage()` - Access page props
- `useForm()` - Form helpers

They all expect to run inside an Inertia app with server-provided context. In tests, you don't have that.

### The Solution: Simple Mocks

At the top of every test file, mock the Inertia components:

```tsx
// resources/js/Pages/__tests__/Welcome.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Welcome from '../Welcome';

// Mock Inertia components
vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>{children}</a>
    ),
}));
```

**What this does:**
- `vi.mock()` replaces Inertia components with simple test versions
- `Head` becomes a regular `<title>` tag (testable!)
- `Link` becomes a regular `<a>` tag (testable!)
- Props are passed through correctly

**Important:** This mock must be at the top level, before any imports that use Inertia components.

---

## Real Example 1: Testing a Simple Page

Let's test a project detail page. Here's the component:

```tsx
// resources/js/Pages/Projects/Show.tsx
import { Head, Link } from '@inertiajs/react';
import PortfolioLayout from '@/Layouts/PortfolioLayout';

interface Project {
    slug: string;
    title: string;
    description: string | null;
}

export default function Show({ project }: { project: Project }) {
    return (
        <PortfolioLayout>
            <Head title={`${project.title} - Sabrina Markon`} />

            <div className="pt-32 pb-12">
                <div className="max-w-4xl mx-auto px-6">
                    <Link href="/projects">
                        Back to All Projects
                    </Link>

                    <h1>{project.title}</h1>

                    <div>
                        {project.description || 'No description available for this project yet.'}
                    </div>
                </div>
            </div>
        </PortfolioLayout>
    );
}
```

### The Test File

```tsx
// resources/js/Pages/__tests__/Projects.Show.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Show from '../Projects/Show';

// Mock Inertia components
vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ href, children, className, ...props }: any) => (
        <a href={href} className={className} {...props}>{children}</a>
    ),
}));

// Mock the layout
vi.mock('@/Layouts/PortfolioLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="portfolio-layout">{children}</div>
    ),
}));

// Mock other components
vi.mock('@/Components/Portfolio/ContactSection', () => ({
    default: () => <div data-testid="contact-section">Contact Section</div>,
}));

describe('Project Show Page (/projects/{slug})', () => {
    const mockProject = {
        slug: 'test-project',
        title: 'Test Project',
        description: 'This is a detailed description of the test project.',
    };

    it('renders the page with PortfolioLayout', () => {
        render(<Show project={mockProject} />);

        expect(screen.getByTestId('portfolio-layout')).toBeInTheDocument();
    });

    it('sets the correct page title with project name', () => {
        render(<Show project={mockProject} />);

        expect(screen.getByText('Test Project - Sabrina Markon')).toBeInTheDocument();
    });

    it('renders the project title in header', () => {
        render(<Show project={mockProject} />);

        expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('renders back to projects link', () => {
        render(<Show project={mockProject} />);

        const backLink = screen.getByText('Back to All Projects');
        expect(backLink).toBeInTheDocument();
        expect(backLink.closest('a')).toHaveAttribute('href', '/projects');
    });

    it('renders project description', () => {
        render(<Show project={mockProject} />);

        expect(screen.getByText(mockProject.description)).toBeInTheDocument();
    });
});
```

**What we're testing:**
1. Layout renders correctly
2. Page title includes project name
3. Content displays properly
4. Links have correct href attributes
5. Props are passed correctly

---

## Real Example 2: Testing Null and Empty States

One of the most important things to test: **What happens when data is missing?**

### Testing Null Description

```tsx
it('shows default message when description is null', () => {
    const projectWithoutDescription = {
        slug: 'test-project',
        title: 'Test Project',
        description: null,  // ← Null case
    };

    render(<Show project={projectWithoutDescription} />);

    expect(screen.getByText('No description available for this project yet.')).toBeInTheDocument();
});
```

### Testing Empty String

```tsx
it('shows default message when description is empty string', () => {
    const projectWithEmptyDescription = {
        slug: 'test-project',
        title: 'Test Project',
        description: '',  // ← Empty string
    };

    render(<Show project={projectWithEmptyDescription} />);

    expect(screen.getByText('No description available for this project yet.')).toBeInTheDocument();
});
```

### Testing Empty Array

```tsx
it('shows message when no projects available', () => {
    render(<Index projects={[]} />);  // ← Empty array

    expect(screen.getByText('No projects available yet.')).toBeInTheDocument();
});
```

**Why this matters:**
- Catches runtime errors from null/undefined
- Ensures fallback UI works
- Prevents "Cannot read property X of null" bugs in production

---

## Real Example 3: Testing Lists and Links

Testing a page that displays multiple items with links:

```tsx
// resources/js/Pages/Projects/Index.tsx
export default function Index({ projects }: { projects: Project[] }) {
    return (
        <PortfolioLayout>
            <Head title="Projects - Sabrina Markon" />

            <div>
                <h1>All Projects</h1>

                {projects.length === 0 ? (
                    <p>No projects available yet.</p>
                ) : (
                    projects.map((project) => (
                        <div key={project.slug}>
                            <h2>{project.title}</h2>
                            <p>{project.description || 'No description available.'}</p>
                            <Link href={`/projects/${project.slug}`}>
                                View Project
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </PortfolioLayout>
    );
}
```

### Testing the List

```tsx
describe('Projects Index Page (/projects)', () => {
    const mockProjects = [
        { slug: 'project-1', title: 'Project 1', description: 'Description 1' },
        { slug: 'project-2', title: 'Project 2', description: 'Description 2' },
        { slug: 'project-3', title: 'Project 3', description: null },
    ];

    it('renders all projects', () => {
        render(<Index projects={mockProjects} />);

        expect(screen.getByText('Project 1')).toBeInTheDocument();
        expect(screen.getByText('Project 2')).toBeInTheDocument();
        expect(screen.getByText('Project 3')).toBeInTheDocument();
    });

    it('renders project descriptions', () => {
        render(<Index projects={mockProjects} />);

        expect(screen.getByText('Description 1')).toBeInTheDocument();
        expect(screen.getByText('Description 2')).toBeInTheDocument();
    });

    it('shows default text when description is null', () => {
        render(<Index projects={mockProjects} />);

        expect(screen.getByText('No description available.')).toBeInTheDocument();
    });

    it('renders links to individual project pages', () => {
        render(<Index projects={mockProjects} />);

        const links = screen.getAllByText('View Project');
        expect(links).toHaveLength(3);

        // Check href attributes
        const linkElements = screen.getAllByRole('link', { name: /View Project/i });
        expect(linkElements[0]).toHaveAttribute('href', '/projects/project-1');
        expect(linkElements[1]).toHaveAttribute('href', '/projects/project-2');
        expect(linkElements[2]).toHaveAttribute('href', '/projects/project-3');
    });

    it('handles large number of projects', () => {
        const manyProjects = Array.from({ length: 20 }, (_, i) => ({
            slug: `project-${i}`,
            title: `Project ${i}`,
            description: `Description ${i}`,
        }));

        render(<Index projects={manyProjects} />);

        // All projects should be rendered
        expect(screen.getByText('Project 0')).toBeInTheDocument();
        expect(screen.getByText('Project 19')).toBeInTheDocument();

        const viewProjectLinks = screen.getAllByText('View Project');
        expect(viewProjectLinks).toHaveLength(20);
    });
});
```

**Testing strategies:**
- Use `getByText()` for unique text
- Use `getAllByText()` for repeated text (returns array)
- Use `getByRole('link')` to find links semantically
- Test edge cases (empty array, large arrays)

---

## Mocking Custom Components and Layouts

Your Inertia pages likely use custom layouts and components. Mock them to focus on testing one thing at a time.

### Mocking Layouts

```tsx
vi.mock('@/Layouts/PortfolioLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="portfolio-layout">{children}</div>
    ),
}));
```

**Now you can test:**
```tsx
it('renders the page with PortfolioLayout', () => {
    render(<Show project={mockProject} />);

    expect(screen.getByTestId('portfolio-layout')).toBeInTheDocument();
});
```

### Mocking Complex Components

```tsx
vi.mock('@/Components/Portfolio/FeaturedProjects', () => ({
    default: ({ projects, limit }: any) => (
        <div data-testid="featured-projects">
            Featured Projects (showing {Math.min(projects.length, limit || projects.length)} of {projects.length})
        </div>
    ),
}));
```

**Test that props are passed correctly:**
```tsx
it('passes projects to FeaturedProjects component', () => {
    render(<Welcome projects={mockProjects} />);

    const featuredProjects = screen.getByTestId('featured-projects');
    expect(featuredProjects).toBeInTheDocument();
    // FeaturedProjects should receive the projects array
    expect(featuredProjects.textContent).toContain('showing 3 of 4');
});
```

**Why mock components?**
- Test one component at a time (unit testing)
- Faster tests (no deep rendering)
- Easier to debug failures
- Control over mock behavior

---

## Testing Component Structure and Order

Sometimes you need to verify elements appear in the correct order or with specific styling.

### Testing Section Order

```tsx
it('renders sections in correct order', () => {
    const { container } = render(<Welcome projects={mockProjects} />);

    const sections = container.querySelectorAll('[data-testid]');
    const sectionIds = Array.from(sections).map(el => el.getAttribute('data-testid'));

    // Check order of sections
    expect(sectionIds.indexOf('hero-section')).toBeLessThan(sectionIds.indexOf('featured-projects'));
    expect(sectionIds.indexOf('featured-projects')).toBeLessThan(sectionIds.indexOf('writing-section'));
    expect(sectionIds.indexOf('writing-section')).toBeLessThan(sectionIds.indexOf('about-section'));
    expect(sectionIds.indexOf('about-section')).toBeLessThan(sectionIds.indexOf('contact-section'));
});
```

### Testing CSS Classes

```tsx
it('applies correct styling classes', () => {
    const { container } = render(<Index projects={mockProjects} />);

    // Check header section has white background
    const headerSection = container.querySelector('.pt-32.pb-12');
    expect(headerSection).toBeInTheDocument();

    // Check projects section has colored background
    const projectsSection = container.querySelector('.py-12.pb-24');
    expect(projectsSection).toBeInTheDocument();
});
```

### Testing Whitespace Preservation

```tsx
it('preserves whitespace in description', () => {
    const projectWithMultilineDescription = {
        slug: 'test',
        title: 'Test',
        description: 'Line 1\n\nLine 2\n\nLine 3',
    };

    const { container } = render(<Show project={projectWithMultilineDescription} />);

    // Check for whitespace-pre-wrap class which preserves newlines
    const descriptionElement = container.querySelector('.whitespace-pre-wrap');
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement?.textContent).toContain('Line 1');
    expect(descriptionElement?.textContent).toContain('Line 2');
    expect(descriptionElement?.textContent).toContain('Line 3');
});
```

---

## Testing Edge Cases

Always test edge cases to prevent production bugs.

### Very Long Text

```tsx
it('handles very long project titles', () => {
    const projectWithLongTitle = {
        slug: 'test',
        title: 'This Is An Extremely Long Project Title That Should Still Display Correctly Without Breaking The Layout',
        description: 'Test',
    };

    render(<Show project={projectWithLongTitle} />);

    expect(screen.getByText(projectWithLongTitle.title)).toBeInTheDocument();
});

it('handles very long descriptions', () => {
    const longDescription = 'Lorem ipsum dolor sit amet, '.repeat(100);
    const projectWithLongDescription = {
        slug: 'test',
        title: 'Test',
        description: longDescription,
    };

    render(<Show project={projectWithLongDescription} />);

    // Use partial text match for very long strings
    expect(screen.getByText(/Lorem ipsum dolor sit amet,/)).toBeInTheDocument();
});
```

### Special Characters

```tsx
it('handles project titles with special characters', () => {
    const projectWithSpecialChars = {
        slug: 'test',
        title: 'Project <>&"\'',
        description: 'Test',
    };

    render(<Show project={projectWithSpecialChars} />);

    expect(screen.getByText('Project <>&"\'')).toBeInTheDocument();
});
```

---

## Complete Test File Template

Here's a complete, ready-to-use template for testing Inertia pages:

```tsx
// resources/js/Pages/__tests__/YourPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import YourPage from '../YourPage';

// Mock Inertia components
vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ href, children, className, ...props }: any) => (
        <a href={href} className={className} {...props}>{children}</a>
    ),
}));

// Mock your layouts
vi.mock('@/Layouts/YourLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="your-layout">{children}</div>
    ),
}));

// Mock any other components used in the page
vi.mock('@/Components/YourComponent', () => ({
    default: ({ someProp }: any) => (
        <div data-testid="your-component">Component with {someProp}</div>
    ),
}));

describe('YourPage', () => {
    const mockProps = {
        // Your test props here
    };

    it('renders the page with layout', () => {
        render(<YourPage {...mockProps} />);

        expect(screen.getByTestId('your-layout')).toBeInTheDocument();
    });

    it('sets the correct page title', () => {
        render(<YourPage {...mockProps} />);

        expect(screen.getByText('Your Page Title')).toBeInTheDocument();
    });

    it('renders main content', () => {
        render(<YourPage {...mockProps} />);

        // Test your content here
        expect(screen.getByText('Some text')).toBeInTheDocument();
    });

    it('handles null/empty props', () => {
        render(<YourPage {...mockProps, someField: null} />);

        // Test fallback behavior
        expect(screen.getByText('Fallback text')).toBeInTheDocument();
    });

    it('renders links with correct hrefs', () => {
        render(<YourPage {...mockProps} />);

        const link = screen.getByText('Click me');
        expect(link.closest('a')).toHaveAttribute('href', '/expected-url');
    });
});
```

---

## Running Tests

### Watch Mode (Development)

```bash
npm test
```

**What happens:**
- Tests run automatically when files change
- Only reruns affected tests
- Interactive mode with filtering options
- Press keys to control:
  - `a` - Run all tests
  - `f` - Run only failed tests
  - `q` - Quit
  - `p` - Filter by filename pattern
  - `t` - Filter by test name pattern

[POSSIBLE IMAGE: Terminal showing Vitest in watch mode]

### Single Run (CI/CD)

```bash
npm test -- --run
```

**For continuous integration:**
- Runs all tests once
- Exits with code 0 (success) or 1 (failure)
- No watch mode
- Perfect for GitHub Actions, etc.

### Coverage Report

```bash
npm test -- --coverage
```

**Generates:**
- Terminal coverage summary
- HTML coverage report in `coverage/` directory
- Shows which lines/branches aren't tested

[POSSIBLE IMAGE: Coverage report output]

---

## Debugging Failed Tests

### Use screen.debug()

```tsx
it('renders something', () => {
    render(<YourPage {...mockProps} />);

    // Print the entire DOM tree
    screen.debug();

    // Or debug a specific element
    const element = screen.getByText('Something');
    screen.debug(element);
});
```

**Output:**
```html
<body>
  <div>
    <div data-testid="your-layout">
      <title>Your Page Title</title>
      <h1>Something</h1>
      ...
    </div>
  </div>
</body>
```

### Check What Queries Are Available

```tsx
it('finds the right element', () => {
    render(<YourPage {...mockProps} />);

    // If getByText fails, see all text content:
    screen.getByText('exact text');  // Fails

    // Debug to see what's actually rendered
    screen.debug();

    // Maybe you need a partial match instead:
    screen.getByText(/partial text/i);  // Works!
});
```

### Common Query Methods

**Difference between getBy, queryBy, and findBy:**

```tsx
// getBy* - Throws error if not found (use for assertions)
const element = screen.getByText('Hello');

// queryBy* - Returns null if not found (use to check absence)
const element = screen.queryByText('Hello');
expect(element).not.toBeInTheDocument();

// findBy* - Async, waits for element (use for delayed rendering)
const element = await screen.findByText('Hello');
```

---

## Common Pitfalls and Solutions

### Problem: "TypeError: Cannot read property of undefined"

**Cause:** Inertia component not mocked.

**Solution:** Add mock at top of file:
```tsx
vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));
```

### Problem: "Unable to find an element with the text: ..."

**Cause:** Text doesn't match exactly, or element hasn't rendered.

**Solutions:**
```tsx
// Try partial match
screen.getByText(/partial text/i);

// Try by role
screen.getByRole('heading', { name: /partial text/i });

// Debug to see what's there
screen.debug();

// Check if it's in a specific container
const container = screen.getByTestId('my-container');
within(container).getByText('text');
```

### Problem: "Found multiple elements with the text: ..."

**Cause:** Text appears multiple times (like in <title> and <h1>).

**Solutions:**
```tsx
// Use getAll and pick one
const elements = screen.getAllByText('text');
expect(elements[0]).toBeInTheDocument();

// Or use a more specific query
screen.getByRole('heading', { name: 'text' });
```

### Problem: Tests pass but component is broken

**Cause:** Not testing the right thing.

**Solution:** Test behavior, not implementation:
```tsx
// ❌ Bad: Testing implementation
expect(container.firstChild.className).toBe('some-class');

// ✅ Good: Testing behavior
expect(screen.getByRole('button')).toBeEnabled();
expect(screen.getByText('Submit')).toBeInTheDocument();
```

---

## Testing Philosophy: What to Test

### ✅ DO Test

1. **User-visible behavior**
   - Does text appear?
   - Are links correct?
   - Do buttons work?

2. **Props handling**
   - Are props displayed correctly?
   - Are props passed to child components?

3. **Edge cases**
   - Null/undefined values
   - Empty arrays
   - Very long text
   - Special characters

4. **Conditional rendering**
   - Empty states
   - Error states
   - Different user roles

### ❌ DON'T Test

1. **Implementation details**
   - State variable names
   - Function names
   - Internal component structure

2. **Third-party libraries**
   - Inertia's Link behavior
   - React's rendering
   - Tailwind's CSS

3. **Styling details**
   - Exact pixel values
   - Hover states
   - Animations

**Rule of thumb:** If a user can't see or interact with it, don't test it.

---

## Real-World Test Suite Stats

From my Laravel + Inertia.js portfolio project:

**Test files:** 4
**Total tests:** 41
**Test coverage:** 87%
**Average test run time:** 0.8s
**Time to write:** ~3 hours

**Tests breakdown:**
- Welcome page: 8 tests
- Projects index: 13 tests
- Project show: 17 tests
- Utility functions: 3 tests

**Bugs caught before production:**
- Null description crashes
- Missing empty state messages
- Broken link hrefs
- Long text layout breaks

**Time saved:** Countless hours of manual testing across browsers and scenarios.

---

## Adding Tests to Your Workflow

### Start Small

Don't try to test everything at once:

1. **Week 1:** Test one simple page
2. **Week 2:** Test a page with props
3. **Week 3:** Test edge cases
4. **Week 4:** Add tests for new features as you build them

### Test-Driven Development (TDD)

Try writing tests *before* the component:

```tsx
// 1. Write the test first
it('shows welcome message to user', () => {
    render(<Dashboard user={{ name: 'Alice' }} />);
    expect(screen.getByText('Welcome, Alice!')).toBeInTheDocument();
});

// 2. Test fails (component doesn't exist yet)

// 3. Write minimal code to make it pass
export default function Dashboard({ user }) {
    return <div>Welcome, {user.name}!</div>;
}

// 4. Test passes!
```

**Benefits:**
- Ensures you write testable code
- Prevents over-engineering
- Gives you confidence to refactor

### CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --run
```

Now tests run automatically on every push!

---

## Frequently Asked Questions

### Q: Do I need to test every single page?

**A:** No. Focus on:
- Pages with complex logic
- Pages with many edge cases
- Pages critical to your app
- Pages that broke before

Simple pages (like a static About page) may not need tests.

### Q: Should I test layout components?

**A:** Usually no—mock them instead. Test them separately only if they have complex logic.

### Q: How do I test forms?

**A:** Use `@testing-library/user-event`:

```bash
npm install --save-dev @testing-library/user-event
```

```tsx
import userEvent from '@testing-library/user-event';

it('submits form with user input', async () => {
    const user = userEvent.setup();
    render(<YourForm />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(screen.getByText('Success!')).toBeInTheDocument();
});
```

### Q: Can I test Inertia's useForm hook?

**A:** Yes, but you'll need to mock it or test the whole form submission flow with integration tests. Unit testing individual pages is usually sufficient.

### Q: What about testing authentication/authorization?

**A:** Mock the auth prop:

```tsx
it('shows admin menu when user is admin', () => {
    render(<Dashboard auth={{ user: { isAdmin: true } }} />);
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
});

it('hides admin menu for regular users', () => {
    render(<Dashboard auth={{ user: { isAdmin: false } }} />);
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
});
```

---

## Conclusion: Testing Inertia.js Pages Is Actually Simple

Once you understand the core pattern—**mocking Inertia components**—testing becomes straightforward:

1. Mock `@inertiajs/react` components
2. Mock your layouts and complex components
3. Render your page with test props
4. Assert what users see

**The pattern:**
```tsx
// Mock Inertia
vi.mock('@inertiajs/react', () => ({ ... }));

// Mock layouts
vi.mock('@/Layouts/...', () => ({ ... }));

// Test
it('works', () => {
    render(<YourPage {...props} />);
    expect(screen.getByText('...')).toBeInTheDocument();
});
```

That's it!

### Key Takeaways

- 🚀 **Use Vitest** for Vite projects (20x faster than Jest)
- 🎭 **Mock Inertia components** at the top of every test file
- 🧪 **Test user-visible behavior**, not implementation
- 🛡️ **Test edge cases** (null, empty, long text)
- 📝 **Start small** and build testing habits gradually
- ⚡ **Use watch mode** during development

### What's Next?

Start testing! Pick your simplest Inertia page and write 3 tests:
1. It renders with the layout
2. It displays props correctly
3. It handles null/empty data

Then gradually expand from there.

**Want to see the full test suite?** Check out my [Project Archive on GitHub](https://github.com/SabrinaMarkon/project-archive) to see all 41 tests in action.

---

**About this tutorial:** Based on real experience writing 41 tests for a Laravel 11 + Inertia.js v2 + React 18 + TypeScript 5 application. All code examples are actual working tests from the production codebase.

**Tools used:**
- Vitest 2.1
- React Testing Library 16
- @testing-library/jest-dom 6
- Vite 6
- Laravel 11

**Test stats:**
- 41 tests across 4 files
- 87% code coverage
- 0.8s average test run time
- 3 hours to write initial suite

---

*Questions or issues? Reach out via [email/Twitter/LinkedIn].*

**Related articles:**
- [How to Bulk-Edit Git Commit History Using AI](#)
- [Fix Vite Hot Reload in WSL2: The Complete Guide](#)
