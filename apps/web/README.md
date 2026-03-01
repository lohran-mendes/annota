# @annota/web

Frontend Angular 21 da plataforma Annota.

## Tecnologias

- Angular 21.2 (standalone components, signals, lazy loading)
- Angular Material 21.2
- TypeScript 5.9
- SCSS
- Vitest 4.0

## Estrutura

```
src/app/
  core/                 # Mock data e services
    mock-data.ts        # Dados de desenvolvimento
    services/           # Services com HttpClient (skeleton)
  features/
    home/               # Pagina inicial - selecao de prova
    study/              # Dashboard de estudo e resolucao de questoes
    progress/           # Dashboard de progresso e estatisticas
    mock-exam/          # Setup, sessao e resultado de simulados
    admin/              # Painel admin com CRUD completo
  layout/
    user-shell/         # Layout principal do usuario (sidenav + toolbar)
    admin-shell/        # Layout do painel admin
  shared/
    components/
      not-found/        # Pagina 404
```

## Comandos

```bash
# Desenvolvimento
npm start               # ng serve (http://localhost:4200)

# Build
npm run build           # Build de producao
npm run build:ghpages   # Build para GitHub Pages (com base-href /annota/)

# Testes
npm test                # Vitest
```

## Deploy

O deploy e feito automaticamente via GitHub Actions para o GitHub Pages.
URL: https://lohran-mendes.github.io/annota/
