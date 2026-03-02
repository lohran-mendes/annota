---
name: seed
description: Run or update the database seed script for Annota
argument-hint: [run|update]
allowed-tools: Bash, Read, Edit, Write, Grep, Glob
---

Manage the Annota database seed script.

Action: $ARGUMENTS

## Instructions

- If `$ARGUMENTS` is "run" or empty:
  1. Run `npm run seed -w @annota/api`
  2. Report results and any errors
  3. If MongoDB connection fails, check `.env` file exists with MONGODB_URI

- If `$ARGUMENTS` is "update":
  1. Read `apps/api/src/seed.ts`
  2. Read all schema files in `apps/api/src/` to understand current data model
  3. Read `libs/shared/src/index.ts` for shared types
  4. Update the seed script to include data for any new modules/schemas
  5. Ensure seed data is realistic and covers edge cases
  6. Run the seed after updating to verify it works
