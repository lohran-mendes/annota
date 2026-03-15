import { Model } from 'mongoose';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Transforma documentos lean do Mongoose: _id → id e remove __v.
 * Necessário porque .lean() bypassa as transformações toJSON do schema.
 */
export function normalizeLeanDoc<T>(doc: any): T {
  if (!doc) return doc;
  const { _id, __v, ...rest } = doc;
  return { ...rest, id: _id?.toString?.() ?? _id } as T;
}

export function normalizeLeanDocs<T>(docs: any[]): T[] {
  return docs.map((d) => normalizeLeanDoc<T>(d));
}

export async function paginate<T>(
  model: Model<T>,
  filter: Record<string, unknown> = {},
  page: number = 1,
  limit: number = 20,
  sort: Record<string, 1 | -1> = {},
): Promise<PaginatedResult<T>> {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    model.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
    model.countDocuments(filter).exec(),
  ]);
  return {
    data: normalizeLeanDocs<T>(data),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
