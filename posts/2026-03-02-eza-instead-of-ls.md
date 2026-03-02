---
title: Use eza Instead of ls
date: 2026-03-02
slug: eza-instead-of-ls
description: Why eza is a better ls, with examples and AI integration tips
---

# Use eza Instead of ls

I spend a lot of time in the terminal. Listing files is probably the command I run most — dozens of times a day, maybe hundreds. And for all that usage, `ls` has barely changed since the 1970s. It works, but it doesn't *help*.

[eza](https://eza.rocks) is a modern replacement for `ls` written in Rust. It's faster, it's colorful by default, it understands Git, and it can render tree views without needing a separate `tree` command. Once you try it, plain `ls` feels like going back to a flip phone.

## Installation

Pick your platform:

```bash
# macOS
brew install eza

# Ubuntu/Debian (22.04+)
sudo apt install eza

# Arch
pacman -S eza

# Cargo (any platform with Rust)
cargo install eza
```

## Examples: ls vs eza

Here's where it gets fun. Let's compare them side by side.

### Basic listing

```terminal
$ ls
README.md  build.js  dist  node_modules  package.json  posts  src  templates
```

```terminal
$ eza
README.md  build.js  {blue}dist{/}  {blue}node_modules{/}  package.json  {blue}posts{/}  {blue}src{/}  {blue}templates{/}
```

Looks similar, but eza color-codes directories, executables, and symlinks out of the box. No `--color=auto` flag needed.

### Long format with Git status

This is the killer feature. eza can show Git status inline with your file listing:

```terminal
$ eza -l --git
{dim}drwxr-xr-x{/}    {dim}-{/} me  2 Mar 10:30 {blue}dist{/}
{dim}drwxr-xr-x{/}    {dim}-{/} me  2 Mar 09:15 {blue}node_modules{/}
{dim}.rw-r--r--{/}  1.2k me  2 Mar 11:02 {yellow}M{/}{dim}-{/} build.js
{dim}.rw-r--r--{/}   480 me  2 Mar 10:58 {dim}--{/} package.json
{dim}.rw-r--r--{/}   220 me  1 Mar 16:30 {dim}--{/} README.md
{dim}drwxr-xr-x{/}    {dim}-{/} me  2 Mar 11:00 {blue}posts{/}
{dim}drwxr-xr-x{/}    {dim}-{/} me  2 Mar 10:45 {blue}src{/}
{dim}drwxr-xr-x{/}    {dim}-{/} me  1 Mar 16:30 {blue}templates{/}
```

You get the usual permissions, size, and date columns — but also a two-character Git status column. `M` for modified, `N` for new, `-` for clean. At a glance you know what's changed without running `git status`.

### Tree view

Forget installing `tree` separately:

```terminal
$ eza --tree --level=2
{blue}.{/}
├── {blue}dist{/}
│   ├── {blue}eza-instead-of-ls{/}
│   └── index.html
├── {blue}posts{/}
│   └── 2026-03-02-eza-instead-of-ls.md
├── {blue}src{/}
│   ├── {blue}css{/}
│   └── {blue}js{/}
├── {blue}templates{/}
│   └── base.html
├── build.js
├── package.json
└── README.md
```

This gives you a recursive directory view with the same color coding and Git awareness. The `--level` flag controls depth so you don't drown in `node_modules`.

### Icons

If your terminal supports Nerd Fonts:

```bash
eza --icons
```

Every file type gets a little icon — folders, JavaScript files, Markdown, images, config files. It's not just pretty; it makes scanning a directory genuinely faster.

### Filtering by type

Show only directories:

```bash
eza -D
```

Show only files:

```bash
eza -f
```

Show only Git-ignored files:

```bash
eza --git-ignore
```

### Sorting and grouping

Sort by size, biggest first:

```bash
eza -l --sort=size --reverse
```

Sort by modification time:

```bash
eza -l --sort=modified
```

Group directories before files (like a file manager):

```bash
eza --group-directories-first
```

## Making eza your default

Add these aliases to your `.bashrc` or `.zshrc`:

```bash
alias ls="eza"
alias ll="eza -l --git"
alias la="eza -la --git"
alias lt="eza --tree --level=2"
```

After sourcing your shell config, every `ls` you type — and every `ls` any tool runs in your shell — uses eza instead.

## Getting AI to use eza

This is the part nobody talks about. If you use AI coding assistants like Claude Code, they run commands in your shell. By default they'll reach for `ls` because that's what's universal. Here's how to make them prefer eza.

### Shell aliases

The simplest approach: if you alias `ls` to `eza` in your shell config, Claude Code inherits those aliases. When it runs `ls`, it's actually running `eza`. No extra configuration needed.

### CLAUDE.md directive

For explicit control, add a line to your project's `CLAUDE.md`:

```markdown
Use `eza` instead of `ls` for directory listings. Prefer `eza -l --git` for detailed views.
```

Claude Code reads this file at the start of every session and follows the instructions. This is the most reliable method because it works regardless of shell configuration.

### Combining both

The belt-and-suspenders approach:

1. Set up shell aliases so eza is the default for everything
2. Add the `CLAUDE.md` directive so AI tools explicitly know to use it
3. Your terminal, your scripts, and your AI assistant all use the same tool

## Wrap-up

`eza` is one of those tools that makes you wonder why you waited so long. It's a drop-in replacement that makes every directory listing more useful. The Git integration alone is worth the switch — but the tree views, icons, and filtering make it indispensable.

Install it, alias it, tell your AI about it, and never look back.
