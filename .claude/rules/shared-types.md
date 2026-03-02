---
paths:
  - "libs/shared/**/*.ts"
---

# Shared Library Rules

## Purpose
`libs/shared/` contains TypeScript interfaces and types shared between frontend and backend.

## Files
- `index.ts` - Entity interfaces and barrel exports
- `api-contracts.ts` - DTOs, API response types, and endpoint contracts

## IMPORTANT
- When adding a new entity or API endpoint, ALWAYS update both files
- Export everything from `index.ts` (barrel pattern)
- Use `ApiResponse<T>` and `ApiListResponse<T>` wrappers for all API responses
- Keep interfaces in sync with Mongoose schemas (apps/api/) and Angular services (apps/web/)
- NEVER add runtime code here - only types and interfaces
