# Project Archive

A portfolio and content platform for showcasing development work and selling technical courses. The application includes a public-facing site for visitors and an admin panel for content management.

## Overview

The platform serves three main purposes: displaying a portfolio of development projects with detailed case studies, hosting technical blog posts, and selling educational courses through Stripe and PayPal. Visitors can browse content freely. Authenticated admins manage everything through a dashboard interface.

## Architecture

The application is built with Laravel 12 and React 18, connected through Inertia.js. The architecture eliminates the need for a separate API layer while maintaining a modern SPA experience. The backend handles authentication, authorization, payment processing, and content management. The frontend provides the user interface and form handling.

All content uses slug-based URLs instead of numeric IDs for better SEO. Projects and posts render markdown. Courses integrate with payment gateways that can be configured independently based on admin preferences.

## Technical Stack

The application runs on Laravel 12, MySQL, React 18, TypeScript, Tailwind CSS, and Vite. Payment processing is handled through Stripe and PayPal. The codebase includes both backend (PHPUnit) and frontend (Vitest) test coverage.

## Setup

The setup follows standard Laravel installation procedures. The `.env.example` file should be copied to `.env`, application keys generated, and migrations and seeders run. Frontend dependencies can be installed with npm before starting the development server.

Admin access requires the `is_admin` flag on the user record, which must be set manually in the database after registration.
