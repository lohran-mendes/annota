# Annota Shared Library

Biblioteca somente de tipos TypeScript. NUNCA adicionar codigo runtime aqui.

## Arquivos
- `src/index.ts` — interfaces de entidades (Exam, Subject, Topic, Question, User, MockExam, Deck, Flashcard, Schedule, AccessLog, etc.) + barrel re-exports
- `src/api-contracts.ts` — DTOs de request/response, wrappers `ApiResponse<T>` e `ApiListResponse<T>`, referencia de endpoints

## Quando atualizar
- **Nova entidade**: adicionar interface em `index.ts`
- **Novo endpoint**: adicionar DTOs em `api-contracts.ts`
- **Manter em sync**: interfaces devem refletir os Mongoose schemas (api) e os services Angular (web)
