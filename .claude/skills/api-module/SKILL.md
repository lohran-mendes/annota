---
name: api-module
description: Create a complete NestJS module with schema, DTOs, controller, service following Annota patterns
argument-hint: [module-name]
allowed-tools: Read, Grep, Glob, Write, Edit, Bash
---

Create a new NestJS module for the Annota API following the existing patterns.

Module name: $ARGUMENTS

## Steps

1. Read existing modules for reference patterns:
   - `apps/api/src/exam/` for schema, controller, service, DTOs structure
   - `apps/api/src/common/` for shared filters and pipes
   - `libs/shared/src/index.ts` and `libs/shared/src/api-contracts.ts` for shared types

2. Create the module directory at `apps/api/src/$ARGUMENTS/`

3. Create these files following the exact patterns from existing modules:
   - `$ARGUMENTS.schema.ts` - Mongoose schema with `@Schema()` decorator, timestamps, toJSON virtuals
   - `$ARGUMENTS.module.ts` - NestJS module with MongooseModule.forFeature
   - `$ARGUMENTS.service.ts` - Service with constructor injecting @InjectModel
   - `$ARGUMENTS.controller.ts` - Controller with `@Controller('$ARGUMENTS')` and standard CRUD endpoints
   - `dto/create-$ARGUMENTS.dto.ts` - Create DTO with class-validator decorators
   - `dto/update-$ARGUMENTS.dto.ts` - Update DTO extending PartialType(CreateDto)

4. Register the module in `apps/api/src/app.module.ts`

5. Add shared types to `libs/shared/src/index.ts` and `libs/shared/src/api-contracts.ts`

## Patterns to follow

- Use `@Prop()` decorators from `@nestjs/mongoose`
- Schema class extends `Document`, use `SchemaFactory.createForClass()`
- Virtual `id` field mapping `_id` in toJSON
- DTOs use `@IsString()`, `@IsNotEmpty()`, `@IsOptional()` from class-validator
- Controller methods return typed responses matching `ApiResponse<T>` from shared lib
- Service methods use `.lean()` for read queries
