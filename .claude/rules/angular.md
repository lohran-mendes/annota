---
paths:
  - "apps/web/**/*.ts"
  - "apps/web/**/*.html"
  - "apps/web/**/*.scss"
---

# Angular 21 Rules

## Components
- ALWAYS use standalone components. NEVER create NgModules.
- Use `signal()`, `computed()`, `effect()` for state management.
- Use `input()`, `output()`, `model()` for component communication (NOT @Input/@Output decorators).
- Use `inject()` function for dependency injection (NOT constructor injection).

## Templates
- Use `@if (condition) { }` instead of `*ngIf`
- Use `@for (item of items; track item.id) { }` instead of `*ngFor`
- Use `@switch (value) { @case (x) { } }` instead of `*ngSwitch`
- Call signals in templates: `{{ mySignal() }}` not `{{ mySignal }}`

## Services
- Services are in `apps/web/src/app/core/services/`
- Use `inject(HttpClient)` for HTTP calls
- API base URL: `http://localhost:3000/api`
- Type responses using interfaces from `@annota/shared`

## Styling
- Use Angular Material components (import individually from `@angular/material/*`)
- Write SCSS, not CSS
- Follow the pink/violet color palette already established

## File naming
- Component: `feature-name.ts`, `feature-name.html`, `feature-name.scss`
- Service: `feature-name.service.ts`
- Routes: `feature-name.routes.ts`

## Auth & Guards
- `authGuard` protects all user routes, `adminGuard` protects admin routes (in `app.routes.ts`)
- `authInterceptor` adds JWT Bearer token to all HTTP requests automatically
- Auth state managed by `AuthService` in `core/services/auth.service.ts`
- Login/register pages are public (no guard)
