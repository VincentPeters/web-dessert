# aibro-blog: Project Plan

## Vision

A small, hand-crafted personal blog that lives on the indie web. Fully owned, fully controlled, lightweight enough for the 512KB Club Green tier (< 100KB), and expandable over time into a cosy corner of the internet.

## Guiding Principles

- **Own everything** — domain, content, design, code
- **Small by default** — no frameworks, no bloat, every byte intentional
- **Progressive enhancement** — start minimal, layer features over time
- **Indie web aligned** — RSS, microformats, webmentions, blogroll
- **No surveillance** — zero tracking, zero analytics scripts, zero third-party requests

---

## Chosen Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **SSG** | DIY (custom Node.js, ~60-100 lines) | Maximum control, learning, indie cred. Upgrade to Eleventy later if needed. |
| **Hosting** | Cloudflare Pages | Free, unlimited bandwidth, global CDN, Workers for future dynamic features |
| **Styling** | Hand-written CSS, inlined | System fonts, classless approach, < 3KB total |
| **Content** | Markdown with YAML frontmatter | Simple authoring, portable, git-friendly |
| **Templating** | Single HTML template with slot replacement | No engine needed — string replace is enough |

---

## Phases

### Phase 1: Foundation (MVP)

Build the absolute minimum blog that works.

- [ ] Project structure (`src/`, `posts/`, `dist/`, `templates/`)
- [ ] Build script (`build.js`) — Markdown to HTML with template
- [ ] Single HTML template with header, main content, footer
- [ ] Inline CSS (system fonts, responsive, dark mode via `prefers-color-scheme`)
- [ ] Index page with post list (newest first)
- [ ] First blog post
- [ ] Deploy to Cloudflare Pages (connect git repo)
- [ ] Custom domain setup + HTTPS

**Target:** Working blog, Green tier (< 100KB per page), live on the internet.

### Phase 2: Indie Web Essentials

Make the blog a citizen of the indie web.

- [ ] RSS/Atom feed generation (`feed.xml`)
- [ ] `<link rel="alternate">` autodiscovery in `<head>`
- [ ] `rel="me"` links for Mastodon/GitHub verification
- [ ] h-card microformat on about/footer
- [ ] h-entry microformat on blog posts
- [ ] Semantic HTML throughout (`<article>`, `<time>`, `<nav>`, etc.)
- [ ] Submit to ooh.directory
- [ ] Submit to 512KB Club

**Target:** Discoverable via RSS, verified on Mastodon, listed in directories.

### Phase 3: Community & Personality

Make it a place people want to visit and return to.

- [ ] About page (`/about`)
- [ ] Blogroll / links page (`/links`) with OPML export
- [ ] Now page (`/now`) — what you're up to currently
- [ ] Uses page (`/uses`) — tools, setup, etc.
- [ ] 404 page with personality
- [ ] Favicon (tiny SVG, inlined)
- [ ] Post tags/categories
- [ ] Tag index pages

**Target:** A site with character, not just posts.

### Phase 4: Interaction

Let the site participate in conversations.

- [ ] Webmentions receiving (via webmention.io)
- [ ] Display webmentions on posts (build-time fetch, zero runtime JS)
- [ ] Guestbook page (simple form → email or Cloudflare Worker)
- [ ] Join a web ring (XXIIVV, Hotline, or create your own)
- [ ] IndieAuth setup (your domain = your login)

**Target:** Two-way communication without platforms.

### Phase 5: Polish & Expansion

Quality of life and advanced features.

- [ ] Syntax highlighting for code blocks (build-time, no client JS)
- [ ] Image optimization pipeline (WebP, lazy loading, explicit dimensions)
- [ ] Sitemap.xml generation
- [ ] Open Graph / social meta tags
- [ ] Reading time estimate
- [ ] Post series / collections
- [ ] Search (build-time JSON index + tiny client JS, or no-JS approach)
- [ ] Archive page (by year/month)
- [ ] Consider migrating build script to Eleventy if complexity warrants it

**Target:** A mature, feature-complete personal blog.

---

## File Structure (Phase 1)

```
aibro-blog/
  build.js              # The SSG — ~60-100 lines
  package.json          # Just "marked" as dependency
  templates/
    base.html           # Single page template
  posts/
    2026-02-27-hello-world.md   # First post
  src/
    css/
      style.css         # Inlined at build time
  dist/                 # Generated output (gitignored)
    index.html
    hello-world.html
    feed.xml            # (Phase 2)
  docs/
    PLAN.md             # This file
    MCP.md              # Minimum Complete Product
```

---

## Deployment

```bash
# Local development
node build.js           # Build site to dist/
npx serve dist          # Preview locally

# Production (Cloudflare Pages)
# Connect git repo → build command: node build.js → output dir: dist
```

---

## Design Constraints

- **Zero web fonts** — system-ui font stack only
- **Zero JavaScript** in output (until Phase 4/5, and even then minimal)
- **Zero third-party requests** — everything self-contained
- **Max page weight: < 50KB** uncompressed (targeting well under Green tier)
- **Works without CSS** — semantic HTML reads well in any browser
- **Works in Lynx** — text browser compatible

---

## Success Criteria

1. Site loads in < 1 second on 3G
2. Every page under 100KB (512KB Club Green tier)
3. Perfect Lighthouse scores (100/100/100/100)
4. Listed on ooh.directory
5. Listed on 512KB Club
6. Mastodon verified via rel="me"
7. RSS feed works in any feed reader
8. You enjoy writing posts on it
