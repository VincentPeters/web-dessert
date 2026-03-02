---
title: Per-Project MCP Servers in Claude Code
date: 2026-03-02
slug: per-project-mcp-servers
draft: true
description: How to configure MCP servers per project with .mcp.json, and why you should care about your context window
---

# Per-Project MCP Servers in Claude Code

I have too many MCP servers. Context7 for docs, Playwright for browser testing, a Postgres server for database work, a GitHub server, a Supabase server — the list keeps growing. And every time I start a Claude Code session, all of them load. Every single one, whether I need them or not.

That's a problem, because each MCP server eats tokens. Tool definitions, descriptions, parameter schemas — it all gets stuffed into the context window before you even type your first message. I measured mine once: over 60,000 tokens gone before "hello." That's roughly a third of the context window, consumed by tools I'm not going to use.

The fix: stop configuring MCP servers globally and start using `.mcp.json` per project.

## The context window tax

Here's the thing most people don't think about. When Claude Code starts, it reads every MCP server configuration and loads all their tool definitions into the system prompt. Each tool has a name, a description, and a JSON schema for its parameters. A server with 10 tools can easily consume 5,000–10,000 tokens just sitting there.

If you have five or six servers configured globally, you're looking at 40,000–60,000 tokens of overhead. That's context window space that could hold actual code, actual conversation, actual work. Instead it's holding the parameter schema for a Postgres query tool while you're working on a frontend React project.

Fewer servers means:

- **More room for code** — Claude can read and hold more of your codebase in memory
- **Better tool selection** — fewer options means less confusion about which tool to pick
- **Lower costs** — fewer input tokens per request means lower API bills
- **Faster responses** — less to process on every turn

## Why not just install globally and toggle per project?

This was my first instinct too. Install everything at the user scope, then have a per-project file that says "enable these, disable those." Clean, simple, obvious.

Except Claude Code doesn't really support this — at least not in the way you'd expect.

### The settings that almost work

Claude Code does have some settings that sound like they'd solve this:

```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["context7", "playwright"],
  "disabledMcpjsonServers": ["postgres"]
}
```

These go in `.claude/settings.json` at your project root. But here's the catch: they only control the **approval prompt** for `.mcp.json` servers. They're security gates that decide whether Claude Code asks "do you trust this project-scoped server?" — not toggles that prevent global servers from loading.

If you have Postgres configured at the user scope in `~/.claude.json`, it loads in every project regardless of what `disabledMcpjsonServers` says. That setting only affects servers defined in `.mcp.json`.

Even worse, these settings [don't work in `.claude/settings.local.json`](https://github.com/anthropics/claude-code/issues/24657) — the file that's supposed to hold per-developer overrides. Claude Code only reads them from `~/.claude.json` or the shared `.claude/settings.json`. There's a [feature request](https://github.com/anthropics/claude-code/issues/16402) to fix this, but it was closed as a duplicate without resolution.

### What about a `disabled` field?

You might expect something like this to work in `.mcp.json`:

```json
{
  "mcpServers": {
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-postgres"],
      "disabled": true
    }
  }
}
```

It doesn't. There's an [open feature request](https://github.com/anthropics/claude-code/issues/17921) for exactly this, filed in February 2026. It has community support but no official response from Anthropic yet.

### The /mcp session toggle

The `/mcp` slash command inside Claude Code does let you toggle servers on and off during a session, which is handy. But it's session-only — next time you start Claude Code, everything resets back to the config files.

### Community tools that bridge the gap

The community has built several tools to work around this limitation:

- [**McPick**](https://github.com/spences10/mcpick) by Scott Spence — a CLI that gives you an interactive menu to toggle servers before starting a session. It uses `claude mcp add/remove` under the hood, so changes persist until you toggle again.
- [**Claude-Code-MCP-Server-Selector**](https://github.com/henkisdabro/Claude-Code-MCP-Server-Selector) — a terminal UI with a three-way toggle: on (green), off (red), and paused (orange). It manipulates `~/.claude.json` directly.
- [**disable-claude-mcp**](https://github.com/zudochkin/disable-claude-mcp) — uses a YAML file as the source of truth where you mark servers `enabled: false`, then exports a clean JSON config with only the active ones.

These tools work by physically moving server configs between the active `mcpServers` section and an ignored `_disabled_mcpServers` section in your config file. Claude Code doesn't know about `_disabled_mcpServers` — it just doesn't see those servers because they're not in the right place.

If you switch projects often and want that toggle workflow, McPick is probably the most polished option. Run `npx mcpick` before starting Claude Code, check the boxes for what you need, and go.

### The bottom line

There are [many](https://github.com/anthropics/claude-code/issues/4879) [open](https://github.com/anthropics/claude-code/issues/10447) [issues](https://github.com/anthropics/claude-code/issues/17921) asking for a native toggle. It'll probably land eventually. Until then, the cleanest approach is to skip the global config and define servers per project.

## The approach that actually works

Instead of configuring servers globally and trying to disable them per project, flip it around:

1. **Keep your global config empty** — don't add MCP servers at user scope
2. **Define everything in `.mcp.json` per project** — each project gets exactly the servers it needs
3. **Copy the ones you always want** — yes, you'll duplicate a few lines of JSON across projects

It's a little more repetitive, but it means each project is self-contained. You open a project, you see its `.mcp.json`, and you know exactly what tools are loaded. No mystery globals, no hidden overhead.

## How .mcp.json works

Claude Code looks for MCP configuration in three places, in this priority order:

1. **Local** — `~/.claude.json` scoped to a specific project path
2. **Project** — `.mcp.json` at your project root
3. **User** — `~/.claude.json` global settings

When servers with the same name exist at multiple scopes, local wins over project, and project wins over user. But servers with _different_ names at different scopes all load together. That's why having a bunch of global servers is a problem — `.mcp.json` can't turn them off.

The project-scoped `.mcp.json` file lives in your repo root, right next to `package.json` or `pyproject.toml`. You can commit it to version control so your whole team gets the same tools.

## Setting it up

### The file format

Create a `.mcp.json` file in your project root:

```json
{
  "mcpServers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["@anthropic-ai/mcp-playwright"]
    }
  }
}
```

These servers load when you open this project. If your global config is empty, these are the _only_ servers that load. That's the goal.

### Using the CLI

You can also add servers with the `claude mcp add` command and the `--scope project` flag:

```bash
# Add a server to this project only
claude mcp add context7 --scope project -- npx -y @upstash/context7-mcp

# Add an HTTP-based server
claude mcp add --transport http paypal --scope project https://mcp.paypal.com/mcp

# List what's configured
claude mcp list
```

The `--scope project` flag writes to `.mcp.json` instead of your global config.

### Environment variables

You probably don't want API keys in a committed file. Use variable expansion:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "supabase-mcp"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_KEY": "${SUPABASE_KEY}"
      }
    }
  }
}
```

The `${VAR}` syntax pulls from your shell environment. You can also set defaults with `${VAR:-fallback-value}`. The secrets stay in your `.env` or shell profile where they belong, and the `.mcp.json` file stays safe to commit.

## Real-world examples

Here's what my `.mcp.json` looks like for different kinds of projects.

### Frontend project

```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["@anthropic-ai/mcp-playwright"]
    },
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

Two servers. Playwright for testing UI in the browser. Context7 for looking up React or Tailwind docs. That's all a frontend project needs from MCP.

### Backend API project

```json
{
  "mcpServers": {
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    },
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

Database access and docs. No Playwright — there's no browser to test.

### This blog

```json
{
  "mcpServers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

One server. It's a static site with a build script. I don't need database tools, I don't need browser automation. One documentation server is plenty.

## The /mcp escape hatch

Even with per-project configs, sometimes you realize mid-session that you need a server you didn't include, or that one of the loaded servers is getting in the way. The `/mcp` slash command inside Claude Code shows all connected servers and lets you toggle them on or off for the current session.

It's not persistent — it resets when you restart — but it's useful for one-off situations. Think of it as a quick override, not a configuration strategy.

## Team benefits

Since `.mcp.json` lives in your repo, you can commit it. That means:

- New team members get the right MCP servers automatically
- Everyone works with the same tools
- No "works on my machine" because someone forgot to configure a server
- Onboarding is one fewer thing to document

The first time a team member opens the project in Claude Code, they'll get a prompt asking them to approve the project-scoped servers. After that, it just works.

## Tool Search: the automatic safety net

If you do end up with a lot of MCP tools loaded (maybe you need five servers for a big full-stack project), Claude Code has a built-in optimization called Tool Search. When your MCP tool definitions exceed 10% of the context window, it automatically switches to loading tools on-demand instead of all upfront. Claude searches for the right tool when it needs one, rather than holding every definition in memory.

You can tweak the threshold:

```bash
# Activate tool search at 5% instead of 10%
ENABLE_TOOL_SEARCH=auto:5 claude

# Always on
ENABLE_TOOL_SEARCH=true claude

# Disable entirely
ENABLE_TOOL_SEARCH=false claude
```

It's a nice safety net, but it's not a replacement for keeping your server list lean. A targeted `.mcp.json` with three servers will always beat ten servers behind a search layer.

## The takeaway

The ideal world would let you install MCP servers once and toggle them per project. We're not there yet. Until that feature lands, the practical move is to skip the global config entirely and define your servers in `.mcp.json` per project. Yes, you'll copy-paste a few lines of JSON between projects. That's a small price for a context window that isn't half-full before you start working.

Three steps:

1. Remove your global MCP servers (`claude mcp remove <name>`)
2. Create a `.mcp.json` in each project with only the servers it needs
3. Commit it so your team benefits too

Your context window will thank you.
