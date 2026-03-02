---
paths:
  - "**/*.spec.ts"
  - "**/*.test.ts"
---

# Testing Rules

## Frontend (Vitest)
- Test files: `*.spec.ts` next to the component
- Framework: Vitest 4+
- Run: `npm run test:web`
- Test standalone components with `TestBed.configureTestingModule`
- Mock services with `jasmine.createSpyObj` or manual mocks
- Use `provideHttpClientTesting()` for HTTP tests

## Backend (Jest)
- Test files: `*.spec.ts` next to the source file
- Framework: Jest 30+
- Run: `npm run test:api`
- Use `Test.createTestingModule` from `@nestjs/testing`
- Mock Mongoose models with `getModelToken()`
- Test controllers and services separately
