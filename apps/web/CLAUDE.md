# Annota Web (Angular 21)

## App configuration
- `src/app/app.config.ts`: provideRouter, provideAnimationsAsync, provideHttpClient com interceptors
- Interceptors: `authInterceptor` (adiciona JWT Bearer token), `httpErrorInterceptor` (trata erros HTTP)

## Rotas (`src/app/app.routes.ts`)
- `/login` — rota publica (login e registro)
- `/` — `UserShell` (protegido por `authGuard`) com features: home, study, progress, mock-exam, flashcards, schedule
- `/admin` — `AdminShell` (protegido por `authGuard` + `adminGuard`) com sub-rotas de gerenciamento

## Features (8)

| Feature | Descricao |
|---------|-----------|
| home | Dashboard principal com dialogs (confirm, create-exam) |
| login | Login e registro de usuarios |
| study | Seletor de provas, dashboard de estudo, resolver questoes |
| progress | Dashboard de progresso e estatisticas |
| mock-exam | Setup, sessao e resultado de simulados |
| flashcards | Lista de decks, detalhe do deck, sessao de revisao |
| schedule | Dashboard de cronograma de estudos |
| admin | Painel completo de gerenciamento (exam, subject, topic, question, mock-exam, schedule) |

## Services (`src/app/core/services/`)
14 services seguindo o mesmo pattern: `inject(HttpClient)`, base URL do env, responses tipadas de `@annota/shared`.
- auth, exam, subject, topic, question, answer, progress, mock-exam, deck, flashcard, schedule, access-log

## Guards e Interceptors (`src/app/core/`)
- `guards/auth.guard.ts` — verifica se usuario esta autenticado
- `guards/admin.guard.ts` — verifica se usuario e admin
- `interceptors/auth.interceptor.ts` — adiciona Bearer token em todas as requests
- `interceptors/http-error.interceptor.ts` — trata erros HTTP globalmente

## Layouts (`src/app/layout/`)
- `user-shell/` — layout principal para features de estudante (sidebar, toolbar)
- `admin-shell/` — layout do painel administrativo

## Variaveis de ambiente
- Arquivo `.env` com prefixo `NG_APP_*` (via `@ngx-env/builder`)
- Acesso: `import.meta.env.NG_APP_API_URL ?? 'http://localhost:3000/api'`
- Tipagem: `src/env.d.ts`

## Testes
- Framework: Vitest 4
- Arquivos: `*.spec.ts` colocados ao lado do componente/service
- Executar: `npm run test:web`
- Pattern: TestBed com `provideHttpClientTesting()`, `HttpTestingController`
