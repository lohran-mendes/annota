---
paths:
  - "apps/api/src/seed.ts"
---

# Seed Script Rules

## Comportamento
- O seed dropa TODAS as collections antes de reinserir — e uma operacao destrutiva
- Schemas sao redefinidos localmente no seed (nao usa os modulos NestJS)
- SEMPRE manter os schemas do seed em sync com os schemas reais em `apps/api/src/*/`

## Dados de teste
- Usuarios: lohran@annota.com (admin), anna@annota.com (student), maria@annota.com (student)
- Senhas sao hashadas com bcrypt (salt rounds 10)
- Dados devem ser realistas e cobrir os principais cenarios

## Ao adicionar novo modulo
- Adicionar seed data para o novo modulo
- Criar referencias validas entre entidades (ObjectIds corretos)
- Executar `npm run seed -w @annota/api` para verificar que funciona
