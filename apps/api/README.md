# @annota/api

Backend NestJS 11 da plataforma Annota.

## Status

Scaffold minimo. Ainda nao possui integracao com banco de dados nem endpoints de dominio.

## Tecnologias

- NestJS 11.0
- TypeScript 5.7
- Jest 30.0

## Pendente

- Integracao com MongoDB/Mongoose
- Modulos de dominio (exam, subject, topic, question, user-progress, mock-exam)
- DTOs com class-validator
- Endpoints REST para CRUD

## Comandos

```bash
# Desenvolvimento
npm run start:dev       # Watch mode (http://localhost:3000)

# Build
npm run build           # Compilacao para dist/

# Testes
npm test                # Jest
npm run test:e2e        # Testes e2e
```
