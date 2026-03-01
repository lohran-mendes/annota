# Annota

Plataforma web de estudos focada na aprendizagem por resolucao de exercicios. O usuario seleciona uma prova para a qual deseja estudar e a aplicacao fornece um ambiente para resolver questoes organizadas por materias e topicos.

O nome "Annota" e uma homenagem a Anna Beatriz, irma do criador do projeto, que precisa passar no vestibulinho da ETEC para cursar o ensino medio.

## Demo

Acesse a aplicacao em: **https://lohran-mendes.github.io/annota/**

> O deploy e feito automaticamente via GitHub Actions a cada push na branch `main`.

## Stack tecnologica

| Camada     | Tecnologia       | Versao  |
| ---------- | ---------------- | ------- |
| Frontend   | Angular          | 21.2    |
| UI/CSS     | Angular Material | 21.2    |
| Backend    | NestJS           | 11.0    |
| Runtime    | Node.js          | 22+     |
| Linguagem  | TypeScript       | 5.9     |
| Testes web | Vitest           | 4.0     |
| Testes api | Jest             | 30.0    |
| Deploy     | GitHub Pages     | -       |

## Estrutura do monorepo

```
annota/
  package.json              # raiz com npm workspaces
  .github/workflows/        # GitHub Actions (deploy automatico)
  apps/
    web/                    # @annota/web - Angular 21 frontend
    api/                    # @annota/api - NestJS 11 backend
  libs/
    shared/                 # @annota/shared - tipos e interfaces compartilhados
```

O projeto usa **npm workspaces** para gerenciar os pacotes `@annota/web`, `@annota/api` e `@annota/shared`.

## Funcionalidades implementadas

### Painel do usuario
- Selecao de prova para estudar (Vestibulinho ETEC, ENEM, etc.)
- Navegacao por materias e topicos com barras de progresso
- Resolucao de questoes de multipla escolha com feedback visual
- Gabarito com explicacao detalhada apos responder
- Dashboard de progresso com estatisticas (% acerto por materia, streak)
- Simulados completos com timer e resultado detalhado

### Painel admin
- Dashboard com contadores de provas, materias, topicos e questoes
- CRUD de provas com tabela e acoes (adicionar, editar, excluir)
- CRUD de materias vinculadas a provas
- CRUD de topicos vinculados a materias
- CRUD de questoes com enunciado, alternativas e explicacao

### Arquitetura frontend
- Standalone components (padrao Angular 21)
- Signals para gerenciamento de estado reativo
- Lazy loading em todas as rotas
- Layout responsivo com sidenav adaptavel (mobile/desktop)
- Design system customizado com paleta rosa/violeta
- Fonte Nunito + Material Icons
- Animacoes CSS (fadeInUp, fadeIn com stagger)

### Dados
- Mock data completo com provas, materias, topicos e questoes de exemplo
- Services skeleton preparados para integracao com API (HttpClient injetado)
- Interfaces TypeScript compartilhadas via `@annota/shared`

## Modelo de dados

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

### Interfaces principais

- **Exam** - prova com nome, descricao, ano e instituicao
- **Subject** - materia vinculada a uma prova com icone e cor
- **Topic** - topico dentro de uma materia
- **Question** - questao com enunciado, alternativas, resposta e explicacao
- **UserProgress** - progresso geral e por materia (acertos, erros, streak)
- **MockExamConfig** - configuracao de simulado com timer e status

## Rotas

| Rota | Componente | Descricao |
| --- | --- | --- |
| `/` | Home | Selecao de prova e resumo de progresso |
| `/study` | StudyDashboard | Materias e topicos da prova selecionada |
| `/study/:examId` | StudyDashboard | Dashboard de estudo de uma prova |
| `/study/:examId/:subjectId/:topicId` | QuestionSolver | Resolucao de questoes |
| `/progress` | ProgressDashboard | Estatisticas e progresso |
| `/mock-exam` | MockExamSetup | Selecao de simulados |
| `/mock-exam/:id` | MockExamSession | Sessao de simulado com timer |
| `/mock-exam/:id/result` | MockExamResult | Resultado do simulado |
| `/admin` | AdminDashboard | Painel admin com contadores |
| `/admin/exams` | ExamManagement | CRUD de provas |
| `/admin/subjects` | SubjectManagement | CRUD de materias |
| `/admin/topics` | TopicManagement | CRUD de topicos |
| `/admin/questions` | QuestionManagement | CRUD de questoes |

## Como rodar

### Pre-requisitos

- Node.js 22+
- npm 10+

### Instalacao

```bash
git clone https://github.com/lohran-mendes/annota.git
cd annota
npm install
```

### Desenvolvimento

```bash
# Frontend (http://localhost:4200)
npm run dev:web

# Backend (http://localhost:3000)
npm run dev:api

# Ambos em paralelo
npm run dev
```

### Build

```bash
# Build do frontend
npm run build:web

# Build do frontend para GitHub Pages
npm run build:ghpages

# Build do backend
npm run build:api
```

### Testes

```bash
# Testes do frontend (Vitest)
npm run test:web

# Testes do backend (Jest)
npm run test:api
```

## Deploy (GitHub Pages)

O frontend e deployado automaticamente no GitHub Pages via GitHub Actions.

### Como funciona

1. A cada push na branch `main`, o workflow `.github/workflows/deploy.yml` e executado
2. O Angular e buildado com `--base-href /annota/` para funcionar no subpath do GitHub Pages
3. Os arquivos de build sao enviados para o GitHub Pages
4. Um `404.html` customizado redireciona rotas SPA para o `index.html`, permitindo que o Angular Router funcione corretamente

### Configuracao necessaria no repositorio

1. Va em **Settings > Pages** no repositorio do GitHub
2. Em **Source**, selecione **GitHub Actions**
3. O deploy sera feito automaticamente no proximo push

### Build manual para GitHub Pages

```bash
npm run build:ghpages
```

Os arquivos de build ficam em `apps/web/dist/web/browser/`.

## Status do projeto

### Implementado
- [x] Estrutura do monorepo com npm workspaces
- [x] Frontend Angular 21 com Material Design
- [x] Layout responsivo com sidenav (user + admin)
- [x] Todas as telas do painel do usuario (home, estudo, progresso, simulados)
- [x] Todas as telas do painel admin (dashboard, CRUD de provas/materias/topicos/questoes)
- [x] Mock data completo para desenvolvimento
- [x] Interfaces compartilhadas via @annota/shared
- [x] Services skeleton com HttpClient
- [x] Deploy automatico via GitHub Pages
- [x] Componente 404 (Not Found)

### Pendente
- [ ] Integracao do backend com MongoDB/Mongoose
- [ ] Endpoints REST para CRUD (provas, materias, topicos, questoes)
- [ ] Conectar services do frontend com a API
- [ ] Persistencia real de dados (substituir mock data)
- [ ] Upload de imagens para enunciados
- [ ] Autenticacao (JWT) - planejado para apos o MVP
- [ ] Conteudo real do vestibulinho da ETEC

## Licenca

Projeto privado de uso pessoal e educacional.
