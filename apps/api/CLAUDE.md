# Annota API (NestJS 11)

## Bootstrap (`src/main.ts`)
- Global prefix: `/api`
- CORS: localhost:4200, annota.pages.dev
- Global pipes: `ValidationPipe` (whitelist, transform, forbidNonWhitelisted)
- Global filters: `MongoExceptionFilter` (duplicate key errors)
- Swagger docs: `/api/docs`

## Root module (`src/app.module.ts`)
- `ConfigModule.forRoot({ isGlobal: true })`
- `MongooseModule.forRootAsync()` com `MONGODB_URI` do ConfigService
- Todos os 12 modulos de dominio registrados

## Modulos (12)

| Modulo | Descricao |
|--------|-----------|
| exam | CRUD de provas |
| subject | Materias vinculadas a provas (ref Exam) |
| topic | Topicos dentro de materias (ref Subject) |
| question | Questoes multipla escolha (ref Topic, Subject) |
| answer | Submissao e validacao de respostas |
| progress | Progresso do usuario por materia/topico |
| mock-exam | Templates, sessoes e resultados de simulados |
| deck | Baralhos de flashcards |
| flashcard | Flashcards com algoritmo SM-2 de repeticao espacada |
| schedule | Cronograma de estudos semanal |
| access-log | Registro de acessos do usuario |
| auth | Autenticacao JWT, registro, login, guards |

## Auth
- JWT strategy com Passport (`@nestjs/passport`, `@nestjs/jwt`)
- Token expira em 7 dias
- Senhas com bcrypt (salt rounds 10)
- User schema em `src/auth/user.schema.ts`
- Guards: `JwtAuthGuard` (rotas autenticadas)
- Roles: `admin` e `student`

## Common utilities (`src/common/`)
- `filters/mongo-exception.filter.ts` — trata erros de chave duplicada do MongoDB
- `pipes/parse-object-id.pipe.ts` — valida e converte parametros ObjectId
- `utils/paginate.ts` — paginacao com skip/limit
- `validators/valid-answer-index.validator.ts` — valida indice de resposta

## Seed (`src/seed.ts`)
- Executar: `npm run seed -w @annota/api`
- Dropa TODAS as collections e recria dados de teste
- Cria: 3 usuarios (1 admin + 2 students), 2 provas, materias, topicos, questoes, simulados, decks, flashcards
- Senhas sao hashadas com bcrypt

## Testes
- Framework: Jest 30
- Arquivos: `*.spec.ts` colocados ao lado do arquivo fonte
- Executar: `npm run test:api`
- Pattern: `Test.createTestingModule`, `getModelToken()` para mocks de Mongoose
