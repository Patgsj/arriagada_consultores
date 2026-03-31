# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static multi-page website for **Arriagada Consultores**, a real estate and consulting business in the Ñuble region of Chile. Built with vanilla HTML/CSS/JS + Tailwind CSS, with a PHP backend for contact forms.

## Development Commands

```bash
# Install dependencies
npm install

# Watch and recompile Tailwind CSS during development
npx tailwindcss -i src/input.css -o src/output.css --watch

# One-time production build
npx tailwindcss -i src/input.css -o src/output.css --minify

# Serve locally (requires separate terminal from CSS watch)
python -m http.server 8000
# or
npx http-server
```

> PHP contact form (`enviar.php`) requires a PHP-capable server to function locally.

## Architecture

### Component Loading

`navbar.html` and `footer.html` are reusable partials injected into every page via `fetch()` calls in `main.js`. All pages depend on this pattern — do not inline nav/footer content into individual pages.

### JavaScript (`src/main.js`)

Single JS file handles everything: component injection, mobile menu, scroll effects, Swiper carousel initialization (hero, properties, pricing, gallery), blog category filtering with fade animations, contact form submissions with success modals, and WhatsApp widget toggle.

### CSS (`src/input.css` → `src/output.css`)

`src/output.css` is the compiled output — **never edit it directly**. All CSS changes go into `src/input.css` or Tailwind utility classes in HTML. Custom overrides include Swiper pagination color (`#ea580c` orange) and smooth scroll.

### Contact Form Backend

`enviar.php` (root and `assets/enviar.php`) handles form submissions — sanitizes inputs and sends email to `info@arriagadaconsultores.cl`, returning JSON responses.

## Deployment

Pushing to `main` triggers automatic FTP deployment via GitHub Actions (`.github/workflows/main.yml`). Requires `FTP_SERVER`, `FTP_USERNAME`, and `FTP_PASSWORD` secrets configured in the GitHub repository.

## Design System

- Primary color: orange `#ea580c` (Tailwind `orange-600`)
- Font: Poppins (loaded via Tailwind config)
- All pages follow a mobile-first responsive layout
