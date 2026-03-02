---
name: angular-feature
description: Create a new Angular feature module with components, routes, and service following Annota patterns
argument-hint: [feature-name]
allowed-tools: Read, Grep, Glob, Write, Edit, Bash
---

Create a new Angular feature for the Annota frontend following existing patterns.

Feature name: $ARGUMENTS

## Steps

1. Read existing features for reference:
   - `apps/web/src/app/features/home/` for component structure
   - `apps/web/src/app/features/study/` for routes with lazy loading
   - `apps/web/src/app/core/services/` for service patterns
   - `apps/web/src/app/app.routes.ts` for route registration

2. Create the feature directory at `apps/web/src/app/features/$ARGUMENTS/`

3. Create these files following Angular 21 patterns:
   - `$ARGUMENTS.routes.ts` - Routes array with lazy loading
   - Component directories with standalone components:
     - `component-name/component-name.ts` - Component class with signals
     - `component-name/component-name.html` - Template with @if/@for control flow
     - `component-name/component-name.scss` - SCSS styles

4. Create service at `apps/web/src/app/core/services/$ARGUMENTS.service.ts` if needed

5. Register routes in `apps/web/src/app/app.routes.ts` with lazy loading

## Angular 21 patterns

- ALWAYS use standalone components (no NgModules)
- Use signals (`signal()`, `computed()`, `effect()`) for state
- Use `input()`, `output()`, `model()` signal-based APIs
- Use `@if`, `@for`, `@switch` control flow (NOT *ngIf, *ngFor)
- Use `inject()` function instead of constructor injection
- Use `HttpClient` with typed responses
- Import Angular Material components individually
- SCSS for all styles
- Lazy load routes: `loadChildren: () => import('./path').then(m => m.routes)`
