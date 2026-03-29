---
paths:
  - "apps/api/**/*.ts"
---

# NestJS 11 Rules

## Module structure
Every domain module must have: module, controller, service, schema, and DTOs.
Register every new module in `apps/api/src/app.module.ts`.

## Schemas (Mongoose)
- Use `@Schema({ timestamps: true, toJSON: { virtuals: true } })` on every schema
- Always define a virtual `id` field that maps `_id`
- Use `@Prop()` decorator with explicit types
- References: `@Prop({ type: Types.ObjectId, ref: 'ModelName' })`
- Export both the class and the schema: `export const XSchema = SchemaFactory.createForClass(X)`

## DTOs
- Create DTOs use class-validator decorators: `@IsString()`, `@IsNotEmpty()`, `@IsOptional()`, etc.
- Update DTOs extend `PartialType(CreateDto)` from `@nestjs/mapped-types`
- NEVER use `@IsMongoId()` without also using `@IsString()`

## Controllers
- Global prefix `/api` is set in main.ts - do NOT add it to controllers
- Use `ParseObjectIdPipe` for `:id` parameters
- Return typed responses using `ApiResponse<T>` from `@annota/shared`

## Services
- Inject models: `@InjectModel(X.name) private xModel: Model<X>`
- Use `.lean()` on find queries for performance
- Throw `NotFoundException` from `@nestjs/common` when entity not found
- Avoid `.save()` on lean objects - use `findByIdAndUpdate` instead

## Validation
- Global ValidationPipe is configured in main.ts (whitelist, transform, forbidNonWhitelisted)
- MongoExceptionFilter handles duplicate key errors globally

## Auth
- Auth module uses JWT with Passport (`@nestjs/passport`, `@nestjs/jwt`)
- `JwtAuthGuard` protects authenticated routes — apply to controllers/routes that need auth
- User schema is in `auth/user.schema.ts` (not a separate user module)
- Passwords hashed with bcrypt (salt rounds 10)
- Roles: `admin` | `student` — check role in guards when needed
