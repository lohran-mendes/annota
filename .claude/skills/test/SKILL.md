---
name: test
description: Run tests for the Annota project (web with Vitest, api with Jest)
argument-hint: [web|api|all]
allowed-tools: Bash, Read, Grep, Glob
---

Run tests for the Annota project.

Target: $ARGUMENTS

## Instructions

Based on the argument, run the appropriate test command:

- If `$ARGUMENTS` is "web" or "frontend":
  Run `npm run test:web` from the project root.
  Tests use Vitest. Check for failures and report results.

- If `$ARGUMENTS` is "api" or "backend":
  Run `npm run test:api` from the project root.
  Tests use Jest 30. Check for failures and report results.

- If `$ARGUMENTS` is "all" or empty:
  Run both `npm run test:web` and `npm run test:api`.
  Report combined results.

After running tests:
1. If tests pass, report success with summary
2. If tests fail, read the failing test files and the source files they test
3. Identify root cause of failures
4. Suggest or implement fixes
