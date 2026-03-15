import { describe, it, expect } from 'vitest';
import { mergeWithMock } from './data-merge';

// Tipo minimo para os testes — qualquer objeto com id: string
interface Item {
  id: string;
  name: string;
}

describe('mergeWithMock', () => {
  // --- Sem sobreposicao ---

  it('should return only API items when there is no id overlap with mock data', () => {
    const apiData: Item[] = [{ id: 'a-1', name: 'API Item 1' }];
    const mockData: Item[] = [{ id: 'm-1', name: 'Mock Item 1' }];

    const result = mergeWithMock(apiData, mockData);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(apiData[0]);
    expect(result).toContainEqual(mockData[0]);
  });

  // --- Com sobreposicao: mesmo id ---

  it('should keep only the API item when both API and mock share the same id', () => {
    const apiData: Item[] = [{ id: 'shared-1', name: 'API version' }];
    const mockData: Item[] = [{ id: 'shared-1', name: 'Mock version' }];

    const result = mergeWithMock(apiData, mockData);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('API version');
  });

  it('should discard all mock items whose ids already exist in API data', () => {
    const apiData: Item[] = [
      { id: 'x-1', name: 'API 1' },
      { id: 'x-2', name: 'API 2' },
    ];
    const mockData: Item[] = [
      { id: 'x-1', name: 'Mock 1' }, // duplicado
      { id: 'x-2', name: 'Mock 2' }, // duplicado
      { id: 'x-3', name: 'Mock 3' }, // unico — deve aparecer
    ];

    const result = mergeWithMock(apiData, mockData);

    expect(result).toHaveLength(3);
    // As versoes da API devem prevalecer
    expect(result.find(i => i.id === 'x-1')?.name).toBe('API 1');
    expect(result.find(i => i.id === 'x-2')?.name).toBe('API 2');
    // O item exclusivo do mock deve estar presente
    expect(result.find(i => i.id === 'x-3')?.name).toBe('Mock 3');
  });

  // --- API data vazia ---

  it('should return all mock items when API data is empty', () => {
    const apiData: Item[] = [];
    const mockData: Item[] = [
      { id: 'm-1', name: 'Mock 1' },
      { id: 'm-2', name: 'Mock 2' },
    ];

    const result = mergeWithMock(apiData, mockData);

    expect(result).toHaveLength(2);
    expect(result).toEqual(mockData);
  });

  // --- Mock data vazia ---

  it('should return only API items when mock data is empty', () => {
    const apiData: Item[] = [
      { id: 'a-1', name: 'API 1' },
      { id: 'a-2', name: 'API 2' },
    ];
    const mockData: Item[] = [];

    const result = mergeWithMock(apiData, mockData);

    expect(result).toHaveLength(2);
    expect(result).toEqual(apiData);
  });

  // --- Ambas vazias ---

  it('should return an empty array when both API data and mock data are empty', () => {
    const result = mergeWithMock([], []);
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  // --- Ordem do resultado ---

  it('should place API items before unique mock items in the result', () => {
    const apiData: Item[] = [{ id: 'a-1', name: 'API 1' }];
    const mockData: Item[] = [{ id: 'm-1', name: 'Mock 1' }];

    const result = mergeWithMock(apiData, mockData);

    // API items vem primeiro (conforme implementacao: [...apiData, ...uniqueMocks])
    expect(result[0].id).toBe('a-1');
    expect(result[1].id).toBe('m-1');
  });

  // --- Lista combinada sem duplicatas ---

  it('should return a list of unique items combining API and non-overlapping mock items', () => {
    const apiData: Item[] = [
      { id: '1', name: 'Item 1 (API)' },
      { id: '2', name: 'Item 2 (API)' },
    ];
    const mockData: Item[] = [
      { id: '2', name: 'Item 2 (Mock — deve ser ignorado)' },
      { id: '3', name: 'Item 3 (Mock)' },
    ];

    const result = mergeWithMock(apiData, mockData);

    expect(result).toHaveLength(3);
    // Sem id duplicado no resultado
    const ids = result.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
