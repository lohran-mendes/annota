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
  package.json            # raiz com npm workspaces
  README.md               # documentacao do projeto
  CLAUDE.md               # este arquivo (instrucoes para Claude Code)
  .github/
    workflows/
      deploy.yml          # GitHub Actions - deploy automatico no GitHub Pages
  apps/
    web/                  # @annota/web - Angular 21 frontend (standalone, signals)
      src/
        app/
          core/           # mock-data, services (skeleton)
          features/       # home, study, progress, mock-exam, admin
          layout/         # user-shell, admin-shell
          shared/         # not-found
    api/                  # @annota/api - NestJS 11 backend
      src/
        main.ts           # bootstrap (prefix /api, CORS, validation)
        app.module.ts     # root module
        common/           # filters (MongoException), pipes (ParseObjectId)
        exam/             # ExamModule - CRUD de provas
        subject/          # SubjectModule - CRUD de materias (ref Exam)
        topic/            # TopicModule - CRUD de topicos (ref Subject)
        question/         # QuestionModule - CRUD de questoes (ref Topic, Subject)
        answer/           # AnswerModule - submissao de respostas
        progress/         # ProgressModule - progresso do usuario
        mock-exam/        # MockExamModule - simulados com timer
        seed.ts           # script de seed do banco
      .env                # variaveis de ambiente (nao commitado)
      .env.example        # exemplo de variaveis
  libs/
    shared/               # @annota/shared - tipos e interfaces compartilhados
      src/
        index.ts          # barrel export (entidades)
        api-contracts.ts  # DTOs e tipos de request/response da API
```

## Modelo de dados (hierarquia de conteudo)

```
Prova (Exam)
  └── Materia (Subject)
        └── Topico (Topic)
              └── Questao (Question)
                    ├── Enunciado (texto + imagens)
                    ├── Alternativas[] (multipla escolha, 4-5 opcoes)
                    ├── Resposta correta
                    └── Explicacao (obrigatoria)
```

### Entidades principais

- **Exam**: representa uma prova (ex: Vestibulinho ETEC 2025, ENEM 2025)
- **Subject**: materia vinculada a uma prova (ex: Matematica, Portugues)
- **Topic**: topico dentro de uma materia (ex: Equacoes, Interpretacao de Texto)
- **Question**: questao de multipla escolha com enunciado, alternativas, resposta e explicacao
- **UserProgress**: progresso do usuario (questoes respondidas, acertos, erros por materia/topico)
- **MockExam**: simulado montado com questoes selecionadas, com timer

## Funcionalidades do MVP

### Painel do usuario (sem autenticacao por enquanto)
- Selecionar prova para estudar
- Resolver questoes por materia e topico
- Ver gabarito com explicacao apos responder
- Acompanhar progresso e estatisticas (% acerto por materia/topico)
- Realizar simulados completos com timer (replica formato da prova real)

### Painel admin
- CRUD completo de provas, materias, topicos e questoes
- Upload de imagens para enunciados e alternativas
- Visualizacao previa da questao antes de salvar

## Decisoes tecnicas

### Autenticacao
- **MVP**: Sem autenticacao. Assume-se uso individual (apenas Anna Beatriz).
- **Futuro**: Adicionar auth (email+senha com JWT) quando necessario.

### Escopo de provas
- Modelagem generica desde o inicio para suportar multiplas provas.
- Foco inicial no conteudo do vestibulinho da ETEC.

### Questoes
- Somente multipla escolha no MVP.
- Toda questao DEVE ter explicacao/resolucao.
- Suporte a imagens (upload) desde o inicio.

### Deploy
- **Frontend**: GitHub Pages com deploy automatico via GitHub Actions (`.github/workflows/deploy.yml`).
- Build com `--base-href /annota/` para subpath do GitHub Pages.
- SPA routing via `404.html` customizado que redireciona para `index.html`.
- URL: https://lohran-mendes.github.io/annota/
- **Backend**: MongoDB Atlas (cluster gratuito). Conexao via MONGODB_URI no `.env`.

## Convencoes de codigo

### Geral
- Idioma do codigo (variaveis, funcoes, classes): **ingles**
- Idioma dos comentarios e documentacao: **portugues quando necessario, ingles no codigo**
- Commits em ingles, seguindo conventional commits (feat:, fix:, chore:, etc.)

### Frontend (Angular)
- Usar standalone components (padrao Angular 21+)
- Signals para gerenciamento de estado reativo
- Rotas com lazy loading
- Angular Material para todos componentes de UI
- SCSS para estilos customizados

### Backend (NestJS)
- Modulos organizados por dominio (exam, question, subject, topic, user-progress, mock-exam)
- Mongoose schemas com decorators do @nestjs/mongoose
- DTOs com class-validator para validacao
- Respostas padronizadas da API

### Compartilhado (libs/)
- Interfaces e tipos TypeScript compartilhados entre frontend e backend
- DTOs compartilhados quando aplicavel

## Comandos uteis

```bash
# Desenvolvimento
npm run dev:web          # Angular dev server (localhost:4200)
npm run dev:api          # NestJS dev server com watch (localhost:3000)
npm run dev              # Ambos em paralelo

# Build
npm run build:web        # Build do Angular
npm run build:ghpages    # Build do Angular para GitHub Pages (com base-href)
npm run build:api        # Build do NestJS

# Testes
npm run test:web         # Vitest (Angular)
npm run test:api         # Jest (NestJS)

# Executar comando em workspace especifico
npm run <script> -w @annota/web
npm run <script> -w @annota/api

# Seed do banco de dados
npm run seed -w @annota/api    # Popular MongoDB com dados de exemplo
```

## Notas para o Claude Code

- Este e um projeto de aprendizado. Priorizar clareza e boas praticas sobre otimizacao prematura.
- Sempre explicar decisoes tecnicas quando solicitado.
- Manter o codigo simples e legivel.
- Nao adicionar dependencias desnecessarias.
- Ao criar novos arquivos, seguir a estrutura de pastas definida acima.
- Usar os padroes mais recentes do Angular (signals, standalone, control flow @if/@for) e NestJS.
