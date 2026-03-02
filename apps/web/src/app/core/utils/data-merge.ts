export function mergeWithMock<T extends { id: string }>(
  apiData: T[],
  mockData: T[]
): T[] {
  const apiIds = new Set(apiData.map(item => item.id));
  const uniqueMocks = mockData.filter(mock => !apiIds.has(mock.id));
  return [...apiData, ...uniqueMocks];
}
