---
name: dev
description: Start development servers for Annota (web, api, or both)
argument-hint: [web|api|all]
disable-model-invocation: true
allowed-tools: Bash
---

Start Annota development servers.

Target: $ARGUMENTS

## Instructions

- If `$ARGUMENTS` is "web" or "frontend":
  Run `npm run dev:web` (Angular dev server on localhost:4200)

- If `$ARGUMENTS` is "api" or "backend":
  Run `npm run dev:api` (NestJS dev server on localhost:3000)

- If `$ARGUMENTS` is "all" or empty:
  Run `npm run dev` (both servers in parallel)

Run the command in the background so the user can continue working.
