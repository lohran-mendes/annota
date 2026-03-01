# Annota

## O que e o projeto

Annota e uma aplicacao web fullstack de estudos focada na aprendizagem por resolucao de exercicios. O usuario seleciona uma prova para a qual deseja estudar e a aplicacao fornece um ambiente para resolver questoes organizadas por materias e topicos. O objetivo e capacitar o usuario a ser aprovado na prova escolhida.

O nome "Annota" e uma homenagem a Anna Beatriz, irma do criador do projeto, que precisa passar no vestibulinho da ETEC para cursar o ensino medio. O projeto tambem serve como aprendizado pratico de desenvolvimento web com Claude Code.

## Stack tecnologica

| Camada     | Tecnologia         | Versao minima |
| ---------- | ------------------ | ------------- |
| Frontend   | Angular            | 20+           |
| UI/CSS     | Angular Material   | 20+           |
| Backend    | NestJS             | 11+           |
| Banco      | MongoDB            | 7+            |
| ODM        | Mongoose           | 8+            |
| Runtime    | Node.js            | 22+           |
| Pacotes    | npm                | 10+           |
| Linguagem  | TypeScript         | 5.5+          |

## Estrutura do monorepo

```
annota/
  apps/
    web/          # Angular frontend
    api/          # NestJS backend
  libs/           # Codigo compartilhado (tipos, interfaces, DTOs)
  CLAUDE.md       # Este arquivo
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
- Ainda nao definido. Foco no desenvolvimento local.

## Convencoes de codigo

### Geral
- Idioma do codigo (variaveis, funcoes, classes): **ingles**
- Idioma dos comentarios e documentacao: **portugues quando necessario, ingles no codigo**
- Commits em ingles, seguindo conventional commits (feat:, fix:, chore:, etc.)

### Frontend (Angular)
- Usar standalone components (padrao Angular 20+)
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
# Ainda nao configurados - serao adicionados apos setup do monorepo
```

## Notas para o Claude Code

- Este e um projeto de aprendizado. Priorizar clareza e boas praticas sobre otimizacao prematura.
- Sempre explicar decisoes tecnicas quando solicitado.
- Manter o codigo simples e legivel.
- Nao adicionar dependencias desnecessarias.
- Ao criar novos arquivos, seguir a estrutura de pastas definida acima.
- Usar os padroes mais recentes do Angular (signals, standalone, control flow @if/@for) e NestJS.
