import { Model } from 'mongoose';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
    data: data as T[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
