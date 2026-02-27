---
title: Hello World
date: 2026-02-27
slug: hello-world
description: My first post on the indie web
---

# Hello World

Here we go. I've been meaning to start a blog for years — like, actually years — and I keep putting it off because the tooling felt too heavy. WordPress needs a database. Ghost costs money. Medium owns your content and will quietly bury it behind a paywall one day.

So I built something small. A static site generator in about 80 lines of JavaScript that turns Markdown files into HTML pages. No framework. No npm install with 800 dependencies. Just a build script, a CSS file under 2KB, and a folder of posts.

This is post number one.

## Why the indie web matters

There's something important about owning your own corner of the internet. When you publish on someone else's platform, you're a tenant. They can change the algorithm, deprecate the API, or shut down entirely — and your words go with them.

> The web works best when everyone has their own place on it. — probably someone smart

A blog you host yourself is different. It's yours. The URLs don't rot if you don't let them. Your writing doesn't disappear because a startup ran out of funding. You control the reading experience.

I've been inspired by people like [Maciej Cegłowski](https://idlewords.com) who've been writing on their own domains for decades. That's the goal.

## How this site works

The whole thing is embarrassingly simple. Posts are Markdown files with frontmatter:

```markdown
---
title: Hello World
date: 2026-02-27
slug: hello-world
description: My first post on the indie web
---
```

A Node.js build script reads those files, parses the frontmatter, converts Markdown to HTML, and injects it into a template. The output is a `dist/` folder of plain HTML files ready to deploy anywhere — Netlify, GitHub Pages, a $5 VPS, whatever.

No client-side JavaScript. No web fonts. Just HTML and one small CSS file.

## What comes next

Honestly, I'm not sure yet. I want to write about programming, tools I find interesting, and things I'm building. Maybe some stuff about cooking. We'll see.

The important thing is that I started. The site is live, the first post is up, and the infrastructure is so simple that there's nothing to break.

Here's to actually publishing things.
