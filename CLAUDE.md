# Annota

## O que e o projeto

Annota e uma aplicacao web fullstack de estudos focada na aprendizagem por resolucao de exercicios. O usuario seleciona uma prova para a qual deseja estudar e a aplicacao fornece um ambiente para resolver questoes organizadas por materias e topicos. O objetivo e capacitar o usuario a ser aprovado na prova escolhida.

O nome "Annota" e uma homenagem a Anna Beatriz, irma do criador do projeto, que precisa passar no vestibulinho da ETEC para cursar o ensino medio. O projeto tambem serve como aprendizado pratico de desenvolvimento web com Claude Code.

## Stack tecnologica

| Camada     | Tecnologia         | Versao minima |
| ---------- | ------------------ | ------------- |
| Frontend   | Angular            | 21+           |
| UI/CSS     | Angular Material   | 21+           |
| Backend    | NestJS             | 11+           |
| Banco      | MongoDB            | 7+            |
| ODM        | Mongoose           | 8+            |
| Runtime    | Node.js            | 22+           |
| Pacotes    | npm                | 10+           |
| Linguagem  | TypeScript         | 5.9+          |
| Testes web | Vitest             | 4+            |
| Testes api | Jest               | 30+           |

## Estrutura do monorepo

```
annota/
  package.json              # raiz com npm workspaces
  CLAUDE.md                 # este arquivo
  apps/
    web/                    # @annota/web - Angular 21 frontend
    api/                    # @annota/api - NestJS 11 backend
  libs/
    shared/                 # @annota/shared - tipos e interfaces compartilhados
```

**Modulos backend** (12): exam, subject, topic, question, answer, progress, mock-exam, deck, flashcard, schedule, access-log, auth

**Features frontend** (8): home, login, study, progress, mock-exam, flashcards, schedule, admin

**Tipos compartilhados**: `libs/shared/src/index.ts` (entidades) e `api-contracts.ts` (DTOs e responses)

## Autenticacao

Implementada com JWT + bcrypt. Guards: `JwtAuthGuard` (rotas autenticadas), `AdminGuard` (painel admin). User schema em `apps/api/src/auth/`. Interceptor no frontend adiciona Bearer token.

## Deploy

- **Frontend**: Cloudflare Pages (`annota.pages.dev`) + GitHub Pages como fallback
- **Backend**: MongoDB Atlas (cluster gratuito). Conexao via `MONGODB_URI` no `.env`
- **CI**: GitHub Actions (`.github/workflows/deploy.yml`)

## Variaveis de ambiente

### Frontend (Angular) — `@ngx-env/builder`
- Arquivo `.env` em `apps/web/.env` (nao commitado, ver `.env.example`)
- Variaveis DEVEM ter prefixo `NG_APP_` (ex: `NG_APP_API_URL`)
- Acessar via `import.meta.env.NG_APP_*` no codigo
- **Sempre usar fallback**: `import.meta.env.NG_APP_API_URL ?? 'http://localhost:3000/api'`
- Tipagem em `apps/web/src/env.d.ts` — adicionar novas variaveis la
- NUNCA hardcodar URLs de API nos services. Usar `import.meta.env`

### Backend (NestJS) — `@nestjs/config`
- Arquivo `.env` em `apps/api/.env` (nao commitado, ver `.env.example`)
- Acessar via `ConfigService.get('VAR_NAME', 'fallback')` ou `process.env.VAR_NAME ?? 'fallback'`
- **Sempre usar fallback/default values**

### Regra geral
- Todo valor que muda entre ambientes DEVE vir de variavel de ambiente
- Sempre fornecer um valor de fallback para desenvolvimento local
- Nunca commitar `.env` — apenas `.env.example` com valores de exemplo

## Comandos uteis

```bash
# Desenvolvimento
npm run dev:web          # Angular dev server (localhost:4200)
npm run dev:api          # NestJS dev server com watch (localhost:3000)
npm run dev              # Ambos em paralelo

# Build
npm run build:web        # Build do Angular
npm run build:ghpages    # Build para GitHub Pages (com base-href)
npm run build:api        # Build do NestJS

# Testes
npm run test:web         # Vitest (Angular)
npm run test:api         # Jest (NestJS)

# Seed do banco de dados
npm run seed -w @annota/api    # Popular MongoDB com dados de exemplo
```

## Convencoes gerais

- Idioma do codigo (variaveis, funcoes, classes): **ingles**
- Commits em ingles, seguindo conventional commits (feat:, fix:, chore:, etc.)
- Este e um projeto de aprendizado. Priorizar clareza e boas praticas sobre otimizacao prematura.
- IMPORTANTE: Ao criar novos modulos backend, usar `/api-module`. Ao criar features frontend, usar `/angular-feature`.
- IMPORTANTE: Sempre atualizar `libs/shared/src/` ao adicionar novas entidades.
- Fluxo recomendado para nova feature: tipos compartilhados → backend → frontend → testes → review.
- Convencoes especificas de Angular, NestJS, shared types e testes estao em `.claude/rules/`.

## Manutencao dos arquivos de contexto

Apos mudancas estruturantes (novo modulo, nova feature, mudanca de arquitetura, adicao/remocao de dependencias, mudanca de deploy, etc.), os arquivos de documentacao do Claude Code DEVEM ser atualizados para refletir a realidade:
- `CLAUDE.md` raiz — estrutura do monorepo, lista de modulos, stack, deploy
- `apps/api/CLAUDE.md` — modulos backend, bootstrap, auth, seed
- `apps/web/CLAUDE.md` — features frontend, rotas, services
- `libs/shared/CLAUDE.md` — entidades e contratos
- `.claude/rules/*.md` — convencoes de framework
- `.claude/agents/*.md` — checklists e expertise
