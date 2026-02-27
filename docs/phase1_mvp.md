# aibro-blog: Minimum Complete Product

The smallest thing we can ship that is a real blog on the real internet.

---

## What "Done" Looks Like

A single-page blog at a custom domain that:

1. Has at least one real post
2. Loads in under 50KB
3. Looks good on phone and desktop
4. Has dark mode (automatic, via CSS)
5. Is live on Cloudflare Pages with HTTPS

That's it. Everything else comes later.

---

## Scope: IN

| Item | Notes |
|------|-------|
| Build script | Node.js, converts Markdown → HTML using a template |
| One HTML template | Header, content slot, footer. Responsive. |
| Inline CSS | System fonts, dark mode, < 3KB |
| Index page | Lists all posts with title and date |
| Individual post pages | Full post content |
| One blog post | "Hello World" or first real post |
| Cloudflare Pages deploy | Git push → auto-build → live |
| Custom domain | Your domain, HTTPS automatic |

## Scope: OUT (for now)

| Item | When |
|------|------|
| RSS feed | Phase 2 |
| About page | Phase 3 |
| Tags/categories | Phase 3 |
| Webmentions | Phase 4 |
| Guestbook | Phase 4 |
| Images in posts | Phase 5 (text-only is fine to start) |
| Search | Phase 5 |
| Analytics of any kind | Never (or self-hosted, much later) |

---

## Technical Spec

### Build Script (`build.js`)

**Input:**
- `posts/*.md` — Markdown files with YAML frontmatter
- `templates/base.html` — HTML template with `{{title}}`, `{{content}}`, `{{date}}` placeholders
- `src/css/style.css` — CSS file to inline

**Output:**
- `dist/index.html` — Post listing page
- `dist/{slug}.html` — Individual post pages

**Dependencies:**
- `marked` — Markdown to HTML (single npm package)

**Frontmatter format:**
```yaml
---
title: Hello World
date: 2026-02-27
slug: hello-world
description: My first post on the indie web
---
```

**Build process:**
1. Read all `.md` files from `posts/`
2. Parse frontmatter (simple regex, no library needed)
3. Convert Markdown body to HTML via `marked`
4. Read CSS file, inject into template `<style>` tag
5. For each post: replace template placeholders, write to `dist/{slug}.html`
6. Generate index page: list of posts sorted by date (newest first)
7. Copy any static assets to `dist/`

### HTML Template (`templates/base.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="{{description}}">
  <title>{{title}} — aibro</title>
  <style>{{css}}</style>
</head>
<body>
  <header>
    <nav>
      <a href="/">aibro</a>
    </nav>
  </header>
  <main>
    {{content}}
  </main>
  <footer>
    <p>&copy; 2026 aibro</p>
  </footer>
</body>
</html>
```

### CSS (`src/css/style.css`)

Target properties:
- System font stack: `system-ui, -apple-system, sans-serif`
- Max width: `65ch` (optimal reading length)
- Auto margins for centering
- `prefers-color-scheme: dark` media query
- Minimal reset (box-sizing, margin on body)
- Link styling with accent color
- Code block styling
- Responsive without media queries (fluid by default at 65ch)

**Budget: < 2KB minified, < 1KB gzipped**

### Page Weight Budget

| Component | Budget |
|-----------|--------|
| HTML structure | 1-2 KB |
| Inline CSS | 1-2 KB |
| Post content (avg) | 5-15 KB |
| **Total per page** | **< 20 KB** |
| **Compressed (gzip)** | **< 8 KB** |

This puts us firmly in 512KB Club **Green tier** (< 100KB).

---

## Deployment Config

### Cloudflare Pages

```
Build command: node build.js
Build output directory: dist
Root directory: /
Node.js version: 20
```

### Alternative: GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: node build.js
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## Definition of Done

- [ ] `node build.js` runs without errors
- [ ] `dist/index.html` exists and lists posts
- [ ] `dist/hello-world.html` exists with rendered post content
- [ ] Total page weight < 50KB (measured with curl)
- [ ] Looks readable on mobile (test with browser devtools)
- [ ] Dark mode works (toggle OS setting)
- [ ] HTML validates (no errors at validator.w3.org)
- [ ] Deployed and accessible at custom domain
- [ ] HTTPS working

---

## Stretch (if it takes 5 minutes)

- Add a `<meta name="theme-color">` for mobile browser chrome
- Add a minimal favicon: `<link rel="icon" href="data:image/svg+xml,<svg ...>">`
- Add `<meta name="color-scheme" content="light dark">` for native dark mode hints

---

## What We're NOT Building

This is not a CMS. This is not a platform. This is not a SaaS.

This is a folder of Markdown files, a build script, and some HTML. It is yours. You can read every line. You can change anything. You can move it anywhere.

That's the whole point.
